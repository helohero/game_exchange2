const request = require('request');
const md5 = require('md5');
const utils = require('../utils');
const usersModel = require('../models/users');

function getUserInfo(app){
    //获取登录用户的信息
    app.get('/get_userinfo', (req, res) => {
        let userId = req.cookies.game_userid;
        if(!userId){ return res.json({ error : "not login" })}

        usersModel.getUserById(userId, (err, rows) => {
            if(err){ return res.json({ error : err })}

            if(rows.length){
                res.json({
                    error : null,
                    data : {
                        email : rows[0].email,
                        id : rows[0].id,
                        phone : rows[0].phone,
                        username : rows[0].username,
                        idcard : rows[0].idcard,
                        realname : rows[0].realname,
                    }
                });
            } else {
                res.json({ error : 'no user data'});
            }
        })
    });
}

function updateRealName(app){
    app.post('/update_realname', (req, res) => {
        let realname = req.body.realname || '';
        let idcard = req.body.idcard || '';
        let userId = req.cookies.game_userid;
        
        if(!userId){
            return res.json({ error : 'not login' });
        }
        if(!realname.trim() || !idcard.trim()){
            return res.json({ error : 'params error' });
        }
    
        usersModel.updateUserRealNameAndIdCardByUserId(userId, realname, idcard, (err, data) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ error : null });
        });
    });
}

module.exports = {
    getUserInfo,
    updateRealName,
}