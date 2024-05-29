const mongoose = require('mongoose');
const { Recruiter } = require('./recruiter.model');
const { BadRequestError, InternalServerError } = require('../core/error.response');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteRecruiterSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    favoriteRecruiters: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

favoriteRecruiterSchema.statics.getListFavoriteRecruiter = async function ({ userId, page, limit, searchText }) {
    const candidate = await this.findOne({ candidateId: userId });
    if (!candidate) {
        return { length: 0, listFavoriteRecruiter: [] };
    }
    let mappedFavoriteRecruiters = await Promise.all(
        candidate.favoriteRecruiters.map(async (recruiterId) => {
            const recruiter = await Recruiter.findById(recruiterId).lean().select(
                '-roles -createdAt -updatedAt -__v -acceptanceStatus -verifyEmail -firstApproval -loginId -avatar'
            )
            recruiter.companyLogo = recruiter.companyLogo?.url ?? null;
            recruiter.companyCoverPhoto = recruiter.companyCoverPhoto?.url ?? null;
            recruiter.slug = recruiter.slug ?? null;
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

favoriteRecruiterSchema.statics.checkFavoriteRecruiter = async function ({ userId, recruiterId }) {
    // check có recruiter này không
    const recruiter = await Recruiter.findById(recruiterId).lean();
    if (!recruiter) {
        throw new BadRequestError("Không tìm thấy nhà tuyển dụng này, vui lòng thử lại");
    }
    // check đã có list chưa
    const listFavoriteRecruiter = await this.findOne({ candidateId: userId });
    if (!listFavoriteRecruiter) {
        return {
            message: "Chưa thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.",
            exist: false
        }
    }
    // check recruiter đã có trong list chưa
    if (listFavoriteRecruiter.favoriteRecruiters.includes(recruiterId)) {
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

favoriteRecruiterSchema.statics.addFavoriteRecruiter = async function ({ userId, recruiterId }) {
    // check có recruiter này không
    const recruiter = await Recruiter.findById(recruiterId).lean();
    if (!recruiter) {
        throw new BadRequestError("Không tìm thấy nhà tuyển dụng này, vui lòng thử lại");
    }
    // check đã có list chưa
    const listFavoriteRecruiter = await this.findOne({ candidateId: userId });
    if (!listFavoriteRecruiter) {
        return await this.create({ candidateId: userId, favoriteRecruiters: [recruiterId] });
    }
    // check recruiter đã có trong list chưa
    if (listFavoriteRecruiter.favoriteRecruiters.includes(recruiterId)) {
        throw new BadRequestError("Bạn đã thêm nhà tuyển dụng vào nhà tuyển dụng yêu thích.");
    }
    listFavoriteRecruiter.favoriteRecruiters.push(recruiterId);
    await listFavoriteRecruiter.save();
}

favoriteRecruiterSchema.statics.removeFavoriteRecruiter = async function ({ userId, recruiterId, page, limit, searchText }) {
    // check đã có list chưa
    const candidate = await this.findOne({ candidateId: userId });
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

favoriteRecruiterSchema.statics.removeAllFavoriteRecruiter = async function ({ userId }) {
    // check đã có list chưa
    const listFavoriteRecruiter = await this.findOne({ candidateId: userId });
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

favoriteRecruiterSchema.statics.getLikeNumber = async function ({ recruiterId }) {
    const likeNumber = await this.find({favoriteRecruiters: recruiterId}).countDocuments();
    return likeNumber;
}

module.exports = {
    FavoriteRecruiter: model('FavoriteRecruiter', favoriteRecruiterSchema)
};