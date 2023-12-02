
const mongoose=require('mongoose');


const userSchema= mongoose.Schema({
    // all fields are here for data insert in DB.....
    username:{
        type:String,
        required:[true,"please add name"]
    },
    email:{
        type:String,
        required:[true,"please add eamil"]
    },
    password:{
        type:String,
        required:[true,"please add password"]
    },
    mobile:{
        type:String,
        required:[true,"please add mobile"]
    },
    address:{
        type:String,
        required:[true,"please add address"]
    },
    userImage:{
        type:String,
        required:[false,"add profile"]
    }
},{
    timestamps:true
})

module.exports=mongoose.model("User",userSchema) // here User is the name of table in database 
