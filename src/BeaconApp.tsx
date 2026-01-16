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
  activities: Activity[];
  badges: Badge[];
  challenges: Challenge[];
}

/* ==============================
   DEFAULT USER STATE
   ============================== */

const defaultUserData: UserData = {
  username: "Guest",
  xp: 0,
  level: 1,
  rank: "Newcomer",
  streak: 0,
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
     LOAD DATA ON APP START
     ============================== */

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("beacon_user_data");

      if (storedData) {
        const parsedData: UserData = JSON.parse(storedData);
        setUserData(parsedData);
      }
    } catch (error) {
      console.error("Failed to load user data. Resetting to default.");
      setUserData(defaultUserData);
    }
  }, []);

  /* ==============================
     SAVE DATA ON STATE CHANGE
     ============================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        "beacon_user_data",
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error("Failed to save user data.");
    }
  }, [userData]);

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
        User data loaded and persisted using localStorage
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
