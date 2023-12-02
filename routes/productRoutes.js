const express = require('express');

const productController = require('../controller/productController');

const router = express.Router();

router.post('/addProduct',productController.addProduct);

router.get('/getProductById/:id',productController.getProductById);

router.delete('/deleteProduct/:id', productController.deleteProduct);

router.put('/updateProduct/:id',productController.updateProduct);

router.get("/getAllProduct", productController.getAllProduct);


module.exports = router;