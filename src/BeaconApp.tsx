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
   BADGE DEFINITIONS
   ============================== */

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: "first_deed",
    label: "First Step",
    description: "Log your first good deed",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "streak_3",
    label: "Consistent",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "level_5",
    label: "Getting Serious",
    description: "Reach level 5",
    icon: "🏅",
    unlocked: false,
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
  badges: BADGE_DEFINITIONS,
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

  const calculateLevel = (xp: number) =>
    Math.floor(xp / XP_PER_LEVEL) + 1;

  const calculateRank = (level: number) => {
    let currentRank = RANKS[0].name;
    for (const rank of RANKS) {
      if (level >= rank.minLevel) currentRank = rank.name;
    }
    return currentRank;
  };

  /* ==============================
     BADGE UNLOCK LOGIC
     ============================== */

  const updateBadges = (data: UserData): Badge[] => {
    return data.badges.map((badge) => {
      if (badge.unlocked) return badge;

      if (
        badge.id === "first_deed" &&
        data.activities.length >= 1
      ) {
        return { ...badge, unlocked: true };
      }

      if (
        badge.id === "streak_3" &&
        data.streak >= 3
      ) {
        return { ...badge, unlocked: true };
      }

      if (
        badge.id === "level_5" &&
        data.level >= 5
      ) {
        return { ...badge, unlocked: true };
      }

      return badge;
    });
  };

  /* ==============================
     STREAK + XP UPDATE
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

  const logGoodDeed = () => {
    setUserData((prev) => {
      const newXP = prev.xp + 50;
      const newLevel = calculateLevel(newXP);
      const newRank = calculateRank(newLevel);
      const newStreak = updateStreak(prev.lastActivityDate);

      const updatedData = {
        ...prev,
        xp: newXP,
        level: newLevel,
        rank: newRank,
        streak: newStreak,
        lastActivityDate: new Date().toISOString(),
        activities: [
          ...prev.activities,
          {
            id: Date.now().toString(),
            title: "Good Deed",
            category: "General",
            points: 50,
            date: new Date().toISOString(),
          },
        ],
      };

      return {
        ...updatedData,
        badges: updateBadges(updatedData),
      };
    });
  };

  /* ==============================
     RENDER
     ============================== */

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beacon</h1>

      <div style={styles.card}>
        <p><strong>Level:</strong> {userData.level}</p>
        <p><strong>Streak:</strong> 🔥 {userData.streak}</p>

        <button style={styles.button} onClick={logGoodDeed}>
          Log Good Deed
        </button>
      </div>

      <div style={styles.badgeGrid}>
        {userData.badges.map((badge) => (
          <div
            key={badge.id}
            style={{
              ...styles.badge,
              opacity: badge.unlocked ? 1 : 0.3,
            }}
          >
            <span style={{ fontSize: "24px" }}>{badge.icon}</span>
            <p>{badge.label}</p>
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
  card: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "360px",
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
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "12px",
    marginTop: "24px",
    maxWidth: "360px",
  },
  badge: {
    backgroundColor: "#1a1a1a",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
  },
};
