const request = require('request');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils');
const usersModel = require('../models/users');
const moneyModel = require('../models/money');
const Pay = require('../pay');

/*
options = {
    logdir,
    cardNo,
    cardPass
}
*/
function doCardPay(options, success) {
    /*
    1. 随机获取一个用户
    2. 执行销卡
    3. 回调success函数
    */
    if (!options.cardNo || !options.cardPass) {
        return ssuccess && success({ error: 'card data error' });
    }
    //获得随机一个用户
    usersModel.getRandomOneUser((err5, rows) => {
        if (err5) {
            return success && success(err5);
        }
        if (!rows || !rows.length) {
            return success && success({ error: 'no data.' });
        }

        if (rows.length) {
            let userData = rows[0];

            let currentDateStr = utils.currentDateStr();
            let logdir = options.logdir || currentDateStr;
            if (!fs.existsSync(path.resolve(__dirname, `../logs/cardpay/${logdir}`))) {
                fs.mkdirSync(path.resolve(__dirname, `../logs/cardpay/${logdir}`));
            }

            //执行卡的消费功能逻辑
            Pay.cardPay(options.cardNo, options.cardPass, (json, originResponse) => {
                if (json.ret_code === '0') {
                    //写入日志做记录
                    fs.writeFileSync(path.resolve(__dirname, `../logs/cardpay/${logdir}/${json.jnet_bill_no}`), originResponse + '&userId=' + userData.id + '&logdir=' + logdir + '&cardno=' + options.cardNo + '&cardpass=' + options.cardPass + '&time=' + Date.now());

                    let money = parseFloat(json.card_real_amt);

                    //充值到该账户中
                    moneyModel.getMoneyByUserId(userData.id, (err3, rows3) => {
                        //如果不存在记录，则初始化一条
                        if (!err3 && (!rows3 || !rows3.length)) {
                            moneyModel.initMoney(userData.id, (err2, result2) => {
                                if (result2.id) {
                                    moneyModel.updateMoney(userData.id, money, (err, result) => {
                                        if (err) { return success && success(err); }
                                        if (result.userId) {
                                            moneyModel.getMoneyByUserId(userData.id, (err2, rows2) => {
                                                if (err2) { return success && success(err2); }
                                                success && success(null, {
                                                    error: null,
                                                    money: money,
                                                    user: userData,
                                                    data: rows2 && rows2.length ? rows2[0] : null
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            moneyModel.updateMoney(userData.id, money, (err, result) => {
                                if (err) { return success && success(err); }
                                if (result.userId) {
                                    moneyModel.getMoneyByUserId(userData.id, (err2, rows2) => {
                                        if (err2) { return success && success(err2); }
                                        success && success(null, {
                                            error: null,
                                            money: money,
                                            user: userData,
                                            data: rows2 && rows2.length ? rows2[0] : null
                                        });
                                    });
                                }
                            });
                        }
                    });
                } else {
                    //写入日志做记录
                    fs.writeFileSync(path.resolve(__dirname, `../logs/cardpay/${logdir}/${json.jnet_bill_no}`), originResponse + '&userId=' + userData.id + '&logdir=' + logdir + '&cardno=' + options.cardNo + '&cardpass=' + options.cardPass + '&time=' + Date.now());

                    success && success({
                        error: json.ret_msg,
                        errorInfo: json
                    });
                }
            });
        }
    })
}


module.exports = doCardPay;