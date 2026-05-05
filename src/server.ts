// src/server.ts
import fs from 'fs';
import path from 'path';
import https from 'https';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { config } from './config/env';
import { connectToMongo } from './config/mongo';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import productRoutes from './routes/product.route';
import cartRoutes from './routes/cart.route';
import orderRoutes from './routes/order.route';
import reviewRoutes from './routes/review.route';

const app = express();

if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// security & body parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('/api', globalRateLimiter);

// health check & routes
app.get('/api/health', (_, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use(errorHandler);

connectToMongo();

console.log('Environment:', config.nodeEnv);

if (config.nodeEnv === 'development') {
  const certDir = path.resolve(process.cwd(), 'certs');
  const keyPath = path.join(certDir, 'stillness.local-key.pem');
  const certPath = path.join(certDir, 'stillness.local.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    https.createServer({ key, cert }, app).listen(config.port, () => {
      console.log(`HTTPS dev server running at https://localhost:${config.port}`);
    });
  } else {
    app.listen(config.port, () => {
      console.log(`HTTP dev server running at http://localhost:${config.port}`);
    });
  }
} else {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`HTTP server running on port ${config.port}`);
  });
}

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
});
