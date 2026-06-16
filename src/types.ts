/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  score: number; // 0-100 overall sustainability rating
  points: number; // gamified challenges points
  isAdmin: boolean;
  badges: string[];
  password?: string;// List of badge IDs
}

export interface CarbonCalculation {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  carDistance: number; // miles or km per day
  transitMode: 'Car' | 'Bike' | 'Bus' | 'Train' | 'Walking' | 'Bicycle';
  electricityKwh: number; // monthly kWh
  gasLpg: number; // monthly LPG or gas usage (kg or therms)
  foodPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Flexitarian';
  totalCO2: number; // calculated Metric Tons or kg CO2/month
  categoryEmissions: {
    transport: number;
    energy: number;
    food: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completedAt?: string; // If completed today, timestamp
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  score: number;
  rank?: number;
}

export interface Recommendation {
  id: string;
  text: string;
  category: 'Transport' | 'Energy' | 'Food' | 'Lifestyle';
  estimatedSavingKg: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSavedCarbonKg: number;
  challengeCompletionRate: number;
  averageSustainabilityScore: number;
  globalEmissionsTrend: { month: string; amount: number }[];
  popularChallenges: { title: string; count: number }[];
}

export interface PredictionResult {
  predictedCO2NextMonth: number;
  predictedCO2SixMonths: number;
  confidenceScore: number;
  trendDirection: 'improving' | 'stable' | 'worsening';
  factors: { name: string; impact: string }[];
}
