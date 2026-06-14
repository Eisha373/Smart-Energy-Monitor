const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET — Aaj ki total energy usage
router.get('/today', (req, res) => {
    const query = `
        SELECT 
        COALESCE(SUM(consumption_kwh), 0) as total_usage
        FROM energy_logs
        WHERE DATE(recorded_at) = CURDATE()`;
    try {
        db.query(query, (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch today usage' });
    }
});

// GET — Last 7 days ki usage (graph ke liye)
router.get('/weekly', (req, res) => {
    const query = `
        SELECT 
        DATE(recorded_at) as date,
        COALESCE(SUM(consumption_kwh), 0) as total_usage
        FROM energy_logs
        WHERE recorded_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(recorded_at)
        ORDER BY date ASC`;
    try {
        db.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weekly data' });
    }
});

// GET — Device wise usage
router.get('/by-device', (req, res) => {
    const query = `
        SELECT 
        d.name,
        COALESCE(SUM(e.consumption_kwh), 0) as total_usage
        FROM devices d
        LEFT JOIN energy_logs e ON d.id = e.device_id
        AND DATE(e.recorded_at) = CURDATE()
        GROUP BY d.id, d.name`;
    try {
        db.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch device usage' });
    }
});

// GET — Monthly cost estimate
router.get('/cost', (req, res) => {
    const RATE_PER_KWH = 50; // Pakistani rupees
    const query = `
        SELECT 
        COALESCE(SUM(consumption_kwh), 0) as total_usage
        FROM energy_logs
        WHERE MONTH(recorded_at) = MONTH(CURDATE())
        AND YEAR(recorded_at) = YEAR(CURDATE())`;
    try {
        db.query(query, (err, results) => {
            if (err) throw err;
            const usage = results[0].total_usage;
            const cost = (usage * RATE_PER_KWH).toFixed(2);
            res.json({ total_usage: usage, estimated_cost: cost });
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cost' });
    }
});

module.exports = router;