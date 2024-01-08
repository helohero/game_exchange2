function renderMoneyInfo(){
    $.ajax({
        url : '/profile_info',
        dataType : 'json',
        cache : false,
        success : (json) => {
            if(json && json.data){
                $('.profile_moneys').html(`
                    账户余额：<span class="money_num">￥<em>${json.data.money}</em></span>
                `);
            }
        }
    });
};

renderMoneyInfo();

$('.card_exchange_btn').on('click', function(){
    $('#card_exchange').modal({
        closeText : 'x'
    });
});

$(document).delegate('.submit_card_exchange_btn', 'click', function(){
    let card_num = $('.card_num').val().trim();
    let card_password = $('.card_password').val().trim();
    
    if(!card_num){
        return utils.alert('卡账号不能为空');
    }
    if(!card_password){
        return utils.alert('卡密码不能为空');
    }

    $.post('/card_exchange', {
        cardNum : card_num,
        cardPassword : card_password
    }, (json) => {
        if(json.error){ 
            return utils.alert(json.error); 
        }
        
        if(json && json.data){
            utils.alert(`充值${json.money}元成功`);
            $('.money_num em').html(json.data.money);
            $.modal.close();
        }
    });
});