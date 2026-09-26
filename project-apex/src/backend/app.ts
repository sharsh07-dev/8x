import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimit';
import v1Routes from './routes/v1';
import { logger } from './utils/logger';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ 
  limit: '10kb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cookieParser());
app.use(globalLimiter);

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// API Routes
app.use('/api/v1', v1Routes);

// Unmatched Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 404, message: 'API Route Not Found' } });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
