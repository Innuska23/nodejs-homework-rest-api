const nodemailer = require("nodemailer");

require('dotenv').config()

const MAILTRAP_MAIL_USER = process.env.MAILTRAP_MAIL_USER
const MAILTRAP_MAIL_PASSWORD = process.env.MAILTRAP_MAIL_PASSWORD
const MAILTRAP_MAIL_HOST = process.env.MAILTRAP_MAIL_HOST
const EMAIL_SERVICE_FROM_MAIL = process.env.EMAIL_SERVICE_FROM_MAIL

const transporter = nodemailer.createTransport({
    host: MAILTRAP_MAIL_HOST,
    port: 2525,
    auth: {
        user: MAILTRAP_MAIL_USER,
        pass: MAILTRAP_MAIL_PASSWORD
    }
});

const sendEmail = async ({ to, subject, html }) => {

    await transporter.sendMail({
        from: EMAIL_SERVICE_FROM_MAIL,
        to,
        subject,
        html,
    });
}

module.exports = { sendEmail }