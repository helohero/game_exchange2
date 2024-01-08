const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const usersDbPath = path.join(__dirname, '../dbs/users.db');
const usersDb = new sqlite3.Database(usersDbPath, err => {});

function addUser(username, password, email, phone, success){
    let time = (new Date()).toISOString();
    let userId = utils.randomString(20);
    usersDb.run('INSERT INTO user (id, username, password, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, username, md5(password), email || '', phone || '', time, time], function(err) {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    });
}

function addUserAllInfo(username, password, email, phone, realname, idcard, success){
    let time = (new Date()).toISOString();
    let userId = utils.randomString(20);
    usersDb.run('INSERT INTO user (id, username, password, email, phone, realname, idcard, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [userId, username, md5(password), email || '', phone || '', realname || '', idcard || '', time, time], function(err) {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    });
}

function getRandomOneUser(success){
    usersDb.all('SELECT * FROM user ORDER BY RANDOM() limit 1', (err, rows) => {
        success && success(err, rows);
    });
}

function getTotalCountUsers(success){
    usersDb.all('SELECT count(*) as total FROM user', (err, rows) => {
        success && success(err, rows);
    });
}

function getUserById(id, success){
    usersDb.all('SELECT * FROM user where id = ?', [id],  (err, rows) => {
        success && success(err, rows);
    });
}

function getUserByUsername(username, success){
    usersDb.all('SELECT * FROM user where username = ?', [username],  (err, rows) => {
        success && success(err, rows);
    });
}

function getUserByUsernameAndPassword(username, password, success){
    usersDb.all('SELECT * FROM user where username = ? and password = ?', [username, password],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllUsers(success) {
    usersDb.all('SELECT * FROM user order by created_at DESC', (err, rows) => {
        success && success(err, rows);
    });
}

function deleteUserById(id, success){
    usersDb.run('DELETE FROM user WHERE id = ?', [id], (err, rows) => {
        success && success(err, rows);
    });
}

function updateUserRealNameAndIdCardByUserId(userId, realname, idcard, success) {
    usersDb.run(`UPDATE user SET realname = $realname, idcard = $idcard WHERE id = $userId`, {
        $realname : realname,
        $idcard : idcard,
        $userId : userId
    }, (err) => {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    })
}

function updateUser(condition, data, success){
    data.updated_at = (new Date()).toISOString();

    let sql = 'UPDATE user set ';
    let temp = [];
    for(var key in data){
        if(data.hasOwnProperty(key)){
            temp.push(key + "=" + data[key]);
        }
    }
    sql += temp.join(",");
    temp = [];
    for(var key in condition){
        if(condition.hasOwnProperty(key)){
            temp.push(key + "=" + condition[key]);
        }
    }

    sql += temp.length ? ' where ' + temp.join(' and ') : '';

    usersDb.run(sql, function(err) {
        success && success(err, this.changes ? data : {});
    });
}

function initUsersTable(success){
    usersDb.run(`CREATE TABLE IF NOT EXISTS user (
        id VARCHAR (30) PRIMARY KEY,
        username VARCHAR (30) NOT NULL,
        password VARCHAR (30) NOT NULL,
        email VARCHAR (30),
        phone VARCHAR (30),
        realname VARCHAR (30),
        idcard VARCHAR (30),
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        });
}

module.exports = {
    initUsersTable,
    addUser,
    updateUser,
    updateUserRealNameAndIdCardByUserId,
    addUserAllInfo,
    getRandomOneUser,
    getTotalCountUsers,
    getUserById,
    getUserByUsername,
    getUserByUsernameAndPassword,
    getAllUsers,
    deleteUserById,
};