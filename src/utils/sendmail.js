const sendWelcomeEmail = async (transporter, email, name) => {
  try {
    const mailOptions = {
      from: process.env.APP_USERNAME,
      to: email,
      subject: 'Welcome to AbuEscrowService!',
      text: `Hello ${name}, welcome to our escrow service. Thank you for registering!`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendOTPEmail = async (transporter, email, otp) => {
  try {
    const mailOptions = {
      from: process.env.APP_USERNAME,
      to: email,
      subject: 'Password Reset OTP - AbuEscrowService',
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

module.exports = { sendWelcomeEmail, sendOTPEmail };