const tasksModel = require('../models/tasks');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils');
let multer = require('multer');


let Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve(__dirname, '../public/upload_files'));
    },
    filename: (req, file, callback) => {
        //callback(null, file.fieldname + '_' + utils.randomString(20) + '_' + file.originalname);
        callback(null, file.fieldname + '_' + utils.randomString(20));
    }
});

const fileFilter = (req, file, cb) => {
    // 限制文件类型 
    var acceptableMime = ['application/ms-excel', 'application/msexcel', 'excel/*', 'application/vnd.ms-excel', 'application/x-msexcel', 'application/x-ms-excel', 'application/x-excel', 'application/x-dos_ms_excel', 'application/xls', 'application/x-xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (acceptableMime.indexOf(file.mimetype) !== -1) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

let upload = multer({
    storage: Storage,
    fileFilter, // 过滤文件
    limits: {
        fileSize: 5 * 1024 * 1000, // 1000 = 1KB, 1000*1024 = 1MB; 限制文件大小
        files: 5 // 限制上传数量,取最小限制值
    }
}).array('file', 99999);


function addTask(app){
    app.post('/partner/admin/submit_task', (req, res) => {
        let userId = req.cookies.partner_userid;
        if(!userId){ return res.json({ error : "not login" })}
        upload(req, res, (err) => {
            if (err) {
                res.json({
                    error : err,
                });
            } else {
                let fileUrl = req.files[0].path; // 单个文件 路径地址
                let taskTitle = req.body.title;

                tasksModel.addTask(userId, taskTitle, fileUrl, (err, result) => {
                    if(err){
                        return res.json({ error : err });
                    }
                    res.json({
                        data : result
                    });
                });
            }
        });
    });
}

function getAllTasks(app){
    app.get('/partner/ops/get_alltasks', (req, res) => {
        let status = req.query.status;
        tasksModel.getAllTasks(status, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ data : rows });
        });
    })
}

function getTasksByUserId(app){
    app.get('/partner/admin/get_tasks', (req, res) => {
        let userId = req.cookies.partner_userid || req.query.partner_userid;
        if(!userId){ return res.json({ error : "not login" })}

        tasksModel.getTaskByUserId(userId, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ data : rows });
        })
    });
}

function deleteTaskById(app){
    app.get('/partner/admin/delete_task', (req, res) => {
        let userId = req.cookies.partner_userid || req.query.partner_userid;
        if(!userId){ return res.json({ error : "not login" })}

        let taskId = req.query.taskId;
        tasksModel.deleteTaskById(taskId, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ data : rows });
        });
    });
}


module.exports = {
    addTask,
    getAllTasks,
    getTasksByUserId,
    deleteTaskById,
}
