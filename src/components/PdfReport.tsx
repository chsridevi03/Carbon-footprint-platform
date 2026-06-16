/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, X, Award, Info, FileText, Printer, CheckSquare } from 'lucide-react';
import { CarbonCalculation, User, Challenge, Recommendation } from '../types';

interface PdfReportProps {
  user: User;
  calculations: CarbonCalculation[];
  recommendations: Recommendation[];
  challenges: Challenge[];
  onClose: () => void;
}

export default function PdfReport({ user, calculations, recommendations, challenges, onClose }: PdfReportProps) {
  const latestCalc = calculations[calculations.length - 1];
  const monthlyTotal = latestCalc ? latestCalc.totalCO2 : 0;
  const yearlyTotal = monthlyTotal * 12;

  const handlePrint = () => {
    window.print();
  };

  const completedChallenges = challenges.filter(c => !!c.completedAt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex justify-center p-4 sm:p-6 no-print md:py-12" id="pdf-report-modal">
      <div className="bg-white text-slate-950 rounded-2xl max-w-4xl w-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative border border-slate-200">
        
        {/* Floating Controls to print/close */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 no-print">
          <button
            onClick={handlePrint}
            id="print-action-btn"
            className="p-2 bg-forest-650 hover:bg-forest-600 text-white rounded-xl text-xs font-bold leading-none flex items-center space-x-1.5 transition shadow"
            title="Download PDF or Print"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 border border-slate-250 hover:bg-slate-100 rounded-xl transition text-slate-500"
            title="Dismiss PDF View"
          >
            <X size={15} />
          </button>
        </div>

        {/* Printable Executive Content layout */}
        <div className="flex-1 space-y-6 text-left" id="printable-report-area">
          
          {/* Header section with brand */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Platform Executive Digest</span>
              <h1 className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                🍃 GreenTrack AI Footprint Report
              </h1>
              <p className="text-xs text-slate-500">Certified Sustainability and Ecological Impact Summary for: <strong>{user.name}</strong></p>
            </div>
            
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/70 text-right space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Evaluation Date</span>
              <p className="text-xs font-semibold font-mono text-slate-800">{new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Grid Layout: Primary Footprints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1">
              <span className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Monthly footprint</span>
              <p className="font-display font-black text-2xl text-slate-800 font-mono">{monthlyTotal > 0 ? monthlyTotal : 'No Logs'} <span className="text-xs font-semibold">Tons CO₂e</span></p>
              <span className="text-[9px] text-slate-400">Monthly calculated values</span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1">
              <span className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Yearly estimate</span>
              <p className="font-display font-black text-2xl text-slate-800 font-mono">{yearlyTotal > 0 ? yearlyTotal.toFixed(1) : 'No Logs'} <span className="text-xs font-semibold">Tons CO₂e</span></p>
              <span className="text-[9px] text-slate-400">Projected yearly tonnage loads</span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1">
              <span className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Community score</span>
              <p className="font-display font-black text-2xl text-emerald-600 font-mono">{user.score}% Rating</p>
              <span className="text-[9px] text-slate-400">Total gamified XP: {user.points} XP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Category Emissions summary list */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">Emission Parameter Segments</h3>
              {latestCalc ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-550 font-medium">🚗 Commute Transportation</span>
                    <span className="font-mono font-bold">{latestCalc.categoryEmissions.transport} Tons CO₂e</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-550 font-medium font-medium">⚡ Utility Electricity & Gas</span>
                    <span className="font-mono font-bold">{latestCalc.categoryEmissions.energy} Tons CO₂e</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-555 font-medium">🍽️ Dietary Preference ({latestCalc.foodPreference})</span>
                    <span className="font-mono font-bold">{latestCalc.categoryEmissions.food} Tons CO₂e</span>
                  </div>

                  <div className="h-[1px] bg-slate-200 my-2" />
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>Total Carbon Footprint Load</span>
                    <span className="font-mono text-sm">{latestCalc.totalCO2} Tons CO₂e</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No carbon log calculations calculated yet. Run the questionnaire first.</p>
              )}
            </div>

            {/* Daily Eco Challenges completed logs list */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">Eco Actions & Tasks Tracker</h3>
              <div className="space-y-2">
                {completedChallenges.map((c, i) => (
                  <div key={c.id || i} className="flex justify-between text-xs py-1 text-slate-705">
                    <span>✅ {c.title}</span>
                    <span className="text-slate-400 font-mono">+{c.points} XP Completed</span>
                  </div>
                ))}
                
                {completedChallenges.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">No successfully logged eco behavior tasks for today.</p>
                )}
                
                <div className="flex items-center space-x-1 font-semibold text-xs text-slate-800 pt-2 border-t border-slate-150">
                  <CheckSquare size={13} className="text-emerald-500" />
                  <span>Total challenges complete today: {completedChallenges.length} items</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Recommendations Plan */}
          <div className="space-y-3.5 pt-2">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">Target Action Reduction Strategy</h3>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((r, i) => (
                <div key={r.id || i} className="text-xs leading-relaxed text-slate-705 flex gap-2">
                  <span className="font-bold">{i + 1}.</span>
                  <div>
                    <strong>{r.text}</strong>
                    <span className="text-forest-650 ml-1.5 font-bold">(Estimated Annual Offsets: {r.estimatedSavingKg} Kg saved)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-200 my-4" />

          {/* Disclaimer Footer */}
          <div className="text-[10px] text-slate-455 space-y-1 max-w-2xl">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Info size={11} className="text-slate-500" />
              Disclaimer Methodologies
            </span>
            <p className="leading-relaxed">
              Assessed emissions estimates are fully referenced from regional IPCC / EPA greenhouse chemical carbon dioxide emission coefficients. Offsets profiles vary based on individual lifestyle, appliance efficiency grids, and micro-transit parameters.
            </p>
          </div>
        </div>

        {/* Footer actions inside modal */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center no-print">
          <span className="text-xs text-slate-451">Print or download directly as clear A4 PDF.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
