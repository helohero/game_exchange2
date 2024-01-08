
let statusMap = {
    1 : '处理中',
    2 : '已完成'
};

$.ajax({
    url : '/get_myorders',
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
                        <td>${item.order_info.account}</td>
                        <td>${item.order_info.remark}</td>
                        <td>${item.remark || ''}</td>
                        <td>${statusMap[item.status]}</td>
                    </tr>
                `);
            });
        } else {
            bodyHtmls.push(`
                <tr><td colspan="8">暂无订单记录</td></tr>
            `);
        }
        $('.orders_body').html(bodyHtmls.join(''));
    }
});