const nodemailer = require("nodemailer");
require("dotenv").config();
const LOG_TAG = "(service)=>"
const transporter = nodemailer.createTransport({
    service : " gmail",
    auth:{
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
})

transporter.verify((error, success) => {
    if(error){
        console.error(LOG_TAG, " Error in email transporter: " +error + process.env.ADMIN_EMAIL + " " + process.env.EMAIL_PASSWORD);
    }else{
        console.debug(LOG_TAG, " Email transporter is ready to send emails");
    }
})

async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Zyoro Ai" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("error sending email: ", error);
  }
}

async function sendLoginEmailAdmin(userName){
    const subject = " User Login Notification"; 
    const text = ` Hi Admin, \n\t\t User ${userName} has successfully logged in to the Zyoro Ai Application.`;  
    const html = `<p>Hi Admin,</p><p>User ${userName} has successfully logged in to the Zyoro Ai Application.</p>`;
    await sendEmail(process.env.ADMIN_EMAIL, subject, text, html);
}

async function sendRegistrationEmailAdmin(userName){
    const subject = " User Registration Notification"; 
    const text = ` Hi Admin, \n\t\t User ${userName} has successfully registered with the Zyoro Ai Application.`;  
    const html = `<p>Hi Admin,</p><p>User ${userName} has successfully registered with the Zyoro Ai Application.</p>`;
    await sendEmail(process.env.ADMIN_EMAIL, subject, text, html);
}

async function sendRegistrationEmail(userEmail, userName) {
  const subject = " Welcome to Zyoro Ai";
  const text = ` Hi ${userName}, \n\t\t Thank you for registering with Zyoro Ai, We are Excited to have you on board! `;
  const html = `<p>Hi ${userName},</p><p>Thank you for registering with Zyoro Ai, We are Excited to have you on board!</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendLoginEmail(userEmail, userName) {
  const subject = " Welcome Back to Zyoro Ai";
  const text = ` Hi ${userName}, \n\t\t You Have Successfully login with  Zyoro Ai Application , We are Excited to have you on board! `;
  const html = `<p>Hi ${userName},</p><p>You Have Successfully  login with Zyoro Ai Application , We are Excited to have you on board!</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendLoggedOutEmail(userEmail, userName){
    const subject = " Logged Out from Zyoro Ai";
    const text = ` Hi ${userName}, \n\t\t You Have Successfully logged out from  Zyoro Ai Application , We are Excited to have you on board! `;
    const html = `<p>Hi ${userName},</p><p>You Have Successfully logged out from Zyoro Ai Application , We are Excited to have you on board!</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendOtpVerificationEmail(userEmail, userName, otp){
  const subject = " Password Reset OTP";
  const text = `Hello ${userName}, Your OTP is : ${otp} This OTP is valid for 10 minutes.`
  const html = `<p>Hello ${userName},</p><p>Your OTP is : ${otp} This OTP is valid for 10 minutes from Zyoro Ai Application </p>`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendLoginEmail,
  sendLoginEmailAdmin,
  sendRegistrationEmailAdmin,
  sendLoggedOutEmail,
  sendOtpVerificationEmail
};
