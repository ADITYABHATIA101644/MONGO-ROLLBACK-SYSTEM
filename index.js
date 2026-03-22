const express = require('express');
const mongoose = require('mongoose');
const { Account, Log } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = process.env.MONGO_URI || "mongodb+srv://Aditya:Aadi010.@cluster0.g0l9d0y.mongodb.net/bankDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ System Online - Aditya Bhatia"))
    .catch(err => console.error("❌ Connection Error:", err));

app.use(express.json());

// FANCY HTML UI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACID Transaction System | Aditya Bhatia</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .glass-card { 
                    background: rgba(30, 41, 59, 0.7); 
                    backdrop-filter: blur(10px); 
                    border: 1px solid rgba(255, 255, 255, 0.1); 
                    border-radius: 20px; padding: 40px; 
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    margin-top: 100px;
                }
                .btn-custom { border-radius: 12px; transition: all 0.3s ease; padding: 12px 25px; font-weight: 600; }
                .btn-primary { background: #3b82f6; border: none; }
                .btn-success { background: #10b981; border: none; }
                .btn-info { background: #06b6d4; color: white; border: none; }
                .btn-custom:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5); }
                .badge-dev { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center glass-card">
                        <i class="fas fa-university fa-4x mb-4 text-primary"></i>
                        <h1 class="display-5 fw-bold mb-2">Banking Transaction System</h1>
                        <span class="badge badge-dev px-3 py-2 mb-4">Developed by Aditya Bhatia</span>
                        
                        <p class="text-secondary mb-5">Demonstrating ACID Compliance, MongoDB Transactions, and Real-time Rollback Capabilities.</p>
                        
                        <div class="d-flex justify-content-center gap-3 flex-wrap">
                            <a href="/seed" class="btn btn-custom btn-primary"><i class="fas fa-plus-circle me-2"></i>Seed Accounts</a>
                            <a href="/transfer" class="btn btn-custom btn-success"><i class="fas fa-exchange-alt me-2"></i>Run Transfer ($100)</a>
                            <a href="/logs" class="btn btn-custom btn-info"><i class="fas fa-list-ul me-2"></i>View Audit Logs</a>
                        </div>

                        <div class="mt-5 pt-4 border-top border-secondary text-secondary small">
                            Experiment 2.2.3 • Chandigarh University • March 2026
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// --- Logic remains the same, just keeping it consistent with your current app ---

app.get('/seed', async (req, res) => {
    try {
        await Account.deleteMany({});
        await Account.create({ name: "Alice", balance: 1000 });
        await Account.create({ name: "Bob", balance: 500 });
        res.send(`<body style="background:#0f172a; color:#10b981; font-family:sans-serif; padding:50px; text-align:center;">
            <h1>✅ Success!</h1>
            <p>Accounts for Alice and Bob have been reset by Aditya Bhatia.</p>
            <a href="/" style="color:#fff; text-decoration:none; border:1px solid #fff; padding:10px 20px; border-radius:10px;">Back to Dashboard</a>
        </body>`);
    } catch (err) { res.json({ error: err.message }); }
});

app.get('/transfer', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const amount = 100;
        const sender = await Account.findOneAndUpdate({ name: "Alice", balance: { $gte: amount } }, { $inc: { balance: -amount } }, { session, new: true });
        if (!sender) throw new Error("Insufficient Funds");
        const receiver = await Account.findOneAndUpdate({ name: "Bob" }, { $inc: { balance: amount } }, { session });
        await Log.create([{ amount, status: 'SUCCESS' }], { session });
        await session.commitTransaction();
        res.send(`<body style="background:#0f172a; color:#10b981; font-family:sans-serif; padding:50px; text-align:center;">
            <h1>💰 Transaction Successful</h1>
            <p>Aditya's system successfully moved $100.</p>
            <a href="/" style="color:#fff; text-decoration:none; border:1px solid #fff; padding:10px 20px; border-radius:10px;">Back to Dashboard</a>
        </body>`);
    } catch (error) {
        await session.abortTransaction();
        await Log.create({ amount: 100, status: 'FAILED', error: error.message });
        res.send(`<body style="background:#0f172a; color:#ef4444; font-family:sans-serif; padding:50px; text-align:center;">
            <h1>⚠️ ACID Rollback Executed</h1>
            <p>Error: ${error.message}. All balances were restored by Aditya's code.</p>
            <a href="/" style="color:#fff; text-decoration:none; border:1px solid #fff; padding:10px 20px; border-radius:10px;">Back to Dashboard</a>
        </body>`);
    } finally { session.endSession(); }
});

app.get('/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json({ developer: "Aditya Bhatia", transaction_history: logs });
});

app.listen(PORT, () => console.log(`🚀 Launched on port ${PORT}`));
