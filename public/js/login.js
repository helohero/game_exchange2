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

$('.login_submit').on('click', function(){
    let accountName = $('.account_name').val().trim();
    let password = $('.password').val().trim();
    if(!accountName){
        return utils.alert('请输入账号');
    }
    if(!password){
        return utils.alert('请输入密码');
    }
    if(accountName.length > 20 || accountName.length < 6){
        return utils.alert('账号名称长度不对');
    }
    if(password.length > 20 || password.length < 6){
        return utils.alert('密码长度不对');
    }

    if(!validateEmail(accountName) && !validatePhoneNumber(accountName)){
        return utils.alert('账号格式不对');
    }

    $.post('/login_submit', {
        accountName : accountName,
        password : password
    }, (json) => {
        if(json.error){ return utils.alert(json.error); }
        utils.alert('登录成功');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    });
});