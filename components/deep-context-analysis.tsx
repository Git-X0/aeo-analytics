"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, Star, Headphones, Zap, Shield, Users, TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface MentionCategory {
  category: string
  count: number
  sentiment: "positive" | "neutral" | "negative"
  examples: string[]
  icon: string
}

interface DeepContextProps {
  brandName: string
  mentions: MentionCategory[]
  quotes: Array<{ text: string; category: string; sentiment: string }>
}

const CATEGORY_ICONS = {
  product: Package,
  pricing: DollarSign,
  quality: Star,
  support: Headphones,
  performance: Zap,
  security: Shield,
  usability: Users,
  features: TrendingUp,
}

const CATEGORY_COLORS = {
  product: "#3b82f6",
  pricing: "#10b981",
  quality: "#f59e0b",
  support: "#8b5cf6",
  performance: "#ef4444",
  security: "#06b6d4",
  usability: "#ec4899",
  features: "#6366f1",
}

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#6b7280",
  negative: "#ef4444",
}

export function DeepContextAnalysis({ brandName, mentions, quotes }: DeepContextProps) {
  // Calculate category distribution
  const categoryData = mentions.map((m) => ({
    name: m.category.charAt(0).toUpperCase() + m.category.slice(1),
    value: m.count,
    color: CATEGORY_COLORS[m.category as keyof typeof CATEGORY_COLORS] || "#6b7280",
  }))

  // Calculate sentiment per category
  const sentimentByCategory = mentions.map((m) => ({
    category: m.category.charAt(0).toUpperCase() + m.category.slice(1),
    positive: m.sentiment === "positive" ? m.count : 0,
    neutral: m.sentiment === "neutral" ? m.count : 0,
    negative: m.sentiment === "negative" ? m.count : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Kategorizace zmínek</CardTitle>
          <CardDescription>V jakých kontextech je váš brand nejčastěji zmiňován</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {mentions.map((m) => {
                const Icon = CATEGORY_ICONS[m.category as keyof typeof CATEGORY_ICONS] || Package
                return (
                  <div key={m.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium capitalize">{m.category}</div>
                        <div className="text-xs text-gray-500">{m.count} zmínek</div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.sentiment === "positive"
                          ? "default"
                          : m.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {m.sentiment}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment podle kategorií</CardTitle>
          <CardDescription>Jak AI hodnotí váš brand v různých oblastech</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sentimentByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Pozitivní" />
              <Bar dataKey="neutral" stackId="a" fill="#6b7280" name="Neutrální" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negativní" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Quotes and Citations */}
      <Card>
        <CardHeader>
          <CardTitle>Klíčové citace z AI odpovědí</CardTitle>
          <CardDescription>Přesné formulace, jak AI popisuje {brandName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote, idx) => (
              <div
                key={idx}
                className="border-l-4 pl-4 py-2"
                style={{ borderColor: CATEGORY_COLORS[quote.category as keyof typeof CATEGORY_COLORS] || "#6b7280" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 italic text-sm">"{quote.text}"</p>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline" className="text-xs capitalize">
                      {quote.category}
                    </Badge>
                    <Badge
                      variant={
                        quote.sentiment === "positive"
                          ? "default"
                          : quote.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {quote.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights podle kategorií</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentions.map((m) => {
              const Icon = CATEGORY_ICONS[m.category as keyof typeof CATEGORY_ICONS] || Package
              return (
                <div key={m.category} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon
                      className="h-5 w-5"
                      style={{ color: CATEGORY_COLORS[m.category as keyof typeof CATEGORY_COLORS] }}
                    />
                    <h4 className="font-semibold capitalize">{m.category}</h4>
                  </div>
                  <div className="space-y-2">
                    {m.examples.slice(0, 2).map((ex, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        • {ex}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
