const goodscodesModel = require('../models/goodscodes');
const cardcodesModel = require('../models/cardcodes');

function cleanCardAndGoodsCodes(app){
    app.get('/op/clean_card_and_goods_codes', (req, res) => {
        cardcodesModel.cleanAllData((err1) => {
            if(err1){
                return res.json({ msg : '清理失败，请重试' });
            }
            goodscodesModel.cleanAllData((err2) => {
                if(err2){
                    return res.json({ msg : '清理失败，请重试' });
                }
                res.json({ msg : '清理成功' });
            });
        })
    });
}

module.exports = {
    cleanCardAndGoodsCodes,
}