const goodscodesModel = require('../models/goodscodes');
const cardcodesModel = require('../models/cardcodes');

function addGoodsCodes(app){
    app.get('/op/goodscodes/add', (req, res) => {
        let code = req.query.code || '';
        let face_value = req.query.face_value || '';

        if(!code.trim() || !face_value.trim()){
            return res.json({ error : 'params error' });
        }

        if(encodeURIComponent(code) !== code){
            return res.json({ error : 'params error.' });
        }

        if(!(/^\d+$/).test(code)) {
            return res.json({ error : 'format error1.' });
        }

        if(!(/^688/).test(code)) {
            return res.json({ error : 'format error2.' });
        }

        let face_value_from_code = '';
        if((/^688([\d]{3,4})118\d{8}0[12]$/).test(code)){
            face_value_from_code = RegExp.$1;
        }
        if(!face_value_from_code) {
            return res.json({ error : 'format error3.' });
        }

        goodscodesModel.addGoodsCode(code, face_value, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({
                data : rows
            });
        });
    });
}


function getAllGoodsCodes(app) {
    app.get('/op/goodscodes/getAll', (req, res) => {
        goodscodesModel.getAllGoodsCodes((err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({
                data : rows
            });
        });
    })
}


function getGoodsCodeByCode(app){
    app.get('/op/goodscodes/get_by_code', (req, res) => {
        let code = req.query.code || '';
        if(!code.trim()) {
            return res.json({ error : 'params error' });
        }

        goodscodesModel.getGoodsCodeByCode(code, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({
                data : rows
            });
        });
    });
}


//对外提货码获取
function verifyGoodsCode(app){
    app.get('/verify_goodscode', (req, res) => {
        let userId = req.cookies.game_userid || req.query.userid;
        if(!userId){ return res.json({ error : "not login"}) }

        let cateId = req.query.cateid || '';

        let code = req.query.code || '';

        if(!code.trim() || !cateId.trim()){ return res.json({ error : 'params error.' }); }

        //1110 lianhua
        //1116 yixiang
        if(cateId !== '1110' && cateId !== '1116'){
            return res.json({
                error : 'no data.00'
            });
        }

        let goodscodeType = '';
        //01 yixiang
        //02 lianhua
        if((/01$/.test(code))) {
            goodscodeType = 'yixiang';
        }
        if((/02$/).test(code)) {
            goodscodeType = 'lianhua';
        }

        if(goodscodeType === 'yixiang' && cateId !== '1116') {
            return res.json({
                error : 'no data.11'
            });
        }
        if(goodscodeType === 'lianhua' && cateId !== '1110') {
            return res.json({
                error : 'no data.222'
            });
        }

        if(encodeURIComponent(code) !== code){
            return res.json({ error : 'params error.' });
        }

        if(!(/^\d+$/).test(code)) {
            return res.json({ error : 'format error1.' });
        }

        if(!(/^688/).test(code)) {
            return res.json({ error : 'format error2.' });
        }

        let face_value = '';
        if((/^688([\d]{3,4})118\d{8}0[12]$/).test(code)){
            face_value = RegExp.$1;
        }
        if(!face_value) {
            return res.json({ error : 'format error3.' });
        }

        goodscodesModel.getGoodsCodeByCode(code, (err, goodscodesResult) => {
            if(err){
                return res.json({ error : err });
            }

            if(goodscodesResult.length) {
                let goodscodeItem = goodscodesResult[0];

                //如果已经被验证过，则直接返回绑定的卡密
                if(goodscodeItem.card_no && goodscodeItem.card_pass && goodscodeItem.status === '2') {
                    return res.json({
                        data : {
                            id : goodscodeItem.id,
                            code : goodscodeItem.code,
                            face_value : goodscodeItem.face_value,
                            card_no : goodscodeItem.card_no,
                            card_pass : goodscodeItem.card_pass,
                            used : 1,
                        }
                    })
                }

                //随机获取一条相同面值的卡密数据
                cardcodesModel.getRandomCardCodeByFaceValue(goodscodeType, goodscodeItem.face_value, (cardErr, cardRows) => {
                    if(cardErr){
                        return res.json({ error : cardErr });
                    }

                    if(cardRows.length) {
                        let randomCardCodeItem = cardRows[0];
                        cardcodesModel.updateCardCodeStatusById(randomCardCodeItem.id, '2', (cardUpdateErr, cardUpdateRows) => {
                            if(cardUpdateErr) {
                                return json({ error : cardUpdateErr });
                            }

                            goodscodesModel.updateGoodsCodeToUsedById(goodscodeItem.id, randomCardCodeItem.card_no, randomCardCodeItem.card_pass, (goodscodeUpdateErr, goodscodeUpdateRows) => {
                                if(goodscodeUpdateErr){
                                    return json({ error : goodscodeUpdateErr });
                                }

                                //响应成功信息
                                res.json({
                                    data : {
                                        id : goodscodeItem.id,
                                        code : goodscodeItem.code,
                                        face_value : goodscodeItem.face_value,
                                        card_no : randomCardCodeItem.card_no,
                                        card_pass : randomCardCodeItem.card_pass
                                    }
                                });
                            });
                        });
                    } else {
                        return res.json({ error : 'no data.22' });
                    }
                });
            } else {
                return res.json({ error : 'no data.33' });
            }
        });
    });
}

module.exports = {
    addGoodsCodes,
    getAllGoodsCodes,
    getGoodsCodeByCode,
    verifyGoodsCode,
}