const request = require('request');
const md5 = require('md5');
const crypto = require('crypto');
const ip = require('ip');
const querystring = require('querystring');

const config = require('./payconfig');

function des(plaintext) {
    let desSignKey = config.payDesKey;
    let key = Buffer.from(desSignKey);
    let iv = Buffer.alloc(0);
    let alg = 'des-ede3';

    //encrypt
    let cipher = crypto.createCipheriv(alg, key, iv);
    cipher.setAutoPadding(true)  //default true
    let ciph = cipher.update(plaintext, 'utf8', 'hex');
    ciph += cipher.final('hex');
    return ciph;
}

function randomString(length){
    let str = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

let formatDate = function (num) {
    return num > 9 ? num : '0' + num;
}

let getCurrentTime = function () {
    let d = new Date();
    return [d.getFullYear(), formatDate(d.getMonth() + 1), formatDate(d.getDate())].join('') + [formatDate(d.getHours()), formatDate(d.getMinutes()), formatDate(d.getSeconds())].join('');
}

function cardPay(cardNo, cardPass, success){
    let bill_id = randomString(32);
    let bill_time = getCurrentTime();
    let agent_id = config.pay_agent_id;
    let card_type = config.pay_card_type;
    //let card_data_str = '2401192323619166,4341101468619212,';
    let card_data_str = `${cardNo},${cardPass},`;
    let card_data = des(card_data_str);
    //pay_amt = pay_amt || 0;
    pay_amt = config.pay_amt;
    let client_ip = ip.address().replace(/\./g,'_');
    let time_stamp = getCurrentTime();
    let signStr = `agent_id=${agent_id}&bill_id=${bill_id}&bill_time=${bill_time}&card_type=${card_type}&card_data=${card_data}&pay_amt=${pay_amt}&notify_url=&time_stamp=${time_stamp}|||${config.paySecretKey}`;
    let sign = md5(signStr);

    request({
        url : `https://pay.Heepay.com/Api/CardPaySubmitService.aspx`, 
        qs : {
            agent_id : agent_id,
            card_type : card_type,
            bill_id : bill_id,
            bill_time : bill_time,
            card_data : card_data,
            pay_amt : pay_amt,
            client_ip : client_ip,
            time_stamp : time_stamp,
            notify_url : '',
            sign : sign
        }
    }, (error, response, body) => {
        success && success(querystring.parse(body), body);
    });
}

//response body object
/*
{
  ret_code: '0',
  agent_id: '2199385',
  bill_id: 'tsjgy4ci1na94uwvreiiftxespdz8pfr',
  jnet_bill_no: 'H2402289968577AQ',
  bill_status: '1',
  card_real_amt: '0.1', //销卡总金额
  card_settle_amt: '0',
  card_detail_data: '2401192323619166=10',
  ret_msg: '支付成功',
  ext_param: '',
  ucard_kind: '272',
  sign: 'a352fd6177f14c81904f73466e7aead4'
}
*/
/*cardPay('2401192323619166', '4341101468619212', 0.1, (json) => {
    console.log(json);
});*/
module.exports = {
    cardPay : cardPay
}




