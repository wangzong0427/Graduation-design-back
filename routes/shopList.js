var express = require('express');
var router = express.Router();
var sql = require('../db/sql')

// 查询店铺列表
// router.get('/shops', (req, res, next) => {
//   sql.query('select * from shops', function(error,results){
//     res.send({
//       code:0,
//       data:results  
//     })
//   })
// })


router.post('/shops', (req, res) => {
  const { phoneNumber, name, recommend, cooperation, business, classify } = req.body; // 采用了ES6的解构赋值语法

  let query = 'SELECT * FROM shops WHERE 1 = 1'; // 1 = 1 是为了避免没有查询条件的情况下出现语法错误

  if (phoneNumber) {
    query += ` AND phoneNumber = '${phoneNumber}'`;
  }

  if (name) {
    query += ` AND store_name like '%${name}%'`;
  }

  if (recommend) {
    query += ` AND recommend = '${recommend}'`;
  }

  if (cooperation) {
    query += ` AND cooperation = '${cooperation}'`;
  }

  if (business) {
    query += ` AND business = '${business}'`;
  }

  if (classify) {
    query += ` AND classify_name = '${classify}'`;
  }

  // 执行查询并返回结果
  sql.query(query, (err, results) => {
    console.log(query);
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

// 查询所有店铺
router.get('/', (req, res, next) => {
  sql.query('select store_name from shops', (error, results) => {
    if(error) {
      res.send(error);
    } else {
      res.send(results);
    }
  })
})

// 查询classify表中的所有数据
router.get('/classify', (req, res, next) => {
  sql.query('select * from classify', function(error,results){
    res.send({
      code:200,
      data:results  
    })
  })
})

module.exports = router;