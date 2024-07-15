require('dotenv').config();

const config = {
    vnp_TmnCode: "5PV2YZN1",
    vnp_HashSecret: "23E4K8G399S3YUAPXZ8QZJYLMM2VC7XW",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: `${process.env.FE_URL}/recruiter/thankyou`
}

module.exports = {
    config
}