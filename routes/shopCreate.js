const express = require("express");
const router = express.Router();
const sql1 = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池

router.post("/shopCreate", (req, res) => {
  const {
    name,
    phone,
    cooperation,
    business,
    recommend,
    information,
    classify,
  } = req.body;

  const sql = `INSERT INTO shops (contact_phone, store_name, classify_name, cooperation_status, business_status, recommend_status, information) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    phone,
    name,
    classify,
    cooperation,
    business,
    recommend,
    information,
  ];

  // 首先检索当前分类下是否存在同名店铺
  sql1.query(
    `SELECT * FROM shops WHERE store_name = ? AND classify_name = ?`,
    [name, classify],
    (error, results, fields) => {
      if (error) {
        console.error("Error checking database for existing shop: ", error);
        return res.status(500).json({ code: 500, message: "服务器出错" });
      }
      if (results.length > 0) {
        return res
          .status(200)
          .json({ code: 400, message: "当前分类下已存在同名店铺！" });
      } else {
        sql1.query(sql, values, (error, results, fields) => {
          if (error) {
            console.error("Error inserting into database: ", error);
            return res
              .status(500)
              .json({ code: 500, message: "服务器出错" });
          }
          return res
            .status(200)
            .json({ code: 200, message: "店铺创建成功！" });
        });
      }
    }
  );
});

module.exports = router;
