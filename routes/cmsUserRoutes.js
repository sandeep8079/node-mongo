const express = require('express');

const cmsController = require('../controller/cmsController');

const validateToken = require('../middleware/validateTokenHandler');

const router = express.Router();

const multer = require('multer');
 
const path = require('path')
 
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        
    }
});
 
const upload = multer({ storage});

// router.post('/addArticles',validateToken, upload.single('image'), cmsController.createArticle);
//upload.single('image'),

router.post("/register", cmsController.userRegister);

router.post("/login", cmsController.loginUser);

router.post("/forgotPasword", cmsController.forgotPasword);

router.post("/verifyOtp", cmsController.verifyOtp);

router.post("/resetPassword", cmsController.resetPassword);

router.post("/updateProfile", validateToken, cmsController.updateProfile);

router.post("/updateUserImage", validateToken, cmsController.updateUserImage);

router.get("/current", validateToken, cmsController.currentUser);

router.post("/addArticles",cmsController.addingArticle);

router.get("/getArticleById/:id",cmsController.getArticleById);

router.get("/getAllArticle",cmsController.getAllArticle);

router.delete("/deleteArticle/:id",cmsController.deleteArticle);

router.post("/updateArticle/:id",cmsController.updateArticle);

router.get("/getLatestArticles",cmsController.getLatestArticles);

 router.get("/demo",cmsController.demo);
 router.get("/lastfiveArticle",cmsController.lastfiveArticle)

module.exports = router;