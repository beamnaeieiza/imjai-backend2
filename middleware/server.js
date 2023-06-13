// import { Express } from "express";
// import cookieSession from "cookie-session";
// import { CorsOptions } from "cors";

const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: "session",
    secret: "your_secret_key",
    maxAge: 24 * 60 * 60 * 1000,
}));

app.use(cors());

app.get("/", (req, res) => {
    res.send("Setup Express web server -> DONE");
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});

// const {Sequelize} = require('sequelize');

// const sequelize = new Sequelize(
//     'imjaidb',
//     'root',
//     '015651113',
//     {
//         host: 'localhost',
//         dialect: 'mysql',
//         define:{
//             timestamps: false
//         }
//     }
// );