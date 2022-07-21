const POSITION_NOT_FOUND_MESSAGE        = "No Position associated to id";
const POSITION_NOT_SYMMETRIC            = "PositionId is not composed by provided AisleID,row and col";
const POSITION_ID_NOT_UNIQUE            = "PositionId already registered";
const POSITION_GREATER_THAN_MAX_WEIGHT  = "Input Weight greater than Max Weight";
const POSITION_GREATER_THAN_MAX_VOLUME  = "Input Volume greater than Max Volume";

class PositionErrorFactory {
    static newPositionNotFound() {
        let error = new Error();
		error.customCode = 404;
        error.customMessage = POSITION_NOT_FOUND_MESSAGE;

		return error;
    }

    static newPositionIdNotSymmetric() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_NOT_SYMMETRIC;

		return error;
    }

    static newPositionIDNotUnique() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_ID_NOT_UNIQUE;

		return error;
    }

    static newGreaterThanMaxWeightPosition() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_GREATER_THAN_MAX_WEIGHT;

		return error;
    }

    static newGreaterThanMaxVolumePosition() {
        let error = new Error();
		error.customCode = 422;
        error.customMessage = POSITION_GREATER_THAN_MAX_VOLUME;

		return error;
    }
}

module.exports = { PositionErrorFactory }