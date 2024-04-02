const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const cardcodesDbPath = path.join(__dirname, '../dbs/cardcodes.db');
const cardcodesDb = new sqlite3.Database(cardcodesDbPath, err => {});

function addCardCode(type, face_value, card_no, card_pass,  success){
    let time = (new Date()).toISOString();
    let id = utils.randomString(20);
    //status : 1(可用) 2(已使用)
    cardcodesDb.run('INSERT INTO codes (id, type, face_value, card_no, card_pass, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?, ?)', [id, type, face_value, card_no, card_pass, 1 ,time, time], function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function getRandomCardCodeByFaceValue(type, face_value, success){
    cardcodesDb.all('SELECT * FROM codes where type= ? and face_value = ? and status = ? ORDER BY RANDOM() limit 1', [type, face_value, '1'],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllCardCodes(success) {
    cardcodesDb.all('SELECT * FROM codes order by created_at DESC', (err, rows) => {
        success && success(err, rows);
    });
}

function updateCardCodeStatusById(id, status, success){
    let time = (new Date()).toISOString();
    cardcodesDb.run(`UPDATE codes set status = $status, updated_at = $updatedTime WHERE id = $id`, {
        $status : status,
        $updatedTime : time,
        $id : id
    }, function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function cleanAllData(success) {
    cardcodesDb.run(`delete from codes`, (err, rows) => {
        success && success(err, rows);
    });
}



function initItemsTable(success){
    cardcodesDb.run(`CREATE TABLE IF NOT EXISTS codes (
        id VARCHAR (30) PRIMARY KEY,
        face_value VARCHAR(30),
        card_no VARCHAR (50),
        card_pass VARCHAR (50),
        type VARCHAR(30),
        status VARCHAR (30),
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        })
}

module.exports = {
    initItemsTable,
    addCardCode,
    getRandomCardCodeByFaceValue,
    getAllCardCodes,
    updateCardCodeStatusById,
    cleanAllData,
};