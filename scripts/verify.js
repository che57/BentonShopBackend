var jwt = require("jsonwebtoken");
var config = require("./config");

function verifyToken(req, res, next) {
    // var token = req.header['Authorization'];
    const authorization = req.get('authorization');
    if(!authorization) return res.status(401).send({auth: false, msg: 'No token received!'});
    else{
        const token = authorization.split('Bearer ')[1];
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) return res.status(401).send(err);
            req.userId = decoded.id;
            req.isAdmin = decoded.isAdmin;
            next();
        });
    }

    // ref: https://github.com/adnanrahic/securing-restful-apis-with-jwt/blob/master/auth/VerifyToken.js
}

module.exports = verifyToken;