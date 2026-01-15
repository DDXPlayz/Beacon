// ============================================
// BEACON APP - Complete Single File Build
// A gamified good deeds tracking application
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, User, Compass, Heart, Star, Zap, Sun, Moon, Flame, Target,
  Coins, TrendingUp, Plus, CheckCircle, Award, Clock, Trophy, Gift,
  Sprout, Gem, Calendar, CalendarDays, Medal, Crown, Lock, X, Check,
  ChevronDown, ChevronUp, Image, MessageSquare, History, Camera, Trash2
} from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

interface UserData {
  username: string;
  avatar: string;
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastDeedDate: string | null;
  totalDeeds: number;
  earnedBadges: string[];
  activities: Activity[];
  challengeProgress: Record<string, number>;
  claimedChallenges: string[];
  availableChallenges: string[];
}

interface Activity {
  id: string;
  description: string;
  category: string;
  points: number;
  date: string;
  reflection?: string;
  imageUrl?: string;
  type: 'deed' | 'challenge';
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: number;
  type: 'deeds' | 'streak' | 'points' | 'level';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  reward: number;
  category?: string;
  daysRemaining?: number;
}

// ============================================
// GAME DATA & CONSTANTS
// ============================================

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦋', '🌟'];

const AVATAR_ICONS = [
  { icon: Sparkles, color: 'from-blue-500 to-purple-600' },
  { icon: Compass, color: 'from-cyan-500 to-blue-600' },
  { icon: Heart, color: 'from-pink-500 to-rose-600' },
  { icon: Star, color: 'from-yellow-500 to-orange-600' },
  { icon: Zap, color: 'from-violet-500 to-purple-600' },
  { icon: Sun, color: 'from-amber-500 to-yellow-600' },
  { icon: Moon, color: 'from-indigo-500 to-blue-600' },
  { icon: Flame, color: 'from-orange-500 to-red-600' },
  { icon: Target, color: 'from-emerald-500 to-teal-600' },
  { icon: User, color: 'from-slate-500 to-gray-600' },
];

const DEED_CATEGORIES = [
  'Helping Others',
  'Environmental',
  'Kindness',
  'Community',
  'Learning',
  'Health',
  'Family',
  'Friendship',
];

const RANKS = [
  { level: 1, name: 'Newcomer', minXp: 0 },
  { level: 5, name: 'Helper', minXp: 500 },
  { level: 10, name: 'Champion', minXp: 1500 },
  { level: 15, name: 'Hero', minXp: 3000 },
  { level: 20, name: 'Legend', minXp: 5000 },
  { level: 25, name: 'Guardian', minXp: 8000 },
];

const BADGES: Badge[] = [
  { id: 'first-deed', name: 'First Step', icon: 'Sprout', description: 'Log your first good deed', requirement: 1, type: 'deeds' },
  { id: 'five-deeds', name: 'Getting Started', icon: 'Star', description: 'Complete 5 good deeds', requirement: 5, type: 'deeds' },
  { id: 'ten-deeds', name: 'Consistent', icon: 'Flame', description: 'Complete 10 good deeds', requirement: 10, type: 'deeds' },
  { id: 'twenty-five-deeds', name: 'Dedicated', icon: 'Gem', description: 'Complete 25 good deeds', requirement: 25, type: 'deeds' },
  { id: 'fifty-deeds', name: 'Committed', icon: 'Trophy', description: 'Complete 50 good deeds', requirement: 50, type: 'deeds' },
  { id: 'streak-3', name: 'On Fire', icon: 'Zap', description: '3 day streak', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', icon: 'Calendar', description: '7 day streak', requirement: 7, type: 'streak' },
  { id: 'streak-14', name: 'Fortnight', icon: 'CalendarDays', description: '14 day streak', requirement: 14, type: 'streak' },
  { id: 'level-5', name: 'Rising Star', icon: 'Sparkles', description: 'Reach level 5', requirement: 5, type: 'level' },
  { id: 'level-10', name: 'Champion', icon: 'Medal', description: 'Reach level 10', requirement: 10, type: 'level' },
  { id: 'points-500', name: 'Collector', icon: 'Coins', description: 'Earn 500 points', requirement: 500, type: 'points' },
  { id: 'points-1000', name: 'Wealthy', icon: 'Crown', description: 'Earn 1000 points', requirement: 1000, type: 'points' },
];

const ALL_CHALLENGES: Challenge[] = [
  { id: 'daily-kindness', title: 'Daily Kindness', description: 'Log 3 kindness deeds this week', targetCount: 3, reward: 50, category: 'Kindness', daysRemaining: 7 },
  { id: 'eco-warrior', title: 'Eco Warrior', description: 'Complete 5 environmental good deeds', targetCount: 5, reward: 75, category: 'Environmental', daysRemaining: 14 },
  { id: 'helper-hero', title: 'Helper Hero', description: 'Help 4 people this week', targetCount: 4, reward: 60, category: 'Helping Others', daysRemaining: 7 },
  { id: 'community-builder', title: 'Community Builder', description: 'Do 3 community deeds', targetCount: 3, reward: 55, category: 'Community', daysRemaining: 10 },
  { id: 'learning-quest', title: 'Learning Quest', description: 'Complete 4 learning-related deeds', targetCount: 4, reward: 65, category: 'Learning', daysRemaining: 10 },
  { id: 'health-hero', title: 'Health Hero', description: 'Log 3 health-positive deeds', targetCount: 3, reward: 45, category: 'Health', daysRemaining: 7 },
  { id: 'family-first', title: 'Family First', description: 'Do 5 family deeds', targetCount: 5, reward: 70, category: 'Family', daysRemaining: 14 },
  { id: 'friendship-goals', title: 'Friendship Goals', description: 'Help friends 4 times', targetCount: 4, reward: 55, category: 'Friendship', daysRemaining: 10 },
];

const DEFAULT_CHALLENGES = ['daily-kindness', 'eco-warrior', 'helper-hero'];
const XP_PER_LEVEL = 150;
const BASE_POINTS_PER_DEED = 10;
const STORAGE_KEY = 'gooddeeds_user_data';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getXpForNextLevel(currentXp: number): { current: number; required: number } {
  const level = calculateLevel(currentXp);
  const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  return { current: xpInCurrentLevel, required: XP_PER_LEVEL };
}

function getRank(level: number): string {
  const rank = [...RANKS].reverse().find(r => level >= r.level);
  return rank?.name || 'Newcomer';
}

function checkBadgeUnlocks(userData: UserData): string[] {
  const newBadges: string[] = [];
  
  BADGES.forEach(badge => {
    if (userData.earnedBadges.includes(badge.id)) return;
    
    let earned = false;
    switch (badge.type) {
      case 'deeds':
        earned = userData.totalDeeds >= badge.requirement;
        break;
      case 'streak':
        earned = userData.streak >= badge.requirement;
        break;
      case 'level':
        earned = userData.level >= badge.requirement;
        break;
      case 'points':
        earned = userData.points >= badge.requirement;
        break;
    }
    
    if (earned) newBadges.push(badge.id);
  });
  
  return newBadges;
}

function getBadgeProgress(badge: Badge, userData: UserData): number {
  switch (badge.type) {
    case 'deeds':
      return Math.min(userData.totalDeeds / badge.requirement, 1);
    case 'streak':
      return Math.min(userData.streak / badge.requirement, 1);
    case 'level':
      return Math.min(userData.level / badge.requirement, 1);
    case 'points':
      return Math.min(userData.points / badge.requirement, 1);
    default:
      return 0;
  }
}

function getBadgeCurrentValue(badge: Badge, userData: UserData): number {
  switch (badge.type) {
    case 'deeds':
      return userData.totalDeeds;
    case 'streak':
      return userData.streak;
    case 'level':
      return userData.level;
    case 'points':
      return userData.points;
    default:
      return 0;
  }
}

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function getNextAvailableChallenge(claimedChallenges: string[], availableChallenges: string[]): string | null {
  const allIds = ALL_CHALLENGES.map(c => c.id);
  const usedIds = new Set([...claimedChallenges, ...availableChallenges]);
  const available = allIds.filter(id => !usedIds.has(id));
  return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

function createDefaultUser(username: string, avatar: string): UserData {
  return {
    username,
    avatar,
    points: 0,
    xp: 0,
    level: 1,
    streak: 0,
    lastDeedDate: null,
    totalDeeds: 0,
    earnedBadges: [],
    activities: [],
    challengeProgress: {},
    claimedChallenges: [],
    availableChallenges: DEFAULT_CHALLENGES,
  };
}

// ============================================
// CUSTOM HOOK: useUserData
// ============================================

function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserData;
        if (parsed.lastDeedDate) {
          if (!isToday(parsed.lastDeedDate) && !isYesterday(parsed.lastDeedDate)) {
            parsed.streak = 0;
          }
        }
        if (!parsed.claimedChallenges) {
          parsed.claimedChallenges = [];
        }
        if (!parsed.availableChallenges) {
          parsed.availableChallenges = DEFAULT_CHALLENGES;
        }
        parsed.activities = parsed.activities.map(a => ({
          ...a,
          type: a.type || 'deed'
        }));
        setUserData(parsed);
      } catch {
        setUserData(null);
      }
    }
    setIsLoading(false);
  }, []);

  const saveUser = useCallback((data: UserData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUserData(data);
  }, []);

  const createUser = useCallback((username: string, avatar: string) => {
    const newUser = createDefaultUser(username, avatar);
    saveUser(newUser);
    return newUser;
  }, [saveUser]);

  const logDeed = useCallback((category: string, description: string, reflection?: string, imageUrl?: string) => {
    if (!userData) return;

    const now = new Date().toISOString();
    const pointsEarned = BASE_POINTS_PER_DEED + Math.floor(Math.random() * 5);
    const xpEarned = 20 + Math.floor(Math.random() * 10);

    const newActivity: Activity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      category,
      points: pointsEarned,
      date: now,
      reflection,
      imageUrl,
      type: 'deed',
    };

    let newStreak = userData.streak;
    if (!userData.lastDeedDate || !isToday(userData.lastDeedDate)) {
      if (userData.lastDeedDate && isYesterday(userData.lastDeedDate)) {
        newStreak += 1;
      } else if (!userData.lastDeedDate || !isYesterday(userData.lastDeedDate)) {
        newStreak = 1;
      }
    }

    const newChallengeProgress = { ...userData.challengeProgress };
    if (category) {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
      newChallengeProgress[categoryKey] = (newChallengeProgress[categoryKey] || 0) + 1;
    }

    const newXp = userData.xp + xpEarned;
    const newLevel = calculateLevel(newXp);
    const newPoints = userData.points + pointsEarned;
    const newTotalDeeds = userData.totalDeeds + 1;

    const updatedUser: UserData = {
      ...userData,
      points: newPoints,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastDeedDate: now,
      totalDeeds: newTotalDeeds,
      activities: [newActivity, ...userData.activities].slice(0, 50),
      challengeProgress: newChallengeProgress,
    };

    const newBadges = checkBadgeUnlocks(updatedUser);
    updatedUser.earnedBadges = [...updatedUser.earnedBadges, ...newBadges];

    saveUser(updatedUser);
    return { pointsEarned, xpEarned, newBadges };
  }, [userData, saveUser]);

  const claimChallenge = useCallback((challengeId: string) => {
    if (!userData) return null;

    const challenge = ALL_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return null;

    const now = new Date().toISOString();
    
    const challengeActivity: Activity = {
      id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `Completed challenge: ${challenge.title}`,
      category: challenge.category || 'Challenge',
      points: challenge.reward,
      date: now,
      type: 'challenge',
    };

    const nextChallengeId = getNextAvailableChallenge(
      [...userData.claimedChallenges, challengeId],
      userData.availableChallenges.filter(id => id !== challengeId)
    );

    const newAvailableChallenges = userData.availableChallenges.filter(id => id !== challengeId);
    if (nextChallengeId) {
      newAvailableChallenges.push(nextChallengeId);
    }

    const newChallengeProgress = { ...userData.challengeProgress };
    if (challenge.category) {
      const categoryKey = challenge.category.toLowerCase().replace(/\s+/g, '-');
      newChallengeProgress[categoryKey] = 0;
    }

    const newXp = userData.xp + Math.floor(challenge.reward / 2);
    const newLevel = calculateLevel(newXp);

    const updatedUser: UserData = {
      ...userData,
      points: userData.points + challenge.reward,
      xp: newXp,
      level: newLevel,
      claimedChallenges: [...userData.claimedChallenges, challengeId],
      availableChallenges: newAvailableChallenges,
      challengeProgress: newChallengeProgress,
      activities: [challengeActivity, ...userData.activities].slice(0, 50),
    };

    const newBadges = checkBadgeUnlocks(updatedUser);
    updatedUser.earnedBadges = [...updatedUser.earnedBadges, ...newBadges];

    saveUser(updatedUser);
    return { reward: challenge.reward, newBadges };
  }, [userData, saveUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserData(null);
  }, []);

  return {
    userData,
    isLoading,
    createUser,
    logDeed,
    claimChallenge,
    logout,
    isLoggedIn: !!userData,
  };
}

// ============================================
// ICON MAP FOR BADGES
// ============================================

const iconMap: Record<string, React.ElementType> = {
  Sprout,
  Star,
  Flame,
  Gem,
  Trophy,
  Zap,
  Calendar,
  CalendarDays,
  Sparkles,
  Medal,
  Coins,
  Crown,
};

// ============================================
// COMPONENT: TopNav
// ============================================

interface TopNavProps {
  username: string;
  avatar: string;
  points: number;
}

function TopNav({ username, avatar, points }: TopNavProps) {
  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="beacon-logo text-xl">BEACON</span>
        </div>

        <div className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border"
            whileHover={{ scale: 1.02 }}
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-foreground">{points.toLocaleString()}</span>
          </motion.div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-xl border border-border">
            {(() => {
              const avatarIndex = parseInt(avatar, 10);
              const avatarData = !isNaN(avatarIndex) && AVATAR_ICONS[avatarIndex] 
                ? AVATAR_ICONS[avatarIndex] 
                : null;
              if (avatarData) {
                const IconComponent = avatarData.icon;
                return (
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarData.color} flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                );
              }
              return (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">
                  {avatar}
                </div>
              );
            })()}
            <span className="font-medium text-foreground hidden sm:block">{username}</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================
// COMPONENT: MetricsCards
// ============================================

interface MetricsCardsProps {
  streak: number;
  totalDeeds: number;
  badgesEarned: number;
  totalXp: number;
}

function MetricsCards({ streak, totalDeeds, badgesEarned, totalXp }: MetricsCardsProps) {
  const metrics = [
    {
      label: 'Current Streak',
      value: streak,
      suffix: streak === 1 ? 'day' : 'days',
      icon: Flame,
      gradient: 'from-orange-500 to-amber-500',
      glow: 'shadow-orange-500/20',
    },
    {
      label: 'Total Deeds',
      value: totalDeeds,
      suffix: '',
      icon: CheckCircle,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/20',
    },
    {
      label: 'Badges Earned',
      value: badgesEarned,
      suffix: '',
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/20',
    },
    {
      label: 'Total XP',
      value: totalXp,
      suffix: '',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/20',
    },
  ];

  return (
    <section>
      <h2 className="section-title">
        <span className="gradient-text">Your Stats</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div 
            key={metric.label} 
            className="metric-card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`metric-icon bg-gradient-to-br ${metric.gradient} shadow-lg ${metric.glow}`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <div className="mt-3">
              <p className="stat-value">
                {metric.value.toLocaleString()}
                {metric.suffix && (
                  <span className="text-base font-normal text-muted-foreground ml-1.5">
                    {metric.suffix}
                  </span>
                )}
              </p>
              <p className="stat-label mt-1">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: ProgressOverview
// ============================================

interface ProgressOverviewProps {
  level: number;
  xp: number;
  onLogDeed: () => void;
}

function ProgressOverview({ level, xp, onLogDeed }: ProgressOverviewProps) {
  const rank = getRank(level);
  const { current, required } = getXpForNextLevel(xp);
  const progressPercent = (current / required) * 100;
  const nextRank = RANKS.find(r => r.level > level);

  return (
    <section className="space-y-6">
      <motion.div 
        className="progress-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold gradient-text uppercase tracking-wider">Current Rank</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2 tracking-tight">{rank}</h1>
            <p className="text-xl text-muted-foreground flex items-center gap-2">
              Level <span className="gradient-text font-bold">{level}</span>
            </p>
          </div>

          <div className="flex-1 md:max-w-md">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-sm text-muted-foreground">Experience Points</span>
                <p className="text-3xl font-bold text-foreground">
                  {current.toLocaleString()} 
                  <span className="text-muted-foreground font-normal text-lg ml-1">/ {required.toLocaleString()} XP</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold gradient-text">Level {level + 1}</span>
              </div>
            </div>
            
            <div className="progress-bar">
              <motion.div
                className="progress-fill-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between mt-3">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{required - current}</span> XP to next level
              </span>
              {nextRank && (
                <span className="text-sm text-secondary font-medium">
                  {nextRank.name} at Lvl {nextRank.level}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button 
        onClick={onLogDeed} 
        className="cta-large group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
        Log a Good Deed
        <Sparkles className="w-5 h-5 opacity-70" />
      </motion.button>
    </section>
  );
}

// ============================================
// COMPONENT: ActiveChallenges
// ============================================

interface ActiveChallengesProps {
  challengeProgress: Record<string, number>;
  availableChallenges: string[];
  onClaimChallenge: (challengeId: string) => void;
}

function ActiveChallenges({ challengeProgress, availableChallenges, onClaimChallenge }: ActiveChallengesProps) {
  const activeChallenges = ALL_CHALLENGES.filter(c => availableChallenges.includes(c.id));

  return (
    <section>
      <h2 className="section-title">
        <Target className="w-5 h-5 gradient-text" />
        <span>Active Challenges</span>
      </h2>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activeChallenges.map((challenge, index) => {
            const categoryKey = challenge.category?.toLowerCase().replace(/\s+/g, '-') || '';
            const progress = challengeProgress[categoryKey] || 0;
            const progressPercent = Math.min((progress / challenge.targetCount) * 100, 100);
            const isComplete = progress >= challenge.targetCount;

            return (
              <motion.div 
                key={challenge.id} 
                className="challenge-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 gradient-bg px-3 py-1.5 rounded-lg ml-4">
                    <Trophy className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">+{challenge.reward}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="progress-bar-sm">
                      <motion.div
                        className="progress-fill-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-bold whitespace-nowrap min-w-[60px] text-right ${isComplete ? 'gradient-text' : 'text-foreground'}`}>
                    {progress} / {challenge.targetCount}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {!isComplete && challenge.daysRemaining && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{challenge.daysRemaining} days left</span>
                    </div>
                  )}

                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Button
                        onClick={() => onClaimChallenge(challenge.id)}
                        className="claim-button"
                        size="sm"
                      >
                        <Gift className="w-4 h-4" />
                        Claim Reward
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeChallenges.length === 0 && (
          <motion.div 
            className="card-base text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <p className="text-foreground font-semibold text-lg">No active challenges</p>
            <p className="text-sm text-muted-foreground mt-1">Complete more deeds to unlock new challenges!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: BadgesGrid
// ============================================

interface BadgesGridProps {
  earnedBadges: string[];
  userData: UserData;
}

function BadgesGrid({ earnedBadges, userData }: BadgesGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBadge) setSelectedBadge(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedBadge]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deeds': return 'Total Deeds';
      case 'streak': return 'Day Streak';
      case 'level': return 'Level';
      case 'points': return 'Points';
      default: return type;
    }
  };

  return (
    <section>
      <h2 className="section-title">
        <Award className="w-5 h-5 gradient-text" />
        <span>Badges</span>
        <span className="text-sm font-normal text-muted-foreground ml-auto">
          {earnedBadges.length} / {BADGES.length}
        </span>
      </h2>
      <div className="card-base">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {BADGES.map((badge, index) => {
            const isEarned = earnedBadges.includes(badge.id);
            const IconComponent = iconMap[badge.icon] || Star;

            return (
              <motion.button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group relative flex flex-col items-center p-3 rounded-xl transition-all ${
                  isEarned
                    ? 'badge-earned'
                    : 'badge-locked'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: isEarned ? 1.05 : 1.02 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                  isEarned 
                    ? 'gradient-bg shadow-lg' 
                    : 'bg-muted'
                }`}>
                  <IconComponent className={`w-5 h-5 ${isEarned ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-xs text-center leading-tight ${
                  isEarned ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {badge.name}
                </span>
                {!isEarned && (
                  <Lock className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedBadge(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="p-6">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {(() => {
                  const isEarned = earnedBadges.includes(selectedBadge.id);
                  const IconComponent = iconMap[selectedBadge.icon] || Star;
                  const progress = getBadgeProgress(selectedBadge, userData);
                  const currentValue = getBadgeCurrentValue(selectedBadge, userData);
                  const progressPercent = progress * 100;

                  return (
                    <div className="text-center">
                      <motion.div 
                        className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                          isEarned 
                            ? 'gradient-bg shadow-xl' 
                            : 'bg-muted'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                      >
                        <IconComponent className={`w-12 h-12 ${isEarned ? 'text-white' : 'text-muted-foreground'}`} />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-foreground mb-2">{selectedBadge.name}</h3>
                      <p className="text-muted-foreground mb-6">{selectedBadge.description}</p>

                      {isEarned ? (
                        <motion.div 
                          className="flex items-center justify-center gap-2 bg-success/10 text-success px-5 py-3 rounded-xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Check className="w-5 h-5" />
                          <span className="font-bold">Badge Earned!</span>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{getTypeLabel(selectedBadge.type)}</span>
                            <span className="text-foreground font-bold">
                              {currentValue} / {selectedBadge.requirement}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <motion.div
                              className="progress-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{selectedBadge.requirement - currentValue}</span> more to unlock
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ============================================
// COMPONENT: RecentActivities
// ============================================

interface RecentActivitiesProps {
  activities: Activity[];
}

function RecentActivities({ activities }: RecentActivitiesProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 3);

  if (activities.length === 0) {
    return (
      <section>
        <h2 className="section-title">
          <History className="w-5 h-5 gradient-text" />
          <span>Recent Activity</span>
        </h2>
        <motion.div 
          className="card-base text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-foreground font-semibold text-lg mb-1">No activities yet</p>
          <p className="text-muted-foreground">Log your first good deed to get started!</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title mb-0">
          <History className="w-5 h-5 gradient-text" />
          <span>Recent Activity</span>
        </h2>
        {activities.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                View All ({activities.length}) <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="card-base p-0 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {displayedActivities.map((activity, index) => {
            const isExpanded = expandedId === activity.id;
            const isChallenge = activity.type === 'challenge';

            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <div 
                  className={`px-5 py-4 cursor-pointer transition-all border-b border-border/50 last:border-0 ${
                    isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                >
                  <div className="flex items-center gap-4">
                    {isChallenge ? (
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`category-tag ${isChallenge ? 'bg-secondary/20 text-secondary' : ''}`}>
                          {activity.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(activity.date)}
                        </span>
                        {(activity.imageUrl || activity.reflection) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {activity.imageUrl && <Image className="w-3 h-3" />}
                            {activity.reflection && <MessageSquare className="w-3 h-3" />}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className={`font-bold text-lg ${isChallenge ? 'gradient-text' : 'text-primary'}`}>
                          +{activity.points}
                        </span>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      className="px-5 pb-5 pt-2 bg-muted/20 border-b border-border/50"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-4 pl-14">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatFullDate(activity.date)}</span>
                        </div>

                        {activity.imageUrl && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <Image className="w-4 h-4" /> Evidence Photo
                            </p>
                            <img 
                              src={activity.imageUrl} 
                              alt="Deed evidence" 
                              className="rounded-xl max-w-full max-h-48 object-cover border border-border"
                            />
                          </div>
                        )}

                        {activity.reflection && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Reflection
                            </p>
                            <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
                              {activity.reflection}
                            </p>
                          </div>
                        )}

                        {!activity.imageUrl && !activity.reflection && (
                          <p className="text-sm text-muted-foreground italic">No additional details for this activity.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================
// COMPONENT: LogDeedModal
// ============================================

interface LogDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, description: string, reflection?: string, imageUrl?: string) => void;
}

function LogDeedModal({ isOpen, onClose, onSubmit }: LogDeedModalProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [reflection, setReflection] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) return;
    
    onSubmit(category, description.trim(), reflection.trim() || undefined, imageUrl || undefined);
    setCategory('');
    setDescription('');
    setReflection('');
    setImageUrl(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            className="modal-content max-h-[90vh] overflow-y-auto scrollbar-hide"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="gradient-bg px-6 py-5 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Log a Good Deed</h2>
                    <p className="text-sm text-white/70">Share your positive action</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-muted/50 border-border text-foreground h-12 rounded-xl">
                    <SelectValue placeholder="What type of deed?" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {DEED_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-foreground focus:bg-muted rounded-lg">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  What did you do?
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Helped a classmate with homework..."
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-2">{description.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Photo Evidence <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                
                {imageUrl ? (
                  <motion.div 
                    className="relative rounded-xl overflow-hidden border border-border"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img 
                      src={imageUrl} 
                      alt="Evidence preview" 
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-black/70 rounded-xl hover:bg-black/90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                      <Camera className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reflection <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How did it make you feel? What did you learn?"
                  className="bg-muted/50 border-border resize-none text-foreground placeholder:text-muted-foreground rounded-xl"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-border text-foreground hover:bg-muted h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!category || !description.trim()}
                  className="flex-1 cta-primary h-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Log Deed ✨
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// COMPONENT: Login Page
// ============================================

function LoginPage() {
  const navigate = useNavigate();
  const { createUser } = useUserData();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    createUser(username.trim(), String(selectedAvatar));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <motion.div 
            className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 
            className="beacon-logo mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            BEACON
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Light the way with good deeds
          </motion.p>
        </div>

        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                What should we call you?
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="bg-muted/50 border-border h-14 text-lg rounded-xl focus:ring-2 focus:ring-primary/50"
                maxLength={20}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">
                Choose your avatar
              </label>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_ICONS.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(index)}
                      className={`avatar-option ${
                        selectedAvatar === index ? 'avatar-option-selected' : ''
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={!username.trim()}
                className="cta-large disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Sparkles className="w-5 h-5" />
                Start Your Journey
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Track your positive impact • Earn rewards • Make a difference
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================
// COMPONENT: Dashboard Page
// ============================================

function DashboardPage() {
  const navigate = useNavigate();
  const { userData, isLoading, logDeed, claimChallenge } = useUserData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !userData) {
      navigate('/');
    }
  }, [isLoading, userData, navigate]);

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-muted-foreground text-lg">Loading your progress...</p>
        </motion.div>
      </div>
    );
  }

  const handleLogDeed = (category: string, description: string, reflection?: string, imageUrl?: string) => {
    const result = logDeed(category, description, reflection, imageUrl);
    if (result) {
      toast({
        title: "Good deed logged! 🎉",
        description: `You earned +${result.pointsEarned} points and +${result.xpEarned} XP`,
      });

      if (result.newBadges.length > 0) {
        setTimeout(() => {
          toast({
            title: "New badge unlocked! 🏅",
            description: `You've earned ${result.newBadges.length} new badge(s)!`,
          });
        }, 1000);
      }
    }
  };

  const handleClaimChallenge = (challengeId: string) => {
    const result = claimChallenge(challengeId);
    if (result) {
      toast({
        title: "Challenge completed! 🏆",
        description: `You earned +${result.reward} points!`,
      });

      if (result.newBadges.length > 0) {
        setTimeout(() => {
          toast({
            title: "New badge unlocked! 🏅",
            description: `You've earned ${result.newBadges.length} new badge(s)!`,
          });
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        username={userData.username}
        avatar={userData.avatar}
        points={userData.points}
      />

      <main className="container py-8 space-y-10 px-4 pb-20">
        <ProgressOverview 
          level={userData.level} 
          xp={userData.xp} 
          onLogDeed={() => setIsModalOpen(true)}
        />
        
        <MetricsCards
          streak={userData.streak}
          totalDeeds={userData.totalDeeds}
          badgesEarned={userData.earnedBadges.length}
          totalXp={userData.xp}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <ActiveChallenges 
            challengeProgress={userData.challengeProgress} 
            availableChallenges={userData.availableChallenges || ['daily-kindness', 'eco-warrior', 'helper-hero']}
            onClaimChallenge={handleClaimChallenge}
          />
          <BadgesGrid earnedBadges={userData.earnedBadges} userData={userData} />
        </div>

        <RecentActivities activities={userData.activities} />
      </main>

      <LogDeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogDeed}
      />
    </div>
  );
}

// ============================================
// COMPONENT: NotFound Page
// ============================================

function NotFoundPage() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

const queryClient = new QueryClient();

export default function BeaconApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
