class TestResult {
    constructor(id, date, result, testDescriptorId, RFID) {
        this.id = id;
        this.date = date;
        this.result = result;
        this.testDescriptorId = testDescriptorId;
        this.RFID = RFID;
    }

    intoJson() {
        return {
            id: this.id,
            Date: this.date,
            Result: this.result,
            idTestDescriptor: this.testDescriptorId
        }
    }
}

module.exports = TestResult;