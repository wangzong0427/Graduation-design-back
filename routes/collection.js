const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池

router.post("/add", (req, res) => {
  const { user_name, product_details } = req.body;
  const checkDuplicateSqlStr =
    "SELECT COUNT(*) AS count FROM collection WHERE user_name = ? AND product_details = ?";
  const checkDuplicateValue = [user_name, product_details];
  console.log(req.body);
  sql.query(checkDuplicateSqlStr, checkDuplicateValue, (err, results) => {
    if (err) {
      return res.send({
        code: 500,
        message: "收藏失败!",
      });
    }

    if (results[0].count > 0) {
      return res.send({
        code: 400,
        message: "您已经收藏过该餐品",
      });
    }

    const insertSqlStr =
      "INSERT INTO collection (user_name, product_details) VALUES (?,?)";
    const insertValue = [user_name, product_details];
    sql.query(insertSqlStr, insertValue, (err, result) => {
      if (err) {
        return res.send({
          code: 500,
          message: "收藏失败!",
        });
      }
      res.send({
        code: 200,
        message: "收藏成功!",
      });
    });
  });
});

router.post("/list", (req, res) => {
  const { user_name } = req.body;
  const sqlStr = "SELECT * FROM collection WHERE user_name = ?";
  const sqlValue = [user_name];
  sql.query(sqlStr, sqlValue, (err, results) => {
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
})

module.exports = router;
