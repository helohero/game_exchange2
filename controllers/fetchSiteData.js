let itemsModel = require('../models/items');
let request = require('request');

function fetchSiteData(app){
    app.get('/add_item_temp', (req, res) => {
        //itemsModel.addItem(item.id, item.accountTips, item.categoryDetail, item.categoryId, item.categoryName, item.detail, item.facePrice, item.facePriceDesc, item.goodsTypeId, item.goodsTypeName, item.image, item.name, item.salePrice, item.topExtendInfo, item.unit, item.parentCategoryId, item.parentCategoryName, (err, data) => {
        
        //good_id, accountTips, categoryDetail, categoryId, categoryName, detail, facePrice, facePriceDesc, goodsTypeId, goodsTypeName, image, name, salePrice, topExtendInfo, unit, parentCategoryId, parentCategoryName


        let item = {
            id : '106',
            accountTips : '',
            categoryDetail : '无',
            categoryId : '1116',
            categoryName : '益享卡',
            detail : '无',
            facePrice : '1000',
            facePriceDesc : '1000元',
            goodsTypeId : '16110',
            goodsTypeName : '卡值',
            image : 'https://img.70ka.com/news/17042506119800000',
            name : '益享卡 1000元',
            salePrice : '1000',
            topExtendInfo : '[]',
            unit : '元',
            parentCategoryId : '999',
            parentCategoryName : '购物卡',
        }

        itemsModel.addItem(item.id, item.accountTips, item.categoryDetail, item.categoryId, item.categoryName, item.detail, item.facePrice, item.facePriceDesc, item.goodsTypeId, item.goodsTypeName, item.image, item.name, item.salePrice, item.topExtendInfo, item.unit, item.parentCategoryId, item.parentCategoryName, (err, data) => {
            res.send({
                error : err,
                data : data
            });
        });
    });

    app.get('/fetch_items', (req, res) => {
        let cateId = req.query.cateid;
        let typeId = req.query.typeid;
        let cb = req.query.cb;
    
        if(!cateId || !typeId){ return req.send({ error : 'params error'}); }
    
        function addItems(items, success){
            let item = items.shift();
            if(!item) { return success && success(); }
    
            itemsModel.getItemsByTypeIdAndGoodId(item.goodsTypeId, item.id.toString(), (err, rows) => {
                if(rows.length){
                    console.log(`已存在该typeId(${item.goodsTypeId}), goodId(${item.id})`);
                    addItems(items, success);
                    return;
                }
                itemsModel.addItem(item.id, item.accountTips, item.categoryDetail, item.categoryId, item.categoryName, item.detail, item.facePrice, item.facePriceDesc, item.goodsTypeId, item.goodsTypeName, item.image, item.name, item.salePrice, item.topExtendInfo, item.unit, item.parentCategoryId, item.parentCategoryName, (err, data) => {
                    addItems(items, success);
                });
            });
        }
        request({
            url : `https://clientapi.itangka.com/v1/homePage/getGoodsListByCategoryId/${cateId}/${typeId}?status=1`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://www.kongfuka.com',
                'Referer': 'https://www.kongfuka.com/',
                'Brandmark' : 'kfk'
            },
        }, (error, response, body) => {
            let json = JSON.parse(body);
            if(json && json.data && json.data.length){
                addItems(json.data, () => {
                    if(cb){
                        res.send(`${cb}(${JSON.stringify({ status : 'finished' })})`);
                    } else {
                        res.json({ status : 'finished' });
                    }
                });
            } else {
                res.json({ error : error || body });
            }
        });
    });
    
    app.get('/fetch_origin_items', (req, res) => {
        let cateId = req.query.cateid;
        let typeId = req.query.typeid;
    
        request({
            url : `https://clientapi.itangka.com/v1/homePage/getGoodsListByCategoryId/${cateId}/${typeId}?status=1`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://aitk.tdrsteam.com',
                'Referer': 'https://aitk.tdrsteam.com/',
                'Brandmark' : 'atk'
            },
        }, (error, response, body) => {
            //let json = JSON.parse(body);
            res.json(body);
        });
    });
}

module.exports = {
    fetchSiteData,
}