const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const { nanoid } = require('nanoid')

const userService = require('../service/users.service')
const emailService = require('../service/email.service')

require('dotenv').config()

const SALT_ROUNDS = +process.env.SALT_ROUNDS
const JWT_KEY = process.env.JWT_KEY
const PORT = process.env.PORT || ''
const HOST_IP = process.env.HOST_IP || ''

const registerUser = async (req, res) => {
    const { email, password } = req.body
    const user = await userService.getUserByEmail(email)

    if (user?.email) return res.status(409).json({ message: 'Email in use' })

    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashPassword = await bcrypt.hash(password, salt)

    const avatarURL = gravatar.url(user?.email)

    const verificationToken = nanoid()
    const registrationMail = {
        to: email,
        subject: 'Registration confirm',
        html: `<a href = "${HOST_IP}${PORT && `:${PORT}`}/api/users/verify/${verificationToken}">Click it to confirm a registration</a>`
    }

    const { subscription } = await userService.createUser({
        ...req.body,
        password: hashPassword,
        avatarURL,
        verificationToken
    })

    await emailService.sendEmail(registrationMail)

    return res.json({ user: { email, subscription } }).status(201)
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    const user = await userService.getUserByEmail(email)

    if (!user) {
        return res.status(401).json({ message: 'Email or password is wrong' })
    }

    if (!user.verify) {
        return res.status(401).json({ message: 'Email is not verified' })
    }

    const isValidPassword = await bcrypt.compare(password, user?.password)

    if (!isValidPassword) {
        return res.status(401).json({ message: 'Email or password is wrong' })
    }

    const payload = {
        id: user.id,
    }

    const token = jwt.sign(payload, JWT_KEY, { expiresIn: '24h' })
    const updatedUser = await userService.updateUser(user.id, { token })

    return res
        .json({
            token,
            user: {
                email: updatedUser.email,
                subscription: updatedUser.subscription,
            },
        })
        .status(201)
}

const logoutUser = async (req, res) => {
    const { _id } = req.user

    await userService.updateUser(_id, { token: null })

    return res.sendStatus(204)
}

const currentUser = async (req, res) => {
    const { email, subscription } = req.user

    return res.json({ email, subscription }).status(200)
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user

    const avatarUrl = await userService.updateAvatar(_id, req.file)
    await userService.updateUser(_id, { avatarUrl })

    return res.json({ avatarURL: avatarUrl }).status(200)
}

const verify = async (req, res) => {
    const { verificationToken } = req.params

    const user = await userService.getUserByToken(verificationToken)

    if (!user) return res.status(404).json({ message: "User not found" })

    await userService.updateUser(user._id, { verify: true, verificationToken: null })

    res.status(200).json({ message: 'Verification successful' })
}

const verifyAgain = async (req, res) => {
    const { email } = req.body

    const user = await userService.getUserByEmail(email)

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    if (user.verify) {
        return res.status(400).json({ message: 'Verification has already been passed' })
    }

    const registrationMail = {
        to: email,
        subject: 'Registration confirm',
        html: `<a href = "${HOST_IP}${PORT && `:${PORT}`}/api/users/verify/${user.verificationToken}">Click it to confirm a registration</a>`
    }

    await emailService.sendEmail(registrationMail)

    return res.status(200).json({ message: 'Verification email sent' })
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    updateAvatar,
    verify,
    verifyAgain
}
