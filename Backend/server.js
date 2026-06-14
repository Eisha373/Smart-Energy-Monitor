const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/connection');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const devicesRoute = require('./Routes/devices');
const energyRoute = require('./Routes/energy');
const chatRoute = require('./Routes/chat');

app.use('/api/devices', devicesRoute);
app.use('/api/energy', energyRoute);
app.use('/api/chat', chatRoute);

// Simulated Data — Har 5 second mein energy data generate hoga
setInterval(() => {
    const deviceIds = [1, 2, 3, 4, 5];
    deviceIds.forEach(deviceId => {
        const consumption = (Math.random() * 0.05).toFixed(3);
        db.query(
            'INSERT INTO energy_logs (device_id, consumption_kwh) VALUES (?, ?)',
            [deviceId, consumption],
            (err) => {
                if (err) console.error('Simulation error:', err.message);
            }
        );
    });
}, 5000);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});