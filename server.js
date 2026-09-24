const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phep server doc JSON tu request body

const orderRoutes = require('./routes/orderRoutes'); 
app.use('/api/orders', orderRoutes);

// Route kiem tra server
app.get('/', (req, res) => {
    res.send('API Quan ly Don hang dang hoat dong...');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected!');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exitCode = 1;
    }
}

startServer();