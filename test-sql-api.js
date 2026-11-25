const https = require('https');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    env[key] = val;
  }
});

// Test Supabase SQL endpoint
const postData = JSON.stringify({
  query: 'ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;'
});

const req = https.request('https://api.supabase.com/v1/projects/zwmnitovljccqulcfsik/database/query', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});
req.on('error', err => console.log('Req error:', err));
req.write(postData);
req.end();

