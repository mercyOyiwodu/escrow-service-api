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

module.exports = { sendWelcomeEmail };