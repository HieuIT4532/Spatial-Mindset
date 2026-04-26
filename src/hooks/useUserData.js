// src/hooks/useUserData.js
// Sync XP, Streak, và profile giữa localStorage ↔ Firestore
import { useState, useEffect, useCallback } from "react";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

const LOCAL_XP_KEY     = "spatialmind_xp";
const LOCAL_STREAK_KEY = "daily_progress";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

export function useUserData() {
  const { user } = useAuth();

  // ---- Local state (offline-first) ----
  const [xp, setXPState] = useState(() => {
    return parseInt(localStorage.getItem(LOCAL_XP_KEY) || "0", 10);
  });
  const [streak, setStreakState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LOCAL_STREAK_KEY) || "{}");
      const today = todayStr();
      const yesterday = yesterdayStr();
      if (s.date === today || s.last_date === yesterday) return s.streak || 0;
      return 0;
    } catch { return 0; }
  });

  // ---- Load from Firestore on login ----
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Lấy giá trị lớn hơn giữa local và cloud (tránh mất dữ liệu offline)
          const cloudXP = data.xp || 0;
          const localXP = parseInt(localStorage.getItem(LOCAL_XP_KEY) || "0", 10);
          const mergedXP = Math.max(cloudXP, localXP);
          setXPState(mergedXP);
          localStorage.setItem(LOCAL_XP_KEY, String(mergedXP));

          const cloudStreak = data.streak || 0;
          setStreakState(cloudStreak);
        }
      } catch (e) {
        console.warn("Firestore offline, dùng local data:", e.message);
      }
    })();
  }, [user]);

  // ---- Sync to Firestore whenever XP/Streak changes ----
  const syncToCloud = useCallback(async (newXP, newStreak) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        xp:         newXP,
        streak:     newStreak,
        lastActive: serverTimestamp(),
      });
    } catch {
      // Offline — sẽ sync lại khi có mạng (Firestore tự handle)
    }
  }, [user]);

  // ---- XP setter (local + cloud) ----
  const setXP = useCallback((updater) => {
    setXPState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(LOCAL_XP_KEY, String(next));
      syncToCloud(next, streak);
      return next;
    });
  }, [streak, syncToCloud]);

  // ---- Streak setter ----
  const setStreak = useCallback((newStreak) => {
    setStreakState(newStreak);
    syncToCloud(xp, newStreak);
  }, [xp, syncToCloud]);

  // ---- Gain XP helper ----
  const gainXP = useCallback((amount) => {
    setXP(prev => prev + amount);
  }, [setXP]);

  // ---- Update streak on daily challenge completion ----
  const updateStreak = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_STREAK_KEY) || "{}");
    const today = todayStr();
    const yesterday = yesterdayStr();
    let newStreak = stored.streak || 0;
    if (stored.last_date === yesterday) {
      newStreak += 1;
    } else if (stored.last_date !== today) {
      newStreak = 1;
    }
    const updated = { ...stored, date: today, last_date: today, streak: newStreak };
    localStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(updated));
    setStreak(newStreak);
    return newStreak;
  }, [setStreak]);

  return { xp, streak, setXP, setStreak, gainXP, updateStreak };
}
