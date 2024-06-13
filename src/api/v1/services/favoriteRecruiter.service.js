const { BadRequestError, InternalServerError } = require("../core/error.response");
const { FavoriteRecruiter } = require("../models/favoriteRecruiter.model");
const { Job } = require("../models/job.model");
const { Recruiter } = require("../models/recruiter.model");

class FavoriteRecruiterService {
    static getListFavoriteRecruiter = async function ({ userId, page, limit, searchText }) {
        const candidate = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!candidate) {
            return { length: 0, listFavoriteRecruiter: [] };
        }
        let mappedFavoriteRecruiters = await Promise.all(
            candidate.favoriteRecruiters.map(async (recruiterId) => {
                const activeJobCount = await Job.find({
                    status: "active", acceptanceStatus: "accept",
                    recruiterId, deadline: { $gte: new Date() }
                }).countDocuments();
                const recruiter = await Recruiter.findById(recruiterId).lean().select(
                    '-roles -createdAt -updatedAt -__v -acceptanceStatus -verifyEmail -firstApproval -loginId -avatar'
                )
                recruiter.companyLogo = recruiter.companyLogo ?? null;
                recruiter.companyCoverPhoto = recruiter.companyCoverPhoto ?? null;
                recruiter.slug = recruiter.slug ?? null;
                recruiter.activeJobCount = activeJobCount;
                if (searchText) {
                    if (new RegExp(searchText, "i").test(recruiter.companyName) || new RegExp(searchText, "i").test(recruiter.slug)) {
                        return recruiter;
                    }
                } else {
                    return recruiter;
                }
            })
        )
        mappedFavoriteRecruiters = mappedFavoriteRecruiters.filter(recruiter => {
            if (recruiter) {
                return recruiter;
            }
        });
        const start = (page - 1) * limit;
        const end = start + limit;
        return { length: mappedFavoriteRecruiters.length, listFavoriteRecruiter: mappedFavoriteRecruiters.slice(start, end) };
    }

    static checkFavoriteRecruiter = async function ({ userId, slug }) {
        // check có recruiter này không
        const recruiter = await Recruiter.findOne({ slug }).lean();
        if (!recruiter) {
            throw new BadRequestError("Không tìm thấy nhà tuyển dụng này, vui lòng thử lại");
        }
        // check đã có list chưa
        const listFavoriteRecruiter = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!listFavoriteRecruiter) {
            return {
                message: "Chưa thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.",
                exist: false
            }
        }
        // check recruiter đã có trong list chưa
        if (listFavoriteRecruiter.favoriteRecruiters.includes(recruiter._id.toString())) {
            return {
                message: "Đã thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.",
                exist: true
            }
        }
        return {
            message: "Chưa thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.",
            exist: false
        }
    }

    static addFavoriteRecruiter = async function ({ userId, recruiterId }) {
        // check có recruiter này không
        const recruiter = await Recruiter.findById(recruiterId).lean();
        if (!recruiter) {
            throw new BadRequestError("Không tìm thấy nhà tuyển dụng này, vui lòng thử lại");
        }
        // check đã có list chưa
        const listFavoriteRecruiter = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!listFavoriteRecruiter) {
            return await FavoriteRecruiter.create({ candidateId: userId, favoriteRecruiters: [recruiterId] });
        }
        // check recruiter đã có trong list chưa
        if (listFavoriteRecruiter.favoriteRecruiters.includes(recruiterId)) {
            throw new BadRequestError("Bạn đã thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.");
        }
        listFavoriteRecruiter.favoriteRecruiters.push(recruiterId);
        await listFavoriteRecruiter.save();
    }

    static removeFavoriteRecruiter = async function ({ userId, recruiterId, page, limit, searchText }) {
        // check đã có list chưa
        const candidate = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!candidate) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        // check recruiter đã có trong list chưa
        if (!candidate.favoriteRecruiters.includes(recruiterId)) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        candidate.favoriteRecruiters = candidate.favoriteRecruiters.filter(recruiter => recruiter !== recruiterId);
        await candidate.save();
        // trả về list đã xóa 
        const { length, listFavoriteRecruiter } = await this.getListFavoriteRecruiter({ userId, page, limit, searchText });
        return { length, listFavoriteRecruiter };
    }

    static removeListFavoriteRecruiter = async function ({ userId, listRecruiterId }) {
        // check đã có list chưa
        const candidate = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!candidate) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        // check recruiter đã có trong list chưa
        if (!listRecruiterId.every(item => candidate.favoriteRecruiters.includes(item))) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        for (let i = 0; i < listRecruiterId.length; i++) {
            candidate.favoriteRecruiters = candidate.favoriteRecruiters.filter(item => item != listRecruiterId[i])
        }
        await candidate.save();
    }

    static removeAllFavoriteRecruiter = async function ({ userId }) {
        // check đã có list chưa
        const listFavoriteRecruiter = await FavoriteRecruiter.findOne({ candidateId: userId });
        if (!listFavoriteRecruiter) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        if (listFavoriteRecruiter.favoriteRecruiters.length === 0) {
            throw new BadRequestError("Không có nhà tuyển dụng nào trong danh sách.");
        }
        listFavoriteRecruiter.favoriteRecruiters = [];
        await listFavoriteRecruiter.save();
        return { length: 0, listFavoriteRecruiter: [] };
    }

    static getLikeNumber = async function ({ recruiterId }) {
        const likeNumber = await FavoriteRecruiter.find({ favoriteRecruiters: recruiterId }).countDocuments();
        return likeNumber;
    }
}

module.exports = FavoriteRecruiterService;