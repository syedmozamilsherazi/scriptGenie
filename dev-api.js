/**
 * Local Development API Server
 * Runs on port 3001 and handles /usage requests for local development
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import { createClient } from 'redis';

// For ES modules, we need to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local explicitly
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

let redis = null;
let useMemoryStore = false;
const memoryStore = new Map();

// Debug: Check if Redis URL is loaded
console.log('STORAGE_REDIS_URL loaded:', process.env.STORAGE_REDIS_URL ? '✓ Yes' : '✗ No');

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

function enableMemoryStore(reason) {
  if (!useMemoryStore) {
    console.warn(`Falling back to in-memory store (${reason}). Word usage will reset on server restart.`);
  }
  useMemoryStore = true;
  if (redis) {
    try {
      redis.quit();
    } catch (error) {
      // ignore close errors
    }
    redis = null;
  }
}

async function getRedisClient() {
  if (useMemoryStore) return null;

  if (!process.env.STORAGE_REDIS_URL) {
    enableMemoryStore('STORAGE_REDIS_URL missing');
    return null;
  }

  if (redis) {
    return redis;
  }

  try {
    redis = createClient({
      url: process.env.STORAGE_REDIS_URL,
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err?.message || err);
      enableMemoryStore('redis error');
    });

    await redis.connect();
    console.log('Connected to Redis');
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    enableMemoryStore('connect failed');
    return null;
  }
}

function readFromStore(key) {
  if (useMemoryStore) {
    const data = memoryStore.get(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

async function writeToStore(key, value, redisClient) {
  if (useMemoryStore || !redisClient) {
    memoryStore.set(key, JSON.stringify(value));
    return;
  }
  await redisClient.setEx(key, 2592000, JSON.stringify(value));
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getUserKey(fingerprint) {
  const currentMonth = getCurrentMonthKey();
  return `usage:${fingerprint}:${currentMonth}`;
}

// Usage endpoint
app.post('/usage', async (req, res) => {
  try {
    const { fingerprint, wordCount, action } = req.body;

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint required' });
    }

    if (!action || !['add', 'subtract', 'get', 'reset'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const redisClient = await getRedisClient();
    const key = getUserKey(fingerprint);
    const currentMonth = getCurrentMonthKey();

    let currentUsage = 0;
    try {
      if (redisClient) {
        const data = await redisClient.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          currentUsage = parsed.wordUsage || 0;
        }
      } else {
        const cached = readFromStore(key);
        if (cached) {
          currentUsage = cached.wordUsage || 0;
        }
      }
    } catch (error) {
      console.warn('Error reading from Redis:', error);
      currentUsage = 0;
    }

    let newWordUsage = currentUsage;

    if (action === 'add' && typeof wordCount === 'number') {
      newWordUsage += wordCount;
    } else if (action === 'subtract' && typeof wordCount === 'number') {
      newWordUsage = Math.max(0, newWordUsage - wordCount);
    } else if (action === 'reset') {
      newWordUsage = 0;
    }

    const data = { wordUsage: newWordUsage, month: currentMonth };
    await writeToStore(key, data, redisClient);

    res.status(200).json({
      success: true,
      wordUsage: newWordUsage,
      month: currentMonth,
      maxWords: 40000,
    });
  } catch (error) {
    console.error('Error in usage handler:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

app.get('/usage', async (req, res) => {
  try {
    const { fingerprint } = req.query;

    if (!fingerprint || typeof fingerprint !== 'string') {
      return res.status(400).json({ error: 'Fingerprint required' });
    }

    const redisClient = await getRedisClient();
    const key = getUserKey(fingerprint);
    const currentMonth = getCurrentMonthKey();

    let wordUsage = 0;
    try {
      if (redisClient) {
        const data = await redisClient.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          wordUsage = parsed.wordUsage || 0;
        }
      } else {
        const cached = readFromStore(key);
        if (cached) {
          wordUsage = cached.wordUsage || 0;
        }
      }
    } catch (error) {
      console.warn('Error reading from Redis:', error);
      wordUsage = 0;
    }

    res.status(200).json({
      success: true,
      wordUsage,
      month: currentMonth,
      maxWords: 40000,
    });
  } catch (error) {
    console.error('Error in usage handler:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});
