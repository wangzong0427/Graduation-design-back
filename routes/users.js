var express = require('express');
var router = express.Router();
var sql = require('../db/sql')



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 查询数据库中表名为admin中的所有数据，作为响应数据返回
router.get('/user', (req, res, next) => {
  sql.query('select * from admin', function(error,results){
    res.send({
      code:0,
      data:results  
    })
  })
})

module.exports = router;
