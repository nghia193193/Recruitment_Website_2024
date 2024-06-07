const { formatInTimeZone } = require('date-fns-tz');
const { sortObject } = require('../utils');
const { config } = require('../configs/config.vnpayment');
const OrderService = require('./order.service');
const { Order } = require('../models/order.model');

class VNPayService {
    static createPaymentURL = async ({ ipAddr, orderId, amount, orderType, language }) => {
        try {
            var tmnCode = config['vnp_TmnCode'];
            var secretKey = config['vnp_HashSecret'];
            var vnpUrl = config['vnp_Url'];
            var returnUrl = config['vnp_ReturnUrl'];

            var date = new Date();

            var createDate = formatInTimeZone(date, "Asia/Ho_Chi_Minh", "yyyyMMddHHmmss");

            var locale = language;
            if (locale === null || locale === '') {
                locale = 'vn';
            }
            var currCode = 'VND';
            var vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            // vnp_Params['vnp_Merchant'] = ''
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = "Thanh toán cho mã giao dịch: " + orderId;
            vnp_Params['vnp_OrderType'] = orderType;
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;

            vnp_Params = sortObject(vnp_Params);

            var querystring = require('qs');
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var crypto = require("crypto");
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            return vnpUrl;
        } catch (error) {
            throw error;
        }
    }

    static getVNPayIPN = async ({ reqQuery }) => {
        try {
            var vnp_Params = reqQuery;
            console.log(vnp_Params)
            var secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);

            var secretKey = config['vnp_HashSecret'];
            var querystring = require('qs');
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var crypto = require("crypto");
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");


            if (secureHash === signed) {
                var orderId = vnp_Params['vnp_TxnRef'];
                var rspCode = vnp_Params['vnp_ResponseCode'];
                const order = await Order.findById(orderId).lean();
                if (order) {
                    if (order.price === (vnp_Params['vnp_Amount'] / 100)) {
                        if (rspCode) {// "This order has been updated to the payment status"
                            if (rspCode === "00") {
                                // success
                                const result = await OrderService.updateStatus({ orderId, status: "Thành công" });
                                return {
                                    message: "Giao dịch thành công",
                                    code: "00",
                                    result
                                }
                            } else {
                                // failed
                                const result = await OrderService.updateStatus({ orderId, status: "Thất bại" });
                                return {
                                    message: "Giao dịch thất bại",
                                    code: "00",
                                    result
                                }
                            }
                        } else {
                            return {
                                message: "Giao dịch đã được cập nhật trạng thái thanh toán",
                                code: "02"
                            }
                        }
                    } else {
                        return {
                            message: "Số tiền không hợp lệ",
                            code: "04"
                        }
                    }
                } else {
                    return {
                        message: "Không tìm thấy đơn hàng",
                        code: "01"
                    }
                }
            } else {
                return {
                    message: "Checksum failed",
                    code: "97"
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // static refund = async ({ userId, ipAddr, orderId, transDate, transNo }) => {
    //     try {
    //         let date = new Date();

    //         let crypto = require("crypto");

    //         let vnp_TmnCode = config['vnp_TmnCode'];
    //         let secretKey = config['vnp_HashSecret'];
    //         let vnp_Api = config['vnp_Api'];

    //         let vnp_TxnRef = orderId;
    //         let vnp_TransactionDate = transDate;
    //         let vnp_Amount = 100000 *100;
    //         let vnp_TransactionType = "02";
    //         let vnp_CreateBy = userId;

    //         let vnp_RequestId = formatInTimeZone(date, 'Asia/Ho_Chi_Minh', 'HHmmss');
    //         let vnp_Version = '2.1.0';
    //         let vnp_Command = 'refund';
    //         let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    //         let vnp_IpAddr = ipAddr;

    //         let currCode = 'VND';
    //         let vnp_CreateDate = formatInTimeZone(date, "Asia/Ho_Chi_Minh", "yyyyMMddHHmmss");

    //         let vnp_TransactionNo = transNo;

    //         let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

    //         let hmac = crypto.createHmac("sha512", secretKey);
    //         let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest("hex");

    //         let dataObj = {
    //             'vnp_RequestId': vnp_RequestId,
    //             'vnp_Version': vnp_Version,
    //             'vnp_Command': vnp_Command,
    //             'vnp_TmnCode': vnp_TmnCode,
    //             'vnp_TransactionType': vnp_TransactionType,
    //             'vnp_TxnRef': vnp_TxnRef,
    //             'vnp_Amount': vnp_Amount,
    //             'vnp_TransactionNo': vnp_TransactionNo,
    //             'vnp_CreateBy': vnp_CreateBy,
    //             'vnp_OrderInfo': vnp_OrderInfo,
    //             'vnp_TransactionDate': vnp_TransactionDate,
    //             'vnp_CreateDate': vnp_CreateDate,
    //             'vnp_IpAddr': vnp_IpAddr,
    //             'vnp_SecureHash': vnp_SecureHash
    //         };
    //         const result = await axios.post(vnp_Api, dataObj)
    //             .then(response => {
    //                 console.log(response.data);
    //                 return response.data;
    //             })
    //             .catch(error => {
    //                 throw error;
    //             });
    //         return result
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}

module.exports = VNPayService;