"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "fund-tracker-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : "system";
};

// 已挂载：服务端快照恒为 false，避免 hydration 后再 setState
const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

// 系统深色偏好：由浏览器 media query 直接驱动，无需手动 setState
const subscribeSystemDark = (callback: () => void) => {
  const mediaQuery = window.matchMedia(DARK_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};
const getSystemDarkSnapshot = () => window.matchMedia(DARK_QUERY).matches;
const getSystemDarkServerSnapshot = () => false;

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  );

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // 只做 DOM 同步，不再由此触发状态更新
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        window.localStorage.setItem(THEME_KEY, newTheme);
      } catch {
        // 隐私模式下 localStorage 可能不可写，忽略即可
      }
    },
    []
  );

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted,
    isDark: resolvedTheme === "dark",
    resolvedTheme,
  };
}
