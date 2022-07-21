const CUSTOMER_NOT_FOUND = "The customer is not registered";
const USER_NOT_FOUND = "The username is not associated to any account";
const WRONG_CREDENTIAL   = "The credential inserted are wrong";
const INEXISTENT_TYPE    = "The given type doesn't exist";
const USER_CONFLICT      = "A user with same mail and type already exists";
const ATTEMPT_PRIVILEGED = "Can't create/modify/delete a privileged account!"

class UserErrorFactory {
    static newCustomerNotFound() {
        let error = new Error();
		error.customMessage = CUSTOMER_NOT_FOUND;
        error.customCode = 404;

		return error;
    }

    static newUserNotFound() {
        let error = new Error();
		error.customMessage = USER_NOT_FOUND;
        error.customCode = 404;

		return error;
    }

    static newWrongCredential() {
        let error = new Error();
		error.customMessage = WRONG_CREDENTIAL;
        error.customCode = 401;

		return error;
    }

    static newTypeNotFound() {
        let error = new Error();
		error.customMessage = INEXISTENT_TYPE;
        error.customCode = 401;

		return error;
    }

    static newTypeNotFound422() {
        let error = new Error();
		error.customMessage = INEXISTENT_TYPE;
        error.customCode = 422;

		return error;
    }

    static newUserConflict() {
        let error = new Error();
		error.customMessage = USER_CONFLICT;
        error.customCode = 409;

		return error;
    }

    static newAttemptCreationPrivilegedAccount() {
        let error = new Error();
		error.customMessage = ATTEMPT_PRIVILEGED;
        error.customCode = 422;

		return error;
    }
}

module.exports = { UserErrorFactory }