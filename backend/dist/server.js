"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// POST /api/check-email
app.post('/api/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }
    try {
        // ✅ LeakCheck public API (no key needed)
        const response = await axios_1.default.get('https://leakcheck.net/api/public', {
            params: { check: email },
            timeout: 10000
        });
        const data = response.data;
        const found = data.found;
        const breaches = data.breaches;
        const result = {
            success: true,
            found: !!found,
            breaches: breaches || []
        };
        res.json(result);
    }
    catch (error) {
        const err = error;
        console.error('Error checking email:', err.message);
        const errorMessage = err.response?.data && typeof err.response.data === 'object'
            ? err.response.data.error || 'API error'
            : err.message || 'Unknown error occurred';
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Email Breach Checker API is running' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email Breach Checker API (LeakCheck) is ready!`);
});
