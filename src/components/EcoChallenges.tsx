/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, CheckCircle, Zap, ShieldAlert, Award, Star, ArrowUpRight, Flame, Hourglass } from 'lucide-react';
import { Challenge, User } from '../types';

interface EcoChallengesProps {
  user: User;
  challenges: Challenge[];
  token: string | null;
  onChallengeCompleted: (updatedUser: User, updatedChallenges: Challenge[], badgeUnlocked?: string) => void;
}

export default function EcoChallenges({ user, challenges, token, onChallengeCompleted }: EcoChallengesProps) {
  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [unlockedAlert, setUnlockedAlert] = useState<{ title: string; icon: string } | null>(null);

  // Gamification stats
  const currentPoints = user.points;
  const currentLevel = Math.floor(currentPoints / 100) + 1;
  const nextLevelPoints = currentLevel * 100;
  const prevLevelPoints = (currentLevel - 1) * 100;
  const levelProgress = ((currentPoints - prevLevelPoints) / 100) * 100;
  const remainingPoints = nextLevelPoints - currentPoints;

  // Complete a challenge
  const handleComplete = async (challengeId: string) => {
    setLoadingChallengeId(challengeId);
    setErrorText(null);

    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error, could not complete challenge.');
      }

      // If a badge unlocked, show brief toast
      if (data.badgeUnlocked) {
        let badgeName = 'New Achievement';
        let badgeIcon = '🏆';
        if (data.badgeUnlocked === 'eco_spark') { badgeName = 'Eco Spark'; badgeIcon = '✨'; }
        else if (data.badgeUnlocked === 'green_champion') { badgeName = 'Green Champion'; badgeIcon = '👑'; }
        else if (data.badgeUnlocked === 'carbon_crusher') { badgeName = 'Carbon Crusher'; badgeIcon = '💥'; }

        setUnlockedAlert({ title: badgeName, icon: badgeIcon });
        setTimeout(() => setUnlockedAlert(null), 4000);
      }

      // Trigger parents callbacks
      // Refetch full challenges after points logging
      const chalRes = await fetch('/api/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chalData = await chalRes.json();

      onChallengeCompleted(data.user, chalData.challenges || [], data.badgeUnlocked);
    } catch (err: any) {
      setErrorText(err.message || 'Action failed.');
    } finally {
      setLoadingChallengeId(null);
    }
  };

  return (
    <div className="space-y-6" id="challenges-view-panel">
      {/* Level-up Progress Banner - styled as the warm toast widget */}
      <div className="p-6 bg-natural-toast border border-natural-toast-border rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
        {/* Large Level Ring */}
        <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-natural-primary text-white flex flex-col items-center justify-center font-display shadow-lg shadow-natural-primary/15 relative overflow-hidden">
          <Star className="absolute opacity-10 text-white scale-150" />
          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Level</span>
          <span className="text-3xl font-black mt-0.5">{currentLevel}</span>
        </div>

        {/* Level XP bar */}
        <div className="flex-grow space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-1">
            <h2 className="font-display font-extrabold text-natural-toast-text text-sm">Active Eco XP Level Tracks</h2>
            <p className="text-[11px] text-natural-toast-text-alt font-bold font-mono">
              <span className="font-bold text-natural-primary">{user.points} XP</span> / {nextLevelPoints} XP • <span className="text-natural-text-sage">{remainingPoints} XP to Lvl {currentLevel + 1}</span>
            </p>
          </div>

          <div className="relative h-3 w-full bg-white/50 border border-natural-toast-border/40 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-natural-primary to-natural-mid-green rounded-full transition-all duration-1000"
              style={{ width: `${levelProgress}%` }}
              id="xp-progress-bar-val"
            />
          </div>
          <p className="text-[11px] text-natural-toast-text-alt italic">
            Complete daily green tasks to earn XP points! Each completion shaves your footprint and brings new badges.
          </p>
        </div>
      </div>

      {unlockedAlert && (
          <div className="p-4 bg-gradient-to-r from-natural-primary to-natural-alt text-white border border-natural-lime rounded-2xl flex items-center justify-between shadow-lg animate-bounce" id="achievement-unlocked-toast">
          <div className="flex items-center space-x-3.5">
            <span className="text-3xl leading-none">{unlockedAlert.icon}</span>
            <div className="space-y-0.5 text-left">
              <span className="text-[11px] font-bold text-natural-lime tracking-wider block uppercase font-mono">Trophy Milestone Reached!</span>
              <span className="font-display font-extrabold text-sm block">Unlocked Badge: {unlockedAlert.title}</span>
            </div>
          </div>
          <Star size={18} className="text-[#FAF3DD] animate-spin" />
        </div>
      )}

      {errorText && (
        <div className="p-3 bg-[#BC4749]/10 text-[#BC4749] text-xs rounded-xl flex items-center space-x-2 border border-[#BC4749]/20">
          <ShieldAlert size={14} />
          <span>{errorText}</span>
        </div>
      )}

      {/* Grid: All active Challenges */}
      <div className="space-y-3.5">
        <h3 className="font-display font-bold text-natural-text-dark dark:text-white tracking-tight text-sm self-start">Daily Ecological Tasks</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="challenges-grid">
          {challenges.map((c) => {
            const isCompleted = !!c.completedAt;
            return (
              <div
                key={c.id}
                className={`p-4 border rounded-2xl text-left bg-white dark:bg-slate-900 flex justify-between items-start gap-3 transition shadow-sm ${
                  isCompleted
                    ? 'border-natural-lime/50 bg-natural-bg-muted/15'
                    : 'border-natural-bg-muted dark:border-[#1E3020] hover:border-natural-bg-muted/80 dark:hover:border-slate-700 hover:shadow-md'
                }`}
                id={`challenge-card-${c.id}`}
              >
                <div className="space-y-2 flex-grow max-w-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                      c.category === 'Transport' ? 'bg-[#4A7C59]/10 text-[#4A7C59]' :
                      c.category === 'Food' ? 'bg-[#386641]/10 text-[#386641]' :
                      c.category === 'Energy' ? 'bg-[#A7C957]/20 text-[#6A994E]' :
                      'bg-natural-toast text-natural-toast-text'
                    }`}>
                      {c.category}
                    </span>
                    <span className="text-[10px] text-natural-mid-green font-bold font-mono">+{c.points} XP</span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-display font-bold text-xs text-natural-text-dark dark:text-white">{c.title}</h4>
                    <p className="text-[11px] text-natural-text-sage dark:text-gray-400 leading-normal">{c.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(c.id)}
                  disabled={isCompleted || loadingChallengeId === c.id}
                  id={`complete-btn-${c.id}`}
                  className={`flex-shrink-0 p-1.5 rounded-full border transition cursor-pointer ${
                    isCompleted
                      ? 'bg-natural-primary border-natural-primary text-white cursor-not-allowed shadow-none'
                      : loadingChallengeId === c.id
                      ? 'border-natural-bg-muted animate-spin'
                      : 'border-natural-bg-muted text-natural-text-sage hover:bg-natural-bg-muted/50 hover:text-natural-primary'
                  }`}
                  title={isCompleted ? 'Challenge completed today!' : 'Mark challenge completed'}
                >
                  <CheckCircle size={17} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
