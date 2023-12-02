const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.NAME,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        dialect: process.env.DIALECT,
        port: process.env.PORT,
    })

async function connect(){
    try {
        await sequelize.authenticate();
        console.log("SQL Connection done sucessfully")
    }
    catch (error) {
        console.error("Unable to connect to database", error.message)
    }
}

connect();

module.exports = { sequelize }
