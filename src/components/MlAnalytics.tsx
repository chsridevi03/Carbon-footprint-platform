/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, BarChart3, HelpCircle, TrendingDown, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { PredictionResult } from '../types';

interface MlAnalyticsProps {
  token: string | null;
  historyCount: number;
}

export default function MlAnalytics({ token, historyCount }: MlAnalyticsProps) {
  const [forecast, setForecast] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await fetch('/api/prediction/forecast', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate machine learning footprint forecasts.');
      }
      setForecast(data.forecast);
    } catch (err: any) {
      setErrorText(err.message || 'Forecast engine timed out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [historyCount]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4" id="forecast-loading">
        <RefreshCw size={24} className="animate-spin text-natural-primary" />
        <p className="text-xs text-natural-text-sage font-mono">Running Least-Squares Regression prediction algorithms...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="p-8 rounded-2xl border border-[#BC4749]/30 bg-[#BC4749]/10 text-[#BC4749] text-center" id="forecast-err">
        <p className="text-xs font-semibold">{errorText}</p>
        <button
          onClick={fetchForecast}
          className="mt-4 px-3 py-1.5 bg-[#BC4749]/20 hover:bg-[#BC4749]/30 text-[#BC4749] text-xs font-bold rounded-lg transition"
        >
          Retry Calculation
        </button>
      </div>
    );
  }

  const trendIsImproving = forecast?.trendDirection === 'improving';
  const trendIsWorsening = forecast?.trendDirection === 'worsening';

  return (
    <div className="space-y-6" id="forecast-tab-workspace">
      {/* Upper banner explaining ML */}
      <div className="p-5 bg-[#FAF3DD]/20 dark:bg-[#1E3020]/20 border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl shadow-sm flex items-start space-x-3.5">
        <Cpu size={22} className="text-natural-primary mt-0.5 flex-shrink-0 animate-pulse" />
        <div className="space-y-1 text-left leading-relaxed">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-natural-text-dark dark:text-white">Predictive AI Forecast Engine</h3>
          <p className="text-[11px] text-natural-text-sage">
            Our predictive engine trains on your historical emissions logs using least-squares linear gradient regression combined with heuristic energy matrices. Logging multiple monthly parameters refines trend matching confidence ratings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Projections values cards */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl shadow-sm space-y-4 text-left">
          <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm flex items-center gap-1.5 pb-2">
            <Activity size={15} className="text-natural-primary" />
            Emissions Path Forecast
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-natural-bg-muted/10 dark:bg-slate-850 border border-natural-bg-muted dark:border-slate-800/85 space-y-1">
              <span className="text-natural-text-sage text-[10px] font-bold uppercase tracking-wider">Next Month CO₂</span>
              <div className="flex items-baseline space-x-1 font-display">
                <span className="text-3xl font-black text-natural-text-dark dark:text-white" id="predict-next-val">
                  {forecast?.predictedCO2NextMonth}
                </span>
                <span className="text-[10px] text-natural-text-sage font-mono font-bold uppercase">Tons CO₂e</span>
              </div>
              <p className="text-[9px] text-[#6B7C6B]">Predicted single-month estimate</p>
            </div>

            <div className="p-4 rounded-xl bg-natural-bg-muted/10 dark:bg-slate-850 border border-natural-bg-muted dark:border-slate-800/85 space-y-1">
              <span className="text-natural-text-sage text-[10px] font-bold uppercase tracking-wider">Six-Month Projection</span>
              <div className="flex items-baseline space-x-1 font-display">
                <span className="text-3xl font-black text-natural-text-dark dark:text-white" id="predict-six-val">
                  {forecast?.predictedCO2SixMonths?.toFixed(2)}
                </span>
                <span className="text-[10px] text-natural-text-sage font-mono font-bold uppercase">Tons CO₂e</span>
              </div>
              <p className="text-[9px] text-[#6B7C6B]">Predicted continuous aggregate loads</p>
            </div>
          </div>

          {/* Trend banner with badge */}
          <div className="p-4 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7C6B] block font-mono">Current Trend Slope</span>
              <span className="font-semibold text-xs text-natural-text-dark dark:text-white block truncate uppercase tracking-widest leading-none">
                {forecast?.trendDirection}
              </span>
            </div>

            {trendIsImproving ? (
              <div className="p-2 rounded-xl bg-[#A7C957]/15 text-natural-primary flex items-center space-x-2 border border-[#A7C957]/30">
                <TrendingDown size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Emissions falling</span>
              </div>
            ) : trendIsWorsening ? (
              <div className="p-2 rounded-xl bg-[#BC4749]/15 text-[#BC4749] flex items-center space-x-2 border border-[#BC4749]/30">
                <TrendingUp size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Emissions expanding</span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-natural-bg-muted/15 text-natural-text-charcoal flex items-center space-x-2 border border-natural-bg-muted">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Flat / Stable</span>
              </div>
            )}
          </div>
        </div>

        {/* Confidence rating circular meter panel */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-1 pb-3">
            <h2 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">Prediction Model Confidence Index</h2>
            <p className="text-natural-text-sage text-[11px] leading-relaxed">
              Confidence levels are derived statistically based on calculated parameter counts, variance intervals, and tracking consistency.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
            {/* Linear scale gauge */}
            <div className="relative h-24 w-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-natural-bg-muted dark:stroke-slate-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-natural-primary fill-none transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * (forecast?.confidenceScore || 50)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-xl text-natural-text-dark dark:text-white">
                  {forecast?.confidenceScore || 50}%
                </span>
                <span className="text-[8px] font-bold text-natural-text-sage uppercase tracking-widest leading-none">Accuracy</span>
              </div>
            </div>

            <div className="space-y-1 max-w-xs text-center sm:text-left">
              <span className="text-xs font-bold text-natural-text-dark dark:text-white inline-block">
                {historyCount >= 3 ? 'Excellent parameter density.' : 'Baseline resolution'}
              </span>
              <p className="text-[11px] text-[#6B7C6B] leading-relaxed">
                {historyCount >= 3
                  ? 'Calculated logs cover sufficient history to fit an accurate quarterly regression slope.'
                  : 'Requires logging calculations across at least 3 distinct intervals to enable full regression precision.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Primary factors drivers analysis */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl shadow-sm text-left space-y-4">
        <h3 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm">Key Footprint Drivers Under Forecasting</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecast?.factors.map((f, i) => (
            <div key={i} className="p-3.5 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl bg-natural-bg-muted/10 dark:bg-slate-900/50 flex space-x-3 items-start">
              <span className="p-1.5 rounded-lg bg-natural-bg-muted text-natural-primary font-bold shrink-0">
                🌿
              </span>
              <div className="space-y-0.5">
                <span className="font-display font-bold text-xs text-natural-text-dark dark:text-white block">{f.name}</span>
                <p className="text-[11px] text-natural-text-sage leading-normal">{f.impact}</p>
              </div>
            </div>
          ))}

          {forecast?.factors.length === 0 && (
            <p className="text-xs text-natural-text-sage italic col-span-2 text-center py-4">
              All environmental factors balanced. Perfect baseline projection! Keep up the spectacular green footprint logging habits.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
