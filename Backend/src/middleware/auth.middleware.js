import jwt from 'jsonwebtoken'
import { ApiError } from '../utills/ApiError.js'
import { asyncHandler } from '../utills/AsyncHandler.js'
import { User } from '../models/User.model.js'
import { blackListTokenModel } from '../models/Blacklist.model.js'


export const verifyJWTForUser = asyncHandler(async (req, _, next) => {
    try {
        // Token can come from HttpOnly cookie or Authorization header
        const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password ")

        if (!user) {

            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})
