const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const goodscodesDbPath = path.join(__dirname, '../dbs/goodscodes.db');
const goodscodesDb = new sqlite3.Database(goodscodesDbPath, err => {});

function addGoodsCode(code, face_value,  success){
    let time = (new Date()).toISOString();
    let id = utils.randomString(20);
    //status : 1(可用) 2(已使用)
    goodscodesDb.run('INSERT INTO codes (id, code, face_value, status, created_at, updated_at) VALUES (?,?,?,?,?,?)', [id, code, face_value, 1 ,time, time], function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function getGoodsCodeByCode(code, success){
    goodscodesDb.all('SELECT * FROM codes where code = ?', [code],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllGoodsCodes(status, face_value, success) {
    if(status && face_value){
        goodscodesDb.all('SELECT * FROM codes where status = ? and face_value = ? order by created_at DESC', [status, face_value], (err, rows) => {
            success && success(err, rows);
        });
        return;
    }
    if(status){
        goodscodesDb.all('SELECT * FROM codes where status = ? order by created_at DESC', [status], (err, rows) => {
            success && success(err, rows);
        });
        return;
    }
    if(face_value){
        goodscodesDb.all('SELECT * FROM codes where face_value = ? order by created_at DESC', [face_value], (err, rows) => {
            success && success(err, rows);
        });
        return;
    }
    goodscodesDb.all('SELECT * FROM codes order by created_at DESC', (err, rows) => {
        success && success(err, rows);
    });
}

function updateGoodsCodeToUsedById(id, card_no, card_pass, success){
    let time = (new Date()).toISOString();
    goodscodesDb.run(`UPDATE codes set card_no = $cardNo, card_pass = $cardPass, status = $status, updated_at = $updatedTime WHERE id = $id`, {
        $cardNo : card_no,
        $cardPass : card_pass,
        $status : '2',
        $updatedTime : time,
        $id : id
    }, function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function cleanAllData(success) {
    goodscodesDb.run(`delete from codes`, (err, rows) => {
        success && success(err, rows);
    });
}


function initItemsTable(success){
    goodscodesDb.run(`CREATE TABLE IF NOT EXISTS codes (
        id VARCHAR (30) PRIMARY KEY,
        code VARCHAR(50),
        face_value VARCHAR(50),
        card_no VARCHAR (50),
        card_pass VARCHAR (50),
        status VARCHAR (30),
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        })
}

module.exports = {
    initItemsTable,
    addGoodsCode,
    getGoodsCodeByCode,
    getAllGoodsCodes,
    updateGoodsCodeToUsedById,
    cleanAllData,
};