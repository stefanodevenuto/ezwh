const INITIALIZATION_ERROR_MESSAGE  = "Internal error: try again later!";
const POSITION_NOT_FOUND_MESSAGE    = "No Position associated to id";
const POSITION_NOT_SYMMETRIC        = "PositionId is not composed by provided AisleID,row and col";
const POSITION_ID_NOT_UNIQUE        = "PositionId already registered";

class PositionErrorFactory {
    static initializeMapFailed() {
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newPositionNotFound() {
        let error = new Error(POSITION_NOT_FOUND_MESSAGE);
		error.code = 404;

		return error;
    }

    static newPositionIdNotSymmetric() {
        let error = new Error(POSITION_NOT_SYMMETRIC);
		error.code = 422;

		return error;
    }

    static newPositionIDNotUnique() {
        let error = new Error(POSITION_ID_NOT_UNIQUE);
		error.code = 422;

		return error;
    }
}

module.exports = { PositionErrorFactory }