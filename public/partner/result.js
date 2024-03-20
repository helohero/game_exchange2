$.ajax({
    url : '/parter/admin/get_userinfo',
    dataType : 'json',
    success : (json) => {
        if(json.data && json.data.username){
            $('.userInfo').html(`欢迎您，<span>${json.data.username}</span>，<a href="/parter/loginout">退出登录</a>`);
        }
    }
});


function renderCardsResultHtml(data, isFail){
    let htmls = [];
    let newDatas = [];
    if(isFail){
        data.forEach((item) => {
            if(item.ret_code !== '0') {
                newDatas.push(item);
            }
        });
    } else {
        newDatas = data;
    }
    if(newDatas.length){
        newDatas.forEach((item) => {
            htmls.push(`
                <tr>
                    <td>${item.jnet_bill_no}</td>
                    <td>${item.cardno}</td>
                    <td>${item.cardpass}</td>
                    <td>¥${item.card_real_amt}</td>
                    <td>${item.ret_code === '0' ? '<span class="badge text-bg-success">成功</span>' : '<span class="badge text-bg-danger">失败</span>'}</td>
                    <td>${item.ret_msg}</td>
                </tr>
            `);
        });
    } else {
        htmls.push('<tr><td style="text-align:center;" colspan="5">暂无记录</td></tr>');
    }
    return htmls.join('');
}

let taskId = utils.parseUrlParams().taskid;
let taskAllResults = null;
$.ajax({
    url : `/partner/admin/stat_task_results?taskid=${taskId}`,
    dataType : 'json',
    success : (json) => {
        if(json.data && json.data.allResults && json.data.allResults.length){
            taskAllResults = json.data.allResults;

            $('#cardslistBody').html(renderCardsResultHtml(json.data.allResults));

            $('#statsInfo').html(`总销卡金额：¥${json.data.totalPayMoney}，执行成功数：${json.data.successResultCount}，执行失败数：${json.data.failResultCount}`);
            if(json.data.failResultCount){
                $('#statsInfo').append('<a id="viewFailResult" style="margin-left:25px;" href="javascript:void(0)">查看运行失败的卡密</a>');
            }
        } else {
            $('#cardslistBody').html('<tr><td style="text-align:center;" colspan="5">暂无记录</td></tr>');
        }
    }
});

$(document).delegate('#viewFailResult', 'click', function(e){
    $('#cardslistBody').html(renderCardsResultHtml(taskAllResults, true));
});