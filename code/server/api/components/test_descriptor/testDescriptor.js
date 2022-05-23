const Sku = require("../sku/sku");

class TestDescriptor {
    constructor(id, name, procedureDescription, idSKU) {
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.idSKU =idSKU;
    }

    static mockTestTestDescriptor() {
        const testDescriptor = new TestDescriptor(null, "test test descriptor", "test test descriptor", null);
        return testDescriptor;
    }
}

module.exports = TestDescriptor;