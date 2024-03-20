function login(){
    let accountName = $('#accountName').val().trim();
    let password = $('#password').val().trim();

    if(!accountName){
        return utils.alert('请输入账号');
    }
    if(!password){
        return utils.alert('请输入密码');
    }
    if(accountName.length > 30 || accountName.length < 4){
        return utils.alert('账号名称长度不对');
    }
    if(password.length > 30 || password.length < 4){
        return utils.alert('密码长度不对');
    }

    $.post('/parter/admin/login_submit', {
        accountName : accountName,
        password : password
    }, (json) => {
        if(json.error){ return utils.alert(json.error); }
        utils.alert('登录成功');
        setTimeout(() => {
            window.location.href = '/partner/index';
        }, 1500);
    });
}