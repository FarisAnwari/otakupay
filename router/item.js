const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const db = require("../database");
const middleware = require("../middleware/users");
// const { NULL } = require("mysql/lib/protocol/constants/types");
require("dotenv").config();

router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

router.get("/all", async (req, res, next) => {
    const item = await db.promise().query(`SELECT * FROM items;`);
    res.status(200).send({
        items: item[0],
    });
});

router.post("/buy", middleware.validateToken, async (req, res, next) => {
    const id = req.body.id;
    const amount = req.body.amount;

    const item = await db
        .promise()
        .query(`SELECT * FROM items WHERE id = ${id};`);
    var stock = item[0][0].stock;
    const price = item[0][0].price;
    const totalPrice = amount * price;

    if (stock < amount) {
        res.status(400).send({
            msg: "Item stock isn't enough",
        });
    } else {
        stock -= amount;
        db.execute(
            `UPDATE items SET stock = ${stock} WHERE id = ${id}`,
            (err, result) => {
                if (err) {
                    throw err;
                    return res.status(500).send({
                        msg: err,
                    });
                } else {
                    res.status(200).send({
                        msg: "Purchase succesful",
                        totalPrice
                    })
                }
            }
        )
    }
})

module.exports = router;
