import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';

// Type definitions for Cloudflare Workers environment
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  ENVIRONMENT: string;
  CACHE?: KVNamespace; // Optional KV namespace for caching
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add production domain later
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Job Tracking API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Database connection test endpoint
app.get('/api/test-db', async (c) => {
  try {
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Test query: count users
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: false });

    if (error) {
      return c.json({
        success: false,
        error: error.message,
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Database connection successful',
      userCount: count,
      users: data,
    });
  } catch (err) {
    return c.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, 500);
  }
});

// API Routes (to be implemented in Phase 1)
app.get('/api/jobs', (c) => {
  return c.json({ message: 'List jobs endpoint - to be implemented' });
});

app.get('/api/jobs/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ message: `Get job ${id} - to be implemented` });
});

app.post('/api/scores', async (c) => {
  return c.json({ message: 'Submit score endpoint - to be implemented' });
});

app.get('/api/dashboard', (c) => {
  return c.json({ message: 'Dashboard data endpoint - to be implemented' });
});

// Webhook endpoint
app.post('/webhooks/recruiterflow', async (c) => {
  // Verify webhook signature
  const signature = c.req.header('X-Recruiterflow-Signature');

  // TODO: Validate signature against RECRUITERFLOW_WEBHOOK_SECRET

  return c.json({ message: 'Webhook received - to be implemented' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
