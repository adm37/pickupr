import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

import { Client as MollieClientType } from 'mollie-api-typescript';

function normalizeEnv(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^['\"]|['\"]$/g, '')
    .trim();
}

function getSupabaseUrlCandidates(urlValue: string): string[] {
  const normalized = normalizeEnv(urlValue);
  if (!normalized) return [];

  const urls = new Set<string>([normalized]);
  if (normalized.includes('.supabase.com')) {
    urls.add(normalized.replace('.supabase.com', '.supabase.co'));
  }
  if (normalized.includes('.supabase.co')) {
    urls.add(normalized.replace('.supabase.co', '.supabase.com'));
  }

  return Array.from(urls);
}

function getSupabaseClients() {
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = normalizeEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '',
  );

  if (!key) return [];
  return getSupabaseUrlCandidates(rawUrl).map((url) => createClient(url, key));
}

async function runWithSupabaseRetry<T>(
  operation: (client: ReturnType<typeof createClient>) => Promise<T>,
): Promise<T> {
  const clients = getSupabaseClients();
  if (clients.length === 0) {
    throw new Error('Supabase configuration missing');
  }

  let lastError: any = null;
  for (const client of clients) {
    try {
      return await operation(client);
    } catch (error: any) {
      lastError = error;
    }
  }

  throw lastError || new Error('Supabase request failed');
}

const supabase = getSupabaseClients()[0] || null;

let mollieClient: MollieClientType | null = null;
function normalizeProfileId(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^['\"]|['\"]$/g, '')
    .trim();
}

function isValidProfileId(value: string): boolean {
  return /^pfl_[A-Za-z0-9_]+$/.test(value);
}

async function getMollie(): Promise<MollieClientType | null> {
  if (!mollieClient) {
    let key = process.env.MOLLIE_API_KEY || '';
    if (!key && supabase) {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'MOLLIE_API_KEY').single();
        if (data && data.value) {
          key = data.value;
          process.env.MOLLIE_API_KEY = key;
        }
      } catch (e) {
        console.error('Failed to load Mollie key from Supabase', e);
      }
    }
    if (key) {
      mollieClient = new MollieClientType({ security: { apiKey: key } });
    }
  }
  return mollieClient;
}

import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Test DB
  app.get('/api/test-db', async (req, res) => {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase is niet geconfigureerd. Voeg SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY toe aan je environment variables in Hostinger.'
      });
    }

    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) throw error;
      res.json({ 
        success: true, 
        message: 'Supabase is succesvol verbonden!', 
      });
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        error: 'Supabase verbinding gefaald.', 
        details: err.message,
      });
    }
  });

  // API Route: Login
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Fallback for AI Studio preview / Local without Supabase
    if (!supabase) {
       if (email === 'admin@pickupr.com' && password === 'Sadeceadem37!') {
         return res.json({
           success: true,
           user: { id: 1, email: 'admin@pickupr.com', role: 'admin', name: 'Admin (Preview Fallback)' }
         });
       }
       return res.status(500).json({ error: 'Supabase URL en KEY zijn niet ingesteld. Log in met admin@pickupr.com voor preview, of configureer je environment.' });
    }

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (error) throw error;

      const user = users?.[0];
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Ongeldige inloggegevens' });
      }

      return res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          name: user.name 
        } 
      });
    } catch (dbError: any) {
      console.error(dbError);
      res.status(500).json({ error: 'Database connection failed.', details: dbError.message });
    }
  });

  // API Route: Mollie Payment
  app.get('/api/mollie/components-config', async (req, res) => {
    try {
      let profileId = normalizeProfileId(process.env.MOLLIE_PROFILE_ID || '');

      if (!profileId && supabase) {
        try {
          const { data } = await supabase.from('settings').select('value').eq('key', 'MOLLIE_PROFILE_ID').single();
          if (data && data.value) {
            profileId = normalizeProfileId(data.value);
          }
        } catch (e) {
          console.error('Failed to load Mollie profile ID from Supabase', e);
        }
      }

      if (!profileId) {
        return res.status(500).json({ error: 'MOLLIE_PROFILE_ID is missing in environment variables or settings.' });
      }

      if (!isValidProfileId(profileId)) {
        return res.status(500).json({
          error:
            `MOLLIE_PROFILE_ID is invalid. It must start with "pfl_". Received: "${profileId}". ` +
            'Check for extra quotes or spaces in your environment variable.',
        });
      }

      const apiKey = process.env.MOLLIE_API_KEY || '';
      res.json({
        profileId,
        testmode: apiKey.startsWith('test_'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to load Mollie config' });
    }
  });

  app.post('/api/create-card-payment', async (req, res) => {
    try {
      const mollie = await getMollie();
      if (!mollie) {
        return res.status(500).json({ error: 'Mollie is niet geconfigureerd. Voeg MOLLIE_API_KEY toe.' });
      }

      const { amount, currency = 'EUR', bookingId, rideName = 'Ride Booking', cardToken, returnPath } = req.body;
      if (!cardToken) {
        return res.status(400).json({ error: 'cardToken is verplicht.' });
      }

      const clientOrigin = req.headers.origin === 'null' ? null : req.headers.origin;
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const origin = clientOrigin || `${protocol}://${host}`;

      let safeReturnPath = '/booking';
      if (typeof returnPath === 'string' && returnPath.startsWith('/booking')) {
        safeReturnPath = returnPath;
      }

      const successReturnUrl = new URL(safeReturnPath, origin);
      successReturnUrl.searchParams.set('success', 'true');
      successReturnUrl.searchParams.set('bookingId', String(bookingId || ''));

      const paymentAmount = Number(amount).toFixed(2);

      const payment = await mollie.payments.create({
        paymentRequest: {
          amount: {
            currency: currency.toUpperCase(),
            value: paymentAmount,
          },
          method: 'creditcard',
          cardToken,
          description: rideName,
          redirectUrl: successReturnUrl.toString(),
          metadata: {
            bookingId,
          },
        },
      });

      res.json({
        id: (payment as any).id,
        status: (payment as any).status,
        checkoutUrl: payment.links?.checkout?.href || (payment as any)._links?.checkout?.href || null,
      });
    } catch (err: any) {
      console.error('Mollie card payment error:', err);
      res.status(400).json({ error: err.message || 'Card payment failed' });
    }
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const mollie = await getMollie();
      if (!mollie) {
        return res.status(500).json({ error: 'Mollie is niet geconfigureerd. Voeg MOLLIE_API_KEY toe.' });
      }
      const { amount, currency = 'EUR', bookingId, rideName = 'Ride Booking', returnPath } = req.body;
      const clientOrigin = req.headers.origin === 'null' ? null : req.headers.origin;
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const origin = clientOrigin || `${protocol}://${host}`;

      // Return to the same booking details URL after payment/cancel.
      let safeReturnPath = '/booking';
      if (typeof returnPath === 'string' && returnPath.startsWith('/booking')) {
        safeReturnPath = returnPath;
      }

      const successReturnUrl = new URL(safeReturnPath, origin);
      successReturnUrl.searchParams.set('success', 'true');
      successReturnUrl.searchParams.set('bookingId', String(bookingId || ''));

      const cancelReturnUrl = new URL(safeReturnPath, origin);
      cancelReturnUrl.searchParams.set('canceled', 'true');
      cancelReturnUrl.searchParams.set('bookingId', String(bookingId || ''));
      
      const paymentAmount = Number(amount).toFixed(2);
      
      const payment = await mollie.payments.create({
        paymentRequest: {
          amount: {
            currency: currency.toUpperCase(),
            value: paymentAmount, // expects string like "10.00"
          },
          description: rideName,
          redirectUrl: successReturnUrl.toString(),
          cancelUrl: cancelReturnUrl.toString(),
          metadata: {
            bookingId
          }
        }
      });
      res.json({ url: payment.links?.checkout?.href || (payment as any)._links?.checkout?.href });
    } catch (err: any) {
      console.error('Mollie error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // API Route: Register
  app.post('/api/register', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase niet verbonden' });
    const { email, password, firstName, lastName, phone, role } = req.body;
    try {
      const name = `${firstName} ${lastName}`.trim();
      const userRole = role === 'partner' ? 'partner' : 'customer';
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email,
          password, // In a real app we'd use supabase auth or bcrypt here
          role: userRole,
          name,
          phone
        }])
        .select();

      if (error) {
        if (error.code === '23505') { // Postgres duplicate key error
           return res.status(400).json({ error: 'Email already exists' });
        }
        throw error;
      }
      res.json({ success: true, userId: data[0].id });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to create account', details: e.message });
    }
  });

  app.post('/api/settings/mollie', async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) return res.status(400).json({ error: 'Key required' });
      process.env.MOLLIE_API_KEY = key;
      mollieClient = new MollieClientType({ security: { apiKey: key } });
      
      if (supabase) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: 'MOLLIE_API_KEY', value: key }, { onConflict: 'key' });
        if (error) {
          console.error('Save Mollie key to DB failed:', error);
        }
      }
      
      try {
        let envContent = '';
        if (fs.existsSync('.env')) {
          envContent = fs.readFileSync('.env', 'utf-8');
        }
        if (envContent.includes('MOLLIE_API_KEY=')) {
          envContent = envContent.replace(/MOLLIE_API_KEY=.*/g, `MOLLIE_API_KEY="${key}"`);
        } else {
          envContent += `\nMOLLIE_API_KEY="${key}"\n`;
        }
        fs.writeFileSync('.env', envContent);
      } catch (err) {
        console.error('Failed to write .env', err);
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Save settings error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/settings/mollie', async (req, res) => {
    let key = process.env.MOLLIE_API_KEY || '';
    if (!key && supabase) {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'MOLLIE_API_KEY').single();
        if (data && data.value) {
          key = data.value;
        }
      } catch(e) {}
    }
    res.json({ isSet: !!key, key: key || '' });
  });

  app.post('/api/settings/generic/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (!key) return res.status(400).json({ error: 'Key required' });
      
      if (supabase) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: key, value: typeof value === 'string' ? value : JSON.stringify(value) }, { onConflict: 'key' });
        if (error) {
          console.error(`Save ${key} to DB failed:`, error);
          return res.status(500).json({ error: error.message });
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Save settings error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/settings/generic/:key', async (req, res) => {
    try {
      const { key } = req.params;
      if (!key) return res.status(400).json({ error: 'Key required' });
      if (supabase) {
        const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
        if (data && data.value) {
          return res.json({ value: data.value });
        }
      }
      res.json({ value: null });
    } catch (err: any) {
      console.error('Get settings error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Tracking
  let memoryTrackingEvents: any[] = [];
  
  // Load initial events from supabase
  if (supabase) {
    (async () => {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'TRACKING_EVENTS').single();
        if (data && data.value) {
          try {
            memoryTrackingEvents = JSON.parse(data.value);
          } catch(e) {}
        }
      } catch(e) {}
    })();
  }
  
  app.post('/api/tracking', async (req, res) => {
    const { id, ipAddress, timestamp, action, details } = req.body;
    
    // In-memory update for fast fallback
    memoryTrackingEvents.unshift({ id, ipAddress, timestamp, action, details });
    if (memoryTrackingEvents.length > 2000) memoryTrackingEvents.length = 2000;
    
    // Save to Supabase (fetch latest to avoid overwriting other instances' events)
    if (supabase) {
      (async () => {
        try {
          let eventsToSave = memoryTrackingEvents;
          const { data } = await supabase.from('settings').select('value').eq('key', 'TRACKING_EVENTS').single();
          if (data && data.value) {
            try {
              const existingEvents = JSON.parse(data.value);
              // avoid duplicate if this instance just started and memory has it
              if (!existingEvents.find((e: any) => e.id === id)) {
                existingEvents.unshift({ id, ipAddress, timestamp, action, details });
                if (existingEvents.length > 2000) existingEvents.length = 2000;
                eventsToSave = existingEvents;
                memoryTrackingEvents = existingEvents; // sync memory too
              }
            } catch(e) {}
          }
          await supabase.from('settings').upsert({ key: 'TRACKING_EVENTS', value: JSON.stringify(eventsToSave) }, { onConflict: 'key' });
        } catch(e) {}
      })();
    }
    
    res.json({ success: true });
  });

  app.get('/api/tracking', async (req, res) => {
    if (supabase) {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'TRACKING_EVENTS').single();
        if (data && data.value) {
           const events = JSON.parse(data.value);
           res.json({ events });
           return;
        }
      } catch(e) {}
    }
    res.json({ events: memoryTrackingEvents });
  });

  app.delete('/api/tracking', async (req, res) => {
    memoryTrackingEvents = [];
    if (supabase) {
       await supabase.from('settings').upsert({ key: 'TRACKING_EVENTS', value: JSON.stringify([]) }, { onConflict: 'key' });
    }
    res.json({ success: true });
  });

  // Fallback 404 handler for API routes (must be before vite.middlewares)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route niet gevonden: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      console.error('Express JSON parsing error:', err.message);
      return res.status(400).json({ error: 'Ongeldige JSON verstuurd naar de server.' });
    }
    
    console.error('Express Error:', err);
    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: 'Interne server fout in API.' });
    } else {
      next(err);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

