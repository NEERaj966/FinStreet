import path from "path";
import XLSX from "xlsx";
import { normalizeCategoryName } from "../constants/categories.js";

const SHEET_NAME = "Passbook Payment History";
const RUPEE_DECIMAL_PATTERN = /,/g;

const parseAmount = (value) => {
    const normalized = String(value ?? "")
        .replace(RUPEE_DECIMAL_PATTERN, "")
        .trim();

    const numericValue = Number(normalized);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeDateParts = (dateValue, timeValue) => {
    const rawDate = String(dateValue ?? "").trim();
    const rawTime = String(timeValue ?? "").trim() || "00:00:00";
    const [day = "01", month = "01", year = "1970"] = rawDate.split("/");
    const isoDate = `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    return {
        date: isoDate,
        time: rawTime,
        timestamp: `${isoDate}T${rawTime}+05:30`
    };
};

const buildCategory = (tag, transactionDetails) => {
    return normalizeCategoryName(tag || transactionDetails);
};

const buildSpentAt = (transactionDetails) => {
    const details = String(transactionDetails ?? "").trim();
    const patterns = [
        /^paid to\s+/i,
        /^money sent to\s+/i,
        /^recharge of\s+/i,
        /^paid for\s+/i
    ];

    const cleaned = patterns.reduce((current, pattern) => current.replace(pattern, ""), details);
    return cleaned || details || null;
};

const buildSourceKey = ({
    date,
    time,
    signedAmount,
    transactionDetails,
    account,
    upiRefNo,
    orderId
}) => {
    if (upiRefNo) {
        return `upi:${upiRefNo}`;
    }

    if (orderId) {
        return `order:${orderId}`;
    }

    return [
        date,
        time,
        signedAmount,
        String(transactionDetails ?? "").trim().toLowerCase(),
        String(account ?? "").trim().toLowerCase()
    ].join("|");
};

const normalizeTransaction = (row) => {
    const signedAmount = parseAmount(row.Amount);
    const direction =
        signedAmount < 0 ? "paid" : signedAmount > 0 ? "received" : "unknown";
    const { date, time, timestamp } = normalizeDateParts(row.Date, row.Time);
    const transactionDetails = String(row["Transaction Details"] ?? "").trim();
    const otherTransactionDetails = String(
        row["Other Transaction Details (UPI ID or A/c No)"] ?? ""
    ).trim();
    const account = String(row["Your Account"] ?? "").trim();
    const upiRefNo = String(row["UPI Ref No."] ?? "").trim() || null;
    const orderId = String(row["Order ID"] ?? "").trim() || null;
    const remarks = String(row["Remarks"] ?? "").trim() || null;
    const tag = String(row["Tags"] ?? "").trim() || null;

    return {
        date,
        time,
        timestamp,
        amount: Math.abs(signedAmount),
        signedAmount,
        direction,
        spentAt: buildSpentAt(transactionDetails),
        transactionDetails,
        otherTransactionDetails,
        account,
        upiRefNo,
        orderId,
        remarks,
        tag,
        category: buildCategory(row["Tags"], transactionDetails),
        sourceKey: buildSourceKey({
            date,
            time,
            signedAmount,
            transactionDetails,
            account,
            upiRefNo,
            orderId
        })
    };
};

const readPassbookRows = (input, options = {}) => {
    const workbook =
        Buffer.isBuffer(input)
            ? XLSX.read(input, { type: "buffer", cellDates: false, raw: false })
            : XLSX.readFile(input, { cellDates: false, raw: false });

    const worksheet = workbook.Sheets[SHEET_NAME];
    if (!worksheet) {
        throw new Error(
            `Sheet "${SHEET_NAME}" was not found. Available sheets: ${workbook.SheetNames.join(", ")}`
        );
    }

    return {
        rows: XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false
        }),
        sheetName: SHEET_NAME,
        fileName: options.fileName || (typeof input === "string" ? path.basename(input) : "statement.xlsx")
    };
};

const buildPaytmPassbookPayload = (input, options = {}) => {
    const { rows, fileName, sheetName } = readPassbookRows(input, options);
    const transactions = rows
        .map(normalizeTransaction)
        .filter((item) => item.direction !== "unknown");

    const expenses = transactions
        .filter((item) => item.direction === "paid")
        .map((item) => ({
            date: item.date,
            time: item.time,
            timestamp: item.timestamp,
            amount: item.amount,
            spentAt: item.spentAt,
            transactionDetails: item.transactionDetails,
            category: item.category,
            account: item.account,
            otherTransactionDetails: item.otherTransactionDetails,
            upiRefNo: item.upiRefNo,
            orderId: item.orderId,
            remarks: item.remarks,
            tag: item.tag,
            source: "paytm-passbook",
            sourceKey: item.sourceKey
        }));

    const mainAccountEntries = transactions
        .filter((item) => item.direction === "received")
        .map((item) => ({
            date: item.date,
            time: item.time,
            timestamp: item.timestamp,
            amount: item.amount,
            transactionDetails: item.transactionDetails,
            account: item.account,
            otherTransactionDetails: item.otherTransactionDetails,
            upiRefNo: item.upiRefNo,
            orderId: item.orderId,
            remarks: item.remarks,
            tag: item.tag,
            source: "paytm-passbook",
            sourceKey: item.sourceKey
        }));

    const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
    const totalReceived = mainAccountEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
        generatedAt: new Date().toISOString(),
        source: {
            fileName,
            sheetName
        },
        summary: {
            totalTransactions: transactions.length,
            expenseCount: expenses.length,
            receivedCount: mainAccountEntries.length,
            totalExpenses,
            totalReceived,
            netAmount: Number((totalReceived - totalExpenses).toFixed(2))
        },
        transactions,
        expenses,
        mainAccount: {
            totalReceived,
            entries: mainAccountEntries
        }
    };
};

export { buildPaytmPassbookPayload, SHEET_NAME };
