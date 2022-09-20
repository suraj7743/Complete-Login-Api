const userController = require("../controller/userController");

const express = require("express");
const Router = express();
const protectMiddlewareWithJWT = require("../middleware/protectWithJwt");

Router.post("/register", userController.postRegister);
Router.post("/login", userController.postLogin);
Router.post("/forgotPassword", userController.forgetPassword);
Router.patch("/resetPassword/:token", userController.resetPassword);
Router.get("/logout", protectMiddlewareWithJWT, userController.logout);
Router.get("/home", protectMiddlewareWithJWT, (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "You are passed through the token ",
  });
});
module.exports = Router;
