# GreenTrack AI – Carbon Footprint Awareness Platform

GreenTrack AI is an immersive, production-ready full-stack application designed to help individuals understand, track, visualize, and reduce their carbon footprint through personalized insights, sustainable challenges, and Gemini-powered environmental coaches.

---

## 🚀 Core Architectural Features

1. **Carbon Footprint Questionnaire**:
   - Captures daily travel distance, primary travel mode (Car, Bike, Bus, Train, Walking, Bicycle), household utility electricity values (kWh), LPG cylinder weights (Kg), and nutritional diet styles.
   - Calculates monthly emissions in **Metric Tons of CO₂ equivalent (CO₂e)**.
   - Updates the user's **Sustainability Index (0-100)** instantly.

2. **Heuristic Recommended Actions Plan**:
   - Automatically computes personal savings based on dominant carbon drivers (e.g., suggesting meatless options if red protein emissions exceed 45% of total footprint).

3. **Gamified Eco-Challenges & Trophy Badges**:
   - Engage in daily challenges (Car-Free Commute, ShowerSpeedrun, Unplug standby devices) to earn Points.
   - Unlock community achievements such as **Eco Spark**, **Green Champion**, or **Carbon Crusher**.

4. **Predictive AI Forecasting Engine**:
   - Employs a least-squares linear regression model to map the trajectory of future emissions, projecting next-month and six-month outputs accompanied by statistical confidence meters.

5. **Climatology Chatbot Specialist**:
   - Integrates the advanced Google Gemini `gemini-3.5-flash` model as a motivational Eco Coach.

6. **Secured Account Profiles (Auth)**:
   - Registers new users, encrypts password storage, and authenticates calculations on separate dashboards.

7. **Printable Sustainability PDF Digest**:
   - Optimized print stylesheet support (runs native `window.print()`) format perfectly onto A4 paper size, ready to be immediately saved or printed.

8. **Light / Dark Theme Support**:
   - Elegant dark theme option mapped directly to system values.

9. **Administrative Hub**:
   - Monitors user count, platform aggregated CO₂ savings, community index values, and popular actions.

---

## 📂 Database & Mathematical Formula Schemes

### 🗄️ Zero-Config Embedded Database (`/data/db.json`)
Our embedded layer simulates a SQLite relational setup containing:
- **`users` Table**: Profiles, points, levels, unlocked badges.
- **`calculations` Table**: Logs carbon histories, breakdown segments.
- **`completedChallenges` Table**: User daily checkmark logs.
- **`challenges` Table**: Core challenge rules and awards.

### 📐 Emissions Equations
- **Commute**: $\text{Daily Km} \times 30 \times \text{Transit Mode Factor (Car: 0.404, Bus: 0.103, Train: 0.052, bicycle: 0)}$
- **Electricity**: $\text{Monthly kWh} \times 0.453\text{ Kg CO}_2$
- **LPG Gas**: $\text{Monthly Kg} \times 3.0\text{ Kg CO}_2\text{ equivalent}$
- **Nutrition**: Vegan: 75Kg, Vegetarian: 100Kg, Flexitarian: 125Kg, Non-Veg: 160Kg.

---

## 🔑 Login Credentials

The database comes fully seeded on initialization with two pre-created test accounts:

| Role | Username / Email | Password | Features Unlocked |
|---|---|---|---|
| **Regular User** | `user@greentrack.ai` | `user123` | Log Calculations, Chat with Coach, Gain XP, Forecast Trends |
| **Administrator** | `admin@greentrack.ai` | `admin123` | Access **Admin Hub** statistics panel, view user metrics |

---

## 🛠️ Build and Deployment Instructions

### 1️⃣ Set up your environment secrets
Ensure you define your Gemini key in your environment or your platform's Secrets panel:
```env
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
```

### 2️⃣ Production Build Command
Run compilation commands to compile the Express full-stack bundles:
```bash
npm run build
```
This performs a two-tier compilation layout:
1. Bundles client React SPA codes under `dist/` directories using Vite.
2. Compiles backend TypeScript `server.ts` into a fast, single CJS file `/dist/server.cjs` using esbuild.

### 3️⃣ Start Production Server
Launch the self-contained backend on PORT 3000:
```bash
npm start
```
The Express server securely boots up, listening on host `0.0.0.0` for all external routes.
