const AppDAO = require("../../../db/AppDAO");

class TestResultDAO extends AppDAO {
    async getAllTestResults(RFID) {
        const query = 'SELECT * FROM testResult WHERE RFID = ?';
        return await this.all(query, [RFID]);
    }


    async getTestResultByID(rfid, id) {
        const query = 'SELECT * FROM testResult WHERE RFID = ? AND id = ?';
        let row = await this.get(query, [rfid, id]);

        return row;
    }

    async createTestResult(rfid, idTestDescriptor, Date, Result) {
        const query_get_last_id = 'SELECT MAX(id) as id FROM testResult WHERE RFID = ?';
        const query_insert = 'INSERT INTO testResult(id, testDescriptorId, date, result, RFID) VALUES (?, ?, ?, ?, ?)';

        let { id } = await this.get(query_get_last_id, [rfid]);
        const newId = id + 1;

        await this.run(query_insert, [newId, idTestDescriptor, Date, Result, rfid]);
        return newId;
    }

    async modifyTestResult(id, rfid, newIdTestDescriptor, newDate, newResult) {
        const query = 'UPDATE testResult SET testDescriptorId = ?, date = ?, result = ? WHERE RFID = ? AND id = ?';
        return await this.run(query, [newIdTestDescriptor, newDate, +newResult, rfid, id]);
    }

    async deleteTestResult(rfid, id) {
        const query = 'DELETE FROM testResult WHERE RFID = ? AND id = ?'
        return await this.run(query, [rfid, id]);
    }

    // Utilities
    async hasFailedTestResultsByRFID(rfid) {
        const query = 'SELECT COUNT(*) AS failedQuantity FROM testResult WHERE RFID = ? AND result = 0';
        return await this.get(query, [rfid]);
    }

    // Test
    async deleteAllTestResult() {
        const query = 'DELETE FROM testResult';
        return await this.run(query);
    }
}

module.exports = TestResultDAO;
