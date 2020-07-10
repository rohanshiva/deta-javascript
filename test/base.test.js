require('dotenv').config()

const Deta = require("../internal/deta");
var assert = require('assert');

initializeDatabase = () => {
   const deta = new Deta(process.env.DETA_TEST_PROJECT_KEY);
   const db = deta.Base(process.env.DETA_TEST_TABLE_NAME);
   return db;
};

clearDatabase = async (db) => {
    const all_items = await db.fetch();
    for (item of all_items){
        db.delete(item.key);
    }
};

describe('#db.update()', async () => {

    const db = initializeDatabase();
    let item = {
        "key": "testUpdate", 
        "name": "aavash",
        "profile": {
            "age": 22, 
            "active": true
        }
    }
    await db.put(item)
    
    let updates = {
        "username": "aavash",
        "profile.age": 23, 
        "profile.active": true, 
        "profile.awesome": {"value": false},
        "name": db.util.trim()
    }

    let expectedItem = {
        "key": "testUpdate",
        "username": "aavash", 
        "profile": {
            "age": 23, 
            "active": true, 
            "awesome": {"value": false}
        }
    }

    const returned = await db.update(updates, "testUpdate")
    const storedItem = await db.get("testUpdate")    

    assert.equal(returned, undefined)
    assert.deepEqual(storedItem, expectedItem)

    const badUpdates = {
        "username": "aavash",
        "username": db.util.trim() 
    }

    db.update(badUpdates, "testUpdate")
    //clearDatabase(db)
});