const mongoose=require('mongoose');

const cmsUserSchema= mongoose.Schema({
    name:{
        type:String,
        required:[true,"please add name"]
    },
    email:{
        type:String,
        required:[true,"please add eamil"]
    },
    password:{
        type:String,
        required:[true,"enter password"]
    },
    mobile:{
        type:String,
        required:[true,"enter mobile"]
    },
    address:{
        type:String,
        required:[true,"enter address"]
    },
    userImage:{
        type:String,
        required:[false,"add profile"]
    }
},{
    timestamps:true
})

module.exports=mongoose.model("cmsUser",cmsUserSchema)