import nodemailer from "nodemailer";
import User from "@/models/UserModel";
import bcrypt from "bcryptjs";

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {
    //create hashedToken
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.NODEMAIL_USER,
        pass: process.env.NODEMAIL_PASS,
      },
    });

    const mailOptionsForVerifyEmail = {
      from: "musili@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}" >here</a> to verify your email       
      or copy and paste the link below in your browser <br/> <br/>
      ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
      </p>`,
    };

    const mailOptionsForForgotPassword = {
      from: "musili@gmail.com",
      to: email,
      subject: "Reset password",
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyforgotpasswordtoken?token=${hashedToken}" >here</a> to reset password       
      or copy and paste the link below in your browser <br/> <br/>
      ${process.env.DOMAIN}/verifyforgotpasswordtoken?token=${hashedToken}
      </p>`,
    };

    // const mailResponse = await transport.sendMail(mailOptions);

    // const mailOptions =
    //   emailType === mailOptionsForVerifyEmail
    //     ? mailOptionsForVerifyEmail
    //     : mailOptionsForForgotPassword;

    const mailOptions =
      emailType === "VERIFY"
        ? mailOptionsForVerifyEmail
        : mailOptionsForForgotPassword;

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
