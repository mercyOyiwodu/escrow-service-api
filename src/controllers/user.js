const userModel = require('../models/user');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/sendmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validate } = require('../validation/utilites');
const { registerUserSchema, loginUserSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validation/user');
const crypto = require('crypto');
require(`dotenv`).config();

exports.registerUser = async (req, res) => {
    try {
        const validatedData = await validate(req.body, registerUserSchema);
        const { email, name, password } = validatedData;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await userModel.findUserByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(400).json({ message: `User with email ${normalizedEmail} already exists.` });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await userModel.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });
        sendWelcomeEmail(normalizedEmail, name);
        res.status(201).json({
            message: "User registered successfully", newUser
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const validatedData = await validate(req.body, loginUserSchema);
        const { email, password } = validatedData;

        const normalizedEmail = email.toLowerCase();

        const user = await userModel.findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        res.status(400).json({ error: error.details ? error.details[0].message : error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        res.status(200).json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.addAllowedIP = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({ error: "IP address is required" });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        if (user.allowedIPs.includes(ip)) {
            return res.status(400).json({ error: "IP address already allowed" });
        }
        user.allowedIPs.push(ip);
        await user.save();
        res.status(200).json({ message: "IP address added successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { name, allowedIPs } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        if (name) user.name = name;
        if (allowedIPs) user.allowedIPs = allowedIPs;
        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    } 
};

exports.forgotPassword = async (req, res) => {
    try {
        const validatedData = await validate(req.body, forgotPasswordSchema);
        const { email } = validatedData;
        const normalizedEmail = email.toLowerCase();

        const user = await userModel.findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

       
        await sendOTPEmail( normalizedEmail, otp);

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const validatedData = await validate(req.body, resetPasswordSchema);
        const { email, otp, newPassword } = validatedData;
        const normalizedEmail = email.toLowerCase();

        const user = await userModel.findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};