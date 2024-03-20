function randomString(length){
    var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

function randomNumberString(length){
    var str = '0123456789';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

function formatFloat (src, pos) {
    pos = pos || 2;
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
}

let formatDate = function (num) {
    return num > 9 ? num : '0' + num;
}

let currentDateStr = function (time, split) {
    let currentDate = time ? new Date(time) : new Date();
    return [currentDate.getFullYear(), formatDate(currentDate.getMonth() + 1), formatDate(currentDate.getDate())].join(split || '-');
}



function validateEmail(email){
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};

function validatePhoneNumber(str) {
    let reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
    return reg.test(str)
};

module.exports = {
    randomString,
    randomNumberString,
    formatFloat,
    validateEmail,
    validatePhoneNumber,
    currentDateStr,
};