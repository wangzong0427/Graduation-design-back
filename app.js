var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors') // 解决跨域问题，先npm i cors，然后引入

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shopRouter = require('./routes/shopList');
var newShopRouter = require('./routes/shopCreate');
var productRouter = require('./routes/product');
var homeShowRouter = require('./routes/homeShow');
var customerRouter = require('./routes/customer');
var orderRouter = require('./routes/order');
var serviceRouter = require('./routes/service');
var collectionRouter = require('./routes/collection');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/public',express.static(path.join(__dirname,'public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()) // 注册解决跨域问题的中间件

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shopList', shopRouter);
app.use('/newShop', newShopRouter);
app.use('/product', productRouter);
app.use('/homeShow', homeShowRouter);
app.use('/customer', customerRouter);
app.use('/order', orderRouter);
app.use('/service', serviceRouter);
app.use('/collection', collectionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;