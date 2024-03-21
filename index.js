const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const md5 = require('md5');
const async = require('async');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const svgCaptcha = require('svg-captcha');
const request = require('request');

const siteConfig = require('./site_config.json');

const port = siteConfig.port;

const utils = require('./utils');
const userDb = require('./models/users');
const moneyDb = require('./models/money');
const ordersDb = require('./models/orders');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views') ;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

require('express-async-errors');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/*.html', (req, res) => {
    let content = fs.readFileSync(path.resolve(__dirname, './public' + req.baseUrl)).toString();
    res.send(content);
});
app.get('/', (req, res) => {
    res.render('index', { queryData : req.query });
});
app.get('/login', (req, res) => {
    //如果已登录，则直接跳到首页
    res.render('login');
});
app.get('/list', (req, res) => {
    res.render('list', { queryData : req.query });
});
app.get('/all', (req, res) => {
    res.render('all', { queryData : req.query });
});
app.get('/detail', (req, res) => {
    res.render('detail', { queryData : req.query });
});
app.get('/user/account', (req, res) => {
    let userId = req.cookies.game_userid;
    if(!userId){
        return res.redirect('/login');
    }
    let usersModel = require('./models/users');
    usersModel.getUserById(userId, (err, rows) => {
        if(err){
            return res.redirect('/login');
        }
        res.render('account', {
             queryData : req.query,
             userData : rows[0]
        });
    });
});
app.get('/user/profile', (req, res) => {
    let userId = req.cookies.game_userid;
    if(!userId){
        return res.redirect('/login');
    }
    res.render('profile', {
        queryData : req.query
   });
});
app.get('/user/myorders', (req, res) => {
    let userId = req.cookies.game_userid;
    if(!userId){
        return res.redirect('/login');
    }
    res.render('myorders', {
        queryData : req.query
   });
});

const fetchSiteDataController = require('./controllers/fetchSiteData');
const loginController = require('./controllers/login');
const usersController = require('./controllers/users');
const itemsController = require('./controllers/items');
const exchangeController = require('./controllers/money');
const ordersController = require('./controllers/orders');

fetchSiteDataController.fetchSiteData(app);

loginController.login(app);
loginController.loginout(app);

usersController.getUserInfo(app);
usersController.updateRealName(app);

itemsController.getItems(app);
itemsController.getAllCategorys(app);
itemsController.initItemsTable(app);
itemsController.getGuessYourLike(app);

exchangeController.card_exchange(app);
exchangeController.profileInfo(app);

ordersController.getOrdersByUserId(app);
ordersController.submitOrder(app);
ordersController.getAllOrders(app);
ordersController.updateOrderOpRemark(app);
ordersController.updateOrderOpStatus(app);
ordersController.deleteOrderById(app);

app.get('/op/orders', (req, res) => {
    res.render('op/orders', { queryData : req.query });
});


/* ============ Parter Tools  ============= */
const parterUserController = require('./controllers/partnerusers');
const tasksController = require('./controllers/tasks');

parterUserController.addParterUser(app);
parterUserController.login_submit(app);
parterUserController.loginout(app);
parterUserController.deleteParterUser(app);
parterUserController.getAllParterUsers(app);
parterUserController.getParterUserInfo(app);

parterUserController.calcCardPayTotalMoneySingleDay(app);
parterUserController.statTaskResults(app);

tasksController.addTask(app);
tasksController.getAllTasks(app);
tasksController.getTasksByUserId(app);
tasksController.deleteTaskById(app);

app.get('/partner/index', (req, res) => {
    let userId = req.cookies.partner_userid;
    if(!userId) {
        return res.redirect('/partner/login');
    }
    res.render('partner/index');
});
app.get('/partner/login', (req, res) => {
    res.render('partner/login');
});
app.get('/partner/result', (req, res) => {
    res.render('partner/result');
});

//运行任务的定时任务
let runTasks = require('./controllers/runtask');
runTasks();
/* ================= End =================== */

app.get('/tencent9559293464193188836.txt', (req, res) => {
    let content = fs.readFileSync(path.resolve(__dirname, './tencent9559293464193188836.txt')).toString();
    res.send(content);
});


app.listen(port, () => {
    console.log(`Server start: http://localhost:${port}`);
});