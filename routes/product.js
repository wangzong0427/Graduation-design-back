const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池

// 创建商品接口
router.post("/productCreate", (req, res) => {
  const { name, price, inventory, description, store_name } = req.body;

  // 查询对应的店铺ID
  const getStoreIdSql = `SELECT store_id FROM shops WHERE store_name = ?`;
  const getStoreIdValues = [store_name];
  sql.query(getStoreIdSql, getStoreIdValues, (error, results, fields) => {
    console.log(results);
    if (error) {
      console.error("Error querying store_id from shops table: ", error);
      return res.status(500).json({
        code: 500,
        message: "Error querying store_id from shops table",
      });
    }

    // 获取到店铺ID后，查询该店铺是否已存在同名商品
    const store_id = results[0].store_id;
    const checkProductSql = `SELECT COUNT(*) as count FROM product WHERE store_id = ? AND product_name = ?`;
    const checkProductValues = [store_id, name];
    sql.query(checkProductSql, checkProductValues, (error, results, fields) => {
      if (error) {
        console.error("Error querying product table: ", error);
        return res.status(500).json({
          code: 500,
          message: "Error querying product table",
        });
      }

      const count = results[0].count;
      if (count > 0) {
        // 存在同名商品，返回错误响应
        return res.status(400).json({
          code: 400,
          message: "The same product name already exists in this store",
        });
      }

      // 获取到店铺ID后，将数据插入到 product 表中
      const store_id = results[0].store_id;
      const insertProductSql = `INSERT INTO product (product_name, product_price, product_inventory, product_description, store_id, store_name) VALUES (?, ?, ?, ?, ?, ?)`;
      const insertProductValues = [
        name,
        price,
        inventory,
        description,
        store_id,
        store_name,
      ];

      sql.query(
        insertProductSql,
        insertProductValues,
        (error, results, fields) => {
          if (error) {
            console.error("Error inserting into product table: ", error);
            return res.status(500).json({
              code: 500,
              message: "Error inserting into product table",
            });
          }
          return res
            .status(200)
            .json({ code: 200, message: "Product added successfully" });
        }
      );
    });
  });
});

// 商品列表接口
router.post("/", (req, res) => {
  const { product_name, store_name } = req.body;
  let query = "select * from product where 1 = 1";
  if (product_name) {
    query += ` AND product_name = '${product_name}'`;
  }
  if (store_name) {
    query += ` AND store_name = '${store_name}'`;
  }
  // 执行查询并返回结果
  sql.query(query, (error, results, fields) => {
    if (error) {
      res.send({
        code: 500,
        message: "未找到相关商品！请确认搜索条件是否正确",
        data: results,
      });
    } else {
      res.send({ code: 200, message: "查询成功！", data: results });
    }
  });
});

// 商品分类查询接口
router.get("/productClassify", (req, res) => {
  sql.query("select * from product_classify", (error, results) => {
    res.send({
      code: 200,
      message: "查询成功！",
      data: results,
    });
  });
});

module.exports = router;
