let itemsModel = require('../models/items');
let request = require('request');

function fetchSiteData(app){
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