
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");

var Item = require("../models/items");
var User = require("../models/users");
var Comment = require("../models/comments");
var CollectionItem = require("../models/collectionItems");
var CartItem = require("../models/cartItems");
var Collection = require("../models/collections");

var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var nPerPage = 9;

router.use((req, res, next)=>{
    console.log('something is happening....');
    next();
});

router.route('/items')
    .post((req, res)=>{
        var item = new Item();
        item.name = req.body.name;
        item.price = req.body.price;
        item.tax = req.body.tax;
        item.stock = req.body.stock;
        item.salesVolume = 0;
        
        if(item.price == '' || item.price == null){
            res.json({msg: 'must input a price!'});
        }
        else{
            item.save((err)=>{
                if(err) res.send(err);
                res.json({message: 'New item created!!'});
            })
        }
    })
    .get((req, res)=>{
        var nSkip = req.query.page * nPerPage;
        Item.find().sort({salesVolume: -1}).skip(nSkip).limit(nPerPage).exec((err, items)=>{
            if(err) res.send(err);
            res.json(items);
        })
    });
    
router.route('/items/:item_id')
    .get((req, res)=>{
        Item.findById(req.params.item_id, (err, item)=>{
            if(err) res.send(err);
            res.json(item);
        })
    })
    .put((req,res)=>{
        Item.findById(req.params.item_id, (err, item)=>{
            if(err) res.send(err);
            if(req.body.name != null && req.body.name != '') item.name = req.body.name;
            if(req.body.iDescription != null && req.body.iDescription != '') item.iDescription = req.body.iDescription;
            if(req.body.price != null && req.body.price != '') item.price = req.body.price;
            if(req.body.stock != null && req.body.stock != '') item.stock = req.body.stock;
            if(req.body.tax != null){
                item.tax = req.body.tax;
                if(req.body.tax != '') item.tax = req.body.tax;
                // else{
                //     Item.update({_id: req.params.item_id}, {$unset: {tax: 1}});
                // }
            } 
            item.save((err)=>{
                if(err) res.send(err);
                res.json({msg: "item information updated!!"});
            })
        })
    })
    .delete((req, res)=>{
        Item.remove({_id: req.params.item_id},
        (err, item)=>{
            if(err) res.send(err);
            res.json({msg: 'item deleted!!'});
        })
    });
    
router.route('/users')
    .get((req, res)=>{
        User.find((err, users)=>{
            if(err) res.send(err);
            res.json(users);
        })
    });
    
router.route('/users/:user_id')
    .get((req, res)=>{
        User.findById(req.params.user_id, (err, user)=>{
            if(err) res.send(err);
            res.json(user);
        })
    })
    .put((req,res)=>{
        User.findById(req.params.user_id, (err, user)=>{
            if(err) res.send(err);
            if(req.body.password != null && req.body.password != '') user.password = req.body.password;
            if(req.body.state != null && req.body.state != '') user.state = req.body.state;
            if(req.body.isAdmin != null && req.body.isAdmin != '') user.isAdmin = req.body.isAdmin;
            user.save((err)=>{
                if(err) res.send(err);
                res.json({msg: "User information updated!!"});
            })
        })
    })
    .delete((req, res)=>{
        User.remove({_id: req.params.user_id},
        (err, user)=>{
            if(err) res.send(err);
            res.json({msg: 'User deleted!!'});
        })
    });
    
router.route('/comments')
    .post((req, res)=>{
        var comment = new Comment();
        comment.userId = req.body.userId;
        comment.content = req.body.content;
        comment.rating = req.body.rating;
        comment.itemId = req.body.itemId;
        comment.state = 1;
        if(comment.userId == null || comment.userId == '') {
            res.json({msg: 'missing userId!'});
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
    .get((req, res)=>{
        Comment.find((err, comments)=>{
            if(err) res.send(err);
            res.json(comments);
        })
    });
    
router.route('/items/:item_id/comments/')
    .get((req, res)=>{
        Comment.find({itemId: req.params.item_id}, (err, comments)=>{
            if(err) res.send(err);
            res.json(comments);
        })
    })
    .delete((req, res)=>{
        Comment.remove({itemId: req.params.item_id}, (err, comments)=>{
            if(err) res.send(err);
            res.json({msg: 'Comments of item_id deleted!!'});
        })
    });
    
router.route('/comments/:comment_id')
    .get((req, res)=>{
        Comment.findById(req.params.comment_id, (err, comments)=>{
                if(err) res.send(err);
                res.json(comments);
        })
    })
    .put((req,res)=>{
        Comment.findById(req.params.comment_id, (err, comment) => {
            if(err) res.send(err);
            if(req.body.state != null && req.body.state != '') {
                comment.state = req.body.state;
            }
            comment.save((err) => {
                if(err) res.send(err);
                res.json({msg: "Comment updated!"})
            })
        })
    })
    .delete((req, res)=>{
        Comment.remove({_id: req.params.comment_id},
            (err, comments)=>{
                if(err) res.send(err);
                res.json({msg: 'Comment deleted!!'});
            })
    });
    
router.route('/cartItems')
    .get((req, res) => {
        CartItem.find((err, cartItems) => {
            if(err) res.send(err);
            res.json(cartItems)
        })
    })
    .post((req, res) => {
        var cartItem = new CartItem();
        cartItem.userId = req.body.userId;
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
            cartItem.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'New cartItem created!'});
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
        CartItem.remove({_id: req.params.cartItem_id}, (err, cartItem) => {
            if(err) res.send(err);
            res.json({msg: 'cartItem deleted!'});
        })
    })
router.route('/users/:user_id/cartItems')
    .get((req, res) => {
        CartItem.find({userId: req.params.user_id}, (err, cartItems) => {
            if(err) res.send(err);
            res.json(cartItems);
        })
    })
    .delete((req, res) => {
        CartItem.remove({userId: req.params.user_id}, (err, cartItem) => {
            if(err) res.send(err);
            res.json({msg: 'cartItems of user_id deleted!'});
        })
    })
    
router.route('/collections')
    .get((req, res) => {
        Collection.find((err, collection) => {
            if(err) res.send(err);
            res.json(collection);
        })
    })
    .post((req, res) => {
        var collection = new Collection();
        collection.userId = req.body.userId;
        collection.collectionName = req.body.collectionName;
        collection.collectionDescription = req.body.collectionDescription;
        collection.visibilityState == req.body.visibilityState;
        if(collection.userId == null || collection.userId == ''){
            res.json({msg: "missing userId"});
        }
        else if(collection.collectionName == null || collection.collectionName == ''){
            collection.collectionName = 'Collection';
        }
        else{
            if(collection.visibilityState != 1 || collection.visibilityState != 0){
                collection.visibilityState = 0;
            }
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
            if(req.body.visibilityState == 1 || req.body.visibilityState == 0){
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
router.route('/users/:user_id/collections')
    .get((req, res) => {
        Collection.find({userId: req.params.user_id}, (err, collection) => {
            if(err) res.send(err);
            res.json(collection);
        })
    })
    .delete((req, res) => {
        Collection.remove({userId: user._id}, (err, collection) => {
            if(err) res.send(err);
            res.json({msg: 'collections of user_id deleted!'});
        })

    })
    
router.route('/collectionItems')
    .get((req, res) => {
        CollectionItem.find((err, collectionItems) => {
            if(err) res.send(err);
            res.json(collectionItems)
        })
    })
    .post((req, res) => {
        var collectionItem = new CollectionItem();
        collectionItem.collectionId = req.body.collectionId;
        collectionItem.itemId = req.body.itemId;
        collectionItem.itemCName = req.body.itemCName;
        collectionItem.itemCDescription = req.body.itemCDescription;

        if(collectionItem.collectionId == '' || collectionItem.collectionId == null) {
            res.json({msg: 'missing collectionId'});
        }
        else if(collectionItem.itemId == '' || collectionItem.itemId == null) {
            res.json({msg: 'missing itemId'});
        }
        else if(collectionItem.itemCName == '' || collectionItem.itemCName == null) {
            Item.findById(collectionItem.itemId, (err, item) => {
                if(err) res.send(err);
                collectionItem.itemCName = item.name;
            })
        }
        else{
            collectionItem.save((err) => {
                if(err) res.send(err);
                res.json({msg: 'New collectionItem created!'});
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
            if(req.body.itemQuantity != null && req.body.itemQuantity != '') {
                collectionItem.itemQuantity = req.body.itemQuantity;
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
    .delete((req, res) => {
        CollectionItem.remove({collectionId: req.params.collection_id}, (err, collectionItem) => {
            if(err) res.send(err);
            res.json({msg: 'collectionItems of collecion_id deleted!'});
        })
    })

module.exports = router;