const sqlite3 = require('sqlite3').verbose()

const db = this.db = new sqlite3.Database('./db/ezwh.db', (err) => {
    if (err)
        throw err;
});

initDB();

// -----------------------------------------------------------------------------

class AppDAO {
    constructor() {
        this.transaction = { onGoing: false };
        this.db = db;
    }

    async run(sql, params = []) {
        const copyDb = this.db;
        let transaction = this.transaction;

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
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
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    async startTransaction() {
        if (this.transaction.onGoing === true)
            return;

        await this.run("BEGIN TRANSACTION");
        this.transaction.onGoing = true;
    }

    async commitTransaction() {
        if (this.transaction.onGoing === false)
            return;

        await this.run("COMMIT");
        this.transaction.onGoing = false;
    }

    async rollbackTransaction() {
        if (this.transaction.onGoing === false)
            return;

        await this.run("ROLLBACK");
        this.transaction.onGoing = false;
    }
}

// -----------------------------------------------------------------------------

function initDB() {
    db.serialize(function () {
        this.run("PRAGMA foreign_keys = ON");

        this.run(`CREATE TABLE IF NOT EXISTS "position" ( \
            "positionID"	TEXT, \
            "aisleID"	TEXT, \
            "row"	TEXT, \
            "col"	TEXT, \
            "maxWeight"	INTEGER, \
            "maxVolume"	INTEGER, \
            "occupiedWeight"	INTEGER DEFAULT 0 CHECK("occupiedWeight" <= "maxWeight"), \
            "occupiedVolume"	INTEGER DEFAULT 0 CHECK("occupiedVolume" <= "maxVolume"), \
            PRIMARY KEY("positionID") \
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "user" (
            "id"	INTEGER,
            "name"	TEXT,
            "surname"	TEXT,
            "email"	TEXT,
            "password"	TEXT,
            "type"	TEXT,
            UNIQUE("email","type"),
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "sku" (
            "id"	INTEGER,
            "description"	TEXT,
            "weight"	INTEGER,
            "volume"	INTEGER,
            "notes"	TEXT,
            "positionId"	TEXT UNIQUE,
            "availableQuantity"	INTEGER,
            "price"	NUMERIC,
            "testDescriptor"	INTEGER UNIQUE,
            FOREIGN KEY("positionId") REFERENCES "position"("positionID") ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY("testDescriptor") REFERENCES "testDescriptor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "testDescriptor" (
            "id"	INTEGER,
            "name"	TEXT,
            "procedureDescription"	TEXT,
            "idSKU"	INTEGER /*UNIQUE*/,
            FOREIGN KEY("idSKU") REFERENCES "sku"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "restockOrder" (
            "id"	INTEGER,
            "issueDate"	TEXT,
            "state"	TEXT,
            "supplierId"	INTEGER,
            "deliveryDate"	TEXT,
            FOREIGN KEY("supplierId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("id" AUTOINCREMENT),
            CHECK("deliveryDate" IS NULL OR ("issueDate" < "deliveryDate"))
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "internalOrder" (
            "id"	INTEGER,
            "issueDate"	TEXT,
            "state"	TEXT,
            "customerId"	INTEGER,
            FOREIGN KEY("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "returnOrder" (
            "id"	INTEGER,
            "returnDate"	TEXT,
            "restockOrderId"	INTEGER,
            FOREIGN KEY("restockOrderId") REFERENCES "restockOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("id" AUTOINCREMENT)
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "skuItem" (
            "RFID"	TEXT,
            "SKUId"	INTEGER,
            "available"	INTEGER,
            "dateOfStock"	TEXT,
            "returnOrderId"	INTEGER,
            "restockOrderId"	INTEGER,
            "internalOrderId"	INTEGER,
            FOREIGN KEY("SKUId") REFERENCES "sku"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY("internalOrderId") REFERENCES "internalOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY("restockOrderId") REFERENCES "restockOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY("returnOrderId") REFERENCES "returnOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            PRIMARY KEY("RFID")
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "testResult" (
            "id"	INTEGER,
            "testDescriptorId"	INTEGER,
            "date"	TEXT,
            "result"	INTEGER,
            "RFID"	TEXT,
            FOREIGN KEY("testDescriptorId") REFERENCES "testDescriptor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY("RFID") REFERENCES "skuItem"("RFID") ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE("id","RFID"),
            PRIMARY KEY("RFID","id")
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "item" (
            "id"	INTEGER,
            "description"	TEXT,
            "price"	NUMERIC,
            "SKUId"	INTEGER,
            "supplierId"	INTEGER,
            FOREIGN KEY("SKUId") REFERENCES "sku"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY("supplierId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("id","supplierId"),
            UNIQUE("supplierId","SKUId")
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "restockOrder_item" (
            "itemId"	INTEGER,
            "supplierId"	INTEGER,
            "restockOrderId"	INTEGER,
            "qty"	INTEGER,
            FOREIGN KEY("itemId","supplierId") REFERENCES "item"("id","supplierId") ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY("restockOrderId") REFERENCES "restockOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("itemId","restockOrderId")
        )`);

        this.run(`CREATE TABLE IF NOT EXISTS "internalOrder_sku" (
            "internalOrderId"	INTEGER,
            "skuId"	INTEGER,
            "qty"	INTEGER,
            FOREIGN KEY("skuId") REFERENCES "sku"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY("internalOrderId") REFERENCES "internalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            PRIMARY KEY("internalOrderId","skuId")
        )`);

        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('customer','customer','user1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','customer')`);
        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('qualityEmployee','qualityEmployee','qualityEmployee1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','qualityEmployee')`);
        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('clerk','clerk','clerk1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','clerk')`);
        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('deliveryEmployee','deliveryEmployee','deliveryEmployee1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','deliveryEmployee')`);
        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('supplier','supplier','supplier1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','supplier')`);
        this.run(`INSERT OR IGNORE INTO "user"(name, surname, email, password, type) VALUES ('manager','manager','manager1@ezwh.com','e16b2ab8d12314bf4efbd6203906ea6c','manager')`);
    })
}

module.exports = AppDAO;