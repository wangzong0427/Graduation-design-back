const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件保存路径
    cb(null, "public/images/customer/");
  },
  filename: function (req, file, cb) {
    //存储文件名
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });


// 注册用户
router.post("/register", (req, res) => {
  const { tel, password } = req.body;
  const sqlStr = "insert into customer (user_name,user_password) values (?,?)";
  const value = [tel, password];
  sql.query(sqlStr, value, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "注册失败!用户名已存在!",
      });
    }
    res.send({
      code: 200,
      message: "注册成功!",
    });
  });
});

// 登录
router.post("/", (req, res) => {
  const { username, password } = req.body;
  const sqlStr =
    "select * from customer where user_name = ? and user_password = ?";
  const value = [username, password];
  sql.query(sqlStr, value, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "服务器错误！",
      });
    }
    if (result.length == 0) {
      return res.send({
        code: 500,
        message: "用户名或密码错误",
      });
    }
    res.send({
      code: 200,
      message: "登录成功!",
      data: result,
    });
  });
});

// 用户列表
router.post("/list", (req, res) => {
  const { user_nickname, user_name } = req.body;
  let query = "select * from customer where 1 = 1";
  if (user_nickname) {
    query += " and user_nickname like '%" + user_nickname + "%'";
  }
  if (user_name) {
    query += ` and user_name = '${user_name}'`;
  }
  console.log(query);
  sql.query(query, (err, results) => {
    if (err) {
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
  });
});

// 删除用户
router.post("/delete", (req, res) => {
  const { user_name } = req.body
  const sqlStr = `delete from customer where user_name = ${user_name}`
  sql.query(sqlStr, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "删除失败!",
      });
    }
    res.send({
      code: 200,
      message: "删除成功!",
    });
  })
})

// 用户信息更新
router.post("/update",  upload.single("file"), (req, res) => {
  // 获取上传的文件信息
  const file = req.file;

  // 新信息
  const { address, nickName, phone, customer } = req.body

  // 构建插入数据库的SQL查询
  const sqlInsert =
    "UPDATE customer set image_name = ?, image_path = ?, address = ?, phone = ?, user_nickname = ? where user_name = ?";
  const values = [file.originalname, file.path, address, phone, nickName, customer];
  console.log(values);
  // 执行SQL查询
  sql.query(sqlInsert, values, (err, result) => {
    if (err) {
      console.error("Error uploading image: ", err);
      return res.send({
        code: 500,
        message: "信息更新失败",
      });
    } else {
      console.log("Image uploaded successfully");
      return res.send({
        code: 200,
        message: "信息更新成功",
      });
    }
  });
})

router.post("/updateInfo", (req, res) => {
  // console.log(req.body);
  res.send({
    code: 200,
    message: "收到信息"
  })
})





module.exports = router;
