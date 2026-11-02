
const express = require('express');
const db = require('./db');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// HOME
app.get('/', (req, res) => {
    res.send('Welcome to FitSphere Backend!');
});

// BACKEND STATUS
app.get('/api/status', (req, res) => {
    res.json({
        message: 'FitSphere backend is running!',
        database: 'SQLite connected'
    });
});

// REGISTER
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (
        typeof username !== 'string' ||
        username.trim().length < 3 ||
        username.trim().length > 30 ||
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof password !== 'string' ||
        password.length < 8 ||
        password.length > 72
    ) {
        return res.status(400).json({
            message: 'Enter a valid username, email and password (8+ characters).'
        });
    }

    try {
        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        const existing = db.prepare(`
            SELECT id FROM users
            WHERE LOWER(username) = LOWER(?)
               OR LOWER(email) = LOWER(?)
        `).get(cleanUsername, cleanEmail);

        if (existing) {
            return res.status(409).json({
                message: 'Username or email already registered. Please login.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users
            (name, email, password, username, password_hash)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            cleanUsername,
            cleanEmail,
            passwordHash,
            cleanUsername,
            passwordHash
        );

        return res.status(201).json({
            message: 'Account created successfully!',
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: error.message
        });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (
        typeof username !== 'string' ||
        !username.trim() ||
        typeof password !== 'string' ||
        !password
    ) {
        return res.status(400).json({
            message: 'Enter your username and password.'
        });
    }

    try {
        const user = db.prepare(`
            SELECT id, username, email, password_hash
            FROM users
            WHERE LOWER(username) = LOWER(?)
        `).get(username.trim());

        if (!user || !user.password_hash) {
            return res.status(401).json({
                message: 'Invalid username or password.'
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid username or password.'
            });
        }

        return res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: error.message
        });
    }
});

// SAVE FITNESS DETAILS
app.post('/api/users', (req, res) => {
    const { name, age, gender, height, weight, goal } = req.body;

    if (
        typeof name !== 'string' ||
        !name.trim() ||
        !Number.isFinite(Number(age)) ||
        Number(age) < 1 ||
        Number(age) > 120 ||
        typeof gender !== 'string' ||
        !gender.trim() ||
        !Number.isFinite(Number(height)) ||
        Number(height) <= 0 ||
        !Number.isFinite(Number(weight)) ||
        Number(weight) <= 0 ||
        typeof goal !== 'string' ||
        !goal.trim()
    ) {
        return res.status(400).json({
            message: 'Please enter all fitness details correctly.'
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO fitness_details
            (name, age, gender, height, weight, goal)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            name.trim(),
            Number(age),
            gender.trim(),
            Number(height),
            Number(weight),
            goal.trim()
        );

        return res.status(201).json({
            message: 'Fitness details saved successfully!',
            id: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Fitness details error:', error);
        return res.status(500).json({
            message: error.message
        });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`FitSphere server running on port ${PORT}`);
});
