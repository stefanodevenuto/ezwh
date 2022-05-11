const AppDAO = require("../../../db/AppDAO");

class TestResultDAO extends AppDAO {

    constructor() { super(); }

    async getAllTestResults(RFID) {
        const query = 'SELECT * FROM testResult WHERE RFID = ?';
        return await this.all(query, [RFID]);
    }


    async getTestResultByID(rfid, id) {
        const query = 'SELECT * FROM testResult WHERE RFID = ? AND id = ?';
        let row = await this.get(query, [rfid, id]);

        return row;
    }

    async createTestResult(testResult) {
        const query_get_last_id = 'SELECT MAX(id) as id FROM testResult WHERE RFID = ?';
        const query_insert = 'INSERT INTO testResult(id, testDescriptorId, date, result, RFID) VALUES (?, ?, ?, ?, ?)';

        let { id } = await this.get(query_get_last_id, [testResult.rfid]);
        const newId = id + 1;

        await this.run(query_insert, [newId, testResult.idTestDescriptor,
            testResult.Date, testResult.Result, testResult.rfid]);

        return newId;
    }

    async modifyTestResult(id, rfid, testResult) {
        const query = 'UPDATE testResult SET testDescriptorId = ?, date = ?, result = ? WHERE RFID = ? AND id = ?';
        return await this.run(query, [testResult.newIdTestDescriptor, testResult.newDate, +testResult.newResult, rfid, id]);
    }

    async deleteTestResult(rfid, id) {
        const query = 'DELETE FROM testResult WHERE RFID = ? AND id = ?'
        return await this.run(query, [rfid, id]);
    }
}

module.exports = TestResultDAO;
