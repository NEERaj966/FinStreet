import { randomUUID } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.model.js'
import { asyncHandler } from '../utills/AsyncHandler.js'
import { ApiError } from '../utills/ApiError.js'
import { ApiResponse } from '../utills/ApiResponse.js'
import { blackListTokenModel } from '../models/Blacklist.model.js'

const googleClient = new OAuth2Client()

const getCookieOptions = () => ({
    httpOnly: true,
    secure: true
})

const sendAuthResponse = async (res, user, statusCode, message) => {
    const loggedInUser = await User.findById(user._id).select("-password")
    const token = user.generateAuthToken()

    return res
        .status(statusCode)
        .cookie("authtoken", token, getCookieOptions())
        .json(
            new ApiResponse(
                statusCode,
                {
                    user: loggedInUser,
                    token
                },
                message
            )
        )
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body

    if ([fullname, email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existedUser = await User.findOne({ email: normalizedEmail })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullname: fullname.trim(),
        email: normalizedEmail,
        password,
        authProvider: "local"
    })

    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return sendAuthResponse(res, user, 201, "User registered Successfully")
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select("+password")

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (user.authProvider === "google") {
        throw new ApiError(400, "This account uses Google sign-in. Please continue with Google.")
    }

    const isPasswordValid = await user.ispasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    return sendAuthResponse(res, user, 200, "User logged In Successfully")
})

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        throw new ApiError(400, "Google credential is required")
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new ApiError(500, "Google auth is not configured on the server")
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    const googleId = payload?.sub
    const email = payload?.email?.trim().toLowerCase()
    const fullname = payload?.name?.trim() || "Google User"
    const avatar = payload?.picture || ""

    if (!googleId || !email || payload?.email_verified !== true) {
        throw new ApiError(400, "Unable to verify Google account")
    }

    let user = await User.findOne({
        $or: [{ googleId }, { email }]
    })
    let statusCode = 200
    let message = "Google sign-in successful"

    if (!user) {
        user = await User.create({
            fullname,
            email,
            password: randomUUID(),
            googleId,
            authProvider: "google",
            avatar
        })
        statusCode = 201
        message = "Google account created successfully"
    } else {
        let shouldSave = false

        if (!user.googleId) {
            user.googleId = googleId
            shouldSave = true
        }

        if (!user.avatar && avatar) {
            user.avatar = avatar
            shouldSave = true
        }

        if (!user.fullname && fullname) {
            user.fullname = fullname
            shouldSave = true
        }

        if (shouldSave) {
            await user.save()
        }
    }

    return sendAuthResponse(res, user, statusCode, message)
})

const getUserProfile = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User profile"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

    await blackListTokenModel.create({ token })

    return res
        .status(200)
        .clearCookie("authtoken", getCookieOptions())
        .json(new ApiResponse(200, {}, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    googleAuth,
    logoutUser,
    getUserProfile,
}
