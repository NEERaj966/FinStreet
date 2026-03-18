import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer'


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// Serve static assets from the backend public folder
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/User.route.js'
import expenseRouter from './routes/Expense.route.js'
import eventRouter from './routes/Event.route.js'
import investmentRouter from './routes/Investment.route.js'
import advisorRouter from './routes/Advisor.route.js'
import budgetRouter from './routes/Budget.route.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/expenses", expenseRouter)
app.use("/api/v1/events", eventRouter)
app.use("/api/v1/investments", investmentRouter)
app.use("/api/v1/advice", advisorRouter)
app.use("/api/v1/budgets", budgetRouter)

app.use((err, _req, res, _next) => {
    const isMulterError = err instanceof multer.MulterError
    const statusCode = err?.statusCode || (isMulterError ? 400 : 500)
    const message =
        err?.message ||
        (isMulterError ? "File upload failed" : "Internal server error")

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err?.errors || []
    })
})


export{
    app
}
