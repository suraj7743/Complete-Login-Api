const sendErrorDev = (err, res) => {
  console.log(err.stack);
  res.status(err.statuscode).json({
    status: err.status,
    message: err.message,
    errorStack: err.stack,
    name: err.name,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  res.status(500).json({
    status: err.status,
    message: "something went wrong Internal error ",
  });
};
const ErrorHandler = (err, req, res, next) => {
  err.statuscode = err.statuscode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "failure",
        message: "token invalid ",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "failure",
        message: "Unauthorized token expired login again ",
      });
    }
    sendErrorProd(err, res);
  }
};
module.exports = ErrorHandler;
