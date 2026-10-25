import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NavRecord {
  date: string;
  nav: number;
  accNav: number;
}

export interface Fund {
  /** 基金代码 */
  code: string;
  /** 基金名称 */
  name: string;
  /** 最新净值 */
  netAssetValue?: number;
  /** 昨日净值 */
  previousNetAssetValue?: number;
  /** 昨日涨跌幅（百分比） */
  yesterdayChange?: number;
  /** 估算净值（实时） */
  estimatedNetValue?: number;
  /** 估算涨跌幅（实时，百分比） */
  estimatedGrowthRate?: number;
  /** 累计净值 */
  totalNetValue?: number;
  /** 近一周涨跌幅 */
  lastWeekGrowthRate?: number;
  /** 近一月涨跌幅 */
  lastMonthGrowthRate?: number;
  /** 今年以来涨跌幅 */
  thisYearGrowthRate?: number;
  /** 数据更新时间 */
  updateTime?: string;
  /** 持有份额 */
  shares?: number;
  /** 成本价（单位净值） */
  costPrice?: number;
  /** 总投入成本 */
  costAmount?: number;
  /** 历史净值记录 */
  navHistory?: NavRecord[];
}

export interface FundGroup {
  id: string;
  name: string;
  funds: string[];
}

export type TransactionType = "buy" | "sell" | "dividend";

export interface Transaction {
  id: string;
  fundCode: string;
  type: TransactionType;
  date: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  remark?: string;
}

export interface DividendRecord {
  id: string;
  fundCode: string;
  date: string;
  amountPerShare: number;
  totalShares: number;
  totalAmount: number;
  reinvest: boolean;
}

interface FundsState {
  watchlist: Fund[];
  groups: FundGroup[];
  transactions: Transaction[];
  dividends: DividendRecord[];
  addFund: (fund: Fund, groupId?: string) => void;
  removeFund: (code: string) => void;
  updateFund: (code: string, data: Partial<Fund>) => void;
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  addFundToGroup: (fundCode: string, groupId: string) => void;
  removeFundFromGroup: (fundCode: string, groupId: string) => void;
  setFundPosition: (code: string, shares: number, costPrice: number) => void;
  removeFundPosition: (code: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addDividend: (dividend: Omit<DividendRecord, "id">) => void;
  removeDividend: (id: string) => void;
  recalculatePosition: (fundCode: string) => void;
  cleanOrphanFunds: () => void;
}

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useFundsStore = create<FundsState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      groups: [
        {
          id: "default",
          name: "默认分组",
          funds: [],
        },
      ],
      transactions: [],
      dividends: [],

      addFund: (fund: Fund, groupId?: string) =>
        set((state) => {
          const exists = state.watchlist.some((f) => f.code === fund.code);
          if (exists) return state;

          const newWatchlist = [...state.watchlist, fund];
          const targetGroupId = groupId || "default";

          return {
            watchlist: newWatchlist,
            groups: state.groups.map((g) =>
              g.id === targetGroupId && !g.funds.includes(fund.code)
                ? { ...g, funds: [...g.funds, fund.code] }
                : g
            ),
          };
        }),

      removeFund: (code: string) =>
        set((state) => ({
          watchlist: state.watchlist.filter((f) => f.code !== code),
          groups: state.groups.map((g) => ({
            ...g,
            funds: g.funds.filter((c) => c !== code),
          })),
          transactions: state.transactions.filter((t) => t.fundCode !== code),
          dividends: state.dividends.filter((d) => d.fundCode !== code),
        })),

      updateFund: (code: string, data: Partial<Fund>) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) => {
            if (f.code !== code) return f;
            const updates: Partial<Fund> = {};
            (Object.keys(data) as Array<keyof Fund>).forEach((key) => {
              const value = data[key];
              if (value !== undefined && value !== null) {
                updates[key] = value as never;
              }
            });
            return { ...f, ...updates };
          }),
        })),

      addGroup: (name: string) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              id: `group-${Date.now()}`,
              name,
              funds: [],
            },
          ],
        })),

      removeGroup: (id: string) =>
        set((state) => {
          const group = state.groups.find((g) => g.id === id);
          const groupFundCodes = group ? group.funds : [];
          return {
            groups: state.groups.filter((g) => g.id !== id),
            watchlist: state.watchlist.filter((f) => !groupFundCodes.includes(f.code)),
          };
        }),

      cleanOrphanFunds: () =>
        set((state) => {
          const validGroupFundCodes = new Set(
            state.groups.flatMap((g) => g.funds)
          );
          return {
            watchlist: state.watchlist.filter(
              (f) => validGroupFundCodes.has(f.code) || !validGroupFundCodes.size
            ),
          };
        }),

      addFundToGroup: (fundCode: string, groupId: string) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId && !g.funds.includes(fundCode)
              ? { ...g, funds: [...g.funds, fundCode] }
              : g
          ),
        })),

      removeFundFromGroup: (fundCode: string, groupId: string) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, funds: g.funds.filter((c) => c !== fundCode) }
              : g
          ),
        })),

      setFundPosition: (code: string, shares: number, costPrice: number) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code
              ? {
                  ...f,
                  shares,
                  costPrice,
                  costAmount: shares * costPrice,
                }
              : f
          ),
        })),

      removeFundPosition: (code: string) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code
              ? {
                  ...f,
                  shares: undefined,
                  costPrice: undefined,
                  costAmount: undefined,
                }
              : f
          ),
        })),

      addTransaction: (transaction: Omit<Transaction, "id">) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: generateId(),
          };
          const newState = {
            ...state,
            transactions: [...state.transactions, newTransaction].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
          return newState;
        }),

      updateTransaction: (id: string, data: Partial<Transaction>) =>
        set((state) => ({
          transactions: state.transactions
            .map((t) => (t.id === id ? { ...t, ...data } : t))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
        })),

      removeTransaction: (id: string) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addDividend: (dividend: Omit<DividendRecord, "id">) =>
        set((state) => {
          const newDividend: DividendRecord = {
            ...dividend,
            id: generateId(),
          };
          return {
            dividends: [...state.dividends, newDividend].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        }),

      removeDividend: (id: string) =>
        set((state) => ({
          dividends: state.dividends.filter((d) => d.id !== id),
        })),

      recalculatePosition: (fundCode: string) => {
        const state = get();
        const fund = state.watchlist.find((f) => f.code === fundCode);

        // 分红再投需要按除息日净值把现金折算成份额，净值查不到时跳过该笔
        const navLookup = (date: string) =>
          resolveNavOnDate(fund?.navHistory, date, fund?.netAssetValue);

        const { shares, costPrice, costAmount } =
          calculatePositionFromTransactions(
            state.transactions,
            state.dividends,
            fundCode,
            navLookup
          );

        set((s) => ({
          watchlist: s.watchlist.map((f) =>
            f.code === fundCode
              ? {
                  ...f,
                  shares: shares > 0 ? shares : undefined,
                  costPrice: costPrice > 0 ? costPrice : undefined,
                  costAmount: costAmount > 0 ? costAmount : undefined,
                }
              : f
          ),
        }));
      },
    }),
    {
      name: "fund-tracker-storage",
    }
  )
);

/**
 * 在净值历史中查找指定日期（含当日）最近一次的净值。
 * 找不到时回退到 fallbackNav，仍无效则返回 undefined。
 */
function resolveNavOnDate(
  navHistory: NavRecord[] | undefined,
  date: string,
  fallbackNav?: number
): number | undefined {
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return normalizeNav(fallbackNav);

  if (navHistory && navHistory.length > 0) {
    const sorted = [...navHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let matched: number | undefined;
    for (const record of sorted) {
      const recordTime = new Date(record.date).getTime();
      if (Number.isNaN(recordTime)) continue;
      if (recordTime <= target) matched = record.nav;
      else break;
    }
    const nav = normalizeNav(matched);
    if (nav !== undefined) return nav;
  }

  return normalizeNav(fallbackNav);
}

const normalizeNav = (value: number | undefined): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;

export function calculatePositionFromTransactions(
  transactions: Transaction[],
  dividends: DividendRecord[],
  fundCode: string,
  navLookup?: (date: string) => number | undefined
): { shares: number; costPrice: number; costAmount: number } {
  const fundTransactions = transactions.filter((t) => t.fundCode === fundCode);
  const fundDividends = dividends.filter((d) => d.fundCode === fundCode);

  let totalShares = 0;
  let totalCost = 0;

  const sortedTransactions = [...fundTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTransactions.forEach((t) => {
    if (t.type === "buy") {
      totalShares += t.shares;
      totalCost += t.amount + t.fee;
    } else if (t.type === "sell") {
      if (totalShares > 0) {
        const sellRatio = t.shares / totalShares;
        totalCost -= totalCost * sellRatio;
        totalShares -= t.shares;
        if (totalShares < 0) totalShares = 0;
      }
    }
  });

  // 分红再投：现金按除息日净值转成份额，成本不变（摊低单位成本）
  const sortedDividends = [...fundDividends].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedDividends.forEach((d) => {
    if (!d.reinvest || !(d.totalAmount > 0)) return;

    const nav = navLookup?.(d.date);
    if (nav === undefined) {
      console.warn(
        `基金 ${fundCode} 缺少 ${d.date} 的净值，跳过该笔分红再投份额计算`
      );
      return;
    }

    totalShares += d.totalAmount / nav;
  });

  const avgCostPrice = totalShares > 0 ? totalCost / totalShares : 0;

  return {
    shares: totalShares,
    costPrice: avgCostPrice,
    costAmount: totalCost,
  };
}
