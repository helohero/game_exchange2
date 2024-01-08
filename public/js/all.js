$.ajax({
    url : '/all_category',
    dataType : 'json',
    cache : false,
    success : (json) => {
        let categoryMap = {};
        if(json && json.data){
            json.data.forEach((item) => {
                categoryMap[item.parentCategoryName] = categoryMap[item.parentCategoryName] || [];
                categoryMap[item.parentCategoryName].push(item);
            });

            let allHtmls = [];
            for(let parentName in categoryMap){
                let singleHtml = [];
                singleHtml.push(`
                    <div class="l-section">
                        <div id="GTitle">${parentName}</div>
                        <div class="c-grid">
                `)
                categoryMap[parentName].forEach((item) => {
                    let imgUrl = item.image;
                    if(imgUrl.indexOf('http') === -1){
                        imgUrl = 'https://cdn.gongfucard.com' + imgUrl;
                    }
                    singleHtml.push(`
                        <a class="c-grid__item pointer" href="/list?cateid=${item.categoryId}">
                            <img class="vj-pic c-grid__icon" src="${imgUrl}?x-oss-process=image/format,webp">
                            <em class="c-grid__label">${item.categoryName}</em>
                        </a>
                    `);
                });
                singleHtml.push('</div></div>');
                allHtmls.push(singleHtml.join(''));
            }
            $('#Category').html(allHtmls.join(''));
        }
    }
})