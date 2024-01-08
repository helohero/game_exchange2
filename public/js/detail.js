let cateId = utils.parseUrlParams().cateid;
let typeId = utils.parseUrlParams().typeid;
let itemId = utils.parseUrlParams().id || '';

let urlNav = utils.parseUrlParams().nav || '';

let currentItemData = {};
let originItemsData = null;

$.ajax({
    url : '/items',
    dataType : 'json',
    cache : false,
    data : {
        cateid : cateId,
        fetch_detail : 1,
    },
    success : (json) => {
        let itemsData = {};
        if(json && json.data){
            originItemsData = json.data;
            json.data.forEach((item) => {
                if(item.id === itemId) {
                    currentItemData = item;
                }
                let key = item.goodsTypeName + ':' + item.goodsTypeId;
                itemsData[key] = itemsData[key] || [];
                itemsData[key].push(item);
            });

            //导航的内容复制
            $('.detailBreadNav').html(`
                <a class="g-breadcrumb__item" href="/list?cateid=${currentItemData.categoryId}">${currentItemData.categoryName}</a>
                <strong>${currentItemData.name}</strong>
            `);

            //商品主图
            let itemImageUrl = currentItemData.image;
            if(currentItemData.image.indexOf('http') === -1){
                itemImageUrl = 'https://cdn.gongfucard.com' + itemImageUrl + '?x-oss-process=image/format,webp';
            }
            $('.good_image').html(`<img class="vj-pic goods-info__icon" src="${itemImageUrl}">`);

            //商品标题
            $('.good_title').html(currentItemData.name);

            //商品详情
            $('.good_detailinfo').html(currentItemData.detail);

            //商品详细表单
            let detailFormHtmls = [];
            let exchangeTypeHtmls = [
                '<div class="el-form-item">',
                    '<label class="el-form-item__label" style="width:120px;">类型:</label>',
                    '<div class="el-form-item__content" style="margin-left:120px;">',
                        '<ul class="choose-box">'
            ];

            var typeInfoArr = null;
            for(let goodsTypeName in itemsData){
                var typeInfoArr = goodsTypeName.split(':');
                exchangeTypeHtmls.push(`
                    <a class="choose-box__item ${typeInfoArr[1] === typeId ? 'active' : ''}" data-typeid="${typeInfoArr[1]}" href="${typeInfoArr[1] !== typeId ? '/detail?cateid=' + cateId + '&typeid=' + typeInfoArr[1] + '&id=' + itemsData[goodsTypeName][0].id: ''}${urlNav ? '&nav=' + urlNav : ''}">${typeInfoArr[0]}</a>
                `);
            }
            exchangeTypeHtmls.push(`
                        </ul>
                    </div>
                </div>
            `);

            let faceValueHtmls = [`
                <div class="el-form-item">
                    <label class="el-form-item__label" style="width:120px;">面值:</label>
                    <div class="el-form-item__content">
                        <ul class="choose-box">
            `];
            let typeItemsData = [];
            json.data.forEach((item) => {
                if(item.goodsTypeId === typeId && item.categoryId === cateId) {
                    typeItemsData.push(item);
                }
            });
            typeItemsData.forEach((item) => {
                faceValueHtmls.push(`
                    <a href="/detail?cateid=${cateId}&typeid=${item.goodsTypeId}&id=${item.id}${urlNav ? '&nav=' + urlNav : ''}" class="choose-box__item ${item.id === itemId ? 'active' : ''}">
                        <em>${item.facePriceDesc}</em>
                    </a>
                `);
            });
            faceValueHtmls.push(`
                        </ul>
                    </div>
                </div>
            `);

            let itemPriceInfoHtml = [`
                <div class="el-form-item strong">
                    <label class="el-form-item__label" style="width:120px;">价格:</label>
                    <div class="el-form-item__content" style="margin-left:120px;">
                        <strong class="total-price">￥${currentItemData.salePrice}</strong>
                    </div>
                </div>
            `];

            let buyBtnHtml = [`
                <div class="el-form-item">
                    <div class="el-form-item__content" style="margin-left:120px;">
                        <div class="goods-detail__btn pointer buybtn">
                            <em>立即购买</em>
                        </div>
                    </div>
                </div>
            `];


            detailFormHtmls.push(exchangeTypeHtmls.join(''));
            detailFormHtmls.push(faceValueHtmls.join(''));
            detailFormHtmls.push(itemPriceInfoHtml.join(''));
            detailFormHtmls.push(buyBtnHtml.join(''));

            $('.detail_form').html(detailFormHtmls.join(''));
        }
    }
});

$(document).delegate('.buybtn', 'click', function(e){
    let imageUrl = currentItemData.image;
    if(currentItemData.image.indexOf('http') === -1){
        imageUrl = 'https://cdn.gongfucard.com' + imageUrl + '?x-oss-process=image/format,webp';
    }
    let orderInfoHtmls = `
        <li class="order-info__item">
            <label class="order-info__label">商品信息</label>
            <div class="order-info__content">
                <img class="vj-pic order-info__icon" style="object-fit: cover;" src="${imageUrl}">
                <div class="order-info__wrap">
                    <p class="order-info__name">${currentItemData.name}</p>
                    <ol class="order-spec">
                        <li class="order-spec__item">类型: ${currentItemData.goodsTypeName}</li>
                        <li class="order-spec__item">面额: ${currentItemData.facePriceDesc}</li>
                    </ol>
                </div>
            </div>
        </li>
        <li class="order-info__item">
            <label class="order-info__label">小计</label>
            <div class="order-info__content" style="color:#ff5339;">￥${currentItemData.salePrice}</div>
        </li>
    `;
    $('.order-info').html(orderInfoHtmls);
    let accountTips = currentItemData.accountTips;
    if(!accountTips){
        try {
            accountTips = JSON.parse(currentItemData.topExtendInfo)[0].tip;
        }catch(e){}
    }
    $('.order_account').attr('placeholder', accountTips || '请输入充值账号信息');
    $('#orderbox').modal({
        closeText : 'x'
    });
});

$(document).delegate('.submit_order_btn', 'click', function(){
    /*
let itemid = req.body.itemid;
        let price = req.body.price;
        let item_info = req.body.item_info;
        let order_info = req.body.order_info;
    */
    let itemid = currentItemData.id;
    let price = currentItemData.salePrice;
    let order_account = $('.order_account').val().trim();
    let order_remark = $('.order_remark').val().trim() || '';

    if(!order_account){
        return utils.alert('充值账号信息不能为空');
    }

    let item_info = {
        image : currentItemData.image,
        goodsTypeName : currentItemData.goodsTypeName,
        facePriceDesc : currentItemData.facePriceDesc,
        name : currentItemData.name,
        salePrice : currentItemData.salePrice,
        categoryId : currentItemData.categoryId,
    };
    let order_info = {
        account : order_account,
        remark : order_remark
    };

    $.post('/order_submit', {
        itemid : itemid,
        price : price,
        item_info : JSON.stringify(item_info),
        order_info : JSON.stringify(order_info),
    }, (json) => {
        if(json.error){
            return utils.alert(json.error);
        }
        utils.alert('购买成功');
        setTimeout(() => {
            window.location.href = '/user/myorders';
        }, 1500);
    });
});


$.ajax({
    url : '/reco_likes?count=10',
    dataType : 'json',
    cache : false,
    success : (json) => {
        //
        if(json.data && json.data.length){
            let likesHtml = [];
            json.data.forEach((item) => {
                let imageUrl = item.image;
                if(imageUrl.indexOf('http') === -1){
                    imageUrl = 'https://cdn.gongfucard.com' + imageUrl;
                }
                likesHtml.push(`
                    <a class="like_item pointer" href="/detail?cateid=${item.categoryId}&typeid=${item.goodsTypeId}&id=${item.id}">
                        <img src="${imageUrl}" class="like_item_img">
                        <div class="like_item_name">${item.name}</div>
                        <div class="like_item_price">￥${item.salePrice}</div>
                        <button class="le_recoBtn">立即抢购</button>
                    </a>
                `);
                $('.le_likesbox').html(likesHtml.join(''));
            });
        }
    }
})