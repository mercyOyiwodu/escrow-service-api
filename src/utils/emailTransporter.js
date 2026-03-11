const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: process.env.SERVICE,
        port: 587,
        secure: false,
        auth: {
            user: process.env.APP_USERNAME,
            pass: process.env.APP_PASSWORD,
        },
    });
};

module.exports = { createTransporter };