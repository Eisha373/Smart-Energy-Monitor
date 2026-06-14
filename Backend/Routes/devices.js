const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET — Sare devices aur unki aaj ki usage
router.get('/', (req, res) => {
    const query = `
        SELECT d.id, d.name, d.power_watts, d.is_active,
        COALESCE(SUM(e.consumption_kwh), 0) as today_usage
        FROM devices d
        LEFT JOIN energy_logs e ON d.id = e.device_id
        AND DATE(e.recorded_at) = CURDATE()
        GROUP BY d.id`;
    try {
        db.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// POST — Naya device add karo
router.post('/', (req, res) => {
    const { name, power_watts } = req.body;
    try {
        db.query(
            'INSERT INTO devices (name, power_watts) VALUES (?, ?)',
            [name, power_watts],
            (err, result) => {
                if (err) throw err;
                res.json({ message: 'Device added!', id: result.insertId });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Failed to add device' });
    }
});

// DELETE — Device delete karo
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.query(
            'DELETE FROM devices WHERE id = ?',
            [id],
            (err) => {
                if (err) throw err;
                res.json({ message: 'Device deleted!' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete device' });
    }
});

module.exports = router;