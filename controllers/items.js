const utils = require('../utils');
const itemsModel = require('../models/items');

function getItems(app) {
    app.get('/items', (req, res) => {
        let cateid = (req.query.cateid || '').trim();
        let parentid = (req.query.parentid || '').trim();
        let keyword = (req.query.keyword || '').trim();

        let fetch_detail = req.query.fetch_detail || '';

        if(!cateid && !parentid && !keyword){
            return res.json({ error : 'params error' });
        }

        if(cateid){
            itemsModel.getItemsByCateId(cateid, (err, rows) => {
                if(err) { return res.json({ error : err })}
                rows.forEach((item) => {
                    if(!fetch_detail){
                        item.categoryDetail = '';
                        item.detail = '';
                        item.topExtendInfo = '';
                    }
                });
                res.json({ error : null, data : rows });
            });
        }
        if(parentid){
            itemsModel.getItemsByParentId(parentid, (err, rows) => {
                if(err) { return res.json({ error : err })}
                rows.forEach((item) => {
                    if(!fetch_detail){
                        item.categoryDetail = '';
                        item.detail = '';
                        item.topExtendInfo = '';
                    }
                });
                res.json({ error : null, data : rows });
            });
        }

        if(keyword){
            itemsModel.getItemsByKeyword(keyword, (err, rows) => {
                if(err) { return res.json({ error : err })}
                rows.forEach((item) => {
                    if(!fetch_detail){
                        item.categoryDetail = '';
                        item.detail = '';
                        item.topExtendInfo = '';
                    }
                });
                res.json({ error : null, data : rows });
            });
        }
    })
}

function getAllCategorys(app){
    app.get('/all_category', (req, res) => {
        itemsModel.getAllCategorys((err, rows) => {
            if(err) { return res.json({ error : err })}
            res.json({ error : null, data : rows });
        });
    });
}

function initItemsTable(app){
    app.get('/init_items_table', (req, res) => {
        itemsModel.initItemsTable((err) => {
            res.json({ success : err });
        });
    });
}

function getGuessYourLike(app){
    app.get('/reco_likes', (req, res) => {
        let count = req.query.count || 1;
        if(count > 50){
            count = 40;
        }
        itemsModel.getRandomItems(count, (err, rows) => {
            if(err) { return res.json({ error : err })}
            res.json({ error : null, data : rows });
        });
    });
}

module.exports = {
    initItemsTable,
    getItems,
    getAllCategorys,
    getGuessYourLike,
}