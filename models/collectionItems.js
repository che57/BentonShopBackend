var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CollectionItemSchema = new Schema({
    itemId: String,
    collectionId: String,
    quantity: Number,
    itemName: String
})

module.exports = mongoose.model('CollectionItem', CollectionItemSchema);