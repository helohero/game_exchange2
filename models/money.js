const path = require('path');
const sqlite3 = require('sqlite3');
const md5 = require('md5');
const utils = require('../utils');
const moneyDbPath = path.join(__dirname, '../dbs/money.db');
const moneyDb = new sqlite3.Database(moneyDbPath, err => {});

function initMoney(userId, success){
    let time = (new Date()).toISOString();
    let id = utils.randomString(20);
    moneyDb.run('INSERT INTO moneys (id, userid, money, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [id, userId, '0', time, time], function(err) {
        success && success(err, this.changes ? {
            id : id,
            userId : userId,
            money : 0,
            created_at : time,
            updated_at : time
        } : {});
    });
}

function updateTotalMoney(userId, money, success){
    let time = (new Date()).toISOString();
    moneyDb.run(`UPDATE moneys set money = $newMoney, updated_at = $updatedTime WHERE userid = $userId`, {
        $newMoney : money,
        $updatedTime : time,
        $userId : userId
    }, function(err) {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    });
}

function updateMoney(userId, money, success){
    let time = (new Date()).toISOString();
    moneyDb.run(`UPDATE moneys set money = money + $newMoney, updated_at = $updatedTime WHERE userid = $userId`, {
        $newMoney : money,
        $updatedTime : time,
        $userId : userId
    }, function(err) {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    });
}

function getMoneyByUserId(userId, success){
    moneyDb.all(`SELECT * FROM moneys WHERE userid = ?`, [userId], (err, rows) => {
        success && success(err, rows);
    });
}

function getAllMoneys(success){
    moneyDb.all(`SELECT * FROM moneys`, (err, rows) => {
        console.log(err, rows);
        success && success(err, rows);
    });
}

function initMoneysTable(success){
    moneyDb.run(`CREATE TABLE IF NOT EXISTS moneys (
        id VARCHAR (30) PRIMARY KEY,
        userid VARCHAR (30) NOT NULL,
        money VARCHAR (30) NOT NULL,
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        });
}

module.exports = {
    initMoneysTable,
    getAllMoneys,
    initMoney,
    updateTotalMoney,
    updateMoney,
    getMoneyByUserId,
};