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
const PORT = parseInt(process.env.PORT) || 8000;
const HOST = '0.0.0.0';

app.use(express.json());

// serve frontend before auth so static files don't need a token
app.use(express.static(path.join(__dirname, 'public')));

app.use(authMiddleware);

app.use('/user', userRouter);
app.use('/',     urlRouter);

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
