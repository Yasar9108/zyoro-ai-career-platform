const mongoose = require("mongoose");

function connectDb(){
    mongoose.connect(process.env.MONGODB_URL).then(() =>{
        console.debug("Server connected to database")
    }).catch((err)=>{
        console.debug("Failed to connect to MongoDB");
        console.error("Error connecting to MongoDB: ", err);
    })
}

module.exports = connectDb;