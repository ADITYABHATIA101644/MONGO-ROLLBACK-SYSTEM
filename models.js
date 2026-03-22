const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    name: String,
    balance: { type: Number, min: 0 } // Built-in integrity check
});

const LogSchema = new mongoose.Schema({
    from: mongoose.Types.ObjectId,
    to: mongoose.Types.ObjectId,
    amount: Number,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', AccountSchema);
const Log = mongoose.model('Log', LogSchema);

module.exports = { Account, Log };