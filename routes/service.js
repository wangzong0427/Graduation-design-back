const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件保存路径
    cb(null, "public/images/service/");
  },
  filename: function (req, file, cb) {
    //存储文件名
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

// 申请售后
router.post("/", upload.single("file"), (req, res) => {
  // 获取上传的文件信息
  const file = req.file;
  console.log(req.body);
  const { order_id, reason, create_time } = req.body;
  const sqlStr = "insert into service (order_id, reason, create_time, image_name, image_path) values (?,?,?,?,?)";
  const value = [order_id, reason, create_time, file.originalname, file.path];
  sql.query(sqlStr, value, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "申请失败!",
      });
    }
    res.send({
      code: 200,
      message: "申请成功!",
    });
  });
});

// 获取售后列表
router.post("/list", (req, res) => {
  const { store_name, user_name } = req.body;
  let sqlStr = "SELECT service.*, `order`.total_price, `order`.user_name, `order`.create_time AS order_create_time, `order`.store_id, shops.contact_phone, customer.phone FROM service JOIN `order` ON service.order_id = `order`.order_id JOIN shops ON `order`.store_id = shops.store_id JOIN customer ON `order`.user_name = customer.user_name WHERE 1=1";
  ;
    if (user_name) {
        sqlStr += " and `order`.user_name = " + user_name;
    }
    // 查询店铺ID
    if (store_name) {
        sqlStr += (" and `order`.store_id = (select store_id from shops where store_name = " + '"' + store_name + '")');
    }
    sql.query(sqlStr, (err, results) => {
        if (err) {
            console.log(err);
            return res.send({
                code: 500,
                message: "查询失败!",
            });
        }
        res.send({
            code: 200,
            message: "查询成功!",
            data: results,
        });
    })
})

// 责任划分
router.post("/duty", (req, res) => {
  const { service_id, result } = req.body;
  let sqlStr = "update service set result = ? where service_id = ?";
  sql.query(sqlStr, [result, service_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.send({
        code: 500,
        message: "操作失败!",
      });
    }
    res.send({
      code: 200,
      message: "操作成功!",
    });
  });
})



module.exports = router;
