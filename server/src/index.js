import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDatabase } from './seed.js';
import { HttpError } from './helpers.js';
import { authRouter } from './routes/auth.js';
import { accountRouter } from './routes/account.js';
import { paymentsRouter } from './routes/payments.js';
import { cardsRouter } from './routes/cards.js';
import { linksRouter } from './routes/links.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

seedDatabase();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'paylune-api' });
});

app.use('/api/auth', authRouter);
app.use('/api', accountRouter);
app.use('/api', paymentsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api', linksRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.json({ message: 'Paylune API is running. Start the Vite client for the web app.' });
  });
}

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong on our side.' });
});

app.listen(PORT, () => {
  console.log(`Paylune API listening on http://localhost:${PORT}`);
});
