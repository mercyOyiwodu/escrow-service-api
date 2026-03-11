const cron = require('node-cron');
const Transaction = require('../models/transaction');

// Daily cron job to auto-release timed out delivered transactions
cron.schedule('0 0 * * *', async () => { // Runs at midnight every day
  try {
    const now = new Date();
    const expiredTransactions = await Transaction.find({
      status: 'delivered',
      disputedAt: { $exists: false }
    });

    for (const transaction of expiredTransactions) {
      const timeoutMs = transaction.timeoutDays * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(transaction.deliveredAt.getTime() + timeoutMs);

      if (expiryDate < now) {
        transaction.status = 'released'; // or 'timed_out' as per requirement
        transaction.releasedAt = now;
        await transaction.save();
        console.log(`Auto-released transaction ${transaction._id} due to timeout`);
      }
    }
  } catch (error) {
    console.error('Error in auto-release cron:', error);
  }
});

console.log('Auto-release cron job scheduled');