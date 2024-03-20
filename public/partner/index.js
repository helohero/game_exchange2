$('#submitTask').on('click', function(e){
    let title = $('#taskTitle').val().trim();
    let file = document.getElementById('taskExcelFile').files[0];

    if(!title || !file){
        return utils.alert('标题和卡密Excel文件不能为空');
    }

    
    let formData = new FormData(); // 创建FormData对象
        
    formData.append("file", file); // 将文件添加到formData中
    formData.append('title', title);

    $.ajax({
        method : 'POST',
        url : '/partner/admin/submit_task',
        data : formData,
        processData : false,
        contentType : false,
        success : (json) => {
            if(json.data){
                utils.alert('创建任务成功');
                $('#createTaskModal').modal('hide');
                renderTasksListTable();
            } else {
                utils.alert('创建任务失败，请重试');
            }
        }
    })
});


$.ajax({
    url : '/parter/admin/get_userinfo',
    dataType : 'json',
    success : (json) => {
        if(json.data && json.data.username){
            $('.userInfo').html(`欢迎您，<span>${json.data.username}</span>，<a href="/parter/loginout">退出登录</a>`);
        }
    }
});

function renderTasksListTable(){
    let statusMap = {
        '0' : '待执行',
        '1' : '执行中',
        '2' : '已完成',
    }
    $.ajax({
        url : '/partner/admin/get_tasks',
        dataType : 'json',
        cache : false,
        success : (json) => {
            if(!json.data || !json.data.length){
                $('#taskslistBody').html('<tr><td style="text-align:center;" colspan="5">暂无记录</td></tr>')
            } else {
                let htmls = [];
                json.data.forEach((item) => {
                    htmls.push(`
                        <tr>
                            <td>${item.id}</td>
                            <td>${utils.formatDateToNormalStr(item.created_at)}</td>
                            <td>${item.title}</td>
                            <td>${ item.status === 2 ? '<span class="badge text-bg-success">' + statusMap[item.status] + '</span>' : statusMap[item.status]}</td>
                            <td>
                                ${item.status === 0 ? '<button type="button" class="btn btn-primary btn-sm btn-danger deleteTask" data-taskid="' + item.id + '">删除</button>' : '<a href="/partner/result?taskid=' + item.id + '" target="_blank" class="btn btn-primary btn-sm btn-success viewRunDetail" data-taskid="' + item.id + '">查看执行详细结果</a>'}
                            </td>
                        </tr>
                    `);
                });
                $('#taskslistBody').html(htmls.join(''));
            }
        }
    })
}
renderTasksListTable();

$(document).delegate('.deleteTask', 'click', function(e){
    let taskId = e.currentTarget.dataset.taskid;
    if(window.confirm('确定删除吗？')) {
        $.ajax({
            url : '/partner/admin/delete_task',
            data : {
                taskId : taskId,
            },
            dataType : 'json',
            success : (json) => {
                utils.alert('删除成功');
                renderTasksListTable();
            }
        });
    }
});