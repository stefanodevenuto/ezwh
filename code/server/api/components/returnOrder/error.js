const INITIALIZATION_ERROR_MESSAGE      = "Internal error: try again later!";
const RETURN_ORDER_NOT_FOUND_MESSAGE    = "No Return Order associated to id";
const POSITION_NOT_SYMMETRIC            = "PositionId is not composed by provided AisleID,row and col";
const POSITION_ID_NOT_UNIQUE            = "PositionId already registered";
const POSITION_GREATER_THAN_MAX_WEIGHT  = "Input Weight greater than Max Weight";
const POSITION_GREATER_THAN_MAX_VOLUME  = "Input Volume greater than Max Volume";

class PositionErrorFactory {
    static initializeMapFailed() {
        let error = new Error(INITIALIZATION_ERROR_MESSAGE);
		error.code = 404;

		return error;
    }
    
    static newReturnOrderNotFound() {
        let error = new Error(RETURN_ORDER_NOT_FOUND_MESSAGE);
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

    static newGreaterThanMaxWeightPosition() {
        let error = new Error(POSITION_GREATER_THAN_MAX_WEIGHT);
		error.code = 422;

		return error;
    }

    static newGreaterThanMaxVolumePosition() {
        let error = new Error(POSITION_GREATER_THAN_MAX_VOLUME);
		error.code = 422;

		return error;
    }
}

module.exports = { PositionErrorFactory }