/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, CarbonCalculation, Challenge, LeaderboardEntry, Recommendation, AdminStats, PredictionResult } from '../types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password_hash
  sessionTokens: Record<string, string>; // token -> userId
  calculations: CarbonCalculation[];
  completedChallenges: Record<string, { challengeId: string; date: string }[]>; // userId -> challenges
  challenges: Challenge[];
  recommendations: Record<string, Recommendation[]>; // userId -> recommendations
}

// Initial Standard Challenges Seeding
const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Car-Free Commute', description: 'Take public transportation, bike, or walk to work or school today.', points: 50, category: 'Transport' },
  { id: 'c2', title: 'Meat-Free Day', description: 'Eat entirely vegetarian or vegan meals for 24 hours.', points: 30, category: 'Food' },
  { id: 'c3', title: 'Unplug Standby Devices', description: 'Unplug chargers, microwave, and TVs when not in use to kill phantom electricity loads.', points: 20, category: 'Energy' },
  { id: 'c4', title: 'Eco-Grocery Shopping', description: 'Bring your own reusable canvas bags and avoid single-use plastics altogether.', points: 25, category: 'Lifestyle' },
  { id: 'c5', title: 'Shower Speedrun', description: 'Limit your hot shower to under 5 minutes to reduce water heating carbon impact.', points: 20, category: 'Energy' },
  { id: 'c6', title: 'Local Harvest', description: 'Purchase fresh ingredients grown locally within a 50-mile radius.', points: 30, category: 'Food' },
  { id: 'c7', title: 'LED Lights Upgrade', description: 'Replace at least one household halogen bulb with a high-efficiency LED bulb.', points: 40, category: 'Energy' },
  { id: 'c8', title: 'Set AC to 78°F / 25°C', description: 'Keep the thermostat at an energy-friendly temperature to reduce HVAC energy consumption.', points: 15, category: 'Energy' },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure standard fields
        return {
          users: parsed.users || [],
          passwords: parsed.passwords || {},
          sessionTokens: parsed.sessionTokens || {},
          calculations: parsed.calculations || [],
          completedChallenges: parsed.completedChallenges || {},
          challenges: parsed.challenges || DEFAULT_CHALLENGES,
          recommendations: parsed.recommendations || {},
        };
      } catch (err) {
        console.error('Failed to read db file, creating new', err);
      }
    }

    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'admin-uuid',
          email: 'admin@greentrack.ai',
          name: 'Green Admin',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          score: 85,
          points: 150,
          isAdmin: true,
          badges: ['eco_pioneer', 'energy_saver'],
        },
        {
          id: 'demo-user-uuid',
          email: 'user@greentrack.ai',
          name: 'Eco Warrior',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          score: 72,
          points: 80,
          isAdmin: false,
          badges: ['eco_pioneer'],
        }
      ],
      passwords: {
        'admin-uuid': this.hashPassword('admin123'),
        'demo-user-uuid': this.hashPassword('user123'),
      },
      sessionTokens: {},
      calculations: [
        // Seed historical calculations for demo user to support proper charts and predictive forecasting
        {
          id: 'calc1',
          userId: 'demo-user-uuid',
          date: '2026-03-15',
          carDistance: 35,
          transitMode: 'Car',
          electricityKwh: 450,
          gasLpg: 30,
          foodPreference: 'Non-Vegetarian',
          totalCO2: 0.85, // tons
          categoryEmissions: { transport: 0.42, energy: 0.27, food: 0.16 }
        },
        {
          id: 'calc2',
          userId: 'demo-user-uuid',
          date: '2026-04-15',
          carDistance: 25,
          transitMode: 'Car',
          electricityKwh: 400,
          gasLpg: 25,
          foodPreference: 'Flexitarian',
          totalCO2: 0.71, // tons
          categoryEmissions: { transport: 0.30, energy: 0.29, food: 0.12 }
        },
        {
          id: 'calc3',
          userId: 'demo-user-uuid',
          date: '2026-05-15',
          carDistance: 15,
          transitMode: 'Bus',
          electricityKwh: 360,
          gasLpg: 20,
          foodPreference: 'Vegetarian',
          totalCO2: 0.54, // tons
          categoryEmissions: { transport: 0.18, energy: 0.26, food: 0.10 }
        }
      ],
      completedChallenges: {
        'demo-user-uuid': [
          { challengeId: 'c1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          { challengeId: 'c3', date: new Date().toISOString().split('T')[0] }
        ]
      },
      challenges: DEFAULT_CHALLENGES,
      recommendations: {},
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(db: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save to database', err);
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public register(email: string, name: string, password: string): { user: User; token: string } | null {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return null;

    const newUserId = crypto.randomUUID();
    const newUser: User = {
      id: newUserId,
      email: email.toLowerCase(),
      name,
      joinedAt: new Date().toISOString(),
      score: 50, // Starting default
      points: 0,
      isAdmin: false,
      badges: [],
    };

    const token = crypto.randomBytes(32).toString('hex');
    this.data.users.push(newUser);
    this.data.passwords[newUserId] = this.hashPassword(password);
    this.data.sessionTokens[token] = newUserId;

    this.saveData(this.data);
    return { user: newUser, token };
  }

  public login(email: string, password: string): { user: User; token: string } | null {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const hash = this.hashPassword(password);
    if (this.data.passwords[user.id] !== hash) return null;

    const token = crypto.randomBytes(32).toString('hex');
    this.data.sessionTokens[token] = user.id;

    this.saveData(this.data);
    return { user, token };
  }

  public authenticate(token: string): User | null {
    const userId = this.data.sessionTokens[token];
    if (!userId) return null;
    return this.data.users.find(u => u.id === userId) || null;
  }

  public logout(token: string): boolean {
    if (this.data.sessionTokens[token]) {
      delete this.data.sessionTokens[token];
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // CORE FOOTPRINT CALCULATOR LOGIC (monthly estimate in METRIC TONS OF CO2)
  public calculateFootprint(
    userId: string,
    formData: {
      carDistance: number;
      transitMode: 'Car' | 'Bike' | 'Bus' | 'Train' | 'Walking' | 'Bicycle';
      electricityKwh: number;
      gasLpg: number;
      foodPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Flexitarian';
    }
  ): CarbonCalculation {
    const { carDistance, transitMode, electricityKwh, gasLpg, foodPreference } = formData;

    // 1. Transportation Carbon Footprint calculations (Monthly, assuming 30 days)
    // EPA-based variables kg CO2 per km/mile
    let transitFactor = 0;
    switch (transitMode) {
      case 'Car': transitFactor = 0.404; break; // average passenger car (lb per mile/km ratio simplified)
      case 'Bus': transitFactor = 0.103; break;
      case 'Train': transitFactor = 0.052; break;
      case 'Bike': transitFactor = 0.015; break; // energy burned
      case 'Bicycle':
      case 'Walking':
      default: transitFactor = 0; break;
    }

    const monthlyTransportCO2Kg = (carDistance * 30) * transitFactor;

    // 2. Household Utilities calculations
    // 1 kWh electricity is ~0.45 kg CO2
    const monthlyElectricityCO2Kg = electricityKwh * 0.453;
    // 1 kg of LPG represents ~3.0 kg of CO2 equivalent
    const monthlyGasCO2Kg = gasLpg * 3.0;

    // 3. Food Emissions calculations (Estimated kg CO2/month benchmarks)
    let foodEmissionsKg = 160; // Standard Non-Veg
    if (foodPreference === 'Vegan') foodEmissionsKg = 75;
    else if (foodPreference === 'Vegetarian') foodEmissionsKg = 100;
    else if (foodPreference === 'Flexitarian') foodEmissionsKg = 125;

    const totalCO2Kg = monthlyTransportCO2Kg + monthlyElectricityCO2Kg + monthlyGasCO2Kg + foodEmissionsKg;
    const totalCO2Tons = totalCO2Kg / 1000; // metric tons

    const newCalculation: CarbonCalculation = {
      id: crypto.randomUUID(),
      userId,
      date: new Date().toISOString().split('T')[0],
      carDistance,
      transitMode,
      electricityKwh,
      gasLpg,
      foodPreference,
      totalCO2: parseFloat(totalCO2Tons.toFixed(3)),
      categoryEmissions: {
        transport: parseFloat((monthlyTransportCO2Kg / 1000).toFixed(3)),
        energy: parseFloat(((monthlyElectricityCO2Kg + monthlyGasCO2Kg) / 1000).toFixed(3)),
        food: parseFloat((foodEmissionsKg / 1000).toFixed(3)),
      }
    };

    // Save calculation
    this.data.calculations.push(newCalculation);

    // Recalculate user score (0 - 100)
    // Benchmark: 2.0 Tons CO2/year is the ideal sustainable cap. (approx 0.15 tons/month per person)
    // Typical US benchmark is 16 tons/year (~1.33 tons/month)
    // Scale: 100 points for <= 0.15 tons/month, dropping to 10 points at 1.5 tons/month or more
    const currentScore = this.computeScore(newCalculation.totalCO2, userId);
    
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex].score = currentScore;
    }

    this.saveData(this.data);
    return newCalculation;
  }

  private computeScore(monthlyTons: number, userId: string): number {
    // Emissions score
    let base = 100 - (monthlyTons * 60);
    if (base < 10) base = 10;
    if (base > 100) base = 100;

    // Award bonus points based on number of completed challenges
    const completed = this.data.completedChallenges[userId] || [];
    const bonus = Math.min(completed.length * 2.5, 15); // up to 15 bonus points

    return Math.min(Math.round(base + bonus), 100);
  }

  public getHistory(userId: string): CarbonCalculation[] {
    return this.data.calculations
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // GENERATE HEURISTIC PERSONAL RECOMMENDATIONS
  public getRecommendations(userId: string): Recommendation[] {
    const userCalculations = this.getHistory(userId);
    if (userCalculations.length === 0) {
      return [
        { id: 'r1', text: 'Complete your first carbon footprint calculation to receive detailed insights!', category: 'Lifestyle', estimatedSavingKg: 10, completed: false },
        { id: 'r2', text: 'Unplug devices on standby to prevent phantom electricity loads.', category: 'Energy', estimatedSavingKg: 15, completed: false }
      ];
    }

    // Examine the latest calculation
    const latest = userCalculations[userCalculations.length - 1];
    const recs: Recommendation[] = [];

    const total = latest.totalCO2;
    const t_prop = latest.categoryEmissions.transport / total;
    const e_prop = latest.categoryEmissions.energy / total;
    const f_prop = latest.categoryEmissions.food / total;

    // 1. Handle transportation recommendations
    if (latest.transitMode === 'Car' && latest.carDistance > 10) {
      recs.push({
        id: 'rec-t-1',
        text: `Switching to public transit or carpooling for just 2 days a week can reduce your commute footprint by 40%.`,
        category: 'Transport',
        estimatedSavingKg: Math.round(latest.categoryEmissions.transport * 1000 * 0.4),
        completed: false
      });
    }
    if (latest.carDistance > 0 && latest.transitMode !== 'Bicycle' && latest.transitMode !== 'Walking') {
      recs.push({
        id: 'rec-t-2',
        text: 'Consider walking or bicycling for trips under 2 miles to zero-out short distance trip emissions.',
        category: 'Transport',
        estimatedSavingKg: 25,
        completed: false
      });
    }

    // 2. Handle electricity and home energy recommendations
    if (latest.electricityKwh > 300) {
      recs.push({
        id: 'rec-e-1',
        text: 'Upgrade to high-efficiency LED lighting and smart power strips to reduce home power drawing.',
        category: 'Energy',
        estimatedSavingKg: Math.round(latest.electricityKwh * 0.15 * 0.45),
        completed: false
      });
    }
    if (latest.gasLpg > 15) {
      recs.push({
        id: 'rec-e-2',
        text: 'Lower water heater thermostat setting back to 120°F (49°C) for safe, energy-efficient operations.',
        category: 'Energy',
        estimatedSavingKg: 40,
        completed: false
      });
    }

    // 3. Handle nutrition and diet recommendations
    if (latest.foodPreference === 'Non-Vegetarian') {
      recs.push({
        id: 'rec-f-1',
        text: 'Adopt a Flexitarian model or host "Meatless Mondays". Reducing beef/pork consumption can shave 300kg CO2 yearly.',
        category: 'Food',
        estimatedSavingKg: 35,
        completed: false
      });
    } else if (latest.foodPreference === 'Vegetarian') {
      recs.push({
        id: 'rec-f-2',
        text: 'Explore plant-based milk alternatives (oat, almond) to further optimize your vegetarian profile.',
        category: 'Food',
        estimatedSavingKg: 15,
        completed: false
      });
    }

    // 4. Fallback Lifestyle recommendation
    recs.push({
      id: 'rec-l-1',
      text: 'Bring reusable grocery packing options and buy foods with minimal plastic wrappers.',
      category: 'Lifestyle',
      estimatedSavingKg: 12,
      completed: false
    });

    return recs;
  }

  // GET ALL ACTIVE CHALLENGES FOR USER
  public getChallenges(userId: string): Challenge[] {
    const completedTodays = this.data.completedChallenges[userId] || [];
    const todayStr = new Date().toISOString().split('T')[0];

    return this.data.challenges.map(c => {
      const isCompleted = completedTodays.some(comp => comp.challengeId === c.id && comp.date === todayStr);
      return {
        ...c,
        completedAt: isCompleted ? todayStr : undefined
      };
    });
  }

  // COMPLETE CHALLENGE AND EARN POINTS
  public completeChallenge(userId: string, challengeId: string): { success: boolean; pointsEarned: number; newTotalPoints: number; badgeUnlocked?: string } | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;

    const challenge = this.data.challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.data.completedChallenges[userId]) {
      this.data.completedChallenges[userId] = [];
    }

    // Check if already completed today
    const alreadyDone = this.data.completedChallenges[userId].some(comp => comp.challengeId === challengeId && comp.date === todayStr);
    if (alreadyDone) {
      return { success: false, pointsEarned: 0, newTotalPoints: user.points };
    }

    // Store completed log
    this.data.completedChallenges[userId].push({ challengeId, date: todayStr });

    // Add points
    user.points += challenge.points;

    // Check for badge achievements
    let badgeUnlocked: string | undefined;
    const completedCount = this.data.completedChallenges[userId].length;

    if (completedCount === 1 && !user.badges.includes('eco_spark')) {
      user.badges.push('eco_spark');
      badgeUnlocked = 'eco_spark';
    } else if (completedCount === 5 && !user.badges.includes('green_champion')) {
      user.badges.push('green_champion');
      badgeUnlocked = 'green_champion';
    } else if (user.points >= 300 && !user.badges.includes('carbon_crusher')) {
      user.badges.push('carbon_crusher');
      badgeUnlocked = 'carbon_crusher';
    }

    // Recalculate score (challenges give bonus score)
    const history = this.getHistory(userId);
    if (history.length > 0) {
      user.score = this.computeScore(history[history.length - 1].totalCO2, userId);
    }

    this.saveData(this.data);
    return {
      success: true,
      pointsEarned: challenge.points,
      newTotalPoints: user.points,
      badgeUnlocked
    };
  }

  // GET GLOBAL ECO LEADERBOARD
  public getLeaderboard(): LeaderboardEntry[] {
    return this.data.users
      .map(u => ({
        id: u.id,
        name: u.name,
        points: u.points,
        score: u.score
      }))
      .sort((a, b) => b.points - a.points || b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  // MACHINE LEARNING PREDICTION ENGINE (Gradient Descent/Heuristic trends)
  public forecastEmissions(userId: string): PredictionResult {
    const history = this.getHistory(userId);
    
    // Fallback if no history exists yet
    if (history.length === 0) {
      return {
        predictedCO2NextMonth: 0.70,
        predictedCO2SixMonths: 4.10,
        confidenceScore: 60,
        trendDirection: 'stable',
        factors: [
          { name: 'Initial Baseline', impact: 'Based on high default regional energy emissions benchmarks.' }
        ]
      };
    }

    // Linear regression setup if we have historical points
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    let predictedNext = history[history.length - 1].totalCO2;
    let confidence = 70;

    if (history.length >= 2) {
      // Fit Y = aX + b
      // X = month indexes, Y = CO2 tonnage values
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      const n = history.length;
      
      history.forEach((h, i) => {
        sumX += i;
        sumY += h.totalCO2;
        sumXY += i * h.totalCO2;
        sumXX += i * i;
      });

      const denominator = (n * sumXX) - (sumX * sumX);
      let slope = 0;
      let intercept = predictedNext;

      if (denominator !== 0) {
        slope = ((n * sumXY) - (sumX * sumY)) / denominator;
        intercept = (sumY - (slope * sumX)) / n;
      }

      predictedNext = slope * n + intercept;
      if (predictedNext < 0.05) predictedNext = 0.05; // avoid subzero bounds

      if (slope < -0.02) trend = 'improving';
      else if (slope > 0.02) trend = 'worsening';
      
      confidence = Math.min(70 + (n * 5), 95); // Higher confidence with more points
    } else {
      // Heuristic fallback if only 1 data point is present
      const latest = history[0];
      const completedChallengesCount = (this.data.completedChallenges[userId] || []).length;
      
      if (completedChallengesCount > 2) {
        predictedNext = latest.totalCO2 * 0.92; // predict a reduction
        trend = 'improving';
        confidence = 65;
      } else if (latest.transitMode === 'Car' && latest.electricityKwh > 400) {
        predictedNext = latest.totalCO2 * 1.03; // predict increase
        trend = 'worsening';
        confidence = 65;
      }
    }

    const predictedSixMonths = predictedNext * 6; // cumulative or forecast projection
    
    // Core driving components breaking down emission factors
    const latest = history[history.length - 1];
    const factors: { name: string; impact: string }[] = [];

    if (latest.categoryEmissions.transport > latest.totalCO2 * 0.4) {
      factors.push({ name: 'High Transit Burden', impact: 'Transportation currently represents your largest single emission segment. Try cycling or busing.' });
    }
    if (latest.categoryEmissions.energy > latest.totalCO2 * 0.4) {
      factors.push({ name: 'Home HVAC Loads', impact: 'Utility consumption is a dominant driver. Seal window drafts and upgrade LEDs.' });
    }
    if (latest.foodPreference === 'Non-Vegetarian') {
      factors.push({ name: 'Animal Protein Burden', impact: 'Non-vegetarian products maintain elevated processing and land emissions.' });
    } else {
      factors.push({ name: 'Sustainable Diet Offset', impact: 'Plant-forward meals are actively driving down your overall baseline calculations.' });
    }

    return {
      predictedCO2NextMonth: parseFloat(predictedNext.toFixed(3)),
      predictedCO2SixMonths: parseFloat(predictedSixMonths.toFixed(3)),
      confidenceScore: confidence,
      trendDirection: trend,
      factors
    };
  }

  // PLATFORM ADMIN DASHBOARD STATISTICS
  public getAdminStats(): AdminStats {
    const totalUsers = this.data.users.length;
    
    // Calculate estimated global carbon savings (kg)
    // Formula: (Estimated global baseline 1.2 tons - current baseline) * user calculation count
    let totalSavedKg = 0;
    const challengeWeightSaved = Object.values(this.data.completedChallenges)
      .reduce((acc, curr) => acc + (curr.length * 15), 0); // approx 15kg saved per clean eco behavior

    this.data.calculations.forEach(c => {
      const baselineKgs = 1100; // regional typical average monthly CO2 in kg
      const saved = baselineKgs - (c.totalCO2 * 1000);
      if (saved > 0) totalSavedKg += saved;
    });

    totalSavedKg += challengeWeightSaved;

    // Challenge Completion Rate
    const totalPossibleCompletions = totalUsers * 3; // hypothetical threshold
    const totalCompleted = Object.values(this.data.completedChallenges).reduce((acc, current) => acc + current.length, 0);
    const rate = totalPossibleCompletions > 0 ? (totalCompleted / totalPossibleCompletions) * 100 : 0;

    // Average rating
    const averageScore = this.data.users.reduce((acc, u) => acc + u.score, 0) / (totalUsers || 1);

    // Dynamic Monthly platform trend
    const globalEmissionsTrend = [
      { month: 'March 2026', amount: 12.4 },
      { month: 'April 2026', amount: 9.8 },
      { month: 'May 2026', amount: 7.2 },
      { month: 'June 2026', amount: parseFloat((7.2 - (totalSavedKg / 10000)).toFixed(2)) },
    ];

    // Popular challenges distribution
    const participation: Record<string, number> = {};
    Object.values(this.data.completedChallenges).forEach(userLogs => {
      userLogs.forEach(entry => {
        participation[entry.challengeId] = (participation[entry.challengeId] || 0) + 1;
      });
    });

    const popularChallenges = this.data.challenges.map(c => ({
      title: c.title,
      count: participation[c.id] || 0
    })).sort((a, b) => b.count - a.count).slice(0, 4);

    return {
      totalUsers,
      totalSavedCarbonKg: Math.round(totalSavedKg),
      challengeCompletionRate: parseFloat(Math.min(rate, 100).toFixed(1)),
      averageSustainabilityScore: Math.round(averageScore),
      globalEmissionsTrend,
      popularChallenges
    };
  }
}

export const db = new DatabaseManager();
