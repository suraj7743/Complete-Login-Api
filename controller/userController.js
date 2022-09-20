const userModel = require("../model/userModel");
const appError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const nodemailEmail = require("../utils/nodemailer");
//generate token
const jwttoken = (id) => {
  const token = jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  return token;
};
//post register data
const postRegister = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    return next(
      new appError("User with same email address already exist ", 400)
    );
  }
  const saveData = new userModel({
    name,
    email,
    password,
  });
  const data = await saveData.save();
  const token = jwttoken(data._id);

  res.status(200).json({
    status: "success",
    message: "data saved to database with given info ",
    data,
    token,
  });
});

//login data using saved data
const postLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new appError(
        "Email doesnot exist please register first or enter valid email ",
        401
      )
    );
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new appError("Sorry password doesnot match ", 400));
  }
  const token = jwttoken(user._id);

  res.status(200).json({
    status: "success",
    message: "user authorized",
    data: user,
    token,
  });
});
//send mail to the input email and redirect to reset password with resetpassword token
const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new appError(
        "user with given email not found enter valid email or register ",
        401
      )
    );
  }

  const token = user.generateToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get("host")}:${
    process.env.PORT || 8000
  }/resetPassword/:${token}`;
  const subject = `Forget password..? Enter a patch request to this ${resetUrl}.If not just ignore this email (valid for only 10 min ) `;

  let options = {
    email: user.email,
    subject,
  };
  try {
    await nodemailEmail(options);
    return res.status(200).json({
      status: "success",
      message: "email Sent to requested email ",
    });
  } catch (error) {
    user.resetTokenGenerator = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: true });
    next(new appError("Problem sending message to mail try again later ", 500));
  }
});
//to reset the password and assign new password also return new jwt token
const resetPassword = catchAsync(async (req, res, next) => {
  const user = await userModel.findOne({
    resetTokenGenerator: req.params.token,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new appError("Invalid token or token expired", 400));
  }
  user.password = req.body.password;
  user.resetTokenGenerator = undefined;
  user.resetTokenExpires = undefined;
  const data = await user.save({ validateBeforeSave: true });
  const token = jwttoken(user._id);

  res.status(200).json({
    status: "success",
    message: "Password reset",
    jwttoken: token,
  });
});

//to logoout the user id
const logout = catchAsync(async (req, res, next) => {
  //1)) First to logout you need to be logged in with the token
  const user = userModel.findById(req.user._id);
  if (!user) {
    return next(
      new appError("You need to logged in to  visit  this page ", 400)
    );
  }
  req.user = undefined;
  req.headers.authorization = undefined;
  res.cookie("jwt", "");
  res.status(200).json({
    status: "success",
    message: "You just logged out Logged ",
  });
});

module.exports = {
  postRegister,
  postLogin,
  forgetPassword,
  resetPassword,
  logout,
};
