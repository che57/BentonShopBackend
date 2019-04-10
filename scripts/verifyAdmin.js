var express = require("express");
var User = require("../models/users");

function verifyAdmin(req, res, next) {
    if(req.isAdmin != true) return res.status(401).json({msg: 'Authority authentication failed'});
    else next();
}

module.exports = verifyAdmin;