"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { ValuationTable } from "@/components/funds/ValuationTable";
import { useFundsStore, Fund } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { DailyProfitCalendar } from "@/components/funds/DailyProfitCalendar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HoldingsPage() {
  const {
    watchlist,
    removeFund,
    transactions,
  } = useFundsStore();

  const [fundToDelete, setFundToDelete] = useState<{ code: string } | null>(null);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const getFundByCode = (code: string) => {
    return watchlist.find((f: Fund) => f.code === code);
  };

  const calculateMarketValue = (fund: Fund) => {
    if (fund.shares && fund.estimatedNetValue) {
      return fund.shares * fund.estimatedNetValue;
    }
    return 0;
  };

  const calculateProfit = (fund: Fund) => {
    if (fund.shares && fund.costPrice && fund.estimatedNetValue) {
      return fund.shares * (fund.estimatedNetValue - fund.costPrice);
    }
    return 0;
  };

  const calculateTotalCost = (fund: Fund) => {
    return (fund.shares || 0) * (fund.costPrice || 0);
  };

  const getTransactionCount = (fundCode: string) => {
    return transactions.filter((t) => t.fundCode === fundCode).length;
  };

  const portfolioSummary = watchlist.reduce(
    (acc, fund) => {
      if (fund.shares && fund.costPrice) {
        const marketValue = calculateMarketValue(fund);
        const cost = calculateTotalCost(fund);
        acc.totalMarketValue += marketValue;
        acc.totalCost += cost;
        acc.totalProfit += marketValue - cost;
      }
      return acc;
    },
    { totalMarketValue: 0, totalCost: 0, totalProfit: 0 }
  );

  const totalProfitPercent =
    portfolioSummary.totalCost > 0
      ? (portfolioSummary.totalProfit / portfolioSummary.totalCost) * 100
      : 0;

  const toggleFundExpand = (fundCode: string) => {
    setExpandedFund(expandedFund === fundCode ? null : fundCode);
  };

  const handleDeleteFund = () => {
    if (fundToDelete) {
      removeFund(fundToDelete.code);
      setFundToDelete(null);
    }
  };

  return (
    <section>
      <div className="space-y-8 mb-8">
        <div className="border-b-2 border-news-text pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block bg-finance-rise text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2 w-fit">
                投资管理
              </span>
              <h1 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-news-text">
                全部持有
              </h1>
            </div>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-16 border-t border-news-border">
            <p className="text-news-muted font-['Libre_Baskerville'] text-lg mb-2">
              暂无关注基金
            </p>
            <p className="text-sm text-news-muted font-['Source_Sans_3']">
              请在上方搜索框添加基金代码
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {portfolioSummary.totalCost > 0 && (
            <div className="bg-news-accent border border-news-border p-6">
              <h2 className="font-['Newsreader'] text-xl font-bold text-news-text mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                投资总览
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-card border border-paper-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-news-text dark:bg-paper-100 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">¥</span>
                    </div>
                    <span className="text-xs text-news-muted font-['Source_Sans_3']">
                      总成本
                    </span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xl font-bold text-news-text">
                    {formatCurrency(portfolioSummary.totalCost)}
                  </div>
                </div>
                <div className="bg-card border border-paper-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        portfolioSummary.totalMarketValue >=
                          portfolioSummary.totalCost
                          ? "bg-finance-rise"
                          : "bg-finance-fall"
                      )}
                    >
                      <span className="text-white text-xs font-bold">¥</span>
                    </div>
                    <span className="text-xs text-news-muted font-['Source_Sans_3']">
                      总市值
                    </span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xl font-bold text-news-text">
                    {formatCurrency(portfolioSummary.totalMarketValue)}
                  </div>
                </div>
                <div className="bg-card border border-paper-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        portfolioSummary.totalProfit >= 0
                          ? "bg-finance-rise"
                          : "bg-finance-fall"
                      )}
                    >
                      {portfolioSummary.totalProfit >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-white" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-news-muted font-['Source_Sans_3']">
                      总收益
                    </span>
                  </div>
                  <div
                    className={cn(
                      "font-['JetBrains_Mono'] text-xl font-bold flex items-center gap-1",
                      getChangeColor(portfolioSummary.totalProfit)
                    )}
                  >
                    {formatCurrency(portfolioSummary.totalProfit)}
                  </div>
                </div>
                <div className="bg-card border border-paper-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        totalProfitPercent >= 0
                          ? "bg-finance-rise"
                          : "bg-finance-fall"
                      )}
                    >
                      {totalProfitPercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-white" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-news-muted font-['Source_Sans_3']">
                      总收益率
                    </span>
                  </div>
                  <div
                    className={cn(
                      "font-['JetBrains_Mono'] text-xl font-bold flex items-center gap-1",
                      getChangeColor(totalProfitPercent)
                    )}
                  >
                    {formatPercent(Math.abs(totalProfitPercent))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <DailyProfitCalendar funds={watchlist} />
              </div>
            </div>
          )}

          <ValuationTable />

          {portfolioSummary.totalCost === 0 && watchlist.length > 0 && (
            <div className="text-center py-12 text-news-muted font-['Source_Sans_3']">
              <p className="text-lg mb-2">暂无持仓信息</p>
              <p className="text-sm">请在基金详情中添加您的持仓记录</p>
            </div>
          )}

          <ConfirmDialog
            open={!!fundToDelete}
            onOpenChange={(open) => !open && setFundToDelete(null)}
            title="删除基金"
            description={`确定要删除基金 ${fundToDelete?.code} 吗？此操作不可恢复。`}
            confirmText="删除"
            cancelText="取消"
            onConfirm={handleDeleteFund}
            variant="destructive"
          />
          </div>
        )}
      </div>
    </section>
  );
}