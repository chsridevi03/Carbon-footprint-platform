/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Leaf, Info, Car, Zap, Flame, Cookie, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { CarbonCalculation, User } from '../types';

interface CarbonCalculatorProps {
  user: User;
  onCalculationSaved: (calc: CarbonCalculation, updatedUser: User) => void;
  token: string | null;
}

export default function CarbonCalculator({ user, onCalculationSaved, token }: CarbonCalculatorProps) {
  // Form State
  const [carDistance, setCarDistance] = useState<number>(25);
  const [transitMode, setTransitMode] = useState<CarbonCalculation['transitMode']>('Car');
  const [electricityKwh, setElectricityKwh] = useState<number>(350);
  const [gasLpg, setGasLpg] = useState<number>(20);
  const [foodPreference, setFoodPreference] = useState<CarbonCalculation['foodPreference']>('Non-Vegetarian');
  
  // Real-time calculated footprints
  const [liveCO2, setLiveCO2] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Trigger live calculation on state change to provide instant feedback
  useEffect(() => {
    // Equivalent of server equation
    let transitFactor = 0;
    switch (transitMode) {
      case 'Car': transitFactor = 0.404; break;
      case 'Bus': transitFactor = 0.103; break;
      case 'Train': transitFactor = 0.052; break;
      case 'Bike': transitFactor = 0.015; break;
      case 'Bicycle':
      case 'Walking':
      default: transitFactor = 0; break;
    }

    const monthlyTransportCO2Kg = (carDistance * 30) * transitFactor;
    const monthlyElectricityCO2Kg = electricityKwh * 0.453;
    const monthlyGasCO2Kg = gasLpg * 3.0;

    let foodEmissionsKg = 160;
    if (foodPreference === 'Vegan') foodEmissionsKg = 75;
    else if (foodPreference === 'Vegetarian') foodEmissionsKg = 100;
    else if (foodPreference === 'Flexitarian') foodEmissionsKg = 125;

    const totalCO2Kg = monthlyTransportCO2Kg + monthlyElectricityCO2Kg + monthlyGasCO2Kg + foodEmissionsKg;
    setLiveCO2(parseFloat((totalCO2Kg / 1000).toFixed(3)));
  }, [carDistance, transitMode, electricityKwh, gasLpg, foodPreference]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const response = await fetch('/api/carbon/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          carDistance,
          transitMode,
          electricityKwh,
          gasLpg,
          foodPreference,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record carbon footprint logging info.');
      }

      setSuccessText('Carbon calculations logged successfully! Your sustainability score rating was updated.');
      onCalculationSaved(data.calculation, data.user);
    } catch (err: any) {
      setErrorText(err.message || 'Server encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="calculator-workspace">
      {/* Questionnaire Form Section */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white dark:bg-[#131F14] border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-lg text-natural-text-dark dark:text-white tracking-tight">Emissions Parameters Questionnaire</h2>
          <p className="text-natural-text-sage text-xs leading-relaxed">
            Supply details representing your typical month. Move selectors and sliders to observe emissions adjustments dynamically.
          </p>
        </div>

        {errorText && (
          <div className="p-3 border border-[#BC4749]/20 bg-[#BC4749]/10 text-[#BC4749] text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle size={15} className="text-[#BC4749] flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {successText && (
          <div className="p-3 border border-natural-primary/20 bg-natural-bg-muted text-natural-primary text-xs rounded-xl flex items-center space-x-2">
            <Sparkles size={15} className="text-natural-mid-green flex-shrink-0" />
            <span>{successText}</span>
          </div>
        )}

        {/* Transportation Input set */}
        <div className="space-y-3.5 border-b border-natural-bg-muted dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-2 text-natural-primary">
            <Car size={16} />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-natural-text-dark dark:text-white">Transportation Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-natural-text-sage dark:text-gray-400 block font-semibold">Primary Transit Mode</label>
              <select
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/35 dark:bg-slate-800 text-natural-text-dark dark:text-white"
                id="param-transit-mode"
              >
                <option value="Car">Car (Gasoline / Diesel)</option>
                <option value="Bus">Public Commute Bus</option>
                <option value="Train">Electric Light Rail / Train</option>
                <option value="Bike">Gas Motorbike</option>
                <option value="Bicycle">Bicycle (Ecological)</option>
                <option value="Walking">Walking / Running</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-natural-text-sage dark:text-gray-400 block pb-0.5">Daily Distance</label>
                <span className="font-mono text-natural-primary dark:text-natural-lime font-bold">{carDistance} Km</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={carDistance}
                onChange={(e) => setCarDistance(Number(e.target.value))}
                className="w-full accent-natural-primary cursor-pointer h-1 rounded"
                id="param-transit-distance"
              />
            </div>
          </div>
        </div>

        {/* Energy Utilities Input set */}
        <div className="space-y-3.5 border-b border-natural-bg-muted dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-2 text-natural-alt">
            <Zap size={16} />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-natural-text-dark dark:text-white">Household Utility Loads</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-natural-text-sage dark:text-gray-400 block font-semibold">Electricity Consumption</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 border border-natural-bg-muted rounded-lg bg-white dark:bg-slate-800 text-natural-text-dark dark:text-white pr-10"
                  placeholder="e.g. 350"
                  id="param-electricity"
                />
                <span className="absolute right-3 top-2.5 text-[9px] font-mono text-natural-text-sage font-extrabold uppercase">kWh/mo</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-natural-text-sage dark:text-gray-400 block font-semibold">LPG Gas Cylinder Usage</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={gasLpg}
                  onChange={(e) => setGasLpg(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-semibold px-3 py-2 border border-natural-bg-muted rounded-lg bg-white dark:bg-slate-800 text-natural-text-dark dark:text-white pr-10"
                  placeholder="e.g. 20"
                  id="param-gas"
                />
                <span className="absolute right-3 top-2.5 text-[9px] font-mono text-natural-text-sage font-extrabold uppercase">Kg/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Food Preference Input set */}
        <div className="space-y-3.5 pb-2">
          <div className="flex items-center space-x-2 text-natural-mid-green">
            <Cookie size={16} />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-natural-text-dark dark:text-white">Dietary Nutrition Preferences</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-natural-text-sage dark:text-gray-400 block font-semibold">Typical Monthly Diet Pattern</label>
            <select
              value={foodPreference}
              onChange={(e) => setFoodPreference(e.target.value as any)}
              className="w-full text-xs font-semibold px-3 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/35 dark:bg-slate-800 text-natural-text-dark dark:text-white"
              id="param-food"
            >
              <option value="Non-Vegetarian">Non-Vegetarian (Frequent Red/White Meats)</option>
              <option value="Flexitarian font-sans">Flexitarian (Minimal meat portions, organic)</option>
              <option value="Vegetarian">Strict Vegetarian (Dairy/Eggs allowed)</option>
              <option value="Vegan">Whole Food Vegan (Strict plant based offset)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          id="calc-save-btn"
          className="w-full py-2.5 bg-natural-primary hover:bg-natural-alt text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-natural-primary/10 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Leaf size={14} />}
          <span>Calculate & Record Emissions Log</span>
        </button>
      </form>

      {/* Real-time Estimate Indicator Card */}
      <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
        
        {/* Real-time Carbon display box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1B3022] to-[#2D3A2D] text-white border border-[#2D3A2D] shadow-xl flex flex-col items-center justify-center text-center space-y-4 flex-1">
          <Leaf size={32} className="text-natural-lime animate-pulse" />
          
          <div className="space-y-1">
            <p className="text-natural-bg-muted/60 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Instant Calculation Feed</p>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="font-display font-black text-5xl text-natural-lime tracking-tighter" id="live-co2-val">
                {liveCO2}
              </span>
              <span className="text-sm font-bold text-natural-bg-muted/70"> Tons/mo</span>
            </div>
            <p className="text-[11px] text-natural-bg-muted/50">of CO₂ equivalent emissions estimated</p>
          </div>

          <div className="h-[1px] w-full bg-white/10 my-1" />

          {/* Quick analysis comparing benchmark */}
          <div className="space-y-2 w-full text-left">
            <p className="text-[10px] uppercase text-natural-bg-muted/70 font-extrabold tracking-wider">Benchmark comparison:</p>
            
            {liveCO2 > 1.0 ? (
              <div className="p-3 bg-[#BC4749]/15 text-[#EAB5B5] border border-[#BC4749]/30 rounded-xl text-[10px] flex items-start space-x-2 leading-relaxed">
                <AlertCircle size={13} className="mt-0.5 text-[#BC4749]" />
                <span>Elevated footprint. Exceeds typical regional targeted levels. Explore green challenges to actively shave weight.</span>
              </div>
            ) : liveCO2 >= 0.5 ? (
              <div className="p-3 bg-natural-toast border border-natural-toast-border text-natural-toast-text rounded-xl text-[10px] flex items-start space-x-2 leading-relaxed">
                <AlertCircle size={13} className="mt-0.5 text-natural-toast-text" />
                <span>Moderate ratings. Near average profiles. Swapping to LED utilities and train commutes could reduce scores heavily.</span>
              </div>
            ) : (
              <div className="p-3 bg-[#FAF3DD]/10 text-natural-lime border border-[#FAF3DD]/20 rounded-xl text-[10px] flex items-start space-x-2 leading-relaxed">
                <Leaf size={13} className="mt-0.5 text-natural-lime" />
                <span>Exceptional eco profile. Well under regional emission levels. Perfect foundation. Unlock achievement trophies.</span>
              </div>
            )}
          </div>
        </div>

        {/* Fact box helper */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 rounded-2xl shadow-sm space-y-2 flex items-start space-x-3.5">
          <Info size={18} className="text-natural-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="text-xs font-bold text-natural-text-dark dark:text-white">Why Track Carbon Footprints?</p>
            <p className="text-[11px] text-natural-text-sage leading-relaxed">
              The standard human global yearly carbon budget target fits comfortably under **2.0 Metric Tons** to contain catastrophic climate temperatures. Tracking monthly energy offsets keeps individual profiles balanced.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
