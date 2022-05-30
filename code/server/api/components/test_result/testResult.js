const SkuItem = require('../skuItem/SKUItem');

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

    static mockTestTestResult() {
        const skuItem = SkuItem.mockTestSkuItem();
        const testResult = new TestResult(null, "2022/02/02", true, null, skuItem.RFID);
        return testResult;
    }
}

module.exports = TestResult;