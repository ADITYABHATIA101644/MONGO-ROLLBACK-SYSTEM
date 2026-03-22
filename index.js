const express = require('express');
const mongoose = require('mongoose');
const { Account, Log } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Database Connection
// Uses Environment Variable for Render, fallback to your string for local testing
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Aditya:Aadi010.@cluster0.g0l9d0y.mongodb.net/bankDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected Successfully - Developed by Aditya Bhatia"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use(express.json());

// 2. Welcome Route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>Banking Transaction System (ACID)</h1>
            <p>Developed by: <strong>Aditya Bhatia</strong></p>
            <hr style="width: 50%;">
            <nav>
                <a href="/seed"><button style="padding: 10px;">1. Seed Accounts</button></a>
                <a href="/transfer"><button style="padding: 10px;">2. Run Transfer ($100)</button></a>
                <a href="/logs"><button style="padding: 10px;">3. View Logs</button></a>
            </nav>
        </div>
    `);
});

// 3. Seed Route: Initialize Alice and Bob
app.get('/seed', async (req, res) => {
    try {
        await Account.deleteMany({}); // Reset for experiment
        const alice = await Account.create({ name: "Alice", balance: 1000 });
        const bob = await Account.create({ name: "Bob", balance: 500 });
        
        console.log("System Seeded by Aditya Bhatia");
        res.json({ 
            message: "Accounts Initialized", 
            accounts: [alice, bob] 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. THE CORE EXPERIMENT: ACID Transaction Logic
app.get('/transfer', async (req, res) => {
    const amount = 100;
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        console.log("--- Transaction Started by Aditya Bhatia ---");

        // STEP 1: Deduct from Alice (Check balance first)
        const sender = await Account.findOneAndUpdate(
            { name: "Alice", balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error("Insufficient funds: Alice cannot afford this transfer.");
        }

        // STEP 2: Add to Bob
        const receiver = await Account.findOneAndUpdate(
            { name: "Bob" },
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!receiver) {
            throw new Error("Recipient account 'Bob' was not found.");
        }

        // STEP 3: Audit Log (Inside Transaction)
        await Log.create([{ 
            from: sender._id, 
            to: receiver._id, 
            amount, 
            status: 'SUCCESS' 
        }], { session });

        // COMMIT: If we reached here, save all changes
        await session.commitTransaction();
        
        res.json({ 
            status: "Transaction Committed", 
            developer: "Aditya Bhatia",
            alice_new_balance: sender.balance,
            bob_new_balance: receiver.balance
        });

    } catch (error) {
        // ROLLBACK: Undo everything if an error occurred
        console.error("ALERT: Transaction Failed. Initiating Rollback...");
        await session.abortTransaction();

        // Log the failure outside the transaction session for auditing
        await Log.create({ amount, status: 'FAILED', error: error.message });

        res.status(400).json({ 
            status: "Rollback Executed", 
            reason: error.message,
            integrity_check: "All balances remained unchanged."
        });
    } finally {
        session.endSession();
    }
});

// 5. View Logs Route
app.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.json({ developer: "Aditya Bhatia", transaction_history: logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is live on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});