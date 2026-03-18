import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { buildPaytmPassbookPayload } from "../src/utills/PaytmPassbook.js";

const DEFAULT_INPUT = String.raw`c:\Users\Neeraj\Downloads\Files\Paytm_UPI_Statement_16_Feb'26_-_15_Mar'26-1.xlsx`;
const DEFAULT_OUTPUT = path.resolve(
  process.cwd(),
  "public",
  "imports",
  "paytm-passbook-history.json"
);
const DEFAULT_TTL_MINUTES = 30;

const args = process.argv.slice(2);

const getArgValue = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return fallback;
  }
  return args[index + 1];
};

const inputPath = path.resolve(getArgValue("--input", DEFAULT_INPUT));
const outputPath = path.resolve(getArgValue("--output", DEFAULT_OUTPUT));
const ttlMinutes = Number(getArgValue("--ttl-minutes", DEFAULT_TTL_MINUTES));

const scheduleDeletion = (targetPath, delayMinutes) => {
  if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) {
    return;
  }

  const cleanupScriptPath = path.resolve(
    process.cwd(),
    "scripts",
    "deleteGeneratedFile.js"
  );
  const delayMs = Math.round(delayMinutes * 60 * 1000);
  const child = spawn(
    process.execPath,
    [cleanupScriptPath, targetPath, String(delayMs)],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }
  );

  child.unref();
};

const main = async () => {
  const payload = buildPaytmPassbookPayload(inputPath, {
    fileName: path.basename(inputPath),
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  scheduleDeletion(outputPath, ttlMinutes);

  console.log(`Imported ${payload.summary.totalTransactions} transactions from ${inputPath}`);
  console.log(`Expenses: ${payload.summary.expenseCount} | Total paid: ₹${payload.summary.totalExpenses}`);
  console.log(
    `Main account credits: ${payload.summary.receivedCount} | Total received: ₹${payload.summary.totalReceived}`
  );
  console.log(`JSON written to ${outputPath}`);
  if (Number.isFinite(ttlMinutes) && ttlMinutes > 0) {
    console.log(`Scheduled auto-delete in ${ttlMinutes} minute(s)`);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
