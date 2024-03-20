const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const parterUsersDbPath = path.join(__dirname, '../dbs/parterusers.db');
const parterUsersDb = new sqlite3.Database(parterUsersDbPath, err => {});

function addUser(username, password, success){
    let time = (new Date()).toISOString();
    let userId = utils.randomString(20);
    parterUsersDb.run('INSERT INTO user (id, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [userId, username, md5(password), time, time], function(err) {
        success && success(err, this.changes ? {
            userId : userId
        } : {});
    });
}

function getTotalCountUsers(success){
    parterUsersDb.all('SELECT count(*) as total FROM user', (err, rows) => {
        success && success(err, rows);
    });
}

function getUserById(id, success){
    parterUsersDb.all('SELECT * FROM user where id = ?', [id],  (err, rows) => {
        success && success(err, rows);
    });
}

function getUserByUsername(username, success){
    parterUsersDb.all('SELECT * FROM user where username = ?', [username],  (err, rows) => {
        success && success(err, rows);
    });
}

function getUserByUsernameAndPassword(username, password, success){
    parterUsersDb.all('SELECT * FROM user where username = ? and password = ?', [username, password],  (err, rows) => {
        success && success(err, rows);
    });
}

function getAllUsers(success) {
    parterUsersDb.all('SELECT * FROM user order by created_at DESC', (err, rows) => {
        success && success(err, rows);
    });
}

function deleteUserById(id, success){
    parterUsersDb.run('DELETE FROM user WHERE id = ?', [id], (err, rows) => {
        success && success(err, rows);
    });
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

    parterUsersDb.run(sql, function(err) {
        success && success(err, this.changes ? data : {});
    });
}

function initUsersTable(success){
    parterUsersDb.run(`CREATE TABLE IF NOT EXISTS user (
        id VARCHAR (30) PRIMARY KEY,
        username VARCHAR (30) NOT NULL,
        password VARCHAR (30) NOT NULL,
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
    getTotalCountUsers,
    getUserById,
    getUserByUsername,
    getUserByUsernameAndPassword,
    getAllUsers,
    deleteUserById,
};