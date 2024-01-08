$.ajax({
    url : '/reco_likes?count=40',
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