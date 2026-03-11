const joi = require('joi')

exports. registerUserSchema = joi.object().keys({
    name: joi.string().min(3).max(20).required(),
    email: joi.string().trim().email().required(),
    password :joi.string().trim().required(),
})

exports. loginUserSchema = joi.object().keys({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().required()
})

exports.forgotPasswordSchema = joi.object().keys({
    email: joi.string().trim().email().required()
})

exports.resetPasswordSchema = joi.object().keys({
    email: joi.string().trim().email().required(),
    otp: joi.string().length(6).required(),
    newPassword: joi.string().trim().min(6).required()
})

exports.createEscrowSchema = joi.object().keys({
    amount: joi.number().positive().required(),
    currency: joi.string().default('NGN'),
    paymentProvider: joi.string().valid('stripe', 'paystack', 'kora').required(),
    buyerEmail: joi.string().email().required(),
    sellerEmail: joi.string().email().required(),
    description: joi.string().optional(),
    timeoutDays: joi.number().integer().min(1).max(30).default(7)
})