
var express = require("express");

var Item = require("../models/items");
var User = require("../models/users");
var Comment = require("../models/comments");
var CollectionItem = require("../models/collectionItems");
var CartItem = require("../models/cartItems");
var Collection = require("../models/collections");

var router = express.Router();

var nPerPage = 9;

router.route('/items')
    .get((req, res)=>{
        var nSkip = req.query.page * nPerPage;
        // Item.find().sort({salesVolume: -1}).skip(nSkip).limit(nPerPage).exec((err, items)=>{
        //     if(err) res.send(err);
        //     res.json(items);
        // })
        Item.find((error, result) => {
            if(error) {
                return res.status(500).send(error);
            }
            res.send(result);
        });
    });
    
router.route('/items/:item_id')
    .get((req, res)=>{
        Item.findById(req.params.item_id, (err, item)=>{
            if(err) res.send(err);
            res.json(item);
        })
    })
    
router.route('/users')
    .get((req, res)=>{
        User.findById(req.userId, (err, user)=>{
            if(err) res.send(err);
            res.json(user);
        })
    })
    .put((req,res)=>{
        User.findById(req.userId, (err, user)=>{
            if(err) res.send(err);
            if(req.body.password != null && req.body.password != '') user.password = req.body.password;
            user.save((err)=>{
                if(err) res.send(err);
                res.json({msg: "User information updated!!"});
            })
        })
    })
    
router.route('/comments')
    .post((req, res)=>{
        var comment = new Comment();
        comment.userName = req.body.userName;
        comment.content = req.body.content;
        comment.rating = req.body.rating;
        comment.itemId = req.body.itemId;
        comment.state = 1;
        if(comment.userName == null || comment.userName == '') {
            res.json({msg: 'missing userName!'});
        }
        else if(comment.content == null) {
            res.json({msg: 'missing content!'});
        }
        else if(comment.rating == null || comment.rating == '') {
            res.json({msg: 'missing rating!'});
        }
        else if(comment.itemId == null || comment.itemId == '') {
            res.json({msg: 'missing itemId!'});
        }
        else{
            comment.save((err)=>{
                if(err) res.send(err);
                res.json({message: 'New Comment created!!'});
            })
        }
    })
    
router.route('/cartItems')
    .post((req, res) => {
        var cartItem = new CartItem();
        cartItem.userId = req.userId;
        cartItem.itemId = req.body.itemId;
        cartItem.itemQuantity = req.body.itemQuantity;

        if(cartItem.userId == '' || cartItem.userId == null) {
            res.json({msg: 'missing userId'});
        }
        else if(cartItem.itemId == '' || cartItem.itemId == null) {
            res.json({msg: 'missing itemId'});
        }
        else if(cartItem.itemQuantity == '' || cartItem.itemQuantity == null) {
            res.json({msg: 'missing itemQuantity'});
        }
        else{
            Item.find({_id: cartItem.itemId}, (err, items) => {
                if(err) return res.send(err);
                if(items[0].stock < cartItem.itemQuantity) return res.json({msg: 'no enough stock'});
                else {
                    items[0].stock -= cartItem.itemQuantity;
                    items[0].save((err) => {
                        if(err) return res.send(err);
                        CartItem.find({userId: req.userId, itemId: cartItem.itemId}, (err, cartItems) => {
                            if(err) return res.send(err);
                            if(cartItems.length == 0) {
                                cartItem.save((err) => {
                                    if(err) res.send(err);
                                    res.json({msg: 'New cartItem created!'});
                                })
                            }
                            else {
                                cartItems[0].itemQuantity += cartItem.itemQuantity;
                                cartItems[0].save((err) => {
                                    if(err) res.send(err);
                                    res.json({msg: 'cartItem quantity updated!'});                        
                                })
                            }
                        })
                    })
                }
            })
        }
    })
router.route('/cartItems/:cartItem_id')
    .get((req, res) => {
        CartItem.findById(req.params.cartItem_id, (err, cartItem) => {
            if(err) res.send(err);
            res.json(cartItem);
        })
    })
    .put((req, res) => {
        CartItem.findById(req.params.cartItem_id, (err, cartItem) => {
            if(err) res.send(err);
            if(req.body.itemQuantity != null && req.body.itemQuantity != '') {
                cartItem.itemQuantity = req.body.itemQuantity;
            }
            cartItem.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'cartItem updated!'})
            })
        })
    })
    .delete((req, res) => {
        CartItem.findById(req.params.cartItem_id, (err, cartItem) => {
            if(err) res.send(err);
            Item.findById(cartItem.itemId, (err, item) => {
                if(err) return res.send(err);
                item.stock += cartItem.itemQuantity;
                item.save((err) => {
                    if(err) return res.send(err);
                    CartItem.remove({_id: req.params.cartItem_id}, (err, cartItem) => {
                        if(err) res.send(err);
                        res.json({msg: 'CartItem deleted!'});
                    })
                })
            })
        })
    })
router.route('/users/cartItems')
    .get((req, res) => {
        CartItem.find({userId: req.userId}, (err, cartItems) => {
            if(err) res.send(err);
            res.json(cartItems);
        })
    })
    
router.route('/users/cartItems/checkOut')
    .delete((req, res) => {
        CartItem.remove({userId: req.userId}, (err, cartItems) => {
            if(err) return res.send(err);
            res.json({msg: 'check out successfully!'});
        });
    })

    
router.route('/collections')
    .get((req, res) => {
        Collection.find({visibilityState: 1}, (err, collection) => {
            if(err) res.send(err);
            res.json(collection);
        })
    })
    .post((req, res) => {
        var collection = new Collection();
        collection.userId = req.userId;
        collection.collectionName = req.body.collectionName;
        collection.collectionDescription = req.body.collectionDescription;
        collection.visibilityState = req.body.visibilityState;
        collection.userName = req.body.userName;
        if(collection.userId == null || collection.userId == ''){
            res.json({msg: "missing userId"});
        }
        else if(collection.userName == null || collection.userName == ''){
            res.json({msg: "missing userName"});
        }
        else if(collection.collectionName == null || collection.collectionName == ''){
            collection.collectionName = 'Collection';
        }
        else{
            collection.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'New collection created!'});
            })
        }
    })
router.route('/collections/:collecion_id')
    .get((req, res) => {
        Collection.findById(req.params.collecion_id, (err, collection) => {
            if(err) res.send(err);
            res.json(collection);
        })
    })
    .put((req, res) => {
        Collection.findById(req.params.collecion_id, (err, collection) => {
            if(err) res.send(err);
            if(req.body.collectionName != null && req.body.collectionName != ''){
                collection.collectionName = req.body.collectionName;
            }
            if(req.body.collectionDescription != null && req.body.collectionDescription != ''){
                collection.collectionDescription = req.body.collectionDescription;
            }
            if(req.body.visibilityState != null || req.body.visibilityState != ''){
                collection.visibilityState = req.body.visibilityState;
            }
            collection.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'collection updated!'})
            })
        })
    })
    .delete((req, res) => {
        Collection.findById(req.params.collecion_id, (err, collection) => {
            if(err) res.send(err);
            Collection.remove({_id: req.params.collecion_id}, (err, collection) => {
                if(err) res.send(err);
                res.json({msg: 'collection deleted!'});
            })
        })
    })
router.route('/users/collections')
    .get((req, res) => {
        Collection.find({userId: req.userId}, (err, collection) => {
            if(err) res.send(err);
            res.json(collection);
        })
    })
    
router.route('/collectionItems')
    .post((req, res) => {
        var collectionItem = new CollectionItem();
        collectionItem.collectionId = req.body.collectionId;
        collectionItem.itemId = req.body.itemId;
        collectionItem.quantity = req.body.quantity;
        collectionItem.itemName = req.body.itemName;

        if(collectionItem.collectionId == '' || collectionItem.collectionId == null) {
            res.json({msg: 'missing collectionId'});
        }
        else if(collectionItem.itemId == '' || collectionItem.itemId == null) {
            res.json({msg: 'missing itemId'});
        }
        else if(collectionItem.quantity == '' || collectionItem.quantity == null) {
            res.json({msg: 'missing quantity'});
        }
        else if(collectionItem.itemName == '' || collectionItem.itemName == null) {
            res.json({msg: 'missing itemName'});
        }
        else{
            collectionItem.save((err) => {
                if(err) return res.send(err);
                CollectionItem.find({itemId: collectionItem.itemId}, (err, collectionItems) => {
                    if(err) return res.send(err);
                    if(collectionItems.length == 1) {
                        collectionItem.save((err) => {
                            if(err) return res.send(err);
                            res.json({msg: 'New collectionItem created!'});
                        })
                    }
                    else {
                        collectionItems[0].quantity += collectionItem.quantity;
                        collectionItems[0].save((err) => {
                            if(err) return res.send(err);
                            res.json({msg: 'collectionItem updated!'})
                        })
                    }
                })
            })
        }
    })
router.route('/collectionItems/:collectionItem_id')
    .get((req, res) => {
        CollectionItem.findById(req.params.collectionItem_id, (err, collectionItem) => {
            if(err) res.send(err);
            res.json(collectionItem);
        })
    })
    .put((req, res) => {
        CollectionItem.findById(req.params.collectionItem_id, (err, collectionItem) => {
            if(err) res.send(err);
            if(req.body.quantity != null && req.body.quantity != '') {
                collectionItem.quantity = req.body.quantity;
            }
            collectionItem.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'collectionItem updated!'})
            })
        })
    })
    .delete((req, res) => {
        CollectionItem.remove({_id: req.params.collectionItem_id}, (err, collectionItem) => {
            if(err) res.send(err);
            res.json({msg: 'collectionItem deleted!'});
        })
    })
router.route('/collections/:collecion_id/collectionItems')
    .get((req, res) => {
        CollectionItem.find({collectionId: req.params.collecion_id}, (err, collectionItem) => {
            if(err) res.send(err);
            res.json(collectionItem);
        })
    })
    
module.exports = router;