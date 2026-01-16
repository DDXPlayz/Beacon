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
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardXP: number;
  completed: boolean;
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
   CHALLENGE DEFINITIONS
   ============================== */

const CHALLENGE_POOL: Challenge[] = [
  {
    id: "daily_kindness",
    title: "Daily Kindness",
    description: "Log 3 good deeds",
    target: 3,
    progress: 0,
    rewardXP: 100,
    completed: false,
  },
  {
    id: "eco_warrior",
    title: "Eco Warrior",
    description: "Log 5 eco-friendly deeds",
    target: 5,
    progress: 0,
    rewardXP: 150,
    completed: false,
  },
  {
    id: "helping_hand",
    title: "Helping Hand",
    description: "Help others 4 times",
    target: 4,
    progress: 0,
    rewardXP: 120,
    completed: false,
  },
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
  challenges: [CHALLENGE_POOL[0]],
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
      if (stored) setUserData(JSON.parse(stored));
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
     LEVEL + RANK LOGIC
     ============================== */

  const calculateLevel = (xp: number) =>
    Math.floor(xp / XP_PER_LEVEL) + 1;

  const calculateRank = (level: number) => {
    let current = RANKS[0].name;
    for (const rank of RANKS) {
      if (level >= rank.minLevel) current = rank.name;
    }
    return current;
  };

  /* ==============================
     CHALLENGE UPDATE LOGIC
     ============================== */

  const updateChallenges = (
    challenges: Challenge[]
  ): Challenge[] => {
    return challenges.map((ch) => {
      if (ch.completed) return ch;

      const updatedProgress = ch.progress + 1;

      if (updatedProgress >= ch.target) {
        return {
          ...ch,
          progress: ch.target,
          completed: true,
        };
      }

      return {
        ...ch,
        progress: updatedProgress,
      };
    });
  };

  const assignNewChallenge = (
    existing: Challenge[]
  ): Challenge[] => {
    const available = CHALLENGE_POOL.find(
      (c) =>
        !existing.some((e) => e.id === c.id)
    );

    return available ? [...existing, available] : existing;
  };

  /* ==============================
     LOG GOOD DEED (CORE ACTION)
     ============================== */

  const logGoodDeed = () => {
    setUserData((prev) => {
      const updatedChallenges = updateChallenges(prev.challenges);

      const completedNow = updatedChallenges.filter(
        (c) => c.completed && !prev.challenges.find(
          (p) => p.id === c.id && p.completed
        )
      );

      const bonusXP = completedNow.reduce(
        (sum, c) => sum + c.rewardXP,
        0
      );

      const newXP = prev.xp + 50 + bonusXP;
      const newLevel = calculateLevel(newXP);
      const newRank = calculateRank(newLevel);

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        rank: newRank,
        challenges: assignNewChallenge(updatedChallenges),
      };
    });
  };

  /* ==============================
     RENDER
     ============================== */

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beacon</h1>

      <button style={styles.button} onClick={logGoodDeed}>
        Log Good Deed
      </button>

      <div style={styles.challengeList}>
        {userData.challenges.map((ch) => (
          <div key={ch.id} style={styles.card}>
            <h4>{ch.title}</h4>
            <p>{ch.description}</p>
            <p>
              Progress: {ch.progress}/{ch.target}
            </p>
            {ch.completed && (
              <strong>Completed ✓</strong>
            )}
          </div>
        ))}
      </div>
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
  button: {
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#7c3aed",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  challengeList: {
    maxWidth: "420px",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "12px",
  },
};
