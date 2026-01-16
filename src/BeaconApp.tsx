import React, { useEffect, useState } from "react";

/* ==============================
   DATA MODELS
   ============================== */

interface Activity {
  id: string;
  title: string;
  category: string;
  points: number;
  date: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
}

interface UserData {
  username: string;
  xp: number;
  level: number;
  rank: string;
  streak: number;
  lastActivityDate: string | null;
  activities: Activity[];
  badges: Badge[];
  challenges: Challenge[];
}

/* ==============================
   GAMIFICATION CONSTANTS
   ============================== */

const XP_PER_LEVEL = 150;

const RANKS = [
  { name: "Newcomer", minLevel: 1 },
  { name: "Helper", minLevel: 3 },
  { name: "Contributor", minLevel: 6 },
  { name: "Hero", minLevel: 10 },
  { name: "Guardian", minLevel: 15 },
];

/* ==============================
   DEFAULT USER STATE
   ============================== */

const defaultUserData: UserData = {
  username: "Guest",
  xp: 0,
  level: 1,
  rank: "Newcomer",
  streak: 0,
  lastActivityDate: null,
  activities: [],
  badges: [],
  challenges: [],
};

/* ==============================
   MAIN APPLICATION
   ============================== */

export default function BeaconApp() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  /* ==============================
     LOAD / SAVE (Persistence)
     ============================== */

  useEffect(() => {
    try {
      const stored = localStorage.getItem("beacon_user_data");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    } catch {
      setUserData(defaultUserData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "beacon_user_data",
      JSON.stringify(userData)
    );
  }, [userData]);

  /* ==============================
     GAMIFICATION LOGIC
     ============================== */

  const calculateLevel = (xp: number): number =>
    Math.floor(xp / XP_PER_LEVEL) + 1;

  const calculateRank = (level: number): string => {
    let currentRank = RANKS[0].name;
    for (const rank of RANKS) {
      if (level >= rank.minLevel) {
        currentRank = rank.name;
      }
    }
    return currentRank;
  };

  /* ==============================
     STREAK LOGIC
     ============================== */

  const updateStreak = (lastDate: string | null): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastDate) return 1;

    const previous = new Date(lastDate);
    previous.setHours(0, 0, 0, 0);

    const diffDays =
      (today.getTime() - previous.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays === 1) return userData.streak + 1;
    if (diffDays > 1) return 1;

    return userData.streak;
  };

  const addXP = (amount: number) => {
    setUserData((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const newRank = calculateRank(newLevel);
      const newStreak = updateStreak(prev.lastActivityDate);

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        rank: newRank,
        streak: newStreak,
        lastActivityDate: new Date().toISOString(),
      };
    });
  };

  /* ==============================
     TEMP ACTION (SIMULATION)
     ============================== */

  const simulateGoodDeed = () => {
    addXP(50);
  };

  /* ==============================
     RENDER
     ============================== */

  const xpProgress =
    ((userData.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beacon</h1>

      <div style={styles.card}>
        <p><strong>XP:</strong> {userData.xp}</p>
        <p><strong>Level:</strong> {userData.level}</p>
        <p><strong>Rank:</strong> {userData.rank}</p>
        <p><strong>Streak:</strong> 🔥 {userData.streak} days</p>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${xpProgress}%`,
            }}
          />
        </div>

        <button style={styles.button} onClick={simulateGoodDeed}>
          Log Good Deed (+50 XP)
        </button>
      </div>

      <p style={styles.subtitle}>
        Streak updates based on consecutive daily activity
      </p>
    </div>
  );
}

/* ==============================
   STYLES
   ============================== */

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#0f0f0f",
    color: "white",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Inter, sans-serif",
  },
  title: {
    fontSize: "42px",
    marginBottom: "20px",
    color: "#7c3aed",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "360px",
  },
  progressBar: {
    height: "10px",
    backgroundColor: "#333",
    borderRadius: "6px",
    overflow: "hidden",
    margin: "12px 0",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
  },
  button: {
    marginTop: "12px",
    padding: "10px",
    width: "100%",
    backgroundColor: "#7c3aed",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  subtitle: {
    marginTop: "24px",
    opacity: 0.7,
    fontSize: "14px",
  },
};
