const userModel = require('../models/user');
const { sendWelcomeEmail } = require('../utils/sendmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validate } = require('../validation/utilites');
const { registerUserSchema, loginUserSchema } = require('../validation/user');
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
        res.status(400).json({ error: error.message });
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