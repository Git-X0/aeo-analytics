"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, MessageSquare, Download, Share2 } from "lucide-react"

interface AnalysisResultsProps {
  data: {
    aiResponse: string
    brandMentions: {
      found: boolean
      count: number
      positions: number[]
      contexts: string[]
      sentiment: "positive" | "neutral" | "negative"
    }
    competitorMentions?: Array<{
      name: string
      count: number
      sentiment: "positive" | "neutral" | "negative"
    }>
    visibilityScore: number
    recommendations: string[]
    detailedMetrics?: {
      firstMentionPosition: number
      contextQuality: number
      competitiveAdvantage: number
    }
  }
  brand: string
}

export function AnalysisResults({ data, brand }: AnalysisResultsProps) {
  if (!data || !data.brandMentions) {
    return null
  }

  const handleExport = () => {
    const reportData = {
      brand,
      timestamp: new Date().toISOString(),
      ...data,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brand-analysis-${brand}-${Date.now()}.json`
    a.click()
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "negative":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Výborná"
    if (score >= 60) return "Dobrá"
    if (score >= 40) return "Průměrná"
    return "Nízká"
  }

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Sdílet
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="border-2 p-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Skóre viditelnosti</h3>
            <div className="flex items-baseline gap-3">
              <span className={`text-7xl font-bold ${getScoreColor(data.visibilityScore)}`}>
                {data.visibilityScore}
              </span>
              <div className="text-left">
                <div className="text-2xl text-muted-foreground">/100</div>
                <Badge variant="outline" className={`mt-1 ${getSentimentColor(data.brandMentions.sentiment)}`}>
                  {getScoreLabel(data.visibilityScore)} viditelnost
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Target className="h-16 w-16 text-primary" />
          </div>
        </div>
      </Card>

      {/* Brand Mentions */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Analýza zmínek brandu</h3>
          {data.brandMentions.found ? (
            <Badge variant="outline" className="gap-1.5 border-green-500/20 bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-3 w-3" />
              Nalezeno
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 border-red-500/20 bg-red-500/10 text-red-500">
              <XCircle className="h-3 w-3" />
              Nenalezeno
            </Badge>
          )}
        </div>

        {data.brandMentions.found ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 text-sm text-muted-foreground">Počet zmínek</div>
                <div className="text-3xl font-bold text-foreground">{data.brandMentions.count}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.brandMentions.count === 1 ? "zmínka" : data.brandMentions.count < 5 ? "zmínky" : "zmínek"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 text-sm text-muted-foreground">Sentiment</div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(data.brandMentions.sentiment)}
                  <span className="text-xl font-semibold capitalize text-foreground">
                    {data.brandMentions.sentiment === "positive"
                      ? "Pozitivní"
                      : data.brandMentions.sentiment === "negative"
                        ? "Negativní"
                        : "Neutrální"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 text-sm text-muted-foreground">První zmínka</div>
                <div className="text-3xl font-bold text-foreground">#{data.brandMentions.positions[0] || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">pozice ve větě</p>
              </div>
            </div>

            {data.brandMentions.contexts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Kontext zmínek:</h4>
                <div className="space-y-2">
                  {data.brandMentions.contexts.map((context, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Zmínka #{idx + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h4 className="mb-2 text-lg font-semibold text-foreground">Brand nebyl zmíněn</h4>
            <p className="text-sm text-muted-foreground">
              Váš brand se neobjevil v odpovědi AI. Podívejte se na doporučení níže.
            </p>
          </div>
        )}
      </Card>

      {/* Competitor Comparison */}
      {data.competitorMentions && data.competitorMentions.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-6 text-xl font-semibold">Srovnání s konkurencí</h3>
          <div className="space-y-3">
            {data.competitorMentions.map((competitor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{competitor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {competitor.count} {competitor.count === 1 ? "zmínka" : "zmínky"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getSentimentColor(competitor.sentiment)}>
                  {competitor.sentiment === "positive"
                    ? "Pozitivní"
                    : competitor.sentiment === "negative"
                      ? "Negativní"
                      : "Neutrální"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Response */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Kompletní AI odpověď</h3>
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">{data.aiResponse}</p>
        </div>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="border-primary/20 bg-primary/5 p-6">
          <h3 className="mb-4 text-xl font-semibold text-foreground">Akční doporučení</h3>
          <ul className="space-y-3">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <span className="leading-relaxed text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Score Explanation */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Jak se počítá skóre viditelnosti?</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <div>
              <strong className="text-foreground">Zmínky (0-40 bodů):</strong> Každá zmínka přidává body
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <div>
              <strong className="text-foreground">Pozice (0-15 bodů):</strong> Čím dříve je brand zmíněn, tím lépe
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <div>
              <strong className="text-foreground">Sentiment (0-25 bodů):</strong> Pozitivní zmínky získávají nejvíce
              bodů
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <div>
              <strong className="text-foreground">Srovnání (0-20 bodů):</strong> Bonus za zmínění mezi konkurencí
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
