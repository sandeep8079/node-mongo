const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const forgetPasswordOtp = require('../models/forgetPasswordModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');


let userList = [];

const userRegister = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { username, email, password, mobile, address } = req.body;

    if (!username || !email || !password || !mobile || !address) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const isUserExixt = await User.findOne({ email });  // get from database()
    console.log('isUserExist*********', isUserExixt)
    if (isUserExixt) {
        res.status(400);
        throw new Error("User is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword*******", hashedPassword);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        mobile,
        address


    })

    if (newUser) {
        console.log("newUser***", newUser);
        res.status(201).json({
            message: "User Register Sucessfully"
        })

    }
    else {
        res.status(400);
        throw new Error("user is not valid");
    }



});

// login......
const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mendatory!");
    }
    const isUser = await User.findOne({ email });  //get data from database
    console.log("isUser::", isUser);

    // console.log("user", isUser)

    if (isUser && (await bcrypt.compare(password, isUser.password))) {
        console.log("Password Matched")
        // for datafetch
        const accessToken = jwt.sign({
            user: {
                //used for token generation
                username: isUser.username,
                email: isUser.email,
                mobile: isUser.mobile,
                address: isUser.address,
                userid: isUser._id,
            }
        }, process.env.ACCESS_TOKEN,
            { expiresIn: "1d" });

        res.status(200).json({
            bool: true,
            accessToken: accessToken,
            username: isUser.username,
            email: isUser.email,
            mobile: isUser.mobile,
            address: isUser.address,
            userImage: isUser.userImage
        })
    }

    else {
        res.status(203).json({
            bool: false,
            message: "Invalid credentials"
        })
        // throw new Error("Password is Not Valid")
    }
})

const currentUser = asyncHandler(async (req, res) => {
    console.log(req.user)
    res.json(req.user);
})
//api of forgotpassword
const forgotPasword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log(email)
    //checking user exit in database or not
    const isUserExixtDatabase = await User.findOne({ email });

    console.log("is isUserExixt", isUserExixtDatabase);

    if (isUserExixtDatabase === null) {
        return res.status(203).json({ bool: false, message: "user not found" })
    }

    // getting user exiting id ....
    const isUserExixtId = isUserExixtDatabase._id;

    console.log("existing user id ", isUserExixtId)

    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("opt records", otp);

    let otprecords = await forgetPasswordOtp.findOne({ isUserExixtId });

    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 2);

    console.log("time:", expireTime)
    //records....
    if (!otprecords) {
        otprecords = new forgetPasswordOtp({
            email,
            otp,
            expireTime,
            isUserExixtId: isUserExixtDatabase._id,
        });
    }
    else {
        otprecords.otp = otp;
        otprecords.expireTime = expireTime;
    }
    await otprecords.save();
    //sending mails....
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Sending Email using Node.js',
        text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(203).json({
                bool: false,
                message: "failed to send otp"
            })
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({
                bool: true,
                message: "otp send sucessfully"
            })

        }
    });

})



const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    console.log(req.body);
    const newOtp = await forgetPasswordOtp.findOne({ email, otp });
    console.log("first" + newOtp);
    if (!newOtp) {
        return res.status(203).json({ bool: false, msg: "User not found" });
    }
    const currentTime = new Date().getTime();
    if (newOtp.expireTime < currentTime) {

        res.status(203).json({ bool: false, msg: "OTP Expired" });
    }
    if (Number(otp) !== newOtp.otp) {
        console("not matched")
        res.status(203).json({ bool: false, msg: "OTP not matched" });
    } else {
        console.log("matched")
        res.status(200).json({ bool: true, msg: "OTP Matched" });
    }
    console.log("s", otp);
    console.log("n", newOtp.otp)
});

//   ..reset password.
const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    console.log("email , newPassword: ", email, newPassword);
    const resetpass = await User.findOne({ email })
    console.log("resetpass: ", resetpass);
    if (!resetpass) {
        res.status(400).json({
            message: "User not found"
        })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.updateOne({ email }, { password: hashedPassword })
    res.status(200).json({
        message: "Password reset successfully"
    })

});

//userProfiles
const updateProfile = asyncHandler(async (req, res) => {

    console.log(req.body)
    const email = req.user.email
    const { username, mobile, address } = req.body;
    console.log(email);
    console.log("req file", req.files);
    let image_name = "";
    if (req.files) {
        const profileImage = req.files.userImage;
        console.log(profileImage);
        image_name = Date.now() + profileImage.name;
        profileImage.mv("./assets/images/" + image_name);
    }


    const updateUser = await User.findOneAndUpdate({ email: email },
        {
            $set: {
                username: username,
                mobile: mobile,
                address: address,
                userImage: image_name
            }
        }, { new: true }
    )
    console.log(updateUser)
    if (updateUser) {
        res.status(200).json({
            message: "profile updated",
            bool: true
        })
    } else {
        res.status(203).json({
            message: "cannot update",
            bool: false
        })
    }
});


// updates images.......

const updateUserImage = asyncHandler(async (req, res) => {
    
    const files = [];
    for (const key in req.files) {
        const file = req.files[key];
        console.log(file);
        const fileName = Date.now() + file.name;
        file.mv("./assets/images/" + fileName);
        console.log(fileName);
        const email = req.user.email;
        console.log("email", email);
        if (!email) {
            res.status(203).json({ msg: "User not found" });
        } else {
            const updateProfile = await User.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        userImage: fileName,
                    },
                },
                { new: true }
            )
            console.log("updateProfile", updateProfile);
            res.status(200).json(updateProfile);

        }

    }
})







module.exports = { userRegister, loginUser, currentUser, forgotPasword, verifyOtp, resetPassword, updateProfile, updateUserImage };