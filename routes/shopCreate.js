const express = require('express');
const router = express.Router();
const sql1 = require('../db/sql'); // 在 ../db/sql.js 中创建了连接池

router.post('/shopCreate', (req, res) => {
  const { name, phone, cooperation, business, recommend, information, classify } = req.body;

  const sql = `INSERT INTO shops (contact_phone, store_name, classify_name, cooperation_status, business_status, recommend_status, information) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [phone, name, classify, cooperation, business, recommend, information];


    sql1.query(sql, values, (error, results, fields) => {
      // sql1.release(); // 释放连接
      if (error) {
        console.error("Error inserting into database: ", error);
        return res.status(500).json({code: 500, message: "Error inserting into database" });
      }
      return res.status(200).json({code: 200, message: "Shop added successfully" });
    });
  });

module.exports = router;
