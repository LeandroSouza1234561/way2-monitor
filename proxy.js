/**
 * Vercel Serverless Function – Way2 Proxy
 * Faz login automático e busca dados da API Way2
 * Deploy: vercel.com (grátis)
 */

const https = require('https');
const qs    = require('querystring');

const WAY2_HOST = 'pim.way2.com.br';
const USERNAME  = process.env.WAY2_USER || 'leandro.souzagna';
const PASSWORD  = process.env.WAY2_PASS || 'Mudar@2026';

// Cache de sessão (dura enquanto a função estiver quente)
let sessionCookies = '';
let lastLogin = 0;
const SESSION_TTL = 20 * 60 * 1000; // 20 min

function httpsReq(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function parseCookies(setCookie) {
  if (!setCookie) return '';
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr.map(c => c.split(';')[0]).join('; ');
}

async function login() {
  const body = qs.stringify({ username: USERNAME, password: PASSWORD });
  const r = await httpsReq({
    hostname: WAY2_HOST, path: '/login', method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
      'User-Agent': 'Mozilla/5.0 Way2Monitor/2.0',
      'Accept': 'text/html,*/*',
    }
  }, body);

  const cookies = parseCookies(r.headers['set-cookie']);
  if (cookies) {
    sessionCookies = cookies;
    lastLogin = Date.now();
    return true;
  }
  // Tenta JSON
  const jbody = JSON.stringify({ username: USERNAME, password: PASSWORD });
  const r2 = await httpsReq({
    hostname: WAY2_HOST, path: '/api/login', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jbody),
      'User-Agent': 'Mozilla/5.0 Way2Monitor/2.0',
    }
  }, jbody);

  const c2 = parseCookies(r2.headers['set-cookie']);
  let payload = {};
  try { payload = JSON.parse(r2.body); } catch {}
  const token = payload.token || payload.access_token || '';

  if (c2 || token) {
    sessionCookies = c2 || `token=${token}`;
    lastLogin = Date.now();
    return true;
  }
  return false;
}

async function ensureSession() {
  if (sessionCookies && Date.now() - lastLogin < SESSION_TTL) return true;
  return login();
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const { path: way2path } = req.query;

  // Rota de status/ping
  if (!way2path || way2path === 'status') {
    const ok = await ensureSession();
    res.json({ ok, user: USERNAME.split('@')[0] });
    return;
  }

  try {
    await ensureSession();

    const fullPath = '/' + way2path + (req.url.includes('?path=') ?
      req.url.replace(/.*\?path=[^&]+/, '').replace(/^&/, '?') : '');

    const r = await httpsReq({
      hostname: WAY2_HOST,
      path: fullPath,
      method: 'GET',
      headers: {
        'Cookie': sessionCookies,
        'User-Agent': 'Mozilla/5.0 Way2Monitor/2.0',
        'Accept': 'application/json, */*',
      }
    });

    const nc = parseCookies(r.headers['set-cookie']);
    if (nc) sessionCookies = nc;

    if (r.status === 401 || r.status === 403) {
      sessionCookies = ''; lastLogin = 0;
      await login();
    }

    res.status(r.status).setHeader('Content-Type', 'application/json').send(r.body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
