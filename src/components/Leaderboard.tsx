/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Trophy, Bookmark, RefreshCw, Crown, Users } from 'lucide-react';
import { LeaderboardEntry, User } from '../types';

interface LeaderboardProps {
  token: string | null;
  currentUser: User;
}

export default function Leaderboard({ token, currentUser }: LeaderboardProps) {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await fetch('/api/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync platform leaderboard.');
      }
      setList(data.leaderboard || []);
    } catch (err: any) {
      setErrorText(err.message || 'Connecting to leaderboard layer failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4" id="leaderboard-loading">
        <RefreshCw size={24} className="animate-spin text-forest-550" />
        <p className="text-xs text-slate-500 font-mono">Syncing global green leaderboards...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="p-8 border border-red-200 bg-red-50 dark:bg-red-955/20 rounded-2xl text-red-651 text-center" id="leaderboard-err">
        <p className="text-xs font-semibold">{errorText}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition"
        >
          Reload Standings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="leaderboard-workspace">
      {/* Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-start space-x-3.5">
        <Crown size={22} className="text-amber-500 mt-0.5 flex-shrink-0 animate-bounce" />
        <div className="space-y-1 text-left leading-relaxed">
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-850 dark:text-white">Active Community Champions</h3>
          <p className="text-[11px] text-slate-500">
            See how your carbon achievements rank relative to other warriors! Rankings update as daily eco tasks are recorded and score ratings increase.
          </p>
        </div>
      </div>

      {/* Standings list structure */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden" id="leaderboard-card">
        {/* Table header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center space-x-6">
            <span className="w-8 text-center">Rank</span>
            <span>Eco Warrior Name</span>
          </div>
          <div className="flex space-x-12 pr-4">
            <span className="w-16 text-center">Rating</span>
            <span className="w-20 text-center">Cumulative XP</span>
          </div>
        </div>

        {/* Rows list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800" id="leaderboard-list">
          {list.map((u, index) => {
            const isSelf = u.id === currentUser.id;
            const rank = index + 1;
            
            // Crown/Award badges for podium positions
            let rankElement = <span className="font-mono font-bold text-slate-500 text-xs">{rank}</span>;
            if (rank === 1) {
              rankElement = <Crown size={18} className="text-amber-500 mx-auto" />;
            } else if (rank === 2) {
              rankElement = <Trophy size={16} className="text-slate-400 mx-auto" />;
            } else if (rank === 3) {
              rankElement = <Trophy size={16} className="text-amber-653 mx-auto" />;
            }

            return (
              <div
                key={u.id}
                className={`px-6 py-3.5 flex justify-between items-center transition ${
                  isSelf ? 'bg-forest-100/30 dark:bg-forest-950/20 font-bold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/30'
                }`}
                id={`leaderboard-row-${u.id}`}
              >
                <div className="flex items-center space-x-6 text-left">
                  <div className="w-8 text-center flex items-center justify-center">
                    {rankElement}
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs ${isSelf ? 'text-forest-700 dark:text-forest-400 font-extrabold' : 'text-slate-800 dark:text-white'}`}>
                      {u.name} {isSelf && <span className="text-[9px] bg-forest-500 text-white rounded px-1 ml-1 py-0.2 font-normal">YOU</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal leading-none capitalize">
                      {rank <= 3 ? 'Elite Ambassador' : 'Carbon Fighter'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-12 pr-4 text-xs font-bold leading-none">
                  {/* Score */}
                  <div className="w-16 text-center flex items-center justify-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${
                      u.score >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                      u.score >= 50 ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/20' :
                      'bg-red-50 text-red-500 dark:bg-red-950/20'
                    }`}>
                      {u.score}%
                    </span>
                  </div>
                  {/* Points */}
                  <span className="w-20 text-center font-mono font-extrabold text-slate-800 dark:text-white self-center text-sm">
                    {u.points} XP
                  </span>
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Users size={32} className="mx-auto text-slate-300" />
              <p className="text-xs">No active leaderboard profiles loaded. Go complete standard tasks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
