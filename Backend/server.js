const express = require("express");
const app = require("./src/app");
require("dotenv").config();
const connectDb = require("./src/config/db")

connectDb();

app.listen(process.env.PORT, ()=>{
    console.log(" Server is running on port: " + process.env.PORT)
})

app.get("/", (req,res)=>{
    res.send("Welcome to zyoroAiAgent")
})