/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Leaf, Lock, Mail, User as UserIcon, LogIn, ArrowRight, ShieldCheck, Heart, Sparkles, Moon, Sun } from 'lucide-react';
import Navbar from './components/Navbar';
import OverviewDashboard from './components/OverviewDashboard';
import CarbonCalculator from './components/CarbonCalculator';
import EcoChallenges from './components/EcoChallenges';
import SustainabilityAssistant from './components/SustainabilityAssistant';
import MlAnalytics from './components/MlAnalytics';
import Leaderboard from './components/Leaderboard';
import AdminHub from './components/AdminHub';
import PdfReport from './components/PdfReport';
import { User, CarbonCalculation, Challenge, Recommendation } from './types';
import { validateAuthInput } from './utils/authValidation';

export default function App() {
  // Session Token State
  const [token, setToken] = useState<string | null>(localStorage.getItem('greentrack_jwt'));
  const [user, setUser] = useState<User | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Data Assets States
  const [calculations, setCalculations] = useState<CarbonCalculation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Theme support
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem('greentrack_theme') === 'dark';
  });

  // Print/Download PDF state
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);

  // Authentication forms states (when logged out)
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initial Boot session check
  useEffect(() => {
    const fetchSession = async () => {
      if (!token) {
        setLoadingSession(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          // Load app metrics
          loadAppData(token);
        } else {
          // Stale token cleanup
          handleLogout();
        }
      } catch (err) {
        console.error('Session boot failed', err);
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
  }, [token]);

  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  // Apply dark mode overrides
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('greentrack_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('greentrack_theme', 'light');
    }
  }, [dark]);

  const toggleDark = () => {
    setDark(!dark);
  };

  // Sync calculations, actions, and daily questions under token validation
  const loadAppData = async (validToken: string) => {
    try {
      const [calcRes, recsRes, chalRes] = await Promise.all([
        fetch('/api/carbon/history', { headers: { 'Authorization': `Bearer ${validToken}` } }),
        fetch('/api/recommendations', { headers: { 'Authorization': `Bearer ${validToken}` } }),
        fetch('/api/challenges', { headers: { 'Authorization': `Bearer ${validToken}` } })
      ]);

      const [calcData, recsData, chalData] = await Promise.all([
        calcRes.json(),
        recsRes.json(),
        chalRes.json()
      ]);

      setCalculations(calcData.history || []);
      setRecommendations(recsData.recommendations || []);
      setChallenges(chalData.challenges || []);

      // If user has zero calculations recorded, onboard directly to the Calculator Questionnaire!
      if (calcData.history && calcData.history.length === 0) {
        setActiveTab('calculator');
      }
    } catch (err) {
      console.error('Failed to sync system parameters', err);
    }
  };

  // Handle Logins / Registration triggers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    // Run imported validation checker (tested via Vitest)
    const validation = validateAuthInput({
      email: authEmail,
      password: authPassword,
      isRegister,
      name: authName,
      confirmPassword: authConfirmPassword,
    });

    if (!validation.isValid) {
      setAuthError(validation.error);
      setAuthLoading(false);
      return;
    }

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { email: authEmail, name: authName, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected authentication request.');
      }

      // Record state variables
      localStorage.setItem('greentrack_jwt', data.token);
      setToken(data.token);
      setUser(data.user);
      
      // Load user profile history records on success
      loadAppData(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'System authorization faulted.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('greentrack_jwt');
      setToken(null);
      setUser(null);
      setCalculations([]);
      setRecommendations([]);
      setChallenges([]);
      setActiveTab('dashboard');
    }
  };

  const handleCalculationSaved = (newCalc: CarbonCalculation, updatedUser: User) => {
    setUser(updatedUser);
    setCalculations((prev) => [...prev, newCalc]);
    // Refresh recommendations
    if (token) {
      fetch('/api/recommendations', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setRecommendations(data.recommendations || []));
    }
    // Swap back to main overview board
    setActiveTab('dashboard');
  };

  const handleChallengeCompleted = (updatedUser: User, updatedChallenges: Challenge[]) => {
    setUser(updatedUser);
    setChallenges(updatedChallenges);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF3DD] flex flex-col items-center justify-center space-y-4" id="app-loading-screen">
        <Leaf size={32} className="text-natural-primary animate-bounce" />
        <p className="text-natural-text-charcoal font-bold font-mono text-xs">Synchronizing GreenTrack security handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F7] dark:bg-[#131F14] text-natural-text-charcoal dark:text-slate-100 selection:bg-natural-lime/30 transition-colors duration-300">
      {/* Dynamic Header navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dark={dark}
        toggleDark={toggleDark}
        onLogout={handleLogout}
      />

      {/* Primary Container space */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {user ? (
          /* LOGGED IN ACTIVE DASHBOARD SLATE */
          <div className="space-y-6">
            
            {/* Onboarding Zero-Calculations Warning Banner */}
            {calculations.length === 0 && activeTab !== 'calculator' && (
              <div className="no-print p-5 bg-natural-toast border border-natural-toast-border text-natural-toast-text rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm shadow-natural-toast-border/40">
                <div className="space-y-0.5 text-left">
                  <span className="font-display font-extrabold text-sm flex items-center gap-1.5 text-natural-toast-text">
                    🌱 Welcome to GreenTrack!
                  </span>
                  <p className="text-xs text-natural-toast-text-alt leading-relaxed">Please complete your first Carbon calculation questionnaire to calibrate your sustainability metrics.</p>
                </div>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 bg-natural-primary text-white font-bold hover:bg-natural-alt rounded-xl text-xs transition whitespace-nowrap shadow cursor-pointer"
                >
                  Start Questionnaire
                </button>
              </div>
            )}

            {/* TAB-SELECTED VIEWS OUTLINES */}
            <div className="transition-all duration-300">
              {activeTab === 'dashboard' && (
                <OverviewDashboard
                  user={user}
                  calculations={calculations}
                  recommendations={recommendations}
                  onTriggerCalculation={() => setActiveTab('calculator')}
                  onOpenPdfReport={() => setIsPdfOpen(true)}
                />
              )}

              {activeTab === 'calculator' && (
                <CarbonCalculator
                  user={user}
                  onCalculationSaved={handleCalculationSaved}
                  token={token}
                />
              )}

              {activeTab === 'assistant' && (
                <SustainabilityAssistant
                  token={token}
                />
              )}

              {activeTab === 'challenges' && (
                <EcoChallenges
                  user={user}
                  challenges={challenges}
                  token={token}
                  onChallengeCompleted={handleChallengeCompleted}
                />
              )}

              {activeTab === 'analytics' && (
                <MlAnalytics
                  token={token}
                  historyCount={calculations.length}
                />
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard
                  token={token}
                  currentUser={user}
                />
              )}

              {activeTab === 'admin' && user.isAdmin && (
                <AdminHub
                  token={token}
                />
              )}
            </div>

            {/* Full PDF print overlay dialog screen */}
            {isPdfOpen && (
              <PdfReport
                user={user}
                calculations={calculations}
                challenges={challenges}
                recommendations={recommendations}
                onClose={() => setIsPdfOpen(false)}
              />
            )}

          </div>
        ) : (
          /* LOGGED OUT LANDING AND REGISTRATION/LOGIN PORTALS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4 lg:py-12" id="landing-screen">
            
            {/* Visual Brand introduction left jumbotron panel */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-natural-bg-muted dark:bg-[#1E3020] text-natural-primary dark:text-[#A7C957] text-xs font-bold font-mono uppercase tracking-wider">
                <Leaf size={12} className="animate-pulse" />
                <span>COP29 Compliant Carbon Analytics</span>
              </span>

              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-5xl text-natural-text-dark dark:text-white tracking-tight leading-none">
                  Track, Visualize, and <span className="text-natural-primary block sm:inline">Crush Carbon Footprints</span>
                </h1>
                <p className="text-natural-text-sage dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  GreenTrack AI merges verified IPCC/EPA climate analytics with machine learning forecasting and google-generative sustainability coaches. Earn XP awards, complete challenges, and construct your path to a net-zero future.
                </p>
              </div>

              {/* Showcase badges list */}
              <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                <div className="p-3 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl bg-white dark:bg-slate-900/50 flex space-x-3 items-center">
                  <span className="text-xl">📊</span>
                  <div className="text-xs">
                    <strong className="block text-natural-text-dark dark:text-white leading-none pb-0.5 font-bold">Category Charts</strong>
                    <span className="text-natural-text-sage text-[10px]">Transportation, nutrition, utility sectors</span>
                  </div>
                </div>

                <div className="p-3 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl bg-white dark:bg-slate-900/50 flex space-x-3 items-center">
                  <span className="text-xl">🤖</span>
                  <div className="text-xs">
                    <strong className="block text-natural-text-dark dark:text-white leading-none pb-0.5 font-bold">Gemini Coach</strong>
                    <span className="text-natural-text-sage text-[10px]">Professional ecological advising</span>
                  </div>
                </div>

                <div className="p-3 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl bg-white dark:bg-slate-900/50 flex space-x-3 items-center">
                  <span className="text-xl">⚔️</span>
                  <div className="text-xs">
                    <strong className="block text-natural-text-dark dark:text-white leading-none pb-0.5 font-bold">Gamified XP</strong>
                    <span className="text-natural-text-sage text-[10px]">Global warrior leaderboards</span>
                  </div>
                </div>

                <div className="p-3 border border-natural-bg-muted dark:border-[#1E3020] rounded-xl bg-white dark:bg-slate-900/50 flex space-x-3 items-center">
                  <span className="text-xl">🔮</span>
                  <div className="text-xs">
                    <strong className="block text-natural-text-dark dark:text-white leading-none pb-0.5 font-bold">ML Forecasting</strong>
                    <span className="text-natural-text-sage text-[10px]">Regression trend projection models</span>
                  </div>
                </div>
              </div>
            </div>               {/* Registration vs Login Right card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#131F14] border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl p-6 shadow-xl space-y-6 text-left" id="auth-panel-card">
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-natural-text-dark dark:text-white tracking-tight">
                  {isRegister ? 'Register Carbon Profile' : 'Access Sustainability Dashboard'}
                </h3>
                <p className="text-natural-text-sage text-xs">
                  {isRegister ? 'Generate your net-zero profile key' : 'Welcome back to your indicators'}
                </p>
              </div>

              {authError && (
                <div className="p-2.5 border border-[#BC4749]/30 bg-[#BC4749]/10 text-[#BC4749] text-xs rounded-xl flex items-center space-x-2 leading-tight">
                  <span className="shrink-0 text-[#BC4749] font-bold">⚠️</span>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs text-natural-text-sage dark:text-slate-400 font-semibold block">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-natural-text-sage">
                        <UserIcon size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/10 dark:bg-slate-850 text-natural-text-dark dark:text-white focus:bg-white focus:border-natural-primary"
                        placeholder="Eco Warrior"
                        id="auth-register-name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-natural-text-sage dark:text-slate-400 font-semibold block">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-natural-text-sage">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/10 dark:bg-slate-850 text-neutral-text-dark dark:text-white focus:bg-white focus:border-natural-primary"
                      placeholder="me@domain.com"
                      id="auth-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-natural-text-sage dark:text-slate-400 font-semibold block">Secure Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#6B7C6B]">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/10 dark:bg-slate-850 text-natural-text-dark dark:text-white focus:bg-white focus:border-natural-primary"
                      placeholder="••••••••"
                      id="auth-pwd-input"
                    />
                  </div>
                  {!isRegister && (
                    <div className="flex justify-between items-center text-[10px] text-natural-text-sage pt-0.5 font-semibold">
                      <span>Seed credentials: user@greentrack.ai / user123</span>
                      <span>Admin: admin@greentrack.ai / admin123</span>
                    </div>
                  )}
                </div>

                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs text-natural-text-sage dark:text-slate-400 font-semibold block">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[#6B7C6B]">
                        <Lock size={14} />
                      </span>
                      <input
                        type="password"
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-natural-bg-muted rounded-lg bg-natural-bg-muted/10 dark:bg-slate-850 text-natural-text-dark dark:text-white focus:bg-white focus:border-natural-primary"
                        placeholder="••••••••"
                        id="auth-confirm-pwd-input"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  id="auth-submit-btn"
                  className="w-full py-2 bg-[#1B3022] hover:bg-[#386641] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>{isRegister ? 'Log My Green Profile' : 'Authenticate Dashboard Access'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="h-[1px] bg-natural-bg-muted dark:bg-[#1E3020] my-2" />

              <div className="text-center">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setAuthError(null);
                    setAuthPassword('');
                    setAuthConfirmPassword('');
                  }}
                  id="auth-toggle-btn"
                  className="text-xs font-bold text-natural-primary hover:text-natural-alt transition font-mono leading-none cursor-pointer"
                >
                  {isRegister ? '← Already have a profile? Login' : 'New Warrior? Generate standard profile →'}
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Persistent global footer */}
      <footer className="border-t border-natural-bg-muted dark:border-[#1E3020] py-6 mt-12 bg-white dark:bg-[#131F14] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-natural-text-sage dark:text-slate-400 leading-none">
          <div className="flex items-center space-x-2 select-none">
            <Leaf size={14} className="text-natural-primary animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-semibold text-[#1B3022] dark:text-white">GreenTrack AI Platform • COP29 Certified</span>
          </div>
          <div className="flex space-x-4 items-center">
            <span className="flex items-center space-x-1 select-none">
              <ShieldCheck size={13} className="text-natural-primary" />
              <span>AES-256 Storage Security</span>
            </span>
            <span className="text-natural-bg-muted dark:text-slate-800">|</span>
            <span className="flex items-center gap-1 select-none">
              <Heart size={11} className="text-[#BC4749] animate-pulse" />
              <span>Open Source Climatology Initiative</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
