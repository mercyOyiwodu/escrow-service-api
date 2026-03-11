const Transaction = require('../models/transaction');
const { validate } = require('../validation/utilites');
const { createEscrowSchema } = require('../validation/user');

exports.createEscrow = async (req, res) => {
    try {
        const validatedData = await validate(req.body, createEscrowSchema);
        const { amount, currency, paymentProvider, buyerEmail, sellerEmail, description, timeoutDays } = validatedData;

        const transaction = new Transaction({
            creator: req.user._id,
            apiKeyUsed: req.headers['x-api-key'],
            amount,
            currency: currency || 'NGN',
            paymentProvider,
            status: 'pending',
            buyerEmail,
            sellerEmail,
            description,
            timeoutDays: timeoutDays || 7
        });

        const savedTransaction = await transaction.save();

        // Simulate payment held
        savedTransaction.status = 'held';
        await savedTransaction.save();

        res.status(201).json({
            success: true,
            transaction: {
                id: savedTransaction._id,
                status: savedTransaction.status,
                message: "Ready for payment"
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Authorization: only creator can see
        if (transaction.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Sanitized response: hide sensitive fields
        const sanitized = {
            id: transaction._id,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            buyerEmail: transaction.buyerEmail,
            sellerEmail: transaction.sellerEmail,
            description: transaction.description,
            timeoutDays: transaction.timeoutDays,
            deliveredAt: transaction.deliveredAt,
            releasedAt: transaction.releasedAt,
            disputedAt: transaction.disputedAt,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };

        res.status(200).json({ success: true, transaction: sanitized });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.markDelivered = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryProof } = req.body;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Authorization: only creator can mark delivered
        if (transaction.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check status is 'held' (stub for now)
        if (transaction.status !== 'held') {
            return res.status(400).json({ error: 'Transaction must be in held status to mark as delivered' });
        }

        // Update transaction
        transaction.status = 'delivered';
        transaction.deliveredAt = new Date();
        if (deliveryProof) {
            transaction.deliveryProof = deliveryProof;
        }
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transaction marked as delivered',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                deliveredAt: transaction.deliveredAt,
                deliveryProof: transaction.deliveryProof
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.confirmRelease = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Authorization: only creator can confirm release (for MVP)
        if (transaction.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check status is 'delivered'
        if (transaction.status !== 'delivered') {
            return res.status(400).json({ error: 'Transaction must be in delivered status to confirm release' });
        }

        // Update transaction
        transaction.status = 'released';
        transaction.releasedAt = new Date();
        await transaction.save();

        console.log(`Funds released for transaction ${id}`);
        console.log(`Transfer to seller: ${transaction.sellerEmail}`);

        res.status(200).json({
            success: true,
            message: 'Funds released successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                releasedAt: transaction.releasedAt
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.dispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || typeof reason !== 'string') {
            return res.status(400).json({ error: 'Reason is required and must be a string' });
        }

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Authorization: buyer only for MVP currently creator, as buyers aren't authenticated
        if (transaction.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check if already disputed or released
        if (transaction.status === 'disputed' || transaction.status === 'released') {
            return res.status(400).json({ error: 'Transaction cannot be disputed at this stage' });
        }

        // Update transaction
        transaction.status = 'disputed';
        transaction.disputedAt = new Date();
        transaction.evidence.push({
            party: 'buyer',
            text: reason
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Dispute raised successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                disputedAt: transaction.disputedAt,
                evidence: transaction.evidence
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.forceRelease = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        //admin only (for MVP, creator or add admin check later)
        if (transaction.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized - admin only' });
        }

        // Check if delivered and not disputed
        if (transaction.status !== 'delivered' || transaction.disputedAt) {
            return res.status(400).json({ error: 'Transaction must be delivered and not disputed to force release' });
        }

        // Force release
        transaction.status = 'released';
        transaction.releasedAt = new Date();
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transaction force-released successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                releasedAt: transaction.releasedAt
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};