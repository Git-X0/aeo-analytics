"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Zap, Target, TrendingUp, CheckCircle2, XCircle } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"

const AI_MODELS = [
  { id: "openai/gpt-5-mini", name: "GPT-4 Mini", provider: "OpenAI", color: "#10b981" },
  { id: "openai/gpt-5", name: "GPT-4", provider: "OpenAI", color: "#3b82f6" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic", color: "#8b5cf6" },
  { id: "anthropic/claude-3.5-opus", name: "Claude Opus 3.5", provider: "Anthropic", color: "#ec4899" },
]

export function MultiModelComparison() {
  const [query, setQuery] = useState("")
  const [brand, setBrand] = useState("")
  const [selectedModels, setSelectedModels] = useState<string[]>(["openai/gpt-5-mini", "anthropic/claude-sonnet-4.5"])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [progress, setProgress] = useState(0)

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId))
    } else {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  const handleCompare = async () => {
    if (!query || !brand || selectedModels.length === 0) return

    setLoading(true)
    setProgress(0)
    setResults([])

    const allResults: any[] = []
    const increment = 100 / selectedModels.length

    for (let i = 0; i < selectedModels.length; i++) {
      const modelId = selectedModels[i]
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            brand,
            model: modelId,
          }),
        })

        const data = await response.json()
        const modelInfo = AI_MODELS.find((m) => m.id === modelId)

        allResults.push({
          model: modelInfo?.name || modelId,
          modelId,
          color: modelInfo?.color || "#666",
          ...data,
        })

        setProgress((prev) => Math.min(prev + increment, 100))
        setResults([...allResults])
      } catch (error) {
        console.error(`Failed to analyze with ${modelId}:`, error)
      }
    }

    setLoading(false)
    setProgress(100)
  }

  const getComparisonData = () => {
    if (results.length === 0) return []

    return results.map((result) => ({
      model: result.model,
      score: result.visibilityScore,
      mentions: result.brandMentions?.count || 0,
      color: result.color,
    }))
  }

  const getRadarData = () => {
    const metrics = ["Skóre", "Zmínky", "Pozice", "Sentiment", "Kontext"]

    return metrics.map((metric) => {
      const dataPoint: any = { metric }
      results.forEach((result) => {
        switch (metric) {
          case "Skóre":
            dataPoint[result.model] = result.visibilityScore
            break
          case "Zmínky":
            dataPoint[result.model] = (result.brandMentions?.count || 0) * 20
            break
          case "Pozice":
            const pos = result.brandMentions?.positions[0] || 10
            dataPoint[result.model] = Math.max(0, 100 - pos * 10)
            break
          case "Sentiment":
            const sentiment = result.brandMentions?.sentiment
            dataPoint[result.model] = sentiment === "positive" ? 100 : sentiment === "neutral" ? 50 : 0
            break
          case "Kontext":
            dataPoint[result.model] = Math.min((result.brandMentions?.contexts?.length || 0) * 30, 100)
            break
        }
      })
      return dataPoint
    })
  }

  const getBestModel = () => {
    if (results.length === 0) return null
    return results.reduce((best, current) => (current.visibilityScore > best.visibilityScore ? current : best))
  }

  const getWorstModel = () => {
    if (results.length === 0) return null
    return results.reduce((worst, current) => (current.visibilityScore < worst.visibilityScore ? current : worst))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Srovnání AI modelů</h2>
        <p className="text-muted-foreground">Porovnejte, jak různé AI modely hodnotí viditelnost vašeho brandu</p>
      </div>

      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="compare-query" className="text-base font-semibold">
              Testovací dotaz
            </Label>
            <Textarea
              id="compare-query"
              placeholder="Např: Jaké jsou nejlepší projektové nástroje pro týmy?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="compare-brand" className="text-base font-semibold">
              Váš brand
            </Label>
            <Input
              id="compare-brand"
              placeholder="Např: Asana"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Vyberte modely k porovnání</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {AI_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
                    selectedModels.includes(model.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    id={model.id}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => toggleModel(model.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={model.id} className="flex cursor-pointer items-center gap-2">
                      <Sparkles className="h-4 w-4" style={{ color: model.color }} />
                      <span className="font-semibold text-foreground">{model.name}</span>
                    </label>
                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Vybráno: {selectedModels.length}{" "}
              {selectedModels.length === 1 ? "model" : selectedModels.length < 5 ? "modely" : "modelů"}
            </p>
          </div>

          <Button
            onClick={handleCompare}
            disabled={loading || !query || !brand || selectedModels.length === 0}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Porovnávám modely...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Spustit srovnání
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Průběh analýzy</span>
                <span className="font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Nejlepší model</h3>
                <Target className="h-5 w-5 text-green-500" />
              </div>
              {getBestModel() && (
                <>
                  <div className="mb-1 text-2xl font-bold text-foreground">{getBestModel()?.model}</div>
                  <div className="text-3xl font-bold text-green-500">{getBestModel()?.visibilityScore}</div>
                  <p className="mt-2 text-sm text-muted-foreground">bodů viditelnosti</p>
                </>
              )}
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Průměrné skóre</h3>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(results.reduce((sum, r) => sum + r.visibilityScore, 0) / results.length)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">průměr všech modelů</p>
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Rozdíl</h3>
                <Sparkles className="h-5 w-5 text-orange-500" />
              </div>
              {getBestModel() && getWorstModel() && (
                <>
                  <div className="text-3xl font-bold text-foreground">
                    {getBestModel()!.visibilityScore - getWorstModel()!.visibilityScore}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">bodů mezi nejlepším a nejhorším</p>
                </>
              )}
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Srovnání skóre</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getComparisonData()}>
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
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {getComparisonData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Radar Chart */}
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Detailní metriky</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                  {results.map((result, idx) => (
                    <Radar
                      key={result.modelId}
                      name={result.model}
                      dataKey={result.model}
                      stroke={result.color}
                      fill={result.color}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Detailed Results */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Detailní výsledky</h3>
            {results.map((result) => (
              <Card key={result.modelId} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: result.color }} />
                    <h4 className="text-lg font-semibold text-foreground">{result.model}</h4>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    Skóre: <span className="ml-1 font-bold">{result.visibilityScore}</span>
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="mb-1 text-xs text-muted-foreground">Zmínky</div>
                    <div className="flex items-center gap-2">
                      {result.brandMentions?.found ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-xl font-bold text-foreground">{result.brandMentions.count}</span>
                        </>
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="mb-1 text-xs text-muted-foreground">První pozice</div>
                    <div className="text-xl font-bold text-foreground">
                      #{result.brandMentions?.positions[0] || "-"}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="mb-1 text-xs text-muted-foreground">Sentiment</div>
                    <div className="text-sm font-semibold capitalize text-foreground">
                      {result.brandMentions?.sentiment === "positive"
                        ? "Pozitivní"
                        : result.brandMentions?.sentiment === "negative"
                          ? "Negativní"
                          : "Neutrální"}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="mb-1 text-xs text-muted-foreground">Kontexty</div>
                    <div className="text-xl font-bold text-foreground">
                      {result.brandMentions?.contexts?.length || 0}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Insights */}
          <Card className="border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Klíčová zjištění</h3>
            <ul className="space-y-2">
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  <strong>{getBestModel()?.model}</strong> dosáhl nejlepšího skóre s{" "}
                  <strong>{getBestModel()?.visibilityScore} body</strong>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  Průměrné skóre napříč modely je{" "}
                  <strong>
                    {Math.round(results.reduce((sum, r) => sum + r.visibilityScore, 0) / results.length)} bodů
                  </strong>
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  Váš brand byl zmíněn v <strong>{results.filter((r) => r.brandMentions?.found).length}</strong> z{" "}
                  <strong>{results.length}</strong> testovaných modelů
                </span>
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
