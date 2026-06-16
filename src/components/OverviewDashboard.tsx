/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Leaf, Zap, Car, Compass, Calendar, Download, Trophy, Eye, CheckCircle, RefreshCw } from 'lucide-react';
import { CarbonCalculation, Recommendation, User } from '../types';

interface OverviewDashboardProps {
  user: User;
  calculations: CarbonCalculation[];
  recommendations: Recommendation[];
  onTriggerCalculation: () => void;
  onOpenPdfReport: () => void;
}

export default function OverviewDashboard({
  user,
  calculations,
  recommendations,
  onTriggerCalculation,
  onOpenPdfReport
}: OverviewDashboardProps) {
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);

  // Derive metrics
  const latestCalc = calculations[calculations.length - 1];
  
  const monthlyTotal = latestCalc ? latestCalc.totalCO2 : 0;
  const yearlyTotal = monthlyTotal * 12;

  // Category values
  const transportCO2 = latestCalc ? latestCalc.categoryEmissions.transport : 0;
  const energyCO2 = latestCalc ? latestCalc.categoryEmissions.energy : 0;
  const foodCO2 = latestCalc ? latestCalc.categoryEmissions.food : 0;
  const categoriesSum = transportCO2 + energyCO2 + foodCO2 || 1;

  const transportPercent = Math.round((transportCO2 / categoriesSum) * 100);
  const energyPercent = Math.round((energyCO2 / categoriesSum) * 100);
  const foodPercent = Math.round((foodCO2 / categoriesSum) * 100);

  // Badge list maps
  const ALL_BADGES: Record<string, { title: string; desc: string; icon: string; color: string }> = {
    eco_pioneer: { title: 'Eco Pioneer', desc: 'Joined our carbon reduction community', icon: '🌱', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' },
    energy_saver: { title: 'Energy Saver', desc: 'Maintains electricity loads under control', icon: '⚡', color: 'border-cyan-300 bg-cyan-50 dark:bg-cyan-950/20' },
    eco_spark: { title: 'Eco Spark', desc: 'Completed your first eco challenge', icon: '✨', color: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' },
    green_champion: { title: 'Green Champion', desc: 'Completed over 5 daily eco challenges', icon: '👑', color: 'border-forest-400 bg-forest-50 dark:bg-forest-950/20' },
    carbon_crusher: { title: 'Carbon Crusher', desc: 'Amassed over 300 tracker eco points', icon: '💥', color: 'border-purple-300 bg-purple-50 dark:bg-purple-950/20' },
  };

  // Determine score status
  let scoreStatus = 'Moderate';
  let scoreColor = 'text-amber-500';
  let scoreBg = 'bg-amber-100 dark:bg-amber-950/30';
  if (user.score >= 80) {
    scoreStatus = 'Excellent Eco Warrior';
    scoreColor = 'text-emerald-500';
    scoreBg = 'bg-emerald-100 dark:bg-emerald-950/30';
  } else if (user.score >= 60) {
    scoreStatus = 'Eco-Friendly Active Carbon Tracker';
    scoreColor = 'text-green-500';
    scoreBg = 'bg-green-100 dark:bg-green-950/30';
  } else if (user.score < 40) {
    scoreStatus = 'High Carbon Footprint';
    scoreColor = 'text-red-500';
    scoreBg = 'bg-red-100 dark:bg-red-950/30';
  }

  return (
    <div className="space-y-6" id="dashboard-tab-view">
      {/* Upper Brand Jumbotron Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-natural-primary to-natural-alt text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-natural-lime text-xs font-bold tracking-widest uppercase mb-1">ECOLOGICAL INTELLIGENCE CENTER</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Hello, {user.name}!</h1>
          <p className="text-natural-bg-muted/90 text-sm max-w-xl">
            You are currently on active sustainability track. View your emissions profile, conquer daily challenges, and consult our AI expert Coach.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onOpenPdfReport}
            id="report-pdf-btn"
            className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition border border-white/20 shadow-sm"
          >
            <Download size={14} />
            <span>Sustainability Report</span>
          </button>
          <button
            onClick={onTriggerCalculation}
            id="calc-trigger-btn"
            className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl bg-natural-lime hover:bg-natural-lime/90 text-xs font-extrabold text-natural-text-dark transition shadow-lg shadow-natural-lime/10"
          >
            <Leaf size={14} />
            <span>Update Footprint</span>
          </button>
        </div>
      </div>

      {/* Grid: Footprint Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-hero-grid">
        {/* Total Monthly Tonnage card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex items-center space-x-4 transition hover:shadow-md">
          <div className="p-3 rounded-xl bg-natural-alert/10 text-natural-alert">
            <Globe size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-natural-text-sage dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Monthly Footprint</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-display font-bold text-xl text-natural-text-dark dark:text-white" id="stat-monthly-co2">
                {monthlyTotal > 0 ? monthlyTotal : '—'}
              </span>
              {monthlyTotal > 0 && <span className="text-natural-text-sage text-[10px] font-mono">Tons CO₂e</span>}
            </div>
            <p className="text-[10px] text-natural-text-sage/80 dark:text-gray-500">
              {monthlyTotal > 0 ? 'Verified via input calculation' : 'No logs recorded yet'}
            </p>
          </div>
        </div>

        {/* Projected Yearly Tonnage card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex items-center space-x-4 transition hover:shadow-md">
          <div className="p-3 rounded-xl bg-natural-alt/10 text-natural-alt animate-pulse">
            <Calendar size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-natural-text-sage dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Yearly Projection</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-display font-bold text-xl text-natural-text-dark dark:text-white" id="stat-yearly-co2">
                {yearlyTotal > 0 ? yearlyTotal.toFixed(1) : '—'}
              </span>
              {yearlyTotal > 0 && <span className="text-natural-text-sage text-[10px] font-mono">Tons CO₂e</span>}
            </div>
            <p className="text-[10px] text-natural-text-sage/80 dark:text-gray-500">
              {yearlyTotal > 0 ? 'Heuristic cumulative benchmark' : 'Awaiting profile inputs'}
            </p>
          </div>
        </div>

        {/* Challenge points indicator */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex items-center space-x-4 transition hover:shadow-md">
          <div className="p-3 rounded-xl bg-natural-lime/20 text-natural-mid-green">
            <Trophy size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-natural-text-sage dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Eco XP Earned</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-display font-bold text-xl text-natural-text-dark dark:text-white" id="stat-points">
                {user.points}
              </span>
              <span className="text-natural-text-sage text-[10px]">Points</span>
            </div>
            <p className="text-[10px] text-natural-text-sage/85 dark:text-gray-500">
              Completing daily challenges
            </p>
          </div>
        </div>

        {/* Global Carbon saved impact */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex items-center space-x-4 transition hover:shadow-md">
          <div className="p-3 rounded-xl bg-natural-primary/10 text-natural-primary">
            <Compass size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-natural-text-sage dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Saving Offset</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-display font-bold text-xl text-natural-primary dark:text-natural-lime" id="stat-offset">
                {latestCalc ? Math.round((1.1 - latestCalc.totalCO2) * 1000) : '0'}
              </span>
              <span className="text-natural-text-sage text-[10px]">kg CO₂/mo</span>
            </div>
            <p className="text-[10px] text-natural-text-sage/80 dark:text-gray-500">
              Rel. to regional baseline average
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Sustainability Meter Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge Center details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight self-start text-sm">Sustainability Rating Meter</h2>
          
          <div className="relative flex items-center justify-center h-40 w-40">
            {/* SVG circular track and glowing dial */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-natural-bg-muted dark:stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-natural-primary fill-none transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * user.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center space-y-0.5">
              <span className="font-display font-extrabold text-4xl text-natural-text-dark dark:text-white tracking-tighter">
                {user.score}
              </span>
              <p className="text-[10px] text-natural-text-sage font-bold tracking-widest uppercase">Rating Index</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold leading-none ${scoreBg} ${scoreColor}`}>
              {scoreStatus}
            </span>
            <p className="text-[11px] text-natural-text-sage px-3 leading-relaxed">
              Your footprint score increases as emissions fall and active eco-challenges completions accumulate. Goal: &gt;80% index score.
            </p>
          </div>
        </div>

        {/* Emissions breakdown donut visualization chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2">
            <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">Emissions Breakdown</h2>
            <span className="text-[10px] font-mono text-natural-text-sage">Current Log</span>
          </div>

          {calculations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Leaf size={40} className="text-natural-text-sage animate-pulse" />
              <p className="text-xs text-natural-text-sage">No category parameters found yet. Access Calculator page to generate report.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Custom SVG Donut Chart */}
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  {/* Transport Segment */}
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    className="stroke-[#4A7C59] fill-none cursor-pointer transition-all hover:stroke-[14px]"
                    strokeWidth="10"
                    strokeDasharray={326.7}
                    strokeDashoffset={0}
                    onMouseEnter={() => setHoverCategory('Transport')}
                    onMouseLeave={() => setHoverCategory(null)}
                  />
                  {/* Energy Segment */}
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    className="stroke-[#A7C957] fill-none cursor-pointer transition-all hover:stroke-[14px]"
                    strokeWidth="10"
                    strokeDasharray={326.7}
                    strokeDashoffset={(326.7 * transportPercent) / 100}
                    onMouseEnter={() => setHoverCategory('Energy')}
                    onMouseLeave={() => setHoverCategory(null)}
                  />
                  {/* Food Segment */}
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    className="stroke-[#386641] fill-none cursor-pointer transition-all hover:stroke-[14px]"
                    strokeWidth="10"
                    strokeDasharray={326.7}
                    strokeDashoffset={(326.7 * (transportPercent + energyPercent)) / 100}
                    onMouseEnter={() => setHoverCategory('Food')}
                    onMouseLeave={() => setHoverCategory(null)}
                  />
                </svg>
                <div className="text-center font-semibold text-xs text-slate-500 dark:text-slate-400">
                  {hoverCategory ? (
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-[#6B7C6B] uppercase tracking-wider">{hoverCategory}</p>
                      <p className="font-display font-extrabold text-base text-[#1B3022] dark:text-white">
                        {hoverCategory === 'Transport' ? transportPercent : hoverCategory === 'Energy' ? energyPercent : foodPercent}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-natural-text-sage">Metrics</p>
                      <p className="font-display font-extrabold text-xs text-natural-text-charcoal dark:text-slate-350">Emissions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend with values */}
              <div className="grid grid-cols-3 gap-2 w-full text-center text-xs">
                <div className="p-1 px-2 border border-natural-bg-muted dark:border-slate-800 rounded bg-natural-bg-muted/30 dark:bg-slate-900/50">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#4A7C59] mr-1.5" />
                  <span className="text-[10px] text-natural-text-sage block">Transport</span>
                  <span className="font-bold text-[#4A7C59] font-mono text-[11px] block">{transportTons(calculations)}T</span>
                </div>
                <div className="p-1 px-2 border border-natural-bg-muted dark:border-slate-800 rounded bg-natural-bg-muted/30 dark:bg-slate-900/50">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#A7C957] mr-1.5" />
                  <span className="text-[10px] text-natural-text-sage block">Energy</span>
                  <span className="font-bold text-[#6A994E] font-mono text-[11px] block">{energyTons(calculations)}T</span>
                </div>
                <div className="p-1 px-2 border border-natural-bg-muted dark:border-slate-800 rounded bg-natural-bg-muted/30 dark:bg-slate-900/50">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#386641] mr-1.5" />
                  <span className="text-[10px] text-natural-text-sage block">Nutrition</span>
                  <span className="font-bold text-[#386641] font-mono text-[11px] block">{foodTons(calculations)}T</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* emissions historical trend bar chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2">
            <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">CO₂ Emissions Footprint History</h2>
            <span className="text-[10px] font-mono text-natural-text-sage">Quarterly Log</span>
          </div>

          {calculations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Globe size={40} className="text-natural-text-sage animate-pulse" />
              <p className="text-xs text-natural-text-sage">Historical trend details show up sequentially as you log multiple entries.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-end pt-3">
              {/* Dynamic SVG bar diagram */}
              <div className="h-32 flex items-end justify-around border-b border-natural-bg-muted dark:border-slate-700/60 pb-1 relative">
                {/* Max carbon ceiling coordinate indicator */}
                <div className="absolute top-1 left-0 border-t border-natural-bg-muted dark:border-[#1E3020] w-full" />
                <div className="absolute top-1/2 left-0 border-t border-natural-bg-muted dark:border-[#1E3020] w-full border-dashed" />

                {calculations.slice(-5).map((calc, i) => {
                  const barHeight = Math.min((calc.totalCO2 / 1.5) * 100, 100); // normalized against a 1.5-ton ceiling
                  return (
                    <div key={calc.id} className="flex flex-col items-center group relative cursor-pointer pt-4">
                      {/* Floating tooltip */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#1B3022] text-white text-[9px] font-bold font-mono py-0.5 px-1.5 rounded pointer-events-none transition-opacity duration-200 z-10 shadow-sm">
                        {calc.totalCO2}T CO₂
                      </div>
                      
                      {/* Stacked emission segment bars */}
                      <div className="w-6 sm:w-8 flex flex-col justify-end space-y-[1px] transition-transform group-hover:scale-105 duration-200" style={{ height: `${Math.max(barHeight, 15)}%` }}>
                        <div className="bg-[#4A7C59] rounded-t-sm" style={{ height: `${calc.categoryEmissions.transport / calc.totalCO2 * 100}%` }} title="Transport" />
                        <div className="bg-[#A7C957]" style={{ height: `${calc.categoryEmissions.energy / calc.totalCO2 * 100}%` }} title="Energy" />
                        <div className="bg-[#386641] rounded-b-sm" style={{ height: `${calc.categoryEmissions.food / calc.totalCO2 * 100}%` }} title="Nutrition" />
                      </div>

                      <span className="text-[10px] text-natural-text-sage font-bold font-mono mt-2 uppercase">
                        {new Date(calc.date).toLocaleDateString([], { month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-natural-text-sage leading-none">
                <span>0T Goal Baseline</span>
                <span>1.5T High Ceiling</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row: Personalized Recommendation Alerts & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {/* Personalized Recommendations Panel  */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Leaf size={16} className="text-natural-primary animate-spin animate-duration-3000" />
              <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">Personalized Action Plan</h2>
            </div>
            <span className="text-[10px] bg-natural-lime/20 text-[#386641] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-tight">Active Plan</span>
          </div>

          <div className="space-y-3.5">
            {recommendations.slice(0, 3).map((r, i) => (
              <div key={r.id || i} className="p-3.5 border border-natural-bg-muted dark:border-slate-800 rounded-xl bg-natural-bg-muted/15 dark:bg-slate-900/50 flex space-x-3 items-start hover:bg-natural-bg-muted/30 transition">
                <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 rounded-full bg-natural-primary text-white items-center justify-center font-bold text-[10px]">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-natural-text-charcoal dark:text-slate-300 font-semibold leading-relaxed">{r.text}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-natural-text-sage font-bold">
                    <span className="px-1.5 py-0.2 bg-natural-bg-muted dark:bg-slate-800 rounded text-natural-primary dark:text-slate-400 uppercase tracking-wider">{r.category}</span>
                    <span className="text-natural-mid-green">Est. Savings: {r.estimatedSavingKg} kg CO₂ / yr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamified Achievement Badges Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">Unlocked Eco Badge Wall</h2>
            <span className="text-xs text-natural-primary font-mono font-semibold">{user.badges.length}/5 Active Trophies</span>
          </div>

          <div className="grid grid-cols-2 gap-3" id="badge-collection-grid">
            {Object.keys(ALL_BADGES).map((key) => {
              const bgDetails = ALL_BADGES[key];
              const isUnlocked = user.badges.includes(key);

              return (
                <div
                  key={key}
                  className={`p-3 border rounded-xl flex items-center space-x-3 transition-opacity duration-300 ${
                    isUnlocked
                      ? `bg-natural-bg-muted/15 border-natural-bg-muted dark:border-slate-700 opacity-100`
                      : 'border-slate-100 dark:border-slate-800 opacity-40'
                  }`}
                >
                  <span className="text-2.5xl leading-none">{bgDetails.icon}</span>
                  <div className="space-y-0.5 text-left">
                    <h3 className="font-bold text-xs text-natural-text-dark dark:text-white truncate">{bgDetails.title}</h3>
                    <p className="text-[9px] text-natural-text-sage leading-tight mr-1 truncate" title={bgDetails.desc}>
                      {isUnlocked ? bgDetails.desc : 'Locked'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers for aggregate emission values
function transportTons(calcs: CarbonCalculation[]): string {
  if (calcs.length === 0) return '0.0';
  return calcs[calcs.length - 1].categoryEmissions.transport.toFixed(2);
}

function energyTons(calcs: CarbonCalculation[]): string {
  if (calcs.length === 0) return '0.0';
  return calcs[calcs.length - 1].categoryEmissions.energy.toFixed(2);
}

function foodTons(calcs: CarbonCalculation[]): string {
  if (calcs.length === 0) return '0.0';
  return calcs[calcs.length - 1].categoryEmissions.food.toFixed(2);
}
