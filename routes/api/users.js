const express = require('express')

const usersController = require('../../controllers/users.controller')
const {
    usersValidate,
    isAuthorized,
    avatarUpload,
    avatarResize,
    usersValidateBodyField
} = require('../../middleware/users.middleware')

const router = express.Router()

router.post('/register', usersValidate, usersController.registerUser)

router.post('/login', usersValidate, usersController.loginUser)

router.post('/logout', isAuthorized, usersController.logoutUser)

router.get('/current', isAuthorized, usersController.currentUser)

router.patch(
    '/avatar',
    isAuthorized,
    avatarUpload.single('avatar'),
    avatarResize,
    usersController.updateAvatar
)

router.get('/verify/:verificationToken', usersController.verify)

router.post('/verify', usersValidateBodyField('email'), usersController.verifyAgain)


module.exports = router
