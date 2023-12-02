const mongoose = require('mongoose');
 
const articleAboutSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"username"]
    },
    email:{
        type:String,
        required:[true,"user emails"]
    },
    message:{
        type : String,
        required :[true,"messages"]
    },
    
},{
    timestamps:true
});
 
module.exports = mongoose.model("contact",articleAboutSchema);  