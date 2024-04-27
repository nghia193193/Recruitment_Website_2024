const fieldOfActivity = [
    "An toàn lao động", "Biên / Phiên dịch", "Bán hàng kỹ thuật", "Bán lẻ / bán sỉ", 
    "Báo chí / Truyền thông", "Bưu chính / Viễn thông", "Bảo hiểm", "Bảo trì / Sửa chữa",
    "Bất động sản", "Chứng khoán / Vàng / Ngoại tệ", "Công nghệ cao", "Công nghệ thông tin", 
    "Công nghệ Ô tô", "Cơ khí / Chế tạo / Tự động hóa", "Du lịch", "Dược phẩm / Công nghệ sinh học",
    "Dầu khí / Hóa chất", "Dệt may / Da giày", "Dịch vụ khách hàng", "Giáo dục / Đào tạo", "Hóa học / Sinh học",
    "Hoạch định / Dự án", "Hàng cao cấp", "Hàng gia dụng", "Hàng hải", "Hàng không", "Hàng tiêu dùng",
    "Hành chính / Văn phòng", "IT phần cứng / Mạng", "IT phần mềm", "In ấn / Xuất bản", "Khách sạn / Nhà hàng",
    "Kinh doanh / Bán hàng", "Kiến trúc", "Kế toán / Kiểm toán", "Logistics", "Luật / Pháp lý", 
    "Marketing / Truyền thông / Quảng cáo", "Môi trường / Xử lý chất thải", "Mỹ phẩm / Trang sức",
    "Mỹ thuật / Nghệ thuật / Điện ảnh", "NGO / Phi chính phủ / Phi lợi nhuận", "Ngân hàng / Tài chính", 
    "Nhân sự", "Nông / Lâm / Ngư nghiệp", "Phi chính phủ / Phi lợi nhuận", "QA / QC", "Quản lý điều hành",
    "Spa / Làm đẹp", "Sản phẩm công nghiệp", "Sản xuất", "Thiết kế nội thất", "Thiết kế đồ họa", "Thư ký / Trợ lý",
    "Thời trang", "Thực phẩm / Đồ uống", "Tài chính / Đầu tư", "Tư vấn", "Tổ chức sự kiện / Quà tặng", "Vận tải / Kho vận",
    "Xuất nhập khẩu", "Xây dựng", "Y tế / Dược", "Điện / Điện tử / Điện lạnh", "Điện tử viễn thông", "Địa chất / Khoáng sản"
]

const jobType = ["Toàn thời gian", "Bán thời gian", "Remote"];
const levelRequirement = ["Thực tập sinh", "Nhân viên", "Trưởng phòng"];
const experience = ["Không yêu cầu kinh nghiệm", "Dưới 1 năm", "1 năm", "2 năm", "3 năm", "4 năm", "5 năm", "Trên 5 năm"];
const genderRequirement = ["Không yêu cầu", "Nam", "Nữ"];
const acceptanceStatus = ["waiting","accept", "decline"];
const status = ["active", "inactive"];
const provinceOfVietNam = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái"
]

mapRolePermission = {
    "ADMIN": "001",
    "RECRUITER": "002",
    "CANDIDATE": "003"
}

module.exports = {
    fieldOfActivity,
    jobType,
    levelRequirement,
    experience,
    genderRequirement,
    acceptanceStatus,
    status,
    provinceOfVietNam,
    mapRolePermission
}
