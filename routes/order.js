const express = require("express");
const router = express.Router();
const sql = require("../db/sql"); // 在 ../db/sql.js 中创建了连接池


// 下单
router.post("/add", (req, res) => {
    const { order_id, create_time, user_name, total_price, product_details, store_id, note } = req.body;
    const sqlStr = "insert into `order` (order_id, create_time, user_name, total_price, product_details, store_id, note) values (?,?,?,?,?,?,?)";
    const value = [order_id, create_time, user_name, total_price, product_details, store_id, note];
    sql.query(sqlStr, value, (err, result) => {
        if (err) {
            console.log(err);
            return res.send({
                code: 500,
                message: "下单失败!",
            });
        }
        res.send({
            code: 200,
            message: "下单成功!",
        });
    })
})

// 条件查询
router.post("/search", (req, res) => {
    const { store_name, create_time, user_name } = req.body;
    let sqlStr = "SELECT customer.*, `order`.* FROM customer LEFT JOIN `order` ON customer.user_name = `order`.user_name WHERE 1 = 1";
    if (create_time) {
        sqlStr += ` and DATE(create_time) = '${create_time}'`;
    }
    if (user_name) {
        sqlStr += ` and 'order'.user_name = ${user_name}`;
    }
    // 查询店铺ID
    if (store_name) {
        sqlStr += ` and store_id = (select store_id from shops where store_name = '${store_name}')`;
    }
    console.log(sqlStr);
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





module.exports = router;