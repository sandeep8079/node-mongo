const asyncHandler = require('express-async-handler');
const User = require('../models/cmsUserModel');
const forgetPasswordOtp = require('../models/forgetPasswordModel');
const cmsArticle = require('../models/cmsArticle');
// const cmsmessage=require('../models/cmsAboutModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { log } = require('console');




const userRegister = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { name, email, password, mobile, address } = req.body;
    if (!name || !email || !password || !mobile || !address) {
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
        name,
        email,
        password: hashedPassword,
        mobile,
        address
    })
    if (newUser) {
        console.log("newUser***", newUser);
        res.status(201).json(newUser)
        console.log("successfully register");
    }
    else {
        res.status(400);
        throw new Error("user is not valid");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mendatory!");
    }
    const isUser = await User.findOne({ email });
    if (!isUser) {
        console.log("user not found")
    }  //get data from database
    console.log("isUser::", isUser);
    if (isUser && (await bcrypt.compare(password, isUser.password))) {
        console.log("Password Matched")
        // for datafetch
        const accessToken = jwt.sign({
            user: {
                //used for token generation
                name: isUser.name,
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
            name: isUser.name,
            email: isUser.email,
            mobile: isUser.mobile,
            address: isUser.address,
            userImage: isUser.userImage,
            success: true
        })
    }

    else {
        res.status(203).json({
            bool: false,
            message: "Invalid credentials",
            success: false
        })

    }
});
const currentUser = asyncHandler(async (req, res) => {
    console.log(req.user)
    res.json(req.user);
});
const forgotPasword = asyncHandler(async (req, res) => {
    try {


        const { email } = req.body;
        console.log(email)
        //checking user exit in database or not
        const isUserExixtDatabase = await User.findOne({ email });

        console.log("is isUserExixt", isUserExixtDatabase);

        if (isUserExixtDatabase === null) {
            return res.status(203).json({ bool: false, message: "user not found" })
        }



        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log("opt records", otp);
        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + 2);

        console.log("time:", expireTime)

        const otprecords = await forgetPasswordOtp.findOne({ email });
        console.log("new data", otprecords);
        //records....
        if (!otprecords) {
            otprecords = new forgetPasswordOtp({
                email,
                otp,
                expireTime,

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
                pass: process.env.EMAIL_AUTH_PASS
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
    } catch (err) {
        console.log(err.message)
    }

});

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
const updateProfile = asyncHandler(async (req, res) => {

    console.log(req.body)
    const email = req.user.email
    const { name, mobile, address } = req.body;
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
                name: name,
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


//article api start
// const addArticles = asyncHandler(async (req, res) => {
//     console.log(req.body);
//     const { articleId,title,category , content, maincontent, date } = req.body
//     if (!articleId ||!title || !category || !content || !maincontent || !date) {
//         res.status(400)
//         throw new Error("all field are required")
//     }

//     const isArticleExist = await cmsArticle.findOne({ articleId });

//     if (isArticleExist) {
//         res.status(400)
//         throw new Error("Articles exist in database");
//     }
//     else {
//         const newArticle = await cmsArticle.create({
//             articleId,
//             title,
//             category,
//             content,
//             maincontent,
//             date
//         })
//         if (newArticle) {
//             res.status(201).json({
//                 message: 'Articles addedd successfully',
//                 bool: true

//             })  
//         }
//         else {
//             res.status(400).json({
//                 message: 'something went wrong',
//                 bool: false
//             });

//         }
//     }
// });


//for user Or CRUD operations

const createArticle = asyncHandler(async (req, res) => {

    console.log(req.file);

    const { title, category, content, maincontent, date } = req.body;

    console.log(req.body);

    //  console.log("title",title);

    // console.log(req.body);

    // const userName = req.user.name 

    const userID = req.user.userid;

    console.log("userid", userID)

    // console.log("name",userName)


    const image = req.file ? req.file.filename : null;

    console.log("image", image);



    const newArticle = await cmsArticle({
        title,
        category,
        content,
        maincontent,
        image,
        date,
        status: 'pending',
        createdBy: userName,
        IDOfUser: userID
    });

    const savedArticle = await newArticle.save();

    return res.status(200).json(savedArticle);



})

//get articles by id
const getArticleById = asyncHandler(async (req, res) => {
    const getArticles = await cmsArticle.findById(req.params.id)
    if (!getArticles) {
        res.status(203).json({
            message: 'Articles not found'
        })
    }
    else {
        res.status(201).json(getArticles)
    }
});
// finding all api by find()
const getAllArticle = asyncHandler(async (req, res) => {
    const getAllArticle = await cmsArticle.find()
    if (!getAllArticle) {
        res.status(400).json({
            message: "Articles  not found "
        })
    }
    else {
        res.status(200).json(getAllArticle)
    }

});

const deleteArticle = asyncHandler(async (req, res) => {
    const deleteArticle = await cmsArticle.findOneAndDelete({ _id: req.params.id })
    if (!deleteArticle) {
        res.status(203).json({
            message: "Articles not found for deleting....."
        })
    }
    else {
        res.status(200).json({
            message: "Article deleted sucessfully", deleteArticle
        }
        )

    }
})

const updateArticle = asyncHandler(async (req, res) => {
    const { title, content, maincontent } = req.body
    if (!title || !content || !maincontent) {
        res.status(400)
        throw new Error("all field are required")
    }
    const updateArticle = await cmsArticle.findOneAndUpdate({ "_id": req.params.id },
        {
            $set: {
                "title": title,
                "maincontent": maincontent,
                "content": content
            }
        },
        { new: true }
    )
    if (!updateArticle) {
        res.status(400).json({
            message: "Articles not found"
        })
    }
    else {
        res.status(200).json({
            message: "updated sucessfully", updateArticle, success: true
        })
    }

})


const addingArticle = asyncHandler(async (req, res) => {
    const { title, category, content, maincontent } = req.body;
    console.log(req.body);
    console.log("data", req.files);

    let imagename = ''
    if (req.files) {
        const imageArticle = req.files.image;
        console.log("file", imageArticle);
        imagename = Date.now() + imageArticle.name;
        imageArticle.mv('./assets/images' + imagename);
        console.log("image", imagename);
    }

    const newArticle = await cmsArticle.create({
        title,
        category,
        content,
        maincontent,
        image: imagename,

    })

    if (newArticle) {
        res.status(201).json({
            message: 'Article  added successfully'
        })

    }
    else {
        res.status(400).json({
            message: "Article not added",
        })

    }

})

// newly added blogs

const getLatestArticles = asyncHandler(async (req, res) => {

    const today = new Date();

    console.log("todays date is::", today)

    const fiveDaysAgo = new Date(today);

    fiveDaysAgo.setDate(today.getDate() - 15);

    console.log("fiveDaysAgo date was::", fiveDaysAgo)


    // const getArticles = await articleModel.find({ createdAt : { $gte: fiveDaysAgo , $lte: today } } && { status: "approved" })

    const getArticles = await cmsArticle.find({ createdAt: { $gte: fiveDaysAgo, $lte: today } })
    // {$and : [{ createdAt : { $gte: fiveDaysAgo , $lte: today } } , { status: "approved" }]}


    if (!getArticles) {
        res.status(201).json({ message: 'Article not found' });
        console.log("not found")
    }
    res.status(200).json(getArticles)
})


const demo = asyncHandler(async (req, res) => {

    const today = new Date();

    console.log("todays date is::", today)
 
    const getArticles = await cmsArticle.findOne().sort({ createdAt: -1 }).exec();
    console.log(getArticles)
    if (!getArticles) {
        res.status(201).json({ message: 'Article not found' });
        console.log("not found")
    }
    res.status(200).json(getArticles)

})

const lastfiveArticle = asyncHandler(async (req, res) => {

    const today = new Date();

    console.log("todays date is::", today)
 
    const getArticles = await cmsArticle.find().sort({ createdAt: -1 }).limit(5).exec();
    console.log(getArticles)
    if (!getArticles) {
        res.status(201).json({ message: 'Article not found' });
        console.log("not found")
    }
    res.status(200).json(getArticles)

})







module.exports = { userRegister, loginUser, currentUser, forgotPasword, verifyOtp, resetPassword, updateProfile, updateUserImage, getArticleById, createArticle, getAllArticle, deleteArticle, updateArticle, addingArticle, getLatestArticles, demo,lastfiveArticle };
// addArticles