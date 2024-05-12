const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const OTPGenerator = require('otp-generator');
const { insertOtp } = require("../services/otp.service");
const { InternalServerError } = require('../core/error.response');
require('dotenv').config();

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;
const REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const createTransporter = async () => {
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'nguyennghia193913@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
        }
    });
    return transporter;
}

const sendSignUpMail = async ({ toEmail, userName, code }) => {
    try {
        // create otp
        const otp = OTPGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: 6
        })
        // save otp to db
        const isSaveOtp = await insertOtp(otp, toEmail);
        if (isSaveOtp === 0) {
            throw new InternalServerError("Có lỗi xảy ra trong quá trình xử lý");
        }
        // send mail
        let mailDetails = {
            from: `${process.env.MAIL_SEND}`,
            to: toEmail,
            subject: 'Xác nhận đăng ký tài khoản',
            html: ` 
        <div style="text-align: left; font-family: arial; margin: 10px auto;"> 
            <span style="margin: 5px 2px"><b>Xin chào</b> <b style="color: red">${userName}</b>,</span>
            <p style="margin: 5px 2px">Cảm ơn bạn đã đăng ký dịch vụ của chúng tôi.</p>
            <p style="margin: 5px 2px">Mã xác nhận OTP của bạn là: <b >${otp}</b></p>
            <p style="margin: 5px 2px">Vui lòng nhập vào nút bên dưới để xác minh email của bạn.</p>
            <div style="display: flex; justify-content: center; margin: 30px">
            <button style="background-color: #008000; padding: 10px 20px; border-radius: 20px; border-style: none; align-items: center"><a href="${process.env.FE_URL}/otp?email=${toEmail}&code=${code}" style="font-size: 15px;color: white; text-decoration: none">Xác nhận tài khoản</a></button>
            </div>
            <p style="margin: 5px 2px">Xin lưu ý rằng nếu tài khoản chưa được xác minh trong vòng <b style="color: red">10 phút</b> vui lòng yêu cầu gửi lại email xác nhận.</p>
            <p style="margin: 5px 2px">Nếu bạn không yêu cầu vui lòng bỏ qua yêu cầu này</p>
            <p style="margin: 20px 2px">Trân trọng.</p>
        </div>
        `
        };
        const transporter = await createTransporter();
        transporter.sendMail(mailDetails, err => {
            throw new InternalServerError('Có lỗi xảy ra');
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createTransporter,
    sendSignUpMail
}