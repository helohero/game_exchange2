const cardcodesModel = require('../models/cardcodes');

function addCardCode(app){
    app.get('/op/cardcode/add', (req, res) => {
        let face_value = req.query.face_value || '';
        let card_no = req.query.card_no || '';
        let card_pass = req.query.card_pass || '';
        let type = req.query.type || '';

        if(!face_value.trim() || !card_no.trim() || !card_pass.trim() || !type.trim()) {
            return res.json({ error : 'params error' });
        }

        cardcodesModel.addCardCode(type, face_value, card_no, card_pass, (err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({
                data : rows
            });
        });
    });
}

function getAllCardCodes(app){
    app.get('/op/cardcode/getAll', (req, res) => {
        cardcodesModel.getAllCardCodes((err, rows) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({
                data : rows
            });
        })
    });
}


module.exports = {
    addCardCode,
    getAllCardCodes,
}