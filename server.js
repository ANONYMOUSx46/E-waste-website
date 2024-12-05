const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure emails directory exists
const emailsDir = path.join(__dirname, 'data');
const emailsFile = path.join(emailsDir, 'subscribers.json');

async function ensureDirectoryExists() {
    try {
        await fs.mkdir(emailsDir, { recursive: true });
        try {
            await fs.access(emailsFile);
        } catch {
            await fs.writeFile(emailsFile, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// Route to handle email submissions
app.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Basic email validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Read existing emails
        const data = await fs.readFile(emailsFile, 'utf8');
        const emails = JSON.parse(data);

        // Check if email already exists
        if (emails.includes(email)) {
            return res.status(409).json({ error: 'Email already subscribed' });
        }

        // Add new email
        emails.push(email);
        await fs.writeFile(emailsFile, JSON.stringify(emails, null, 2));

        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Error handling subscription:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize directory and start server
ensureDirectoryExists().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
