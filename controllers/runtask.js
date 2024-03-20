const tasksModel = require('../models/tasks');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils');
const async = require('async');
const xlsx = require('node-xlsx');
const doCardPay = require('./doCardPay');

function runTasksForLater(timeout){
    setTimeout(() => {
        runTasks();
    }, timeout || 5 * 1000);
}

function runTasks(){
/*
    1. 获取一个任务
    2. 更新任务状态为运行中
    3. 获取到任务的内容后读取Excel文件的内容
    4. 形成卡密销卡的执行队列
    5. 执行完卡密销卡则写入日志文件
    6. 执行完成更新任务状态
*/
    tasksModel.getOneTaskToRun((err, tasks) => {  // 1. 获取一个任务执行
        if(err){ //读取任务失败，执行下一个
            console.log(err);
            return runTasksForLater();
        }
        if(!tasks.length){
            console.log('No task to run');
            return runTasksForLater(1000 * 10);
        }
        let taskData = tasks[0];
        tasksModel.updateTask({  // 2. 更新任务状态
            id : taskData.id
        }, {
            status : 1
        }, (err, updateRows) => {
            // 3.读取Excel文件内容
            let sheets = xlsx.parse(taskData.excel_path);
            let cardDatas = []; // 全部表数据
            sheets.forEach((sheet) => {
                for (let i = 1; i < sheet['data'].length; i++) {
                    var row = sheet['data'][i]; // 获取行数据
                    if (row && row.length > 0) {
                        cardDatas.push({
                            cardNo : row[0],
                            cardPass: row[1],
                        });
                    }
                }
            });

            if(cardDatas.length){
                let asyncFuncs = [];
                // 4. 执行队列
                cardDatas.forEach((item) => {
                    asyncFuncs.push(function(callback) {
                        doCardPay({
                            cardNo : item.cardNo,
                            cardPass : item.cardPass,
                            logdir : taskData.id
                        }, (err, json) => {
                            callback(null, json);
                        });
                    });
                });
                async.series(asyncFuncs, function(err, results){
                    // 5. 执行完成
                    tasksModel.updateTask({
                        id : taskData.id
                    }, {
                        status : 2
                    }, () => {
                        console.log(`Task(${taskData.id}) completed.`);
                        runTasksForLater();
                    });
                });
            } else { //不存在卡密数据，则更新状态并开始执行下一个
                tasksModel.updateTask({
                    id : taskData.id
                }, {
                    status : 2
                }, () => {
                    return runTasksForLater();
                });
            }
        });
    });
}

module.exports = runTasks;