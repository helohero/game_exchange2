
const moneyModel = require('../models/money');

function card_exchange(app){
    app.post('/card_exchange', (req, res) => {
        let userId = req.cookies.game_userid;
        if(!userId){ return res.json({ error : "not login"}) }
    
        let cardNum = req.body.cardNum;
        let cardPassword = req.body.cardPassword;
    
        if(!cardNum || !cardPassword) {
            return res.json({ error : '参数不全，请重试' });
        }
        
        //执行骏卡的消费功能逻辑

        let money = parseInt(Math.random() * 1000);
    
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
    });
}

function profileInfo(app){
    app.get('/profile_info', (req, res) => {
        let userId = req.cookies.game_userid;
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