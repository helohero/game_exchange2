let cateId = utils.parseUrlParams().cateid;
let parentId = utils.parseUrlParams().parentid;
let keyword = utils.parseUrlParams().keyword;
let nav = utils.parseUrlParams().nav || '';

$.ajax({
    url : '/items',
    dataType : 'json',
    cache : false,
    data : {
        cateid : cateId,
        parentid : parentId,
        keyword : keyword
    },
    success : (json) => {
        if(json && json.data){
            $('.empty_tips').hide();

            let firstItemData = json.data[0];
            let listHtml = [];
            json.data.forEach((item) => {
                let imgUrl = item.image;
                if(imgUrl.indexOf('http') === -1){
                    imgUrl = 'https://cdn.gongfucard.com' + imgUrl;
                }
                listHtml.push(`
                    <a href="/detail?cateid=${item.categoryId}&typeid=${item.goodsTypeId}&id=${item.id}&nav=${nav}" class="c-grid__item">
                        <div class="c-grid__wrap">
                            <img class="vj-pic c-grid__icon" src="${imgUrl}?x-oss-process=image/format,webp">
                        </div>
                        <div class="c-grid__footer">
                            <h3 class="c-grid__footer-name">${item.name}</h3>
                            <strong class="c-grid__strong">￥${item.salePrice}</strong>
                        </div>
                    </a>
                `);
            });
            $('.listbox').html(listHtml.join(''));

            let breadNavHtml = '';
            if(cateId){
                breadNavHtml = `
                    <a href="/" class="g-breadcrumb__item nuxt-link-active">首页</a>
                    <a href="/all" class="g-breadcrumb__item">全部分类</a>
                    <a href="/list?parentid=${firstItemData.parentCategoryId}" class="g-breadcrumb__item">${firstItemData.parentCategoryName}</a>
                    <strong>${firstItemData.categoryName}</strong>
                `;
            } else if (parentId) {
                breadNavHtml = `
                    <a href="/" class="g-breadcrumb__item nuxt-link-active">首页</a>
                    <a href="/all" class="g-breadcrumb__item">全部分类</a>
                    <strong>${firstItemData.parentCategoryName}</strong>
                `;
            } else if (keyword) {
                breadNavHtml = `
                    <a href="/" class="g-breadcrumb__item nuxt-link-active">首页</a>
                    <a href="/all" class="g-breadcrumb__item">全部分类</a>
                    <strong>“${keyword}”</strong>
                `;
            }
            $('.breadcrumb_nav').html(breadNavHtml);
        } else {
            $('.empty_tips').show();
        }
    }
})