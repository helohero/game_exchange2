const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const utils = require('../utils');
const tasksDbPath = path.join(__dirname, '../dbs/tasks.db');
const tasksDb = new sqlite3.Database(tasksDbPath, err => {});

function addTask(userId, title, excel_path, success){
    let time = (new Date()).toISOString();
    let taskId = utils.randomString(20);
    tasksDb.run('INSERT INTO task (id, userid, title, excel_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [taskId, userId, title, excel_path, 0, time, time], function(err) {
        success && success(err, this.changes ? {
            taskId : taskId,
            userId : userId,
        } : {});
    });
}

function getTaskById(id, success){
    tasksDb.all('SELECT * FROM task where id = ?', [id],  (err, rows) => {
        success && success(err, rows);
    });
}

function getTaskByUserId(userId, success){
    tasksDb.all('SELECT * FROM task where userid = ? order by created_at DESC limit 100', [userId],  (err, rows) => {
        success && success(err, rows);
    });
}

function getOneTaskToRun(success){
    tasksDb.all('SELECT * FROM task where status = 0 order by created_at ASC limit 1', (err, rows) => {
        success && success(err, rows);
    });
}

function getAllTasks(status, success) {
    if(status){
        tasksDb.all('SELECT * FROM task order by where status = ? created_at DESC', [status], (err, rows) => {
            success && success(err, rows);
        });
    } else {
        tasksDb.all('SELECT * FROM task order by created_at DESC', (err, rows) => {
            success && success(err, rows);
        });
    }
}

function deleteTaskById(id, success){
    tasksDb.run('DELETE FROM task WHERE id = ?', [id], (err, rows) => {
        success && success(err, rows);
    });
}

function updateTask(condition, data, success){
    data.updated_at = (new Date()).toISOString();

    let sql = 'UPDATE task set ';
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

    tasksDb.run(sql, function(err) {
        success && success(err, this.changes ? data : {});
    });
}

function initTaskTable(success){
    tasksDb.run(`CREATE TABLE IF NOT EXISTS task (
        id VARCHAR (30) PRIMARY KEY,
        userid VARCHAR (30) NOT NULL,
        title VARCHAR (100) NOT NULL,
        excel_path VARCHAR (300) NOT NULL,
        status int,
        created_at VARCHAR (30) NOT NULL,
        updated_at VARCHAR (30) NOT NULL
        )`, (err) => {
            success && success(err);
        });
}

module.exports = {
    initTaskTable,
    addTask,
    getTaskById,
    getTaskByUserId,
    getOneTaskToRun,
    getAllTasks,
    deleteTaskById,
    updateTask,
};