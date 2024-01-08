const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const ordersDbPath = path.join(__dirname, '../dbs/orders.db');
const ordersDb = new sqlite3.Database(ordersDbPath, err => {});

function addOrder(userId, itemid, price, item_info, order_info, type, success){
    let time = (new Date()).toISOString();
    let id = 'D' + utils.randomNumberString(20);
    type = type || '2'; // type表示该订单是什么类型，是网站人工下单的，还是机器接口调用下单的（1：网站人工， 2：机器调用接口）
    ordersDb.run('INSERT INTO orders (id, userid, itemid, price, item_info, order_info, status, type, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', [id, userId, itemid, price, item_info, order_info, '1', type, time, time], function(err) {
        success && success(err, this.changes ? {
            id : id
        } : {});
    });
}

function updateOrder(condition, data, success){
    data.updated_at = (new Date()).toISOString();

    let sql = 'UPDATE orders set ';
    let temp = [];
    for(var key in data){
        if(data.hasOwnProperty(key)){
            temp.push(key + "='" + data[key] + "'");
        }
    }
    sql += temp.join(",");
    temp = [];
    for(var key in condition){
        if(condition.hasOwnProperty(key)){
            temp.push(key + "='" + condition[key] + "'");
        }
    }

    sql += temp.length ? ' where ' + temp.join(' and ') : '';

    ordersDb.run(sql, function(err) {
        success && success(err, this.changes ? data : {});
    });
}

function queryOrders(condition, success){
    let sql = 'SELECT * FROM orders ';
    let temp = [];
    for(var key in condition){
        if(condition.hasOwnProperty(key)){
            temp.push(key + "='" + condition[key] + "'");
        }
    }

    sql +=  temp.length ? ' where ' + temp.join(' and ') : '';

    sql += ' order by created_at DESC';

    ordersDb.all(sql, function(err, rows) {
        success && success(err, rows);
    });
}

function getOrdersByUserId(userId, success){
    ordersDb.all('SELECT * FROM orders where userid = ? order by created_at DESC limit 50', [userId],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllOrders(type, success) {
    if(type){
        ordersDb.all(`SELECT * FROM orders WHERE type = ? order by created_at DESC`, [type], (err, rows) => {
            success && success(err, rows);
        });
    } else {
        ordersDb.all('SELECT * FROM orders order by created_at DESC', (err, rows) => {
            success && success(err, rows);
        });
    }
}

function deleteOrderById(id, success){
    ordersDb.run('DELETE FROM orders WHERE id = ?', [id], (err, rows) => {
        success && success(err, rows);
    });
}

function initOrdersTable(success){
    ordersDb.run(`CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR (30) PRIMARY KEY,
        userid VARCHAR (30) NOT NULL,
        itemid VARCHAR (30) NOT NULL,
        price VARCHAR (30) NOT NULL,
        item_info TEXT,
        order_info TEXT,
        status VARCHAR (30) NOT NULL,
        remark VARCHAR (30),
        type VARCHAR (30),
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        })
}

module.exports = {
    initOrdersTable,
    addOrder,
    updateOrder,
    getOrdersByUserId,
    getAllOrders,
    deleteOrderById,
    queryOrders,
};