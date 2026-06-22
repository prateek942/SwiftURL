import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { authMiddleware } from "./middlewares/auth.middleware.js";
import userRouter from './routes/user.route.js';
import urlRouter from './routes/url.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = parseInt(process.env.PORT) || 8000;  // Railway injects PORT as a string — parseInt is required
const HOST = '0.0.0.0'; // Always bind to all interfaces for Railway / external traffic

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());

// Serve the frontend (public/) — BEFORE auth middleware so HTML/CSS/JS
// assets are delivered without any token check.
app.use(express.static(path.join(__dirname, 'public')));

app.use(authMiddleware); // attach req.user if token is present

// ── API Routes ──────────────────────────────────────────────────
app.use('/user', userRouter);
app.use('/',     urlRouter);

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`✅  Server running on http://${HOST}:${PORT}`);
  console.log(`🌐  Accessible on your local network — find your machine's IP with 'ipconfig' (Windows) or 'ifconfig' (Linux/Mac)`);
});
