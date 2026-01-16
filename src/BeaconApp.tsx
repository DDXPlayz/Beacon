import React, { useState } from "react";

/* ==============================
   DATA MODELS (TypeScript)
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
  activities: Activity[];
  badges: Badge[];
  challenges: Challenge[];
}

/* ==============================
   MAIN APPLICATION COMPONENT
   ============================== */

export default function BeaconApp() {
  /* -------- Core User State -------- */
  const [userData, setUserData] = useState<UserData>({
    username: "Guest",
    xp: 0,
    level: 1,
    rank: "Newcomer",
    streak: 0,
    activities: [],
    badges: [],
    challenges: [],
  });

  /* ==============================
     RENDER
     ============================== */

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beacon</h1>

      <div style={styles.card}>
        <p><strong>User:</strong> {userData.username}</p>
        <p><strong>Level:</strong> {userData.level}</p>
        <p><strong>Rank:</strong> {userData.rank}</p>
        <p><strong>XP:</strong> {userData.xp}</p>
        <p><strong>Streak:</strong> {userData.streak}</p>
      </div>

      <p style={styles.subtitle}>
        Core application architecture initialized
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
  subtitle: {
    marginTop: "24px",
    opacity: 0.7,
    fontSize: "14px",
  },
};
