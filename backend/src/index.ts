import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Type definitions for Cloudflare Workers environment
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  RECRUITERFLOW_API_KEY: string;
  RECRUITERFLOW_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
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
    environment: c.env.ENVIRONMENT,
  });
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
