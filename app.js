const express = require("express"); //for express
const mongoose = require("mongoose"); //for mongodb connection
const dotenv = require("dotenv").config({ path: "./.env" }); //declaring environment variable
const morgan = require("morgan");
const bodyParser = require("body-parser");
const ErrorHandler = require("./middleware/ErrorHandlingMiddleware");
const app = express();

console.log(process.env.NODE_ENV);

//requiring router for each related endpoing
const userRoute = require("./route/UserRoute");
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev")); //for getting https request log info

//connecting to database

mongoose
  .connect(process.env.MONGODB_COMPASS)
  .then(() => {
    console.log("mongodb connected ");
  })
  .catch((err) => {
    console.log(err.message);
  });

//using user route
app.use("/", userRoute);

//error handling middleware
//if error found in any middleware it jumps to this middleware directly
app.use(ErrorHandler);

module.exports = app;
