const asyncHandler = require('express-async-handler');
const express = require('express');
const products = require('../models/productModel');
const routes = require('../routes/productRoutes')

//addd api ......
const addProduct = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { productCode, name, category, quantity, price } = req.body
    if (!productCode || !name || !category || !quantity || !price) {
        res.status(400)
        throw new Error("all field are manda.....")
    }

    const isProductExist = await products.findOne({ productCode });

    if (isProductExist) {
        res.status(400)
        throw new Error("product exits");
    }
    else {
        const newProduct = await products.create({
            productCode,
            name,
            category,
            quantity,
            price
        })
        if (newProduct) {
            res.status(201).json({
                message: 'product addedd successfully',
                bool: true

            })  
        }
        else {
            res.status(400).json({
                message: 'something went wrong',
                bool: false
            });

        }
    }
});

// finding api findById()...
const getProductById = asyncHandler(async (req, res) => {
    const getProduct = await products.findById(req.params.id)
    if (!getProduct) {
        res.status(400).json({
            message: 'Not Found'
        })
    }
    else {
        res.status(201).json(getProduct)
        }
})

// finding all api by find()...
const getAllProduct = asyncHandler(async (req, res) => {
    const getAllProduct = await products.find()
    if (!getAllProduct) {
        res.status(400).json({
            message: "product not found"
        })
    }
    else {
        res.status(200).json(getAllProduct)
    }
});

//delete api by findOneAndDelete().....
const deleteProduct = asyncHandler(async (req, res) => {
    const deleteProduct = await products.findOneAndDelete({ _id: req.params.id })
    if (!deleteProduct) {
        res.status(400).json({
            message: "product not found for deleting....."
        })
    }
    else {
        res.status(200).json({
            message: "product deleted sucessfully", deleteProduct
        }
        )

    }
})

// upadate api by findOneAndUpadate().....

const updateProduct = asyncHandler(async (req, res) => {
    const { productCode, name, category, quantity, price } = req.body
    if (!productCode || !name || !category || !quantity || !price) {
        res.status(400)
        throw new Error("all field are manda.....")
    }
    const updateProduct = await products.findOneAndUpdate({ "_id": req.params.id },
        {
            $set:{
                "productCode": productCode,
                "name": name,
                "category": category,
                "quantity": quantity,
                "price": price
            }
        },
        {new:true}


    )
    if (!updateProduct) {
        res.status(400).json({
            message: "product not found"
        })
    }
    else {
        res.status(200).json({
            message: "updated sucessfully", updateProduct
        })
    }

})

// contact...
const contact = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { username, email, message } = req.body
    if (!username || !email || !message ) {
        res.status(400)
        throw new Error("all field are manditory")
    }

    const isProductExist = await products.findOne({ productCode });

    if (isProductExist) {
        res.status(400)
        throw new Error("product exits");
    }
    else {
        const newProduct = await products.create({
            username,
            email,
            message,
           
        })
        if (newProduct) {
            res.status(201).json({
                message: 'product addedd successfully',
                bool: true

            })  
        }
        else {
            res.status(400).json({
                message: 'something went wrong',
                bool: false
            });

        }
    }
});







module.exports = { addProduct, getProductById, getAllProduct, deleteProduct, updateProduct }
