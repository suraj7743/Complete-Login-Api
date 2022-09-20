const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(options) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.nodemail_HOST,
    port: process.env.nodemail_PORT,
    // true for 465, false for other ports
    auth: {
      user: process.env.nodemail_USERNAME, // generated ethereal user
      pass: process.env.nodemail_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.nodemail_FROM_EMAIL, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    // text: options.text, // plain text body
    // html: options.html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
module.exports = main;
