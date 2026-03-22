# 🏦 ACID-Compliant Banking Transaction System
### Developed by: **Aditya Bhatia**
#### *Experiment 2.2.3 - Full Stack Development*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7.svg)](https://render.com/)

---

## 📌 Project Overview
This project demonstrates a robust **Banking Transaction System** built with Node.js and MongoDB. The core objective is to implement **ACID-compliant transactions** using Mongoose sessions to ensure data integrity during financial transfers.

### 🧪 Experiment Objectives
* **Atomicity:** Ensure either the full transfer happens or nothing happens at all.
* **Consistency:** Maintain accurate account balances before and after transactions.
* **Isolation:** Prevent concurrent transactions from interfering with each other.
* **Durability:** Ensure transaction logs are stored permanently for auditing.

---

## 🚀 Key Features
- **Mongoose Sessions:** Utilizing `startSession()` and `startTransaction()` for multi-document updates.
- **Auto-Rollback:** Automatic `abortTransaction()` execution upon failure (e.g., insufficient funds).
- **Audit Logging:** Every success and failure is logged in a dedicated `logs` collection.
- **Interactive UI:** A modern, glassmorphic dashboard built with Bootstrap 5.
- **Seeding Tool:** Built-in route to reset test data (Alice & Bob) instantly.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Replica Set)
- **ODM:** Mongoose
- **Deployment:** Render
- **Styling:** Bootstrap 5 & FontAwesome

---

## 📂 Project Structure
```text
├── models.js        # MongoDB Schemas (Account & Log)
├── index.js         # Express Server & Transaction Logic
├── .env             # Environment variables (Internal use only)
├── package.json     # Project dependencies
└── README.md        # Documentation
