const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "must include name "],
  },
  email: {
    type: String,
    required: [true, "must include a email address"],
  },
  password: {
    type: String,
    required: [true, "must include a password"],
  },
  passwordChangedDate: Date,
  resetTokenGenerator: String,
  resetTokenExpires: Date,
});
//to pre save the hash password in the database
userSchema.pre("save", function (next) {
  const user = this;

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.password = hash;
          next();
        });
      }
    });
    this.passwordChangedDate = Date.now() - 1000;
  } else {
    return next();
  }
});
userSchema.methods = {
  generateToken: function () {
    this.resetTokenGenerator = crypto.randomBytes(32).toString("hex");
    this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
    return this.resetTokenGenerator;
  },
};
module.exports = mongoose.model("user", userSchema);
