const mongoose=require('mongoose');


const forgotSchema= mongoose.Schema({
    email:{
        type:String,
        required:[true,"please add eamil"]
    },
    otp:{
        type:Number,
        required:[true,"please add otp"]
    },
   
    expireTime:{
        type:Date,
        required:[true,"expire time"]
    },
    isUserExixtId:{
        type:String,
        required:[true]
    }
})

module.exports=mongoose.model("forgetPasswordOtp",forgotSchema);