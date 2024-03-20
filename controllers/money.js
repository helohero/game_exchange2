
const moneyModel = require('../models/money');
const Pay = require('../pay');
const fs = require('fs');
const path = require('path');
const utils = require('../utils');

function card_exchange(app){
    app.post('/card_exchange', (req, res) => {
        let userId = req.cookies.game_userid;
        if(!userId){ return res.json({ error : "not login"}) }
    
        let cardNum = req.body.cardNum.trim();
        let cardPassword = req.body.cardPassword.trim();
    
        if(!cardNum || !cardPassword) {
            return res.json({ error : '参数不全，请重试' });
        }

        let currentDateStr = utils.currentDateStr();
        let logdir = currentDateStr;
        if(!fs.existsSync(path.resolve(__dirname, `../logs/cardpay/${logdir}`))) {
            fs.mkdirSync(path.resolve(__dirname, `../logs/cardpay/${logdir}`));
        }
        
        //执行卡的消费功能逻辑
        Pay.cardPay(cardNum, cardPassword, (json, originResponse) => {
            if(json.ret_code === '0') {
                //写入日志做记录
                fs.writeFileSync(path.resolve(__dirname, `../logs/cardpay/${logdir}/${json.jnet_bill_no}`), originResponse + '&userId=' + userId + '&logdir=' + logdir + '&cardno=' + cardNum + '&cardpass=' + cardPassword + '&time=' + Date.now());


                let money = parseFloat(json.card_real_amt);

                //充值到该账户中
                moneyModel.updateMoney(userId, money, (err, result) => {
                    if(err){ return res.json({ error : err }) }
                    if(result.userId){
                        moneyModel.getMoneyByUserId(userId, (err2, rows) => {
                            if(err2){ return res.json({ error : err2 }) }
                            res.json({
                                error : null,
                                money : money,
                                data : rows && rows.length ? rows[0] : null
                            });
                        });
                    }
                });
            } else {
                //写入日志做记录
                fs.writeFileSync(path.resolve(__dirname, `../logs/cardpay/${logdir}/${json.jnet_bill_no}`), originResponse + '&userId=' + userId + '&logdir=' + logdir + '&cardno=' + cardNum + '&cardpass=' + cardPassword + '&time=' + Date.now());
                
                res.json({
                    error : json.ret_msg,
                    errorInfo : json
                });
            }
        });
    });
}

function profileInfo(app){
    app.get('/profile_info', (req, res) => {
        let userId = req.cookies.game_userid || req.query.userid;
        if(!userId){ return res.json({ error : "not login"}) }
    
        moneyModel.getMoneyByUserId(userId, (err, rows) => {
            if(err){ return res.json({ error : err })}
            //如果不存在记录，则初始化一条
            if(!err && (!rows || !rows.length)) {
                moneyModel.initMoney(userId, (err2, result) => {
                    if(err) {
                        return res.json({ error :  err2 });
                    }
                    if(result.id) {
                        res.json({ error : null, type : 'init', data : result });
                    }
                });
            } else {
                res.json({ error : null, data : rows[0] });
            }
        });
    });
}

module.exports = {
    card_exchange,
    profileInfo,
}