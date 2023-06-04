const express = require("express");
const router = express.Router();
const sql = require("../db/sql");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件保存路径
    cb(null, "public/images/classify/");
  },
  filename: function (req, file, cb) {
    //存储文件名
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

// 获取首页展示数据
router.get("/", (req, res) => {
  sql.query("select * from home_show", (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "获取首页展示数据失败",
      });
    }
    return res.send({
      code: 200,
      message: "获取首页展示数据成功",
      data: result,
    });
  });
});

// 更新
router.post("/update", (req, res) => {
  const { show_id, show_status, show_name, classify_name } = req.body;
  // console.log(req.body);

  sql.query(
    "UPDATE home_show SET show_status = ?, show_name = ?, classify_name = ? WHERE show_id = ?",
    [show_status, show_name, classify_name, show_id],
    (err, result) => {
      if (err) {
        return res.send({
          code: 500,
          message: "更新失败",
        });
      }

      return res.send({
        code: 200,
        message: "更新成功",
      });
    }
  );
});

// 新建
router.post("/new", (req, res) => {
  const { show_status, show_name, classify_name } = req.body;
  const values = [show_status, show_name, classify_name];
  sql.query("INSERT INTO home_show (show_status, show_name, classify_name) values (?, ?, ?)", values, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "新建失败",
      });
    }

    return res.send({
      code: 200,
      message: "新建成功",
    });
  })
})

// 删除
router.post("/delete", (req, res) => {
  const { show_id } = req.body;
  sql.query("DELETE FROM home_show WHERE show_id = ?", show_id, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "删除失败",
      });
    }

    return res.send({
      code: 200,
      message: "删除成功",
    });
  })
})

// 图片上传
router.post("/image", upload.single("file"), (req, res) => {
  const file = req.file;
  const show_id = req.body.show_id;
  const sqlInsert =
    "UPDATE home_show set image_name = ?, image_path = ? where show_id = ?";
  const values = [file.originalname, file.path, show_id];
  console.log(values);
  sql.query(sqlInsert, values, (err, result) => {
    if (err) {
      return res.send({
        code: 500,
        message: "上传失败",
      });
    }
    return res.send({
      code: 200,
      message: "上传成功",
    });
  });
})

// 图片删除
router.post("/deleteImage", (req, res) => {
  const { show_id, image_path } = req.body;
  sql.query("UPDATE home_show SET image_path = NULL, image_name = NULL WHERE show_id = ?", show_id, (err, result) => {
    if (err) {
      console.log(err);
      return res.send({
        code: 500,
        message: "删除失败",
      });
    }
    fs.unlink(image_path, () => {});  // 删除文件
    return res.send({
      code: 200,
      message: "删除成功",
    });
  })
});

module.exports = router;
