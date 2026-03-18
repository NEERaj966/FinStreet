import { User } from '../models/User.model.js'
import { asyncHandler } from '../utills/AsyncHandler.js'
import { ApiError } from '../utills/ApiError.js'
import { ApiResponse } from '../utills/ApiResponse.js'
import { blackListTokenModel } from '../models/Blacklist.model.js'






const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    const { fullname, email, password } = req.body


    // Basic payload validation before hitting the database
    if ([fullname, email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }




    const existedUser = await User.findOne({ email })



    //      res.status(200).json({
    //      message:'OK'
    //  })


    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullname,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select("-password")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const token = user.generateAuthToken();

    return res.status(201).json(
        new ApiResponse(
           201,
            {
                user: createdUser,
                token
            },
            "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password} = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.ispasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   

//    console.log(accessToken);
//    console.log(refreshToken);
   

    const loggedInUser = await User.findById(user._id).select("-password")

    // HttpOnly cookie keeps the token out of client-side JavaScript
    const options = {
        httpOnly: true,
        secure: true
    }

    const token = user.generateAuthToken();

    return res
    .status(200)
    .cookie("authtoken", token, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, token
            },
            "User logged In Successfully"
        )
    )

})


const getUserProfile = asyncHandler(async (req , res , next ) => {
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

    // Persist the token so it can't be reused
    await blackListTokenModel.create({ token });


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("authtoken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})





export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
}
