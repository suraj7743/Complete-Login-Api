const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { promisify } = require("util");
const userModel = require("../model/userModel");

const protectMiddleware = catchAsync(async (req, res, next) => {
  //1)) First check req.headers exist and that start with bearer or not
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "Sorry cannot find the token you are not authorized to vist this page ",
        401
      )
    );
  }
  //2)) verify the token with the header token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3))check if user exist or not after token verified if not return error
  const freshUser = await userModel.findOne({ _id: decoded.id });
  if (!freshUser) {
    return next(
      new AppError(
        "Cannot find the user with given token user not in database "
      )
    );
  }
  const validData = Date.parse(freshUser.passwordChangedDate) / 1000;

  //4)) check if password changed or not after token issued
  if (decoded.iat < validData) {
    return next(
      new AppError(
        "Your just changed your password.please login again to procceed",
        401
      )
    );
  }
  req.user = freshUser;
  res.cookie("jwt", freshUser, {
    expires: new Date(Date.now() + 30 * 24 * 3600000),
  });
  next();
});

module.exports = protectMiddleware;
