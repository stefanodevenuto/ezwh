class TestResult {
    constructor(id, date, result, testDescriptorId, RFID) {
        this.id = id;
        this.date = date;
        this.result = result;
        this.testDescriptorId = testDescriptorId;
        this.RFID = RFID;
    }
}

module.exports = TestResult;