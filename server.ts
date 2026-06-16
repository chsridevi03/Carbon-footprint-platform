/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/db';

// Extend express requests with authenticated user
interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

// Authentication Middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  const user = db.authenticate(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid, please log in' });
  }

  req.user = user;
  req.token = token;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing capability
  app.use(express.json());

  // 1. HEALTHCHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. USER AUTHENTICATION ENDPOINTS
  app.post('/api/auth/register', (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Please submit complete fields (email, name, password)' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must consist of at least 6 characters' });
    }

    const authData = db.register(email, name, password);
    if (!authData) {
      return res.status(412).json({ error: 'Email address already registered' });
    }

    res.status(201).json({ message: 'Success', ...authData });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const authData = db.login(email, password);
    if (!authData) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    res.json({ message: 'Welcome back!', ...authData });
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res) => {
    db.logout(req.token!);
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // 3. CARBON CALCULATOR ROUTE
  app.post('/api/carbon/calculate', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { carDistance, transitMode, electricityKwh, gasLpg, foodPreference } = req.body;

    if (
      carDistance === undefined ||
      !transitMode ||
      electricityKwh === undefined ||
      gasLpg === undefined ||
      !foodPreference
    ) {
      return res.status(400).json({ error: 'Incomplete parameters supplied for carbon log' });
    }

    try {
      const calculation = db.calculateFootprint(req.user.id, {
        carDistance: Number(carDistance),
        transitMode,
        electricityKwh: Number(electricityKwh),
        gasLpg: Number(gasLpg),
        foodPreference,
      });

      // Fetch freshly computed profile with updated score
      const freshUser = db.authenticate(req.token!);

      res.status(201).json({
        calculation,
        user: freshUser,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Footprint calculations failed' });
    }
  });

  app.get('/api/carbon/history', authMiddleware, (req: AuthenticatedRequest, res) => {
    const history = db.getHistory(req.user.id);
    res.json({ history });
  });

  // 4. GENERATE INSIGHTS AND RECS
  app.get('/api/recommendations', authMiddleware, (req: AuthenticatedRequest, res) => {
    const recommendations = db.getRecommendations(req.user.id);
    res.json({ recommendations });
  });

  // 5. ECO CHALLENGES SYSTEM
  app.get('/api/challenges', authMiddleware, (req: AuthenticatedRequest, res) => {
    const challenges = db.getChallenges(req.user.id);
    res.json({ challenges });
  });

  app.post('/api/challenges/:id/complete', authMiddleware, (req: AuthenticatedRequest, res) => {
    const challengeId = req.params.id;
    const result = db.completeChallenge(req.user.id, challengeId);
    
    if (!result) {
      return res.status(404).json({ error: 'Challenge not found or user context invalid' });
    }

    if (!result.success) {
      return res.status(409).json({ error: 'You have already completed this eco challenge today!' });
    }

    // Refresh auth context
    const freshUser = db.authenticate(req.token!);

    res.json({
      message: 'Challenge completed successfully!',
      pointsEarned: result.pointsEarned,
      newTotalPoints: result.newTotalPoints,
      badgeUnlocked: result.badgeUnlocked,
      user: freshUser,
    });
  });

  // 6. GLOBAL LEADERBOARD
  app.get('/api/leaderboard', authMiddleware, (req: AuthenticatedRequest, res) => {
    const list = db.getLeaderboard();
    res.json({ leaderboard: list });
  });

  // 7. PREDICTION ENGINE FORCASTING
  app.get('/api/prediction/forecast', authMiddleware, (req: AuthenticatedRequest, res) => {
    const result = db.forecastEmissions(req.user.id);
    res.json({ forecast: result });
  });

  // 8. ADMIN SUMMARY METRICS
  app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admin permissions mandated' });
    }

    const stats = db.getAdminStats();
    res.json({ stats });
  });

  // 9. AI CO₂ SUSTAINABILITY ASSISTANT chatbot route using @google/genai SDK
  app.post('/api/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Conversational messages checklist required' });
    }

    // Check if Gemini Key exists in environment secrets
    const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

    if (!hasApiKey) {
      // Graceful fallback for local development if key hasn't been configured yet
      const lastMessage = messages[messages.length - 1]?.text || 'Hello';
      return res.json({
        reply: `🍃 **[AI Assistant Demo Mode]:** I'm GreenTrack's Sustainable Specialist. To converse with live AI, please navigate to the **Settings > Secrets** panel in the AI Studio sidebar and declare your \`GEMINI_API_KEY\`. 
        
        As a preview, here is some quick environmental advice on your text: "${lastMessage}". Reaching a lower footprint involves:
        1. **Public Transit:** Minimizes commuter friction and cuts individual emissions up to 70%.
        2. **Energy Audit:** Unplugging standby appliances reduces "phantom watt load" which otherwise bleeds passive bills.
        3. **Nourishment:** Adopting vegetarian proteins saves tons of nitrogen runoff! Make sure your calculations are uploaded on your tracker dashboard.`,
      });
    }

    try {
      // Initialize Gemini Client properly using process.env
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // System Instructions instructing how the assistant should operate
      const systemInstruction = `You are a professional, motivating Environmental Sustainability Coach representing GreenTrack AI. 
Help users track, understand, and reduce their personal carbon footprints.
Always maintain a bright, supportive, and active tone. Provide clear, hyper-practical recommendations. 
Ground advice in modern carbon metrics (e.g., metric tons CO₂ equivalent, EPA standards). 
Reference diet choices (vegan, vegetarian), transport modes (cycling, EVs, light rail), HVAC thermostat offsets, and composting.
Keep your answers beautifully structured using scannable markdown bullet lists and bold accents. No text formatting slop.`;

      // Build context strings from conversation history
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      // Set model option to gemini-3.5-flash as specified in the guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || 'I analyzed your request but generated an empty response. Let me know if you would like me to unpack that differently!',
      });
    } catch (err: any) {
      console.error('Gemini call error:', err);
      res.json({
        reply: `⚠️ I encountered an issue consulting my ecological model database: ${err.message || err}. However, let me happily answer that a standard commuter car emits approximately 4.6 metric tons of carbon dioxide per year, meaning any shift to micro-mobility or public transit has massive benefits! Let's work together to crush those carbon scores.`,
      });
    }
  });

  // Vite Server Integration for fully responsive SPA rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GreenTrack AI Service running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
