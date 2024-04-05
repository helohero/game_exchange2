const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils');
const Pay = require('../pay');


function cardPayService(app){
    app.get('/openapi/cardPayService', (req, res) => {
        let card_no = req.query.card_no || req.body.card_no || '';
        let card_pass = req.query.card_pass || req.body.card_pass || '';
        let total_pay_money_limit = req.query.total_pay_money_limit || req.body.total_pay_money_limit || '';

        if(!card_no.trim() || !card_pass.trim()){
            return res.json({ error : 'params error.' });
        }

        if(encodeURIComponent(card_no) !== card_no  || encodeURIComponent(card_pass) !== card_pass) {
            return res.json({ error : 'params error.' });
        }


        let currentDateStr = utils.currentDateStr();
        let totalPayPath = path.resolve(__dirname, `../logs/total_pay/${currentDateStr}.json`);
        let totalPayMoney = {
            total_pay_money : 0
        };
        if (!fs.existsSync(totalPayPath)) {
            fs.writeFileSync(totalPayPath, JSON.stringify({ total_pay_money : 0 }));
        } else {
            totalPayMoney = JSON.parse(fs.readFileSync(totalPayPath).toString());
        }
        if(total_pay_money_limit){
            if(parseFloat(total_pay_money_limit) <= totalPayMoney.total_pay_money) {
                return res.json({ error : 'total pay money limit.' });
            }
        }

        Pay.cardPay(card_no, card_pass, (json, originResponse) => {
            //销卡成功
            if (json.ret_code === '0') {
                let pay_money = parseFloat(json.card_real_amt);
                totalPayMoney.total_pay_money = utils.formatFloat(totalPayMoney.total_pay_money + pay_money);

                //更新到文件中
                fs.writeFileSync(totalPayPath, JSON.stringify(totalPayMoney));
                res.json({
                    data : {
                        total_pay_money : totalPayMoney.total_pay_money,
                        pay_money : pay_money,
                        pay_response : originResponse,
                    }
                })
            } else {
                res.json({
                    error : originResponse
                });
            }
        });
    });
}


module.exports = {
    cardPayService,
}