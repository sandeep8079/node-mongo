const mongoose = require('mongoose');
 
const articleSchema = new mongoose.Schema({
    articleId:{
        type:String,
        required:[false,"articles id"]
    },
    title:{
        type:String,
        required:[true,"title required"]
    },
    category:{
        type : String,
        required :[true,"category required"]
    },
    content:{
        type : String,
        required :[true,"content required"]
    },
    maincontent:{
        type : String,
        required :[true,"maincontent required"]
    },
    image:{
        type:String,
        required :[false]
    },
    date:{
        type:String,
        required :[false]
    },
    status:{
        type:String,
        required :[false]
 
    },
    createdBy:{
        type:String,
        required :[false]
    },
    IDOfUser:{
        type:String,
        required :[false]
    }
},{
    timestamps:true
});
 
module.exports = mongoose.model("Articles",articleSchema);  