const sqlite3 = require('sqlite3').verbose()

class AppDAO {
    constructor() {
        this.db = new sqlite3.Database('./db/ezwh.db', (err) => {
            if (err)
                throw err;
        });
        this.run("PRAGMA foreign_keys = ON");
        this.transaction = { onGoing: false };
    }

    async run(sql, params = []) {
        const copyDb = this.db;
        let transaction = this.transaction;

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.log('Error running sql ' + sql)
                    console.log(err)

                    if (transaction.onGoing) {
                        copyDb.run("ROLLBACK");
                        transaction.onGoing = false;
                    }
                        
                    reject(err)
                } else {
                    resolve({ id: this.lastID, changes: this.changes })
                }
            })
        })
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    console.log(err)
                    console.log(this);
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    async serialize(sqls, params = [[]], strictCheck = false) {
        let totalChanges = 0;

        await this.run("BEGIN TRANSACTION");
        this.transaction.onGoing = true;

        for (let i = 0; i < sqls.length; i++) {
            let { changes } = await this.run(sqls[i], params[i]);
            if (strictCheck && changes == 0) {
                await this.run("ROLLBACK");
                this.transaction.onGoing = false;
            }

            totalChanges += changes;
        }

        await this.run("COMMIT");

        return totalChanges;
    }
}

module.exports = AppDAO;