import { nanoid } from "nanoid"
import { userModel } from "../../../DB/Models/user.model.js"
import { sendEmailService } from "../../services/sendEmailService.js"
import { generateToken, verifyToken } from "../../utils/tokenFunctions.js"
import pkg from 'bcrypt'


//=============================SignUp==============
export const signUp = async (req, res, next) => {
    const {
        userName,
        email,
        password,
        age,
        gender,
        phoneNumber,
        address,
    } = req.body
    //check if email is unique
    const isEmailDuplicate = await userModel.findOne({ email })
    if (isEmailDuplicate) {
        return next(new Error('Email is already exist', { cause: 400 }))
    }
    //hash password
    // const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)
    // token
    const token = generateToken({
        payload: { email, },
        signature: process.env.CONFIRMATION_EMAIL_TOKEN,
        expiresIn: '1h',
    })
    const confirmationlink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`
    const isEmailSent = sendEmailService({
        to: email,
        subject: 'Confirmation Email',
        message: `<a href=${confirmationlink}>Click here to confirm </a>`,
    })
    if (!isEmailSent) {
        return next(new Error('Fail to sent confirmation Email', { cause: 400 }))
    }
    const user = new userModel(
        {
            userName,
            email,
            password,
            age,
            gender,
            phoneNumber,
            address,
        }
    )
    const savedUser = await user.save()
    res.status(201).json({ Message: "Signed Up", savedUser })
}

//confirm email
export const confirmEmail = async (req, res, next) => {
    const { token } = req.params
    const decode = verifyToken({
        token,
        signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    })
    const user = await userModel.findOneAndUpdate(
        { email: decode?.email, isConfirmed: false },
        { isConfirmed: true },
        { new: true, }
    )
    if (!user) {
        return next(new Error('already Confirmed', { cause: 400 }))
    }
    res.status(200).json({ Message: "Confirmed Done,please try to login", })

}
//=====================login===========
export const logIn = async (req, res, next) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new Error('invalid credinatls', { cause: 400 }))
    }
    const isPassMatch = pkg.compareSync(password, user.password)
    if (!isPassMatch) {
        return next(new Error('invalid credinatls', { cause: 400 }))
    }
    const token = generateToken({
        payload: {
            email,
            _id: user._id,
            role: user.role,
        },
        signature: process.env.SIGN_IN_TOKEN_SECRET,
        expiresIn: '1h',
    })
    const userUpdated = await userModel.findOneAndUpdate({ email }, { token, status: 'online' }, { new: true })
    res.status(200).json({ Message: "logged in done", userUpdated })

}

//forget Password

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new Error('invalid email', { cause: 400 }))
    }
    const code = nanoid()
    const hashedCode = pkg.hashSync(code, +process.env.SALT_ROUNDS)
    const token = generateToken({
        payload: {
            email,
            sentCode: hashedCode,
        },
        signature: process.env.RESET_TOKEN,
        expiresIn: '1h',
    })
    const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`

    const isEmailSent = sendEmailService({
        to: email,
        subject: 'Reset Password',
        message: `<a href=${resetPasswordLink}>Click here to confirm </a>`
    })
    if (!isEmailSent) {
        return next(new Error('Fail to sent confirmation Email', { cause: 400 }))
    }
    const userUpdates = await userModel.findOneAndUpdate({ email }, { forgetCode: hashedCode }, { new: true })
    res.status(200).json({ Message: "Doneee", userUpdates })

}

//reset password
export const resetPassword = async (req, res, next) => {
    const { token } = req.params
    const decoded=verifyToken({token,signature:process.env.RESET_TOKEN})
    const user = await userModel.findOne({ email:decoded?.email,forgetCode:decoded?.sentCode })
    if (!user) {
        return next(new Error('you already reset ,try again later', { cause: 400 }))
    }
    
    const { newPassword } = req.body
    user.password=newPassword
    user.forgetCode=null
    const resetedPassData=await user.save()
    res.status(200).json({ Message: "Doneee", resetedPassData })

}//