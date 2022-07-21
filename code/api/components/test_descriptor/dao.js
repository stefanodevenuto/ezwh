const AppDAO = require("../../../db/AppDAO");

class TestDescriptorDAO extends AppDAO {
    async getAllTestDescriptors() {
        const query = 'SELECT * FROM testDescriptor';
        return await this.all(query);
    }

    async getTestDescriptorByID(testDescriptorId) {
        const query = 'SELECT * FROM testDescriptor WHERE id = ?';
        let row = await this.get(query, [testDescriptorId]);

        return row;
    }

    async createTestDescriptor(name, procedureDescription, idSKU) {
        const query_test_descriptor = 'INSERT INTO testDescriptor(name, procedureDescription, idSKU) VALUES (?, ?, ?)';
        const query_sku = 'UPDATE sku SET testDescriptor = ? WHERE id = ?';

        await this.startTransaction();

        const { id } = await this.run(query_test_descriptor, [name, procedureDescription, idSKU]);
        await this.run(query_sku, [id, idSKU]);

        await this.commitTransaction();
        return id;
    }

    async modifyTestDescriptor(newTestDescriptorId, newName, newProcedureDescription, newIdSKU) {
        const query_test_descriptor = 'UPDATE testDescriptor SET name = ?, procedureDescription = ?, idSKU = ? WHERE id = ?';
        const query_sku = 'UPDATE sku SET testDescriptor = ? WHERE id = ?';

        let row = await this.getTestDescriptorByID(newTestDescriptorId);
        if (row === undefined)
            return {changes: 0};

        const oldSkuId = row.idSKU;

        let totalChanges = 0;
        await this.startTransaction();

        const { changes: testDesc} = await this.run(query_test_descriptor, [newName, newProcedureDescription, newIdSKU, newTestDescriptorId])
        totalChanges += testDesc;
        const { changes: firstSku} = await this.run(query_sku, [null, oldSkuId])
        totalChanges += firstSku;
        const { changes: secondSku} = await this.run(query_sku, [newTestDescriptorId, newIdSKU])
        totalChanges += secondSku;

        await this.commitTransaction();
        return totalChanges;
    }

    async deleteTestDescriptor(testDescriptorId) {
        const query = 'DELETE FROM testDescriptor WHERE id = ?'
        return await this.run(query, [testDescriptorId]);
    }

    // ###### Test

    async deleteAllTestDescriptor() {
        const query = 'DELETE FROM testDescriptor'
        return await this.run(query);
    }
}

module.exports = TestDescriptorDAO;
