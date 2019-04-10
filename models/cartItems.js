var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CartItemSchema = new Schema({
    userId: String,
    itemId: String,
    itemQuantity: Number
})

module.exports = mongoose.model('CartItem', CartItemSchema);