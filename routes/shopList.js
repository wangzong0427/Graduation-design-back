var express = require("express");
var router = express.Router();
var sql = require("../db/sql");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件保存路径
    cb(null, "public/images/shop/");
  },
  filename: function (req, file, cb) {
    //存储文件名
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });
// 图片上传
router.post("/image", upload.single("file"), (req, res) => {
  // 获取上传的文件信息
  const file = req.file;
  const store_id = req.body.store_id;
  // 构建插入数据库的SQL查询
  const sqlInsert =
    "UPDATE shops set image_name = ?, image_path = ? where store_id = ?";
  const values = [file.originalname, file.path, store_id];
  console.log(values);
  // 执行SQL查询
  sql.query(sqlInsert, values, (err, result) => {
    if (err) {
      console.error("Error uploading image: ", err);
      return res.send({
        code: 500,
        message: "图片上传失败",
      });
    } else {
      console.log("Image uploaded successfully");
      return res.send({
        code: 200,
        message: "图片上传成功",
      });
    }
  });
});
// 图片删除
router.post("/deleteImage", (req, res) => {
  const { store_id, image_path } = req.body
  const sqlDeleteImage = "UPDATE shops SET image_path = NULL, image_name = NULL WHERE store_id = ?"
  sql.query(sqlDeleteImage, [store_id], (err, results) => {
    if(err) {
      return res.send({
        code: 500,
        message: "删除头像失败！"
      })
    }
    fs.unlink(image_path, () => {}) // 删除文件
    return res.send({
      code: 200,
      message: "删除头像成功"
    })
  })
})


router.post("/shops", (req, res) => {
  console.log(req.body);
  const { phoneNumber, name, recommend, cooperation, business, classify, store_id } =
    req.body; // 采用了ES6的解构赋值语法

  let query = "SELECT * FROM shops WHERE 1 = 1"; // 1 = 1 是为了避免没有查询条件的情况下出现语法错误

  if (phoneNumber) {
    query += ` AND phoneNumber = '${phoneNumber}'`;
  }

  if (name) {
    query += ` AND store_name like '%${name}%'`;
  }

  if (recommend) {
    query += ` AND recommend_status = '${recommend}'`;
  }

  if (cooperation) {
    query += ` AND cooperation_status = '${cooperation}'`;
  }

  if (business) {
    query += ` AND business_status = '${business}'`;
  }

  if (classify) {
    query += ` AND classify_name = '${classify}'`;
  }

  if (store_id) {
    query += ` AND store_id = '${store_id}' `
  }

  query += " ORDER BY business_status DESC"

  // 执行查询并返回结果
  sql.query(query, (err, results) => {
    console.log(query);
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send(results);
    }
  });
});

// 查询所有店铺
router.get("/", (req, res, next) => {
  sql.query("select store_name from shops", (error, results) => {
    if (error) {
      res.send(error);
    } else {
      res.send(results);
    }
  });
});

// 查询classify表中的所有数据
router.get("/classify", (req, res, next) => {
  sql.query("select * from classify", function (error, results) {
    res.send({
      code: 200,
      data: results,
    });
  });
});

// 更新店铺数据
router.post("/update", (req, res) => {
  const { store_id, store_name, contact_phone, information, business_status, cooperation_status, recommend_status, classify_name, image_name, image_path } = req.body
  const sqlUpdate = "UPDATE shops SET store_name = ?, contact_phone = ?, information = ?, business_status = ?, cooperation_status = ?, recommend_status = ?, classify_name = ?, image_name = ?, image_path = ? WHERE store_id = ?"
  const values = [store_name, contact_phone, information, business_status, cooperation_status, recommend_status, classify_name, image_name, image_path, store_id]
  sql.query(sqlUpdate, values, (err, results) => {
    if(err) {
      console.log(err);
      return res.send({
        code: 500,
        message: "更新失败！"
      })
    }
    return res.send({
      code: 200,
      message: "更新成功！"
    })
  })
})

module.exports = router;
