const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
    validateRegister: (req, res, next) => {
        // username min length 3
        if (!req.body.username || req.body.username.length < 3) {
            return res.status(400).send({
                msg: "Username at least must have 3 characters",
            });
        }

        //password min 8 characters
        if (!req.body.password || req.body.password.length < 8) {
            return res.status(400).send({
                msg: "Password at least must have 8 characters",
            });
        }

        next();
    },

    validateToken: (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            req.userData = decoded;
            next();
        } catch (err) {
            return res.status(401).send({
                msg: "Your session is not valid!;",
            });
        }
    },
};
