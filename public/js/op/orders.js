let statusMap = {
    1 : '处理中',
    2 : '已完成'
};

$('.filter_status').on('change', function(){
    renderOrderList();
});

function renderOrderList(){
    let status = $('.filter_status').val();
    $.ajax({
        url : '/op/get_allorders?type=1&status=' + status,
        dataType : 'json',
        cache : false,
        success : (json) => {
            let bodyHtmls = [];
            if(json.data && json.data.length){
                json.data.forEach((item) => {
                    item.item_info = JSON.parse(item.item_info);
                    item.order_info = JSON.parse(item.order_info);
                    item.created_at_text = utils.formatDateToNormalStr(item.created_at);
                    bodyHtmls.push(`
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.created_at_text}</td>
                            <td>${item.item_info.name}</td>
                            <td>￥${item.price}</td>
                            <td>${statusMap[item.status]}</td>
                            <td>${item.order_info.account}</td>
                            <td>${item.order_info.remark}</td>
                            <td>${item.remark || ''}</td>
                            <td>${item.status == 1 ? '<a href="javascript:void(0)" class="delivery" data-id="' + item.id + '">发货</a> <a href="javascript:void(0)" class="finish" data-id="' + item.id + '">完成</a>' : ''}</td>
                        </tr>
                    `);
                });
            } else {
                bodyHtmls.push(`
                    <tr><td colspan="9">暂无订单记录</td></tr>
                `);
            }
            $('.orders_body').html(bodyHtmls.join(''));
        }
    });
}
renderOrderList();

let currentOpOrderId = '';
$(document).delegate('.delivery', 'click', function(e){
    let orderId = $(this).attr('data-id');
    currentOpOrderId = orderId;
    $('#delivery_modal').modal({
        closeText : 'x'
    });
});
$(document).delegate('.submit_btn', 'click', function(e){
    let remark = $('.remark_text').val().trim();
    if(!remark){ return utils.alert('备注信息不能为空'); }

    $.post('/op/update_remark', {
        orderId : currentOpOrderId,
        remark : remark
    }, (json) => {
        if(json.error){
            return console.log(json.error);
        }
        utils.alert('操作成功');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    })
});

$(document).delegate('.finish', 'click', function(e){
    let orderId = $(this).attr('data-id');
    $.post('/op/update_status', {
        orderId : orderId
    }, (json) => {
        if(json.error){
            return console.log(json.error);
        }
        utils.alert('操作成功');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    })
});