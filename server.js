import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// 環境変数の検証
const requiredEnvVars = ['VERTEX_PROJECT_ID', 'VERTEX_LOCATION', 'VERTEX_MODEL_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]?.trim());

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// ポート設定の検証
const PORT = parseInt(process.env.PORT?.trim() || '8080', 10);
if (isNaN(PORT)) {
  console.error('Invalid PORT environment variable');
  process.exit(1);
}

const app = express();

// CORSの設定
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : [
  'http://localhost:5173',
];

console.log('Starting server initialization...');
console.log('Configuring CORS with origins:', corsOrigins);

// CORSの設定をより詳細に行う
const corsOptions = {
  origin: (origin, callback) => {
    console.log('Incoming request from origin:', origin);
    // 開発環境では全てのオリジンを許可
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    // 本番環境では指定されたオリジンのみ許可
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 86400, // 24時間
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// プリフライトリクエストのための明示的なOPTIONSハンドラ
app.options('*', (req, res) => {
  console.log('Handling OPTIONS request from:', req.headers.origin);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

app.use(express.json());

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

try {
  console.log('Initializing Vertex AI...');
  const vertexAI = new VertexAI({
    project: process.env.VERTEX_PROJECT_ID,
    location: process.env.VERTEX_LOCATION
  });

  const model = vertexAI.getGenerativeModel({
    model: process.env.VERTEX_MODEL_NAME || 'gemini-pro',
  });
  console.log('Vertex AI initialized successfully');

  // ヘルスチェックエンドポイント
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        project: process.env.VERTEX_PROJECT_ID,
        location: process.env.VERTEX_LOCATION,
        model: process.env.VERTEX_MODEL_NAME,
        port: process.env.PORT
      }
    });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      console.log('Received chat request:', {
        body: req.body,
        headers: req.headers
      });

      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('Generating content with message:', message);
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: message }] }],
      });

      console.log('Raw response:', JSON.stringify(response, null, 2));
      
      const textContent = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textContent) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from Vertex AI');
      }

      console.log('Generated response:', textContent);
      res.json({ response: textContent });
    } catch (error) {
      console.error('Error in chat endpoint:', {
        name: error?.name || 'Unknown error',
        message: error?.message || 'Unknown error message',
        stack: error?.stack,
        cause: error?.cause
      });

      res.status(500).json({ 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        name: error?.name || 'Unknown error'
      });
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\nServer configuration:');
    console.log('-------------------');
    console.log('Project ID:', process.env.VERTEX_PROJECT_ID?.trim());
    console.log('Location:', process.env.VERTEX_LOCATION?.trim());
    console.log('Model:', process.env.VERTEX_MODEL_NAME?.trim());
    console.log('Port:', PORT);
    console.log('CORS Origins:', corsOrigins);
    console.log('Node Environment:', process.env.NODE_ENV);
    console.log('-------------------');
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  }).on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Received shutdown signal');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

} catch (error) {
  console.error('Failed to initialize server:', error);
  process.exit(1);
} 