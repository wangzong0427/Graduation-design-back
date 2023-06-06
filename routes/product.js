const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //文件保存路径
    cb(null, "public/images/product/");
  },
  filename: function (req, file, cb) {
    //存储文件名
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

// 创建餐品接口
router.post("/productCreate", (req, res) => {
  const {
    product_name,
    product_description,
    store_name,
    classify_name,
    product_specification,
    product_attribute,
  } = req.body;
  var product_id = null;

  // 查询对应的店铺ID
  const getStoreIdSql = `SELECT store_id FROM shops WHERE store_name = ?`;
  const getStoreIdValues = [store_name];
  sql.query(getStoreIdSql, getStoreIdValues, (error, results, fields) => {
    // console.log(results[0].store_id);
    if (error) {
      console.error("Error querying store_id from shops table: ", error);
      return res.status(500).json({
        code: 500,
        message: "Error querying store_id from shops table",
      });
    }

    // 获取到店铺ID后，查询该店铺是否已存在同名餐品
    const store_id = results[0].store_id;
    console.log(store_id);
    const checkProductSql = `SELECT COUNT(*) as count FROM product WHERE store_id = ? AND product_name = ?`;
    const checkProductValues = [store_id, product_name];
    sql.query(checkProductSql, checkProductValues, (error, results, fields) => {
      // console.log(results);
      if (error) {
        console.error("Error querying product table: ", error);
        return res.status(500).json({
          code: 500,
          message: "Error querying product table",
        });
      } else {
        const count = results[0].count;
        if (count > 0) {
          console.log("存在同名餐品！无法添加");
          // 存在同名餐品，返回错误响应
          return res.send({
            code: 400,
            message: "店铺中已经存在同名餐品！无法添加，请更改餐品名称！",
          });
        } else {
          // 获取到店铺ID后，将数据插入到 product 表中
          const insertProductSql = `INSERT INTO product (product_name, product_description, store_id, store_name, classify_name) VALUES (?, ?, ?, ?, ?)`;
          const insertProductValues = [
            product_name,
            product_description,
            store_id,
            store_name,
            classify_name,
          ];

          // 完成餐品分类以后，再插入餐品
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
            }
          );

          //  获取到餐品id
          const sqlProductId =
            "select product_id from product where product_name = ?";
          sql.query(sqlProductId, [product_name], (error, results1) => {
            console.log(results1[0].product_id);
            product_id = results1[0].product_id;

            // 获取到id以后
            // 插入餐品以后，再插入餐品规格
            product_specification.map((item) => {
              const { name, value, price } = item;
              console.log("name:", name);
              const insertProductSpecificationSql = `INSERT INTO product_specification (product_id, product_name, specification_name, specification_value, specification_price) VALUES (?, ?, ?, ?, ?)`;
              const insertProductSpecificationValues = [
                product_id,
                product_name,
                name,
                value,
                price,
              ];
              console.log("餐品ID", product_id);
              sql.query(
                insertProductSpecificationSql,
                insertProductSpecificationValues,
                (error, results, fields) => {
                  if (error) {
                    console.error(
                      "Error inserting into product_specification table: ",
                      error
                    );
                    return res.status(500).json({
                      code: 500,
                      message:
                        "Error inserting into product_specification table",
                    });
                  }
                }
              );
            });
            // 如果餐品没有属性
            if (product_attribute.length === 0) {
              return res.send({
                code: 200,
                message: "餐品添加成功！",
              });
            } else {
              // 如果餐品有属性
              // 插入餐品规格以后，再插入餐品属性
              product_attribute.map((item) => {
                console.log(item);
                const { name, domains } = item;
                domains.map((item1) => {
                  const { value } = item1;
                  const insertProductAttributeSql = `INSERT INTO product_attribute (product_id, product_name, attribute_name, attribute_value) VALUES (?, ?, ?, ?)`;
                  const insertProductAttributeValues = [
                    product_id,
                    product_name,
                    name,
                    value,
                  ];
                  // console.log("insertProductAttributeValues:", insertProductAttributeValues);
                  sql.query(
                    insertProductAttributeSql,
                    insertProductAttributeValues,
                    (error, results, fields) => {
                      if (error) {
                        console.error(
                          "Error inserting into product_attribute table: ",
                          error
                        );
                        return res.status(500).json({
                          code: 500,
                          message:
                            "Error inserting into product_attribute table",
                        });
                      }
                      // 到此为止全部插入成功，即为餐品创建成功
                      return res.send({
                        code: 200,
                        message: "餐品创建成功！",
                      });
                    }
                  );
                });
              });
            }
          });
        }
      }
    });
  });
});

// 餐品列表接口
router.post("/", (req, res) => {
  const { product_name, store_name, classify_name } = req.body;
  let query = "select * from product where 1 = 1";
  if (product_name) {
    query += ` AND product_name = '${product_name}'`;
  }
  if (store_name) {
    query += ` AND store_name = '${store_name}'`;
  }
  if (classify_name) {
    query += ` AND classify_name = '${classify_name}'`;
  }
  query += " ORDER BY classify_name";
  // 执行查询并返回结果
  sql.query(query, (error, results, fields) => {
    if (error) {
      res.send({
        code: 500,
        message: "未找到相关餐品！请确认搜索条件是否正确",
        data: results,
      });
    } else {
      var data = results;
      results.map((item, index) => {
        const { product_id } = item;
        const sqlQueryProductSpecification = `select * from product_specification where product_id = ?`;
        sql.query(
          sqlQueryProductSpecification,
          [product_id],
          (err, results1) => {
            if (err) {
              console.log(err);
            } else {
              data[index].product_specification = results1;
            }
          }
        );
        const sqlQueryProductAttribute = `select * from product_attribute where product_id = ?`;
        sql.query(sqlQueryProductAttribute, [product_id], (err, results2) => {
          if (err) {
            console.log(err);
          } else {
            data[index].product_attribute = results2;
          }
        });
      });
      setTimeout(() => {
        return res.send({
          code: 200,
          message: "餐品列表获取成功！",
          data: data,
        });
      }, 100);
    }
  });
});
// 删除餐品
router.post("/deleteProduct", (req, res) => {
  const { product_id } = req.body;
  console.log(req.body);
  const sqlDeleteProduct = "delete from product where product_id = ?";
  sql.query(sqlDeleteProduct, [product_id], (err, results) => {
    if (err) {
      return res.send({
        code: 500,
        message: "删除餐品失败",
      });
    } else {
      return res.send({
        code: 200,
        message: "删除餐品成功",
      });
    }
  });
});
// 图片上传
router.post("/image", upload.single("file"), (req, res) => {
  // 获取上传的文件信息
  const file = req.file;
  const product_id = req.body.product_id;
  // 构建插入数据库的SQL查询
  const sqlInsert =
    "UPDATE product set image_name = ?, image_path = ? where product_id = ?";
  const values = [file.originalname, file.path, product_id];
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
  const { product_id, image_path } = req.body;
  const sqlDeleteImage =
    "UPDATE product SET image_path = NULL, image_name = NULL WHERE product_id = ?";
  sql.query(sqlDeleteImage, [product_id], (err, results) => {
    if (err) {
      return res.send({
        code: 500,
        message: "删除图片失败！",
      });
    }
    fs.unlink(image_path, () => {});
    return res.send({
      code: 200,
      message: "删除图片成功",
    });
  });
});

// 餐品分类查询接口
router.post("/productClassify", (req, res) => {
  console.log(req.body);
  const { store_name } = req.body;
  let query = `SELECT * FROM product_classify WHERE store_name = '${store_name}'`;
  query += " ORDER BY classify_name";
  sql.query(query, (error, results, fields) => {
    if (error) {
      res.send({
        code: 500,
        message: "查询错误，请稍后重试",
        data: results,
      });
    } else if (results.length == 0) {
      res.send({
        code: 400,
        message: "店铺不存在或此店铺下不存在任何餐品分类！",
      });
    } else {
      res.send({ code: 200, message: "查询成功！", data: results });
    }
  });
});

// 新建餐品分类
router.post("/newProductClassify", (req, res) => {
  console.log("req.body:", req.body);
  const { store_name, newClassify } = req.body;
  // 查询是否存在相同的分类名称
  const selectProductClassifySql = `SELECT COUNT(*) AS count FROM product_classify WHERE store_name = ? AND classify_name = ?`;
  const ProductClassifyValues = [store_name, newClassify];
  sql.query(
    selectProductClassifySql,
    ProductClassifyValues,
    (error, results, fields) => {
      if (error) {
        console.error("Error querying product_classify table: ", error);
        return res.send({
          code: 500,
          message: "未知错误！请稍后重试！",
        });
      }

      const count = results[0].count;
      console.log("count", count);

      if (count === 0) {
        // 不存在相同的分类名称，执行插入操作
        const insertProductClassifySql = `INSERT INTO product_classify (store_name, classify_name) VALUES (?, ?)`;
        sql.query(
          insertProductClassifySql,
          ProductClassifyValues,
          (error, results, fields) => {
            if (error) {
              console.error(
                "Error inserting into product_classify table: ",
                error
              );
              return res.send({
                code: 500,
                message: "未知错误！请稍后重试",
              });
            }
            return res.send({
              code: 200,
              message: "餐品分类创建成功！",
            });
          }
        );
      } else {
        // 存在相同的分类名称，返回错误信息
        return res.send({
          code: 400,
          message: "此分类名称已存在！",
        });
      }
    }
  );
});

// 删除餐品分类
router.post("/deleteProductClassify", (req, res) => {
  const { classify_id } = req.body;
  sql.query(
    `delete from product_classify where classify_id = '${classify_id}'`,
    (err, results, fields) => {
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
    }
  );
});

// 餐品更新
router.post("/update", (req, res) => {
  const {
    classify_name,
    image_name,
    image_path,
    product_attribute,
    product_description,
    product_id,
    product_name,
    product_specification,
    store_id,
    store_name,
  } = req.body;
  const sqlUpdate = `UPDATE product SET classify_name = ?, product_description = ?, product_name = ?, store_id = ?, store_name = ? WHERE product_id = ?`;
  const values = [
    classify_name,
    product_description,
    product_name,
    store_id,
    store_name,
    product_id,
  ];
  sql.query(sqlUpdate, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.send({
        code: 500,
        message: "更新失败",
      });
    } else {
      return res.send({
        code: 200,
        message: "更新成功",
      });
    }
  });
});

module.exports = router;
