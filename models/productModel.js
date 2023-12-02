const mongoose=require('mongoose');


const productSchema= mongoose.Schema({
    productCode:{
        type:String,
        required:[true,"please productcode"]
    },
    name:{
        type:String,
        required:[true,"please add name"]
    },
    category:{
        type:String,
        required:[true,"please add category"]
    },
    quantity:{
        type:Number,
        required:[true,"please add quantity"]
    },
    price:{
            type:Number,
            required:[true,"please add price"]
        }
   
    },{
    timestamps:true
})

module.exports=mongoose.model("products",productSchema) // here User is the name of table in database 
