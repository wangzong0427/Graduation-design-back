const express = require("express");
const router = express.Router();
const sql = require("../db/sql");

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

module.exports = router;
