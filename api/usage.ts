/**
 * Vercel Serverless Function - Word Usage Tracking API
 * 
 * This endpoint tracks user word usage using device fingerprints.
 * Uses Upstash Redis (Vercel Marketplace) for permanent persistent storage.
 */

import { createClient } from 'redis';

let redis: any = null;

async function getRedisClient() {
  if (redis) {
    return redis;
  }

  try {
    redis = createClient({
      url: process.env.STORAGE_REDIS_URL,
    });

    await redis.connect();
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getUserKey(fingerprint: string): string {
  const currentMonth = getCurrentMonthKey();
  return `usage:${fingerprint}:${currentMonth}`;
}

async function handlePost(body: any, res: any) {
  try {
    const { fingerprint, wordCount, action } = body;

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
      const data = await redisClient.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        currentUsage = parsed.wordUsage || 0;
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

    // Store in Redis with 30 day expiration (2592000 seconds)
    const data = { wordUsage: newWordUsage, month: currentMonth };
    await redisClient.setEx(key, 2592000, JSON.stringify(data));

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
}

async function handleGet(query: any, res: any) {
  try {
    const { fingerprint } = query;

    if (!fingerprint || typeof fingerprint !== 'string') {
      return res.status(400).json({ error: 'Fingerprint required' });
    }

    const redisClient = await getRedisClient();
    const key = getUserKey(fingerprint);
    const currentMonth = getCurrentMonthKey();

    let wordUsage = 0;
    try {
      const data = await redisClient.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        wordUsage = parsed.wordUsage || 0;
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
}

export default async function handler(req: any, res: any) {
  const { method } = req;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (method === 'POST') {
      return await handlePost(req.body, res);
    }

    if (method === 'GET') {
      return await handleGet(req.query, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
