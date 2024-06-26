'use strict'

const statusCodes = require('./statusCodes');
const reasonPhrases = require('./reasonPhrases');


class ErrorResponse extends Error {

    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.BAD_REQUEST, statusCode = statusCodes.BAD_REQUEST) {
        super(message, statusCode)
    }
}

class NotFoundRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.NOT_FOUND, statusCode = statusCodes.NOT_FOUND) {
        super(message, statusCode)
    }
}

class UnauthorizedRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.UNAUTHORIZED, statusCode = statusCodes.UNAUTHORIZED) {
        super(message, statusCode)
    }
}

class ForbiddenRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.FORBIDDEN, statusCode = statusCodes.FORBIDDEN) {
        super(message, statusCode)
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.CONFLICT, statusCode = statusCodes.CONFLICT) {
        super(message, statusCode)
    }
}

class InternalServerError extends ErrorResponse {
    constructor(message = reasonPhrases.INTERNAL_SERVER_ERROR, statusCode = statusCodes.INTERNAL_SERVER_ERROR) {
        super(message, statusCode)
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedRequestError,
    ForbiddenRequestError,
    NotFoundRequestError,
    ConflictRequestError,
    InternalServerError
}

