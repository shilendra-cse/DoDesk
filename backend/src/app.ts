import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { routes as legacyRoutes } from './utils/router';
import './legacyRoutes';
import apiRoutes from './routes';
import { errorHandler } from './shared/errors/errorHandler';
import prisma from './shared/db/prisma';

dotenv.config();

export const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://dodesk-client-alb-1530009405.eu-north-1.elb.amazonaws.com',
    'https://dodesk.app',
    'http://dodesk.app',
    'https://api.dodesk.app',
    'https://dodesk-server.onrender.com',
    'https://do-desk.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],
  credentials: true,
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json());

app.use('/api', legacyRoutes);
app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/test-db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    console.log('Prisma Database connected!');
    res.json({ message: 'Database connected!', time: new Date() });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.use(errorHandler);
