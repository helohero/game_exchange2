const request = require('request');
const md5 = require('md5');
const utils = require('../utils');
const usersModel = require('../models/users');

function login(app){
    app.post('/login_submit', (req, res) => {
        let accountName = req.body.accountName || '';
        let password = req.body.password || '';

        if(!accountName.trim() || !password.trim()) {
            return res.json({ error : 'params error' });
        }

        let phone = utils.validatePhoneNumber(accountName) && accountName || '';
        let email = utils.validateEmail(accountName) && accountName || '';

        usersModel.getUserByUsernameAndPassword(accountName, md5(password), (err, rows) => {
            if(err){ return res.json({ error : err }); }
            //如果存在该账户，则直接登录
            if(rows.length){
                //登录成功，写入cookie
                res.cookie('game_userid' , rows[0].id, { HttpOnly : true, expire : 30 * 24 * 60 * 60 * 1000 });
                res.json({ error : null });
            } else {
                //没有该账户则直接注册
                usersModel.addUser(accountName, password, email, phone, (err2, result) => {
                    if(err2) { return res.json({ error : err2 })}
                    if(result.userId) {
                        //注册成功，写入cookie
                        res.cookie('game_userid' , result.userId, { HttpOnly : true, expire : 30 * 24 * 60 * 60 * 1000 });
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
    app.get('/loginout', (req, res) => {
        let redirect_url = req.query.redirect_url;
        res.clearCookie('game_userid');
        res.redirect(redirect_url || '/login'); //调到登录页面
    });
}

module.exports = {
    login,
    loginout,
}