require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from the root

// Initialize OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const useFakeAI = !OPENAI_API_KEY;
if (useFakeAI) {
  console.warn('OPENAI_API_KEY not set. Server will return simulated AI responses for /api/chat.');
}
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Simple in-memory company KB to provide richer fallback answers (and source attribution)
const companyKB = [
  {
    id: 'kb-001',
    title: 'Company mission',
    content: 'Zerclix Technologies empowers digital transformation through creative branding, user-centered design, and practical software solutions.',
    tags: ['mission','about','company','zerclix']
  },
  {
    id: 'kb-002',
    title: 'Support hours',
    content: 'Support is available Mon–Fri, 9:00–18:00 EAT. For urgent matters, escalate via the internal ticketing system.',
    tags: ['support','hours','contact','helpdesk']
  },
  {
    id: 'kb-003',
    title: 'Product upgrades',
    content: 'We are rolling out phased upgrades across branding and app UX. Release notes are posted weekly on the internal portal.',
    tags: ['upgrade','release','branding','ux']
  }
];

function searchKB(query) {
  const q = (query || '').toLowerCase();
  return companyKB
    .map((item) => {
      const text = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      const score = (item.tags.some(t => q.includes(t)) ? 2 : 0) + (text.includes(q) ? 2 : 0) + q.split(/\s+/).reduce((acc,w) => text.includes(w) ? acc+1 : acc, 0);
      return { item, score };
    })
    .filter(r => r.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0,3)
    .map(r => r.item);
}

function composeCompanyAnswer(query, kbItems) {
  if (!kbItems || kbItems.length === 0) return null;
  // Use the top hit and mention the source
  const top = kbItems[0];
  return `${top.content}\n\nSource: ${top.title} (company KB)`;
}

// Very small repetition detector to avoid returning the exact same large block repeatedly
const recentAnswers = {}; // key -> { answer, ts }
function normalizeKey(userId, query) {
  const q = (query || '').toLowerCase().trim();
  return `${userId || 'anon'}::${q}`;
}

function wasRecentlyAnswered(userId, query, answer, windowMs = 5 * 60 * 1000) {
  const key = normalizeKey(userId, query);
  const r = recentAnswers[key];
  if (!r) return false;
  if (r.answer === answer && (Date.now() - r.ts) < windowMs) return true;
  return false;
}

function storeRecentAnswer(userId, query, answer) {
  const key = normalizeKey(userId, query);
  recentAnswers[key] = { answer, ts: Date.now() };
}

function generateCompanyResponse(message) {
  // Try KB first
  const hits = searchKB(message);
  if (hits.length > 0) {
    return composeCompanyAnswer(message, hits);
  }

  // If nothing relevant in KB, return a more varied fallback (not a single static line)
  const m = (message || '').toLowerCase();
  if (m.includes('services') || m.includes('service')) return 'We provide digital transformation, cloud migration and custom software development — you can view details on our Services page.';
  if (m.includes('team') || m.includes('who')) return 'Our team includes engineers, designers and strategists; the Team page has profiles and availability.';
  if (m.includes('projects') || m.includes('project')) return 'Check the Projects page for case studies and current work. If you need a specific case study, tell me which area (e.g., cloud, AI).';
  // small randomization so repeated fallback isn't identical every time
  const fallbacks = [
    'The AI service is currently unavailable; this is an automatic fallback response. Try rephrasing or ask about our Services or Team pages.',
    'I’m using a local fallback right now — try again later for full AI-powered responses. Meanwhile, ask about our Services, Team, or Projects.',
    'OpenAI is not configured; I can show general company info from our knowledge base if that helps.'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context = [], userId } = req.body;
    const sender = userId || req.ip || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Privacy checks (simple) — refuse to answer private/sensitive queries
    const privacyPatterns = [/\b(full\s*name|phone\s*number|email|address|ssn|bank|account|password)\b/i, /\b(personnel\s*file|medical|disciplinary)\b/i];
    const lower = message.toLowerCase();
    if (privacyPatterns.some(r => r.test(lower))) {
      return res.json({ success: true, response: 'I can’t help with privacy-sensitive or confidential information. Please ask a general question instead.' });
    }

    // First, consult the company KB for relevant hits
    const kbHits = searchKB(message);

    // If KB has relevant info, prefer it (but paraphrase via LLM if available)
    if (kbHits.length > 0) {
      const plainAnswer = composeCompanyAnswer(message, kbHits);

      // If the same user asked the same question recently and we gave the same answer, return a concise note
      if (wasRecentlyAnswered(sender, message, plainAnswer)) {
        const concise = plainAnswer.split('\n')[0].split('.').slice(0,1).join('.') + '.';
        return res.json({ success: true, response: `You've recently asked this — here's a short summary: ${concise}` , sources: kbHits.map(h => ({ id: h.id, title: h.title })) });
      }

      // If we have an OpenAI key, ask it to paraphrase the KB content to avoid repetition / verbatim echo
      if (openai) {
        const systemMsg = `You are a concise assistant for Zerclix Technologies. Use the company notes provided and answer the user's question briefly. Do not repeat the company text verbatim — paraphrase and be conversational. End with a short source attribution.`;
        const kbText = kbHits.map(h => `${h.title}: ${h.content}`).join('\n\n');
        const messages = [
          { role: 'system', content: systemMsg },
          { role: 'user', content: `Company notes:\n${kbText}\n\nUser question: ${message}` }
        ];

        const response = await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, max_tokens: 300, temperature: 0.3 });
        const aiResponse = response.choices[0].message.content;

        storeRecentAnswer(sender, message, aiResponse);
        return res.json({ success: true, response: aiResponse, sources: kbHits.map(h => ({ id: h.id, title: h.title })), tokensUsed: response.usage?.total_tokens || 0 });
      }

      // No OpenAI key — return a KB-derived answer (already concise) and store it
      storeRecentAnswer(sender, message, plainAnswer);
      return res.json({ success: true, response: plainAnswer, sources: kbHits.map(h => ({ id: h.id, title: h.title })), tokensUsed: 0 });
    }

    // No KB hits — fall back to AI or fallback generator
    if (useFakeAI || !openai) {
      // Provide a more varied fallback (avoid identical repeats by storing recent responses)
      const fallback = generateCompanyResponse(message);
      if (wasRecentlyAnswered(sender, message, fallback)) {
        const concise = fallback.split('\n')[0].split('.').slice(0,1).join('.') + '.';
        return res.json({ success: true, response: `You've recently asked this — short repeat: ${concise}`, tokensUsed: 0 });
      }
      storeRecentAnswer(sender, message, fallback);
      return res.json({ success: true, response: fallback, tokensUsed: 0 });
    }

    // If we reach here, forward to OpenAI as before
    let messages = [
      {
        role: 'system',
        content: `You are an AI assistant for Zerclix Technologies, a leading tech company specializing in digital transformation solutions. You help users with questions about the company, its services, team, projects, and technologies. Be helpful, professional, and accurate. If you don't know something, say so politely. Always represent the company in a positive light.`
      },
      ...context,
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, max_tokens: 500, temperature: 0.7 });
    const aiResponse = response.choices[0].message.content;

    // Deduplicate repeated identical answers per user
    if (wasRecentlyAnswered(sender, message, aiResponse)) {
      const concise = aiResponse.split('\n')[0].split('.').slice(0,1).join('.') + '.';
      return res.json({ success: true, response: `You asked this recently — short repeat: ${concise}`, tokensUsed: response.usage?.total_tokens || 0 });
    }

    storeRecentAnswer(sender, message, aiResponse);
    res.json({ success: true, response: aiResponse, tokensUsed: response.usage?.total_tokens || 0 });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    
    if (error.status === 401) {
      res.status(401).json({ 
        error: 'Invalid API key. Please check your OPENAI_API_KEY environment variable.' 
      });
    } else if (error.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        error: 'An error occurred while processing your request. Please try again.' 
      });
    }
  }
});

// Private messaging: in-memory relay (server does NOT decrypt messages)
const pendingKeys = {}; // userId -> [{ from, publicKey, ts }]
const privateMessages = {}; // userId -> [{ from, cipher, ts }]

// Init a private chat handshake by posting a public key for a recipient
app.post('/api/private/init', (req, res) => {
  const { to, from, publicKey } = req.body;
  if (!to || !from || !publicKey) return res.status(400).json({ error: 'Missing fields' });
  pendingKeys[to] = pendingKeys[to] || [];
  pendingKeys[to].push({ from, publicKey, ts: Date.now() });
  console.log(`Private init: ${from} -> ${to}`);
  res.json({ success: true });
});

// Retrieve pending public keys (and clear them)
app.get('/api/private/pending', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const keys = pendingKeys[userId] || [];
  pendingKeys[userId] = [];
  res.json({ success: true, keys });
});

// Send an encrypted private message to a recipient
app.post('/api/private/send', (req, res) => {
  const { to, from, cipher } = req.body;
  if (!to || !from || !cipher) return res.status(400).json({ error: 'Missing fields' });
  privateMessages[to] = privateMessages[to] || [];
  privateMessages[to].push({ from, cipher, ts: Date.now() });
  console.log(`Private message: ${from} -> ${to}`);
  res.json({ success: true });
});

// Retrieve inbox (returns and clears messages for user)
app.get('/api/private/inbox', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const msgs = privateMessages[userId] || [];
  privateMessages[userId] = [];
  res.json({ success: true, messages: msgs });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({ useFakeAI });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log('Ready to serve AI-powered support chat!');
});

module.exports = app;