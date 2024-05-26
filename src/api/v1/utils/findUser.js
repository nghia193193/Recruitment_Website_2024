const { Admin } = require("../models/admin.model");
const { Candidate } = require("../models/candidate.model");
const { Recruiter } = require("../models/recruiter.model");

async function findAdminUser(email) {
    return await Admin.findOne({ email }).lean();
}

async function findRecruiterUser(email) {
    return await Recruiter.findOne({ email }).lean();
}

async function findCandidateUser(email) {
    return await Candidate.findOne({ email }).lean();
}

async function findUserByRole(role, email) {
    switch (role) {
        case "ADMIN":
            return await findAdminUser(email);
        case "RECRUITER":
            return await findRecruiterUser(email);
        case "CANDIDATE":
            return await findCandidateUser(email);
    }
}

module.exports = {
    findUserByRole
}