/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Leaf, Moon, Sun, LogOut, Menu, X, Award, Shield, Cpu, BarChart3, Trophy, Globe, Calculator } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dark: boolean;
  toggleDark: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, activeTab, setActiveTab, dark, toggleDark, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Globe },
    { id: 'calculator', name: 'Calculator', icon: Calculator },
    { id: 'assistant', name: 'AI Coach', icon: Cpu },
    { id: 'challenges', name: 'Challenges', icon: Trophy },
    { id: 'analytics', name: 'Forecast', icon: BarChart3 },
    { id: 'leaderboard', name: 'Leaderboard', icon: Award },
  ];

  if (!user) {
    return (
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex justify-between items-center" id="public-header">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-forest-100 dark:bg-forest-900/40 text-forest-600 dark:text-forest-400">
              <Leaf size={20} />
            </span>
            <span className="font-display font-bold text-lg text-slate-850 dark:text-white tracking-tight">
              GreenTrack <span className="text-forest-500 font-sans font-light">AI</span>
            </span>
          </div>
          <button
            onClick={toggleDark}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>
    );
  }

  const currentLevel = Math.floor(user.points / 100) + 1;

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14" id="nav-container">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <span className="p-1.5 rounded-lg bg-forest-100 dark:bg-forest-900/40 text-forest-600 dark:text-forest-400">
                <Leaf size={20} className="animate-pulse" />
              </span>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                GreenTrack <span className="text-forest-500 font-sans font-light">AI</span>
              </span>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:flex space-x-1.5">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans tracking-tight transition-all ${
                      isActive
                        ? 'bg-natural-bg-muted text-natural-primary dark:bg-[#1B3022] dark:text-natural-lime'
                        : 'text-natural-text-sage hover:bg-natural-bg-muted/50 hover:text-natural-primary dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp size={14} />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              {/* Admin Hub Tab */}
              {user.isAdmin && (
                <button
                  id="nav-tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans tracking-tight transition-all ${
                    activeTab === 'admin'
                      ? 'bg-natural-toast text-natural-toast-text border border-natural-toast-border'
                      : 'text-natural-toast-text dark:text-amber-400 hover:bg-natural-toast/40'
                  }`}
                >
                  <Shield size={14} />
                  <span>Admin Hub</span>
                </button>
              )}
            </div>
          </div>

          {/* User Score, DarkMode, & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Gamification Stats */}
            <div className="flex items-center space-x-3 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                <Trophy size={13} className="text-amber-500 animate-bounce" />
                <span>Lvl {currentLevel}</span>
              </span>
              <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
              <span className="text-forest-600 dark:text-forest-400">{user.points} pts</span>
            </div>

            {/* Sustainability Rating Badge */}
            <div className="flex items-center space-x-1 bg-forest-100 dark:bg-forest-900/40 text-forest-700 dark:text-forest-400 py-1 px-2.5 rounded-full text-xs font-bold leading-none">
              <span className="uppercase text-[9px] tracking-widest text-forest-500 dark:text-forest-400/70 mr-1">Score:</span>
              <span>{user.score}</span>
            </div>

            {/* Dark mode toggler */}
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme mode"
              id="theme-toggler"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              title="Sign out of platform"
              id="logout-button"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-forest-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconComp size={15} />
                <span>{item.name}</span>
              </button>
            );
          })}

          {user.isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
              }`}
            >
              <Shield size={15} />
              <span>Admin Hub</span>
            </button>
          )}

          <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2" />

          {/* Gamification Indicator info */}
          <div className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Level {currentLevel} • {user.points} pts</span>
            <span className="bg-forest-100 dark:bg-forest-900/40 text-forest-700 dark:text-forest-400 py-1 px-2 rounded-full font-bold">
              Score: {user.score}%
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
