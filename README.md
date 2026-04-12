# 追基日报（实时追踪您的基金组合 - Fund Tracking Daily）

> 一份可以管理基金的「电子报纸」

采用复古报纸风格设计的基金追踪工具，支持实时估值、持仓管理、收益分析。数据来自天天基金、腾讯财经、东方财富等公开接口，纯前端无需后端服务。

**在线预览**：[https://laova.github.io/fund-tracking-daily](https://laova.github.io/fund-tracking-daily)

## 功能一览

### 行情追踪

- 输入基金代码即可添加自选，支持搜索联想
- 实时获取基金估值净值与涨跌幅
- 业绩走势图表展示，以任意时间为起点计算相对收益
- 查看基金重仓股票及实时行情

### 持仓管理

- 记录每只基金的持有份额与成本价
- 自动计算持仓收益与累计收益率
- 每日收益日历热力图，直观展示收益分布
- 组合分析饼图与收益归因分析

### 组织整理

- 自定义创建基金分组（按类型、用途等分类）
- 基金在分组间移动
- 一键导入导出 JSON 数据备份

## 快速上手

```bash
# 克隆代码
git clone https://github.com/LAOVA/fund-tracking-daily
cd fund-tracking-daily

# 安装依赖
npm install

# 启动服务
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建发布

项目已配置 GitHub Actions 自动化部署，发布新版本流程如下：

1. 确认代码通过本地测试
2. 创建并推送新标签：

```bash
# 更新版本号（遵循 semver 规范）
git tag v1.0.0

# 推送到远程仓库
git push origin v1.0.0
```

推送标签后，CI 自动完成：依赖安装 → 项目构建 → 部署到 GitHub Pages。整个流程约需 2-3 分钟。

> [!NOTE]
> 部署前需在仓库 Settings → Pages → Source 中启用 GitHub Pages，并选择 "GitHub Actions" 作为部署来源。

### 手动构建

如需本地构建：

```bash
npm run build
```

构建产物在 `out/` 目录，可手动部署到任意静态托管服务。

## 技术方案

| 分类 | 技术选型                    |
| ---- | --------------------------- |
| 框架 | Next.js 16 (App Router)     |
| 语言 | TypeScript 5                |
| 样式 | Tailwind CSS 4 + 自定义主题 |
| 状态 | Zustand 5 (本地持久化)      |
| 组件 | shadcn/ui + Radix UI        |
| 图表 | Chart.js + react-chartjs-2  |

### 数据获取

通过浏览器端 JSONP 请求获取数据，无需后端代理：

| 数据类型 | 来源                  |
| -------- | --------------------- |
| 基金估值 | fundgz.1234567.com.cn |
| 历史净值 | fund.eastmoney.com    |
| 基金持仓 | fundf10.eastmoney.com |
| 股票行情 | qt.gtimg.cn           |

## 项目结构

```
fund-tracker/
├── app/                    # Next.js 应用
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 布局
├── components/
│   ├── analysis/          # 分析模块
│   │   ├── PortfolioAnalysis.tsx
│   │   └── ProfitAttribution.tsx
│   ├── funds/             # 基金模块
│   │   ├── ValuationTable.tsx
│   │   ├── FundDetailPanel.tsx
│   │   ├── FundSearch.tsx
│   │   ├── TransactionManager.tsx
│   │   └── DailyProfitCalendar.tsx
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx
│   │   └── HeroSection.tsx
│   └── ui/                # 基础组件
├── lib/
│   ├── utils.ts           # 工具函数
│   └── useFundData.ts     # 数据请求
└── stores/
    └── fundsStore.ts      # 状态管理
```

## 设计风格

整体采用「报纸杂志」视觉语言：

- **配色**：暖白底色 `#FFFEFB`、深褐文字 `#2D2A26`、红色强调 `#C41E3A`
- **字体**：Newsreader（标题）、Libre Baskerville（正文）、JetBrains Mono（数据）
- **元素**：粗边框、装饰分割线、双栏布局

界面设计灵感来源于传统财经报纸，试图在数字产品中保留纸媒的阅读质感。

## 注意事项

- 基金数据来源于第三方公开接口，可能存在延迟。
- 所有数据仅在本地浏览器存储，请定期备份重要数据。
- 该项目仅供个人学习及参考使用，不作为任何投资建议。

## 开源许可

本项目基于 **AGPL-3.0** 协议开源。

详细协议内容见 [LICENSE](./LICENSE) 文件。

## 交流反馈

如有问题或建议，欢迎提交 Issue。

