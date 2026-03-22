const mongoose = require('mongoose');
const { Account, Log } = require('./models');
require('dotenv').config();

async function transferMoney(fromId, toId, amount) {
    // 1. Start the Session
    const session = await mongoose.startSession();
    
    try {
        // 2. Start the Transaction
        session.startTransaction();

        console.log(`--- Starting Transaction: $${amount} ---`);

        // 3. Deduct from Sender
        const sender = await Account.findOneAndUpdate(
            { _id: fromId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error("Insufficient funds or sender not found");
        }

        // 4. Add to Receiver
        const receiver = await Account.findByIdAndUpdate(
            toId,
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!receiver) {
            throw new Error("Receiver account not found");
        }

        // 5. Log the Audit (Part of the same transaction)
        await Log.create([{ from: fromId, to: toId, amount, status: 'SUCCESS' }], { session });

        // 6. Commit the changes
        await session.commitTransaction();
        console.log("Transaction Committed Successfully.");

    } catch (error) {
        // 7. Rollback if anything goes wrong
        console.error(`Transaction Failed: ${error.message}. Rolling back...`);
        await session.abortTransaction();
        
        // Log the failure separately (optional, outside the main session)
        await Log.create({ from: fromId, to: toId, amount, status: 'FAILED' });
    } finally {
        // 8. End the session
        session.endSession();
    }
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Seed Data
    const alice = await Account.create({ name: 'Alice', balance: 1000 });
    const bob = await Account.create({ name: 'Bob', balance: 500 });

    // Test 1: Successful transfer
    await transferMoney(alice._id, bob._id, 200);

    // Test 2: Failed transfer (Insufficient funds)
    await transferMoney(alice._id, bob._id, 2000);

    process.exit();
}

run();