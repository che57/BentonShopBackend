var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TempUserSchema = new Schema({
    userName: String,
    password: String,
    state: Number,
    // 0: deactivated, 1: activated
    isAdmin: Boolean
})

module.exports = mongoose.model('TempUser', TempUserSchema);