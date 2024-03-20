const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils');
const parterUsersModel = require('../models/partnerusers');
const usersModel = require('../models/users');
const moneyModel = require('../models/money');
const Pay = require('../pay');


function login_submit(app){
    app.post('/parter/admin/login_submit', (req, res) => {
        let accountName = req.body.accountName || '';
        let password = req.body.password || '';

        if(!accountName.trim() || !password.trim()) {
            return res.json({ error : 'params error' });
        }

        parterUsersModel.getUserByUsernameAndPassword(accountName, md5(password), (err, rows) => {
            if(err){ return res.json({ error : err }); }
            //如果存在该账户，则直接登录
            if(rows.length){
                //登录成功，写入cookie
                res.cookie('partner_userid' , rows[0].id, { HttpOnly : true, expire : 30 * 24 * 60 * 60 * 1000 });
                res.json({ error : null });
            } else {
                //没有该账户则直接注册
                parterUsersModel.addUser(accountName, password, (err2, result) => {
                    if(err2) { return res.json({ error : err2 })}
                    if(result.userId) {
                        //注册成功，写入cookie
                        res.cookie('partner_userid' , result.userId, { HttpOnly : true, expire : 30 * 24 * 60 * 60 * 1000 });
                        res.json({ error : null });
                    } else {
                        return res.json({ error : 'register fail.' });
                    }
                });
            }
        });
    });
}

function loginout(app) {
    app.get('/parter/loginout', (req, res) => {
        res.clearCookie('partner_userid');
        res.redirect('/partner/login'); //调到登录页面
    });
}

function addParterUser(app){
    app.get('/parter/ops/add_parter', (req, res) => {
        let username = req.query.username;
        let password = req.query.password;
        parterUsersModel.getUserByUsername(username, (err, rows) => {
            if(rows.length){
                return res.json({ error : 'user exist.' });
            }
            parterUsersModel.addUser(username, password, (err, result) => {
                if(result.userId) {
                    res.json({ data : result });
                } else {
                    res.json(err);
                }
            });
        });
    });
}

function getAllParterUsers(app){
    app.get('/parter/ops/get_allusers', (req, res) => {
        parterUsersModel.getAllUsers((err, rows) => {
            if(err){
                return res.json(err);
            }
            res.json({
                data : rows
            });
        });
    });
}

function getParterUserInfo(app){
    //获取登录用户的信息
    app.get('/parter/admin/get_userinfo', (req, res) => {
        let userId = req.cookies.partner_userid || req.query.partner_userid;
        if(!userId){ return res.json({ error : "not login" })}

        parterUsersModel.getUserById(userId, (err, rows) => {
            if(err){ return res.json({ error : err })}

            if(rows.length){
                res.json({
                    error : null,
                    data : {
                        id : rows[0].id,
                        username : rows[0].username,
                    }
                });
            } else {
                res.json({ error : 'no user data'});
            }
        })
    });
}

function deleteParterUser(app){
    app.get('/parter/ops/deletebyid', (req, res) => {
        let id = req.query.id;
        if(!id){ return res.json({ error : 'id empty' }); }
        parterUsersModel.deleteUserById(id, (err, rows) => {
            res.json({
                error : err,
                data : rows
            })
        });
    });
}


function calcCardPayTotalMoneySingleDay(app){
    app.get('/parter/ops/total_pay_money', (req, res) => {
        let logdir = req.query.date || req.query.taskid || utils.currentDateStr();
        let pathName = path.resolve(__dirname, `../logs/cardpay/${logdir}`);
        let totalPayMoney = 0;
        fs.readdir(pathName, function(err, files){
            if(err){ return res.json(err); }
            (function iterator(i){
                if(i == files.length) {
                    res.json({
                        totalPayMoney : totalPayMoney
                    });
                    return;
                }
                fs.stat(path.join(pathName, files[i]), function(err, data){     
                    if(data.isFile()){     
                        let fileContent = fs.readFileSync(path.join(pathName, files[i])).toString(); 
                        let fileObj;      
                        try {
                            fileObj = querystring.parse(fileContent);
                            totalPayMoney += parseFloat(fileObj.card_real_amt);
                        } catch(e){}
                    }
                    iterator(i+1);
                });   
            })(0);
        });
    });
}

function statTaskResults(app){
    app.get('/partner/admin/stat_task_results', (req, res) => {
        let userId = req.cookies.partner_userid || req.query.partner_userid;
        if(!userId){ return res.json({ error : "not login" })}

        let taskId = req.query.taskid;
        if(!taskId){ return res.json({ error : 'taskId is empty' }); }

        let logdir = taskId;
        let pathName = path.resolve(__dirname, `../logs/cardpay/${logdir}`);
        let totalPayMoney = 0;
        let successResults = [];
        let failResults = [];
        let allResults = [];
        fs.readdir(pathName, function(err, files){
            if(err){ return res.json(err); }
            (function iterator(i){
                if(i == files.length) {
                    res.json({
                        data : {
                            totalPayMoney : utils.formatFloat(totalPayMoney),
                            allResults : allResults,
                            successResultCount : successResults.length,
                            failResultCount : failResults.length
                        }
                    });
                    return;
                }
                fs.stat(path.join(pathName, files[i]), function(err, data){     
                    if(data.isFile()){     
                        let fileContent = fs.readFileSync(path.join(pathName, files[i])).toString(); 
                        let fileObj;      
                        try {
                            fileObj = querystring.parse(fileContent);
                            allResults.push(fileObj);
                            totalPayMoney += parseFloat(fileObj.card_real_amt);
                            if(fileObj.ret_code === '0') {
                                totalPayMoney += parseFloat(fileObj.card_real_amt);
                                successResults.push(fileObj);
                            } else {
                                failResults.push(fileObj);
                            }
                        } catch(e){}
                    }
                    iterator(i+1);
                });   
            })(0);
        });
    });
}

module.exports = {
    login_submit,
    loginout,
    getParterUserInfo,
    addParterUser,
    getAllParterUsers,
    deleteParterUser,
    calcCardPayTotalMoneySingleDay,
    statTaskResults,
}