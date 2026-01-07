"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart3, Target } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"

export function Dashboard() {
  const [stats, setStats] = useState({
    averageScore: 0,
    totalAnalyses: 0,
    mentionRate: 0,
    trend: 0,
  })

  const [trendData, setTrendData] = useState<any[]>([])
  const [modelComparison, setModelComparison] = useState<any[]>([])

  useEffect(() => {
    const trendHistory = JSON.parse(localStorage.getItem("trend_data") || "[]")
    const history = JSON.parse(localStorage.getItem("analysis_history") || "[]")

    // Combine both sources for comprehensive stats
    const allData = [
      ...history,
      ...trendHistory.map((t: any) => ({
        visibilityScore: t.score,
        brandMentions: { found: t.mentions > 0, count: t.mentions },
        model: "Tracked",
      })),
    ]

    if (allData.length > 0) {
      const scores = allData.map((item: any) => item.visibilityScore)
      const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      const mentionsFound = allData.filter((item: any) => item.brandMentions?.found).length
      const mentionRate = (mentionsFound / allData.length) * 100

      // Calculate trend (last 5 vs previous 5)
      const recent = scores.slice(-5)
      const previous = scores.slice(-10, -5)
      const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / (recent.length || 1)
      const previousAvg = previous.reduce((a: number, b: number) => a + b, 0) / (previous.length || 1)
      const trend = ((recentAvg - previousAvg) / (previousAvg || 1)) * 100

      setStats({
        averageScore: Math.round(avgScore),
        totalAnalyses: allData.length,
        mentionRate: Math.round(mentionRate),
        trend: Math.round(trend),
      })

      // Prepare trend data (last 10 analyses)
      const chartData = allData.slice(-10).map((item: any, idx: number) => ({
        name: `#${idx + 1}`,
        score: item.visibilityScore,
        mentions: item.brandMentions?.count || 0,
      }))
      setTrendData(chartData)

      // Model comparison data
      const modelStats = allData.reduce((acc: any, item: any) => {
        const model = item.model || "GPT-4"
        if (!acc[model]) {
          acc[model] = { model, totalScore: 0, count: 0 }
        }
        acc[model].totalScore += item.visibilityScore
        acc[model].count += 1
        return acc
      }, {})

      const comparisonData = Object.values(modelStats).map((stat: any) => ({
        model: stat.model,
        avgScore: Math.round(stat.totalScore / stat.count),
      }))
      setModelComparison(comparisonData)
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-500"
    if (trend < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Přehled výkonnosti vaší značky v AI odpovědích</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Průměrné skóre</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}</h3>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Celkem analýz</p>
              <h3 className="text-3xl font-bold text-foreground">{stats.totalAnalyses}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Míra zmínění</p>
              <h3 className="text-3xl font-bold text-foreground">{stats.mentionRate}%</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trend</p>
              <div className="flex items-center gap-2">
                <h3 className={`text-3xl font-bold ${getTrendColor(stats.trend)}`}>
                  {stats.trend > 0 ? "+" : ""}
                  {stats.trend}%
                </h3>
                {stats.trend > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : stats.trend < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Vývoj skóre viditelnosti</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Zatím žádná data pro zobrazení
            </div>
          )}
        </Card>

        {/* Model Comparison */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold">Srovnání AI modelů</h3>
          {modelComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                  {modelComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Zatím žádná data pro srovnání
            </div>
          )}
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Tipy pro zlepšení viditelnosti</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <p className="text-sm text-foreground">
              Testujte různé AI modely - každý model má jiné preference a zdroje dat
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <p className="text-sm text-foreground">Sledujte trendy v čase a reagujte na změny v AI odpovědích</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <p className="text-sm text-foreground">Optimalizujte obsah na základě konkrétních doporučení z analýz</p>
          </li>
        </ul>
      </Card>
    </div>
  )
}
