const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv').config();
const fileupload = require('express-fileupload')
const connectDB = require('./config/dbConnection');

// const {sequelize} = require('./config/sqlConnection');

// const { patch } = require("./routes/userRoutes");


connectDB();
const port = process.env.APP_PORT || 3000
const app = express();
app.use('/assets',express.static('assets'))

app.use(cors());

app.use(fileupload({ createParentPath: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());









// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cms',require('./routes/cmsUserRoutes'))

app.use(errorHandler);

app.listen(port, () => console.log(`Api is Running on port ${port} !`))

