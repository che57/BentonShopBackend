var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CollectionSchema = new Schema({
    userId: String,
    userName: String,
    collectionName: String,
    collectionDescription: String,
    visibilityState: Number
    //0: private, 1: public
})

module.exports = mongoose.model('Collection', CollectionSchema);