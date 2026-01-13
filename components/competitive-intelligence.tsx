"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Award, AlertCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface CompetitorData {
  brand: string
  count: number
  avgPosition: number
  sentiment: string
  shareOfVoice: number
}

interface CompetitiveIntelligenceProps {
  myBrand: string
  competitors: CompetitorData[]
  totalMentions: number
}

export function CompetitiveIntelligence({ myBrand, competitors, totalMentions }: CompetitiveIntelligenceProps) {
  // Find my brand data
  const myData = competitors.find((c) => c.brand.toLowerCase() === myBrand.toLowerCase())
  const competitorData = competitors.filter((c) => c.brand.toLowerCase() !== myBrand.toLowerCase())

  // Calculate rankings
  const sortedByMentions = [...competitors].sort((a, b) => b.count - a.count)
  const myRank = sortedByMentions.findIndex((c) => c.brand.toLowerCase() === myBrand.toLowerCase()) + 1

  // Share of voice calculation
  const shareOfVoiceData = competitors.slice(0, 5).map((comp) => ({
    name: comp.brand,
    value: comp.shareOfVoice,
    isMyBrand: comp.brand.toLowerCase() === myBrand.toLowerCase(),
  }))

  // Radar chart data for competitive comparison
  const radarData = [
    {
      metric: "Zmínky",
      [myBrand]: myData ? (myData.count / Math.max(...competitors.map((c) => c.count))) * 100 : 0,
      Konkurence:
        competitorData.length > 0
          ? (competitorData.reduce((sum, c) => sum + c.count, 0) /
              competitorData.length /
              Math.max(...competitors.map((c) => c.count))) *
            100
          : 0,
    },
    {
      metric: "Pozice",
      [myBrand]: myData ? 100 - (myData.avgPosition / 500) * 100 : 0,
      Konkurence:
        competitorData.length > 0
          ? 100 - (competitorData.reduce((sum, c) => sum + c.avgPosition, 0) / competitorData.length / 500) * 100
          : 0,
    },
    {
      metric: "Sentiment",
      [myBrand]: myData ? (myData.sentiment === "positive" ? 100 : myData.sentiment === "neutral" ? 50 : 0) : 0,
      Konkurence:
        competitorData.length > 0
          ? competitorData.reduce(
              (sum, c) => sum + (c.sentiment === "positive" ? 100 : c.sentiment === "neutral" ? 50 : 0),
              0,
            ) / competitorData.length
          : 0,
    },
    {
      metric: "Share of Voice",
      [myBrand]: myData?.shareOfVoice || 0,
      Konkurence:
        competitorData.length > 0
          ? competitorData.reduce((sum, c) => sum + c.shareOfVoice, 0) / competitorData.length
          : 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vaše pozice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">#{myRank}</div>
            <p className="text-xs text-gray-500 mt-1">z {competitors.length} brandů</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Share of Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{myData?.shareOfVoice.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">podíl zmínek na trhu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Celkem zmínek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{myData?.count || 0}</div>
            <p className="text-xs text-gray-500 mt-1">napříč všemi odpověďmi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Průměrná pozice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{myData?.avgPosition || 0}</div>
            <p className="text-xs text-gray-500 mt-1">v textu odpovědi</p>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Srovnání s konkurencí</CardTitle>
          <CardDescription>Váš brand vs. průměr konkurence napříč klíčovými metrikami</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name={myBrand} dataKey={myBrand} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Konkurence" dataKey="Konkurence" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Share of Voice Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Share of Voice - podíl zmínek</CardTitle>
          <CardDescription>Jak velký podíl konverzace ve vašem segmentu vlastníte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shareOfVoiceData.map((data) => (
              <div
                key={data.name}
                className={`p-3 rounded-lg ${data.isMyBrand ? "bg-blue-50 border-2 border-blue-500" : "bg-gray-50"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{data.name}</span>
                    {data.isMyBrand && (
                      <Badge variant="default" className="text-xs">
                        Váš brand
                      </Badge>
                    )}
                  </div>
                  <span className="text-lg font-bold text-blue-600">{data.value.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${data.isMyBrand ? "bg-blue-600" : "bg-gray-400"}`}
                    style={{ width: `${data.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailní srovnání konkurentů</CardTitle>
          <CardDescription>Co AI říká o vás vs. o konkurenci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.slice(0, 4).map((comp) => {
              const isMyBrand = comp.brand.toLowerCase() === myBrand.toLowerCase()
              return (
                <div
                  key={comp.brand}
                  className={`p-4 rounded-lg border-2 ${isMyBrand ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{comp.brand}</h4>
                    {isMyBrand && (
                      <Badge variant="default" className="text-xs">
                        Vy
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Zmínky:</span>
                      <span className="font-semibold">{comp.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pozice:</span>
                      <span className="font-semibold">{comp.avgPosition}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sentiment:</span>
                      <Badge
                        variant={
                          comp.sentiment === "positive"
                            ? "default"
                            : comp.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {comp.sentiment}
                      </Badge>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses removed as they were demo data */}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Areas where competitors dominate */}
      <Card>
        <CardHeader>
          <CardTitle>Oblasti dominance konkurence</CardTitle>
          <CardDescription>Kde vás konkurence překonává</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitorData.slice(0, 3).map((comp, idx) => {
              const advantageCount = comp.count - (myData?.count || 0)
              const advantagePercent = myData ? ((advantageCount / myData.count) * 100).toFixed(0) : "0"

              return (
                <div key={comp.brand} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">{comp.brand}</h4>
                      </div>
                      <p className="text-sm text-red-800">
                        Má o <strong>{advantageCount} zmínek více</strong> ({advantagePercent}% advantage)
                      </p>
                      {/* Strengths removed as they were demo data */}
                    </div>
                    <Badge variant="destructive">#{idx + 1}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Konkurenční pozice - Zmínky vs. Pozice</CardTitle>
          <CardDescription>Čím více zmínek a lepší pozice, tím silnější brand</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={competitors.slice(0, 8)}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="brand" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Počet zmínek" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
