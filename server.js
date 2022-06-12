const express = require('express');
const app = express();
const db = require('./database');
const authRoute = require("./router/auth");
const itemRoute = require("./router/item");
const PORT = process.env.PORT || 3000;

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

// preprocessing end 
// routing start

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get("/all", async (req, res, next) => {
    const user = await db.promise().query(`SELECT * FROM users;`);
    res.status(200).send({
        users: user[0],
    });
});

app.use("/auth", authRoute);
app.use("/item", itemRoute);

app.get('/view/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', (req, res) => {
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

                return res.status(200).send({
                    msg: "Logged in!",
                    token,
                });
            }
        }
    );
})

// routing end

app.use(express.static("public"));

app.listen(3000)