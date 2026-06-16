/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, Trophy, Compass, TrendingDown, RefreshCw, BarChart2, Zap } from 'lucide-react';
import { AdminStats } from '../types';

interface AdminHubProps {
  token: string | null;
}

export default function AdminHub({ token }: AdminHubProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Access denied. Administrator privileges required.');
      }
      setStats(data.stats);
    } catch (err: any) {
      setErrorText(err.message || 'Connecting to Admin Hub failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4" id="admin-loading">
        <RefreshCw size={24} className="animate-spin text-forest-550" />
        <p className="text-xs text-slate-500 font-mono">Loading general system administrative telemetry...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="p-8 border border-red-200 bg-red-50 dark:bg-red-955/20 rounded-2xl text-red-651 text-center" id="admin-err">
        <p className="text-xs font-semibold">{errorText}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-751 text-xs font-bold rounded-lg transition"
        >
          Retry Authorization
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-workspace">
      {/* Upper informational card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow border border-slate-800 flex items-start space-x-3.5 text-left">
        <Shield size={22} className="text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
        <div className="space-y-1 leading-relaxed">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-amber-500">Secured Executive Hub</h3>
          <p className="text-[11px] text-slate-400">
            Welcome to the GreenTrack AI Administrative Metrics Board. Review platform user volumes, aggregated carbon tonnage offsets, community challenge statistics, and popular green behaviors in our system.
          </p>
        </div>
      </div>

      {/* Grid: Global Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
        {/* Total Users on platform */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 text-left">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650">
            <Users size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider leading-none">Registered Cohorts</p>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white block" id="adm-users-count">
              {stats?.totalUsers} Users
            </span>
            <p className="text-[9px] text-slate-450">Active database records</p>
          </div>
        </div>

        {/* Global Saved Carbon emissions */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 text-left">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
            <Compass size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider leading-none">Agg Carbon Offset</p>
            <span className="font-display font-black text-2xl text-emerald-605 dark:text-emerald-400 block" id="adm-carbon-val">
              {stats?.totalSavedCarbonKg} Kg
            </span>
            <p className="text-[9px] text-slate-450">Mitigated emissions database-wide</p>
          </div>
        </div>

        {/* Challenge Completion Index */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 text-left">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
            <Trophy size={22} />
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider leading-none">Challenge Engagement</p>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white block" id="adm-engage-val">
              {stats?.challengeCompletionRate}%
            </span>
            <p className="text-[9px] text-slate-450">Completion index per capita</p>
          </div>
        </div>

        {/* Average Community Rating score */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 text-left">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-551 dark:text-amber-400">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider leading-none">Community Index</p>
            <span className="font-display font-black text-2xl text-amber-600 dark:text-amber-400 block" id="adm-comm-idx">
              {stats?.averageSustainabilityScore}%
            </span>
            <p className="text-[9px] text-slate-450">Average sustainability ratings</p>
          </div>
        </div>
      </div>

      {/* Grid: Popular Actions & Aggregated emissions diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category distribution checklist bar chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-2xl shadow-sm text-left flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
              <BarChart2 size={13} className="text-orange-500" />
              Aggregate Emission Paths
            </h4>
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400">Monthly aggregate tons</span>
          </div>

          <div className="space-y-4 pt-4 flex-grow flex flex-col justify-end">
            <div className="space-y-3">
              {stats?.globalEmissionsTrend.map((t, i) => {
                const maxWidth = 100;
                const widthPercent = Math.min((t.amount / 15) * 100, 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10.5px] font-bold">
                      <span className="text-slate-500">{t.month}</span>
                      <span className="text-slate-800 dark:text-slate-205 font-mono">{t.amount} Metric Tons CO₂</span>
                    </div>
                    <div className="h-2 w-full bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-550 rounded-full transition-all duration-1000"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popular eco behaviors distribution list */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-2xl shadow-sm text-left space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-802">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-850 dark:text-white flex items-center gap-1.5 leading-none">
              <TrendingDown size={14} className="text-emerald-500 animate-pulse" />
              Most Popular Green Actions
            </h4>
          </div>

          <div className="space-y-3">
            {stats?.popularChallenges.map((pc, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/55 transition text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="h-5 w-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 font-bold flex items-center justify-center text-[10.5px]">
                    {i + 1}
                  </span>
                  <span className="font-display font-bold text-slate-805 dark:text-white truncate max-w-[150px] sm:max-w-xs">{pc.title}</span>
                </div>
                <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                  {pc.count} Completers
                </span>
              </div>
            ))}

            {stats?.popularChallenges.length === 0 && (
              <p className="text-xs text-slate-500 italic py-4 text-center">No eco actions completed platform-wide yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
