const express = require('express');
const mongoose = require('mongoose');
const { Account, Log } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Connect to MongoDB Atlas
// Ensure your MONGO_URI in Render/Env ends with a database name like /bankDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ Connection error:", err));

app.use(express.json());

// 2. Root Route (For Render health checks)
app.get('/', (req, res) => {
    res.send(`
        <h1>Banking Transaction System (ACID)</h1>
        <p>Status: Online</p>
        <ul>
            <li><a href="/seed">1. Seed Accounts (Run this first)</a></li>
            <li><a href="/transfer">2. Run Experiment (Transfer $100)</a></li>
            <li><a href="/logs">3. View Audit Logs</a></li>
        </ul>
    `);
});

// 3. Seed Route: Create Alice and Bob for testing
app.get('/seed', async (req, res) => {
    try {
        await Account.deleteMany({}); // Clear old data
        const alice = await Account.create({ name: "Alice", balance: 1000 });
        const bob = await Account.create({ name: "Bob", balance: 500 });
        res.json({ message: "Accounts Seeded!", alice, bob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. MAIN EXPERIMENT: ACID Transaction with Rollback
app.get('/transfer', async (req, res) => {
    const amount = 100;
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        console.log("--- Transaction Started ---");

        // STEP A: Deduct from Alice
        const sender = await Account.findOneAndUpdate(
            { name: "Alice", balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error("Insufficient funds for Alice or account not found.");
        }

        // STEP B: Add to Bob
        const receiver = await Account.findOneAndUpdate(
            { name: "Bob" },
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!receiver) {
            throw new Error("Receiver 'Bob' not found.");
        }

        // STEP C: Log for Auditing (Part of the transaction)
        await Log.create([{ 
            from: sender._id, 
            to: receiver._id, 
            amount, 
            status: 'SUCCESS' 
        }], { session });

        // COMMIT: Finalize all changes
        await session.commitTransaction();
        res.json({ 
            status: "Success", 
            message: `Transferred $${amount} from Alice to Bob`,
            senderBalance: sender.balance,
            receiverBalance: receiver.balance
        });

    } catch (error) {
        // ROLLBACK: If any step fails, undo everything
        console.error("Critical Failure. Rolling back changes...");
        await session.abortTransaction();

        // Log the failure (Outside the transaction so the log persists)
        await Log.create({ amount, status: 'FAILED', error: error.message });

        res.status(400).json({ 
            status: "Transaction Rolled Back", 
            reason: error.message 
        });
    } finally {
        session.endSession();
    }
});

// 5. View Logs
app.get('/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});