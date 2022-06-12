const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const db = require("../database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/users");
require("dotenv").config();

router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

router.get("/register", (req, res, next) => {
    res.render('register.ejs')
})


router.post("/register", middleware.validateRegister, (req, res, next) => {
    db.query(
        `SELECT * FROM users WHERE LOWER(username) = LOWER(${db.escape(
            req.body.username
        )});`,
        (err, result) => {
            if (result.length) {
                //username not available
                return res.status(409).send({
                    msg: "Username already exist!",
                });
            } else {
                // username is available

                if (err) {
                    return res.status(500).send({
                        msg: err,
                    });
                } else {
                    // insert into database
                    db.query(
                        `INSERT INTO users (username, email, password) VALUES (${db.escape(
                            req.body.username
                        )}, ${db.escape(req.body.email)}, ${db.escape(req.body.password)})`,
                        (err, result) => {
                            if (err) {
                                // throw err;
                                return res.status(400).send({
                                    msg: err,
                                });
                            } else {
                                // return res.status(201).send({
                                //     msg: "Registered",
                                // });
                                return res.redirect('/auth/login');
                            }
                        }
                    );
                }

            }
        }
    );
});

router.get("/login", (req, res, next) => {
    res.render('login.ejs')
})

router.post("/login", (req, res, next) => {
    // console.log(req.body)
    db.query(
        `SELECT * FROM users WHERE username = ${db.escape(req.body.username)};`,
        (err, result) => {
            if (err) {
                throw err;
                return res.status(400).send({
                    msg: err,
                });
            }

            if (!result.length) {
                return res.status(401).send({
                    msg: "Username or password is incorrect!",
                });
            }
            var pwd = result[0]["password"];
            var pass = req.body.password;
            var secure = pwd.localeCompare(pass);

            if (secure == 0) {
                const id = result[0].id;
                const token = jwt.sign(
                    {
                        id,
                    },
                    process.env.TOKEN_SECRET,
                    {
                        expiresIn: "1d",
                    }
                );

                // res.status(200).send({
                //     msg: "Logged in!",
                //     token,
                // });

                return res.redirect('/');
            }
        }
    );
});

router.get("/profile", middleware.validateToken, async (req, res, next) => {
    const id = req.userData.id;
    const result = await db.promise().query(`SELECT * FROM users WHERE id = ${id};`);
    var profile = result[0][0];
    res.status(200).send({
        profile,
    });
});

router.post("/otakupay/login", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const data = { username, password };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('https://opay-v2.herokuapp.com/auth/login', options).then(response => {
        const token = response;
        res.status(200).send({
            token,
        });
    });
})

module.exports = router;
