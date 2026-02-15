import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/grant', (req, res) => {
    const { childId } = req.body;

    if (!childId) {
        res.status(400).json({ error: 'childId is required' });
        return;
    }

    // Sanitize childId to prevent command injection
    // Only allow alphanumeric, @, ., -, _
    if (!/^[a-zA-Z0-9@.\-_]+$/.test(childId)) {
        res.status(400).json({ error: 'Invalid childId format' });
        return;
    }

    console.log(`[API] Executing grant-consent for: ${childId}`);

    // Execute npm run grant-consent <childId>
    // cwd should be the project root (zk-consent-gateway) which is parent of src/server.ts if run from dist
    // But process.cwd() when running 'npm run start:server' from root is correct

    exec(`npm run grant-consent "${childId}"`, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[API] Execution error: ${error.message}`);
            // Check if it's just a non-zero exit code but valid output (e.g. simulation log)
            // But here we expect success
            console.error(`[API] stderr: ${stderr}`);

            res.status(500).json({
                success: false,
                error: error.message,
                details: stderr
            });
            return;
        }

        console.log(`[API] stdout: ${stdout}`);

        // Parse stdout for transaction ID if possible
        const txMatch = stdout.match(/Transaction ID: ([a-f0-9]+)/);
        const txId = txMatch ? txMatch[1] : null;

        const hashMatch = stdout.match(/Hash:\s+(0x[a-f0-9]+)/);
        const hash = hashMatch ? hashMatch[1] : null;

        res.json({
            success: true,
            txId,
            hash,
            output: stdout
        });
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`   POST /api/grant { childId } -> triggers CLI grant-consent\n`);
});
