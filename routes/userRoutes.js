const express = require('express');
const userController = require('../controller/userController');
const validateToken = require('../middleware/validateTokenHandler');
const router = express.Router();

// const validateTokenv= require('./middleware/validateTokenHandler')
// router.post("/register", (req,res) => {
//     res.status(200).json({
//         // msg:'Registration Succesfully Done!'
//         msg : req.body      
//     })
// }) 

router.post("/register", userController.userRegister);
router.post("/login", userController.loginUser);
router.post("/forgotPasword", userController.forgotPasword);
router.post("/verifyOtp", userController.verifyOtp);
router.post("/resetPassword", userController.resetPassword);
router.post("/updateProfile", validateToken, userController.updateProfile);
router.post("/updateUserImage", validateToken, userController.updateUserImage);
router.get("/current", validateToken, userController.currentUser);
module.exports = router;