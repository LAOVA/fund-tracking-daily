"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// 创建时间 store
function createTimeStore() {
  let listeners: (() => void)[] = [];
  let currentTime = "";
  let timer: NodeJS.Timeout | null = null;

  function getCurrentTime() {
    return new Date().toLocaleTimeString("zh-CN", { hour12: false });
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    // 第一次订阅时启动定时器
    if (timer === null) {
      currentTime = getCurrentTime();
      timer = setInterval(() => {
        currentTime = getCurrentTime();
        listeners.forEach((l) => l());
      }, 1000);
    }
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      // 没有订阅者时清理定时器
      if (listeners.length === 0 && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
  }

  function getSnapshot() {
    return currentTime;
  }

  function getServerSnapshot() {
    return "";
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

const timeStore = createTimeStore();

export function Header() {
  const pathname = usePathname();
  const isConfigPage = pathname.startsWith("/config");
  const currentTime = useSyncExternalStore(
    timeStore.subscribe,
    timeStore.getSnapshot,
    timeStore.getServerSnapshot,
  );

  const today = new Date();
  const dateStr = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const weekDay = weekDays[today.getDay()];

  // 计算期号：从2024年1月1日开始计算
  const startDate = new Date("2026-01-01");
  const daysDiff = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const issueNumber = daysDiff + 1;

  return (
    <header className="bg-news-bg border-b-2 border-news-border">
      {/* 顶部信息栏 */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-news-muted border-b border-news-border pb-2 mb-4">
          <div className="flex items-center gap-4">
            <span className="font-['Source_Sans_3']">
              {dateStr} {weekDay}
            </span>
            <span className="text-finance-rise font-['JetBrains_Mono'] font-bold">
              第 {issueNumber} 期
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-['Source_Sans_3'] hidden sm:inline">
              农历甲辰年
            </span>
            <span className="font-['JetBrains_Mono']">{currentTime}</span>
            <a
              aria-label="GitHub Homepage"
              href="https://github.com/LAOVA/fund-tracking-daily"
              target="_blank"
              rel="noopener noreferrer"
              className="text-news-muted hover:text-news-text dark:text-paper-500 dark:hover:text-paper-200 transition-colors"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="currentColor"
                display="inline-block"
                overflow="visible"
                style={{ verticalAlign: "text-center" }}
              >
                <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path>
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 报头 */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="text-center border-b-4 border-news-text pb-4 mb-4">
          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[2px] w-32 bg-news-text"></div>
            <div className="h-[1px] w-20 bg-news-border"></div>
            <div className="h-[2px] w-32 bg-news-text"></div>
          </div>

          {/* 主标题 - 使用 Newsreader 字体 */}
          <h1 className="font-['Newsreader'] text-6xl md:text-7xl font-bold text-news-text tracking-wide mt-6">
            追基日报
          </h1>

          {/* 副标题 */}
          <p className="font-['Source_Sans_3'] text-sm text-news-muted tracking-[0.4em] uppercase">
            Daily Fund Tracker
          </p>

          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[2px] w-32 bg-news-text"></div>
            <div className="h-[1px] w-20 bg-news-border"></div>
            <div className="h-[2px] w-32 bg-news-text"></div>
          </div>
        </div>

        {/* 导航栏 */}
        <nav className="flex items-center justify-center gap-8 border-b-2 border-news-text pb-3 min-h-[3rem]">
          <Link
            href="/holdings"
            className={`
              font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.2em]
              transition-all duration-200 hover:scale-105
              pb-1
              ${
                !isConfigPage
                  ? "text-finance-rise border-b-2 border-finance-rise"
                  : "text-news-text hover:text-finance-rise"
              }
            `}
          >
            全部持有
          </Link>
          <Link
            href="/config"
            className={`
              font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.2em]
              transition-all duration-200 hover:scale-105
              pb-1
              ${
                isConfigPage
                  ? "text-finance-rise border-b-2 border-finance-rise"
                  : "text-news-text hover:text-finance-rise"
              }
            `}
          >
            持仓配置
          </Link>
        </nav>
      </div>
    </header>
  );
}
