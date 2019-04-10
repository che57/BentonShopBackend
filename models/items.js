var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: String,
    iDescription: String,
    price: Number,
    tax: Number,
    stock: Number,
    salesVolume: Number,
})

module.exports = mongoose.model('Item', ItemSchema);