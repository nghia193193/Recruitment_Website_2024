'use strict'

const statusCodes = require('./statusCodes');
const reasonPhrases = require('./reasonPhrases');

class SuccessResponse {
    constructor({ message, statusCode, reasonStatusCode, metadata }) {
        this.message = !message ? reasonStatusCode : message
        this.status = "sucess"
        this.statusCode = statusCode
        this.metadata = metadata ?? {}
    }

    send(res, headers = {}) {
        return res.status(this.statusCode).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({ message, statusCode = statusCodes.OK, reasonStatusCode = reasonPhrases.OK, metadata, options }) {
        super({ message, statusCode, reasonStatusCode, metadata })
        this.options = options ?? {}
    }
}

class CREATED extends SuccessResponse {
    constructor({ message, statusCode = statusCodes.CREATED, reasonStatusCode = reasonPhrases.CREATED, metadata }) {
        super({ message, statusCode, reasonStatusCode, metadata })
    }
}

module.exports = {
    OK,
    CREATED
}