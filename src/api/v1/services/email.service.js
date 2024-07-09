const OTPGenerator = require('otp-generator');
const OTPService = require("../services/otp.service");
const { createTransporter } = require('../utils/sendMails');
const { InternalServerError } = require('../core/error.response');

class EmailService {
    static sendSignUpMail = async ({ toEmail, userName, code }) => {
        try {
            // create otp
            const otp = OTPGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
                digits: 6
            })
            // save otp to db
            const isSaveOtp = await OTPService.insertOtp(otp, toEmail);
            if (isSaveOtp === 0) {
                throw new InternalServerError("Có lỗi xảy ra trong quá trình xử lý");
            }
            // send mail
            let mailDetails = {
                from: `${process.env.MAIL_SEND}`,
                to: toEmail,
                subject: 'XÁC NHẬN ĐĂNG KÝ',
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
                <p style="margin: 5px 2px">Nếu bạn không yêu cầu vui lòng bỏ qua email này.</p>
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

    static sendForgetPasswordMail = async ({ toEmail, userName, token }) => {
        try {
            // send mail
            let mailDetails = {
                from: `${process.env.MAIL_SEND}`,
                to: toEmail,
                subject: 'CẬP NHẬT MẬT KHẨU',
                html: ` 
                <div style="text-align: left; font-family: arial; margin: 0px 300px; background-color: white; padding: 20px; border-radius: 10px; border: solid 1px grey"> 
                    <span style="margin: 5px 2px"><b>Xin chào</b> <b style="color: red">${userName}</b>,</span>
                    <p style="margin: 5px 2px">Gần đây bạn đã yêu cầu đặt lại mật khẩu. Vui lòng kích vào nút bên dưới để tiến hành đặt lại mật khẩu.</p>
                    <div style="display: flex; margin: 30px">
                        <button style="background-color: #008000; padding: 10px 20px; margin: 0px auto; border-radius: 20px; border-style: none"><a href="${process.env.FE_URL}/forgot-password/confirm-password?email=${toEmail}&token=${token}" style="font-size: 15px; color: white; text-decoration: none">Đặt lại mật khẩu</a></button>
                    </div>
                    <p style="margin: 5px 2px">Xin lưu ý rằng nếu tài khoản chưa cập nhật mật khẩu trong vòng <b style="color: red">60 phút</b> vui lòng gửi lại yêu cầu.</p>
                    <p style="margin: 5px 2px">Nếu bạn không yêu cầu vui lòng bỏ qua email này.</p>
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
}

module.exports = EmailService;