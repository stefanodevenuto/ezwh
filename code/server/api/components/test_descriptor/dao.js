const AppDAO = require("../../../db/AppDAO");

class TestDescriptorDAO extends AppDAO {

    constructor() { super(); }

    async getAllTestDescriptors() {
        const query = 'SELECT * FROM testDescriptor';
        return await this.all(query);
    }

    async getTestDescriptorByID(testDescriptorId) {
        const query = 'SELECT * FROM testDescriptor WHERE id = ?';
        let row = await this.get(query, [testDescriptorId]);

        return row;
    }

    async createTestDescriptor(testDescriptor) {
        const query_test_descriptor = 'INSERT INTO testDescriptor(name, procedureDescription, idSKU) VALUES (?, ?, ?)';
        const query_sku = 'UPDATE sku SET testDescriptor = ? WHERE id = ?';

        await this.startTransaction();

        const { id } = await this.run(query_test_descriptor, [testDescriptor.name, testDescriptor.procedureDescription,
            testDescriptor.idSKU]);
        console.log(id);
        await this.run(query_sku, [id, testDescriptor.idSKU]);

        await this.commitTransaction();

        return id;
    }

    async modifyTestDescriptor(newTestDescriptorId, newTestDescriptor, testDescriptor = {objOrReturn: undefined}) {
        const query_test_descriptor = 'UPDATE testDescriptor SET name = ?, procedureDescription = ?, idSKU = ? WHERE id = ?';
        const query_sku = 'UPDATE sku SET testDescriptor = ? WHERE id = ?';

        let row;
        if (testDescriptor.objOrReturn === undefined) {
            row = await this.getTestDescriptorByID(newTestDescriptorId);
            if (row === undefined)
                return 0;
        } else {
            row = testDescriptor.objOrReturn;
        }

        const oldSkuId = row.idSKU;
        testDescriptor.objOrReturn = oldSkuId;

        return await this.serialize([query_test_descriptor, query_sku, query_sku], [
            [newTestDescriptor.newName, newTestDescriptor.newProcedureDescription, newTestDescriptor.newIdSKU, newTestDescriptorId],
            [null, oldSkuId],
            [newTestDescriptorId, newTestDescriptor.newIdSKU]
        ]);
    }

    async deleteTestDescriptor(testDescriptorId) {
        const query = 'DELETE FROM testDescriptor WHERE id = ?'
        return await this.run(query, [testDescriptorId]);
    }
}

module.exports = TestDescriptorDAO;
