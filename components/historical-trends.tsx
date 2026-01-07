"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TrendDataPoint {
  date: string
  score: number
  competitor1?: number
  competitor2?: number
}

interface HistoricalTrendsProps {
  data: TrendDataPoint[]
  brandName: string
  competitors?: string[]
}

export function HistoricalTrends({ data, brandName, competitors = [] }: HistoricalTrendsProps) {
  const hasEnoughData = data.length >= 14

  const getDemoData = (): TrendDataPoint[] => {
    const demo: TrendDataPoint[] = []
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Create some intentional spikes and drops for demo
      let baseScore = 50
      if (i === 20) baseScore = 75 // Spike
      if (i === 15) baseScore = 35 // Drop
      if (i === 7) baseScore = 80 // Recent spike

      demo.push({
        date: date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit" }),
        score: baseScore + (Math.random() * 10 - 5), // Small random variation
        competitor1: 40 + Math.random() * 25,
        competitor2: 35 + Math.random() * 20,
      })
    }
    return demo
  }

  const displayData = hasEnoughData ? data : getDemoData()
  const isDemo = !hasEnoughData

  // Calculate trend metrics
  const calculateTrendMetrics = () => {
    if (displayData.length < 14) return null

    const recentWeek = displayData.slice(-7)
    const previousWeek = displayData.slice(-14, -7)

    const recentAvg = recentWeek.reduce((sum, d) => sum + d.score, 0) / 7
    const previousAvg = previousWeek.reduce((sum, d) => sum + d.score, 0) / 7

    const change = recentAvg - previousAvg
    const changePercent = (change / previousAvg) * 100

    return {
      current: Math.round(recentAvg),
      previous: Math.round(previousAvg),
      change: Math.round(change * 10) / 10,
      changePercent: Math.round(changePercent * 10) / 10,
      direction: change > 2 ? "up" : change < -2 ? "down" : "stable",
    }
  }

  const detectSignificantChanges = () => {
    const changes = []

    // For demo mode, create some sample significant changes
    if (isDemo && displayData.length >= 14) {
      return [
        {
          date: displayData[20]?.date || "Demo",
          change: 35,
          direction: "up" as const,
        },
        {
          date: displayData[15]?.date || "Demo",
          change: -28,
          direction: "down" as const,
        },
        {
          date: displayData[7]?.date || "Demo",
          change: 42,
          direction: "up" as const,
        },
      ]
    }

    // Real data detection
    for (let i = 7; i < displayData.length; i++) {
      const current = displayData.slice(i - 7, i).reduce((sum, d) => sum + d.score, 0) / 7
      const previous = displayData.slice(i - 14, i - 7).reduce((sum, d) => sum + d.score, 0) / 7
      const changePercent = ((current - previous) / previous) * 100

      if (Math.abs(changePercent) > 20) {
        changes.push({
          date: displayData[i].date,
          change: Math.round(changePercent),
          direction: changePercent > 0 ? ("up" as const) : ("down" as const),
        })
      }
    }
    return changes
  }

  const metrics = calculateTrendMetrics()
  const significantChanges = detectSignificantChanges()

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          📊 Zobrazuji demo data pro demonstraci funkcionalit. Po dokončení více analýz uvidíte skutečná historická
          data.
        </div>
      )}

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{metrics.current}</div>
              <p className="text-sm text-gray-600">Aktuální průměr (7 dní)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {metrics.direction === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
                {metrics.direction === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
                {metrics.direction === "stable" && <Minus className="h-5 w-5 text-gray-600" />}
                <span
                  className={`text-2xl font-bold ${
                    metrics.direction === "up"
                      ? "text-green-600"
                      : metrics.direction === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {metrics.change > 0 ? "+" : ""}
                  {metrics.change}
                </span>
              </div>
              <p className="text-sm text-gray-600">Změna za týden</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {metrics.changePercent > 0 ? "+" : ""}
                {metrics.changePercent}%
              </div>
              <p className="text-sm text-gray-600">Procentuální růst</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Significant Changes Alert */}
      <Card className={significantChanges.length > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <AlertTriangle className="h-5 w-5" />
            Významné změny detekované
          </CardTitle>
          <CardDescription>Změny větší než 20% týden ku týdnu</CardDescription>
        </CardHeader>
        <CardContent>
          {significantChanges.length > 0 ? (
            <div className="space-y-2">
              {significantChanges.map((change, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    {change.direction === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{change.date}</span>
                  </div>
                  <Badge variant={change.direction === "up" ? "default" : "destructive"}>
                    {change.direction === "up" ? "↑" : "↓"} {Math.abs(change.change)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Zatím nebyly detekovány žádné významné změny &gt;20%. Pokračujte v pravidelných analýzách pro sledování
              trendů.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vývoj skóre v čase</CardTitle>
          <CardDescription>Posledních 30 dní {isDemo && "(demo data)"}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorScore)"
                name={brandName}
              />
              {competitors.slice(0, 2).map((comp, i) => (
                <Area
                  key={comp}
                  type="monotone"
                  dataKey={`competitor${i + 1}`}
                  stroke={i === 0 ? "#ef4444" : "#10b981"}
                  fillOpacity={0.1}
                  fill={i === 0 ? "#ef4444" : "#10b981"}
                  name={comp}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Měsíční srovnání</CardTitle>
          <CardDescription>Tento měsíc vs. minulý měsíc</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(
                  displayData.slice(-30).reduce((sum, d) => sum + d.score, 0) / Math.min(30, displayData.length),
                )}
              </div>
              <p className="text-sm text-gray-600">Tento měsíc</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">
                {displayData.slice(-60, -30).length > 0
                  ? Math.round(
                      displayData.slice(-60, -30).reduce((sum, d) => sum + d.score, 0) /
                        displayData.slice(-60, -30).length,
                    )
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600">Minulý měsíc</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
