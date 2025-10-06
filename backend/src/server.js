import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import tripsRouter from './trips.js';
import { connectDatabase, disconnectDatabase, testDatabaseConnection } from './lib/database.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await testDatabaseConnection();
    res.json({ 
      status: 'ok',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api', tripsRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

// Graceful startup and shutdown
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Backend listening on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: Connected`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


