const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const itemsDbPath = path.join(__dirname, '../dbs/items.db');
const itemsDb = new sqlite3.Database(itemsDbPath, err => {});

function addItem(good_id, accountTips, categoryDetail, categoryId, categoryName, detail, facePrice, facePriceDesc, goodsTypeId, goodsTypeName, image, name, salePrice, topExtendInfo, unit,parentCategoryId, parentCategoryName,  success){
    let time = (new Date()).toISOString();
    let id = utils.randomString(20);
    itemsDb.run('INSERT INTO items (id, good_id, accountTips, categoryDetail, categoryId, categoryName, detail, facePrice, facePriceDesc, goodsTypeId, goodsTypeName, image, name, salePrice, topExtendInfo, unit, parentCategoryId, parentCategoryName,created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, good_id, accountTips, categoryDetail, categoryId, categoryName, detail, facePrice, facePriceDesc, goodsTypeId, goodsTypeName, image, name, salePrice, topExtendInfo, unit,parentCategoryId, parentCategoryName,time, time], function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function getItemsByTypeIdAndGoodId(typeId, goodId, success){
    itemsDb.all('SELECT * FROM items where goodsTypeId = ? and good_id = ? order by created_at ASC limit 50', [typeId, goodId],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllItems(success) {
    itemsDb.all('SELECT * FROM items order by created_at ASC', (err, rows) => {
        success && success(err, rows);
    });
}

function getItemsByCateId(cateid, success){
    itemsDb.all('SELECT * FROM items where categoryId = ? order by created_at ASC', [cateid], (err, rows) => {
        success && success(err, rows);
    });
}

function getItemsByParentId(parentid, success){
    itemsDb.all('SELECT * FROM items where parentCategoryId = ? order by created_at ASC', [parentid], (err, rows) => {
        success && success(err, rows);
    });
}

function getItemsByKeyword(keyword, success){
    itemsDb.all(`SELECT * FROM items where name like '%${keyword}%' order by created_at ASC`, (err, rows) => {
        success && success(err, rows);
    });
}

function getRandomItems(count, success){
    count = count || 1;
    itemsDb.all(`SELECT * FROM items ORDER BY RANDOM() limit ${count}`, (err, rows) => {
        success && success(err, rows);
    });
}

function getAllCategorys(success){
    itemsDb.all('select categoryId, image, categoryName, parentCategoryName from items  group by categoryName, parentCategoryId order by created_at ASC', (err, rows) => {
        success && success(err, rows);
    });
}

function initItemsTable(success){
    itemsDb.run(`CREATE TABLE IF NOT EXISTS items (
        id VARCHAR (30) PRIMARY KEY,
        good_id VARCHAR (30),
        accountTips VARCHAR (30),
        categoryDetail TEXT,
        categoryId VARCHAR (30),
        categoryName VARCHAR (30),
        detail TEXT,
        facePrice VARCHAR (30),
        facePriceDesc VARCHAR (30),
        goodsTypeId VARCHAR (30),
        goodsTypeName VARCHAR (30),
        image VARCHAR (30),
        name VARCHAR (30),
        salePrice VARCHAR (30),
        topExtendInfo VARCHAR (30),
        unit VARCHAR (30),
        parentCategoryId VARCHAR (30),
        parentCategoryName VARCHAR (30),
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        })
}

module.exports = {
    addItem,
    initItemsTable,
    getItemsByTypeIdAndGoodId,
    getAllItems,
    getItemsByCateId,
    getItemsByParentId,
    getItemsByKeyword,
    getAllCategorys,
    getRandomItems,
};