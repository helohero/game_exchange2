const orderModel = require('../models/orders');
const moneyModel = require('../models/money');
const utils = require('../utils');

function submitOrder(app) {
    /*app.get('/init_order_table', (req, res) => {
        orderModel.initOrdersTable((err) => {
            res.json({success : err});
        })
    });*/
    app.post('/order_submit', (req, res) => {
        let userId = req.cookies.game_userid;
        let itemid = req.body.itemid;
        let price = req.body.price;
        let item_info = req.body.item_info || '{}';
        let order_info = req.body.order_info || '{}';

        if(!userId){ return res.json({ error : "not login"}) }

        if(!itemid || !price) {
            return res.json({ error : 'params error' });
        }

        // 先判断账户余额是否足够
        moneyModel.getMoneyByUserId(userId, (err, rows) => {
            if(err){ return res.json({ error : err }); }
            if(!rows || !rows.length){ return res.json({ error : '账户余额不足' }); }
            let moneyData = rows[0];
            if(parseFloat(moneyData.money) < parseFloat(price)) {
                return res.json({ error : '账户余额不足' }); 
            }

            let remainMoney = utils.formatFloat(parseFloat(moneyData.money) - parseFloat(price),2 );
            //创建订单逻辑
            orderModel.addOrder(userId, itemid, price, item_info, order_info, '1' , (err, insertData) => {
                if(err) {
                    return res.json({ error : err });
                }

                moneyModel.updateTotalMoney(userId, remainMoney, (err2, result) => {
                    if(err2){ return res.json({ error : err2 }); }
    
                    if(result.userId) {
                        res.json({ error : null });
                    } else {
                        res.json({ error : '余额扣款失败，请重试' });
                    }
                });
            });
        });
    });
}

function getOrdersByUserId(app){
    app.get('/get_myorders', (req, res) => {
        let userId = req.cookies.game_userid;
        if(!userId){ return res.json({ error : "not login" })}

        orderModel.getOrdersByUserId(userId, (err, rows) => {
            if(err) { return res.json({ error : err })}
            res.json({ error : null, data : rows });
        });
    });
}

function getAllOrders(app){
    app.get('/op/get_allorders', (req, res) => {
        let type = req.query.type;
        let status = req.query.status;
        let condition = {};
        if(type){
            condition.type = type;
        }
        if(status){
            condition.status = status;
        }
        orderModel.queryOrders(condition, (err, rows) => {
            if(err) { return res.json({ error : err })}
            res.json({ error : null, data : rows });
        });
    })
}

function updateOrderOpRemark(app){
    app.post('/op/update_remark', (req, res) => {
        let remark = req.body.remark;
        let orderId = req.body.orderId;

        orderModel.updateOrder({
            id : orderId
        }, {
            remark : remark
        }, (err, data) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ error : null });
        });
    });
}

function updateOrderOpStatus(app){
    app.post('/op/update_status', (req, res) => {
        let orderId = req.body.orderId;
        let status = req.body.status;

        orderModel.updateOrder({
            id : orderId
        }, {
            status : status || '2'
        }, (err, data) => {
            if(err){
                return res.json({ error : err });
            }
            res.json({ error : null });
        });
    });
}

function deleteOrderById(app){
    app.get('/op/delete_order', (req, res) => {
        let id = req.query.id;
        if(!id){ return res.json({ error : 'id none' })}

        orderModel.deleteOrderById(id, (err,rows) => {
            res.json({ error : err, data : rows });
        });
    });
}

module.exports = {
    submitOrder,
    getOrdersByUserId,
    getAllOrders,
    updateOrderOpRemark,
    updateOrderOpStatus,
    deleteOrderById,
}