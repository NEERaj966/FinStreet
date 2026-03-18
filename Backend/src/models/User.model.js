import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const roundToTwoDecimals = (value) => {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return Number(numericValue.toFixed(2));
};

const mainAccountTransactionSchema = new mongoose.Schema(
    {
        date: String,
        time: String,
        timestamp: String,
        amount: Number,
        transactionDetails: String,
        account: String,
        otherTransactionDetails: String,
        upiRefNo: String,
        orderId: String,
        remarks: String,
        tag: String,
        source: String,
        sourceKey: String
    },
    { _id: false }
);

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        default: null
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    avatar: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true,
    },
    savings: {
        type: Number,
        default: 0,
        set: roundToTwoDecimals,
        get: roundToTwoDecimals
    },
    mainAccountBalance: {
        type: Number,
        default: 0
    },
    mainAccountTransactions: {
        type: [mainAccountTransactionSchema],
        default: []
    },
    monthlyExpenseOverage: {
        type: Number,
        default: 0
    },
    monthlyExpenseOverageKey: {
        type: String,
        default: ""
    },
    monthlySavings: {
        type: Number,
        default: 0
    },
    monthlySavingsKey: {
        type: String,
        default: ""
    },
    financialScore: {
        type: Number,
        default: 50
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});



userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next;

    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 10);
    return next;
})



userSchema.methods.ispasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}




userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);  
