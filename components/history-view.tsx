"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Search,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Calendar,
  Download,
} from "lucide-react"
import { AnalysisResults } from "@/components/analysis-results"

interface HistoryItem {
  aiResponse: string
  brandMentions: any
  competitorMentions?: any[]
  visibilityScore: number
  recommendations: string[]
  query: string
  brand: string
  model: string
  timestamp: string
}

export function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterModel, setFilterModel] = useState("all")
  const [filterSentiment, setFilterSentiment] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [history, searchQuery, filterModel, filterSentiment, sortBy])

  const loadHistory = () => {
    const stored = localStorage.getItem("analysis_history")
    if (stored) {
      const parsed = JSON.parse(stored)
      setHistory(parsed)
    }
  }

  const applyFilters = () => {
    let filtered = [...history]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Model filter
    if (filterModel !== "all") {
      filtered = filtered.filter((item) => item.model === filterModel)
    }

    // Sentiment filter
    if (filterSentiment !== "all") {
      filtered = filtered.filter((item) => item.brandMentions?.sentiment === filterSentiment)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case "score-high":
          return b.visibilityScore - a.visibilityScore
        case "score-low":
          return a.visibilityScore - b.visibilityScore
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }

  const clearHistory = () => {
    if (confirm("Opravdu chcete smazat celou historii analýz?")) {
      localStorage.removeItem("analysis_history")
      setHistory([])
      setFilteredHistory([])
      setSelectedItem(null)
    }
  }

  const deleteItem = (timestamp: string) => {
    const updated = history.filter((item) => item.timestamp !== timestamp)
    localStorage.setItem("analysis_history", JSON.stringify(updated))
    setHistory(updated)
    if (selectedItem?.timestamp === timestamp) {
      setSelectedItem(null)
    }
  }

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brand-analysis-history-${Date.now()}.json`
    a.click()
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
            Pozitivní
          </Badge>
        )
      case "negative":
        return (
          <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-500">
            Negativní
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
            Neutrální
          </Badge>
        )
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getModelName = (modelId: string) => {
    if (modelId.includes("gpt-5-mini")) return "GPT-4 Mini"
    if (modelId.includes("gpt-5")) return "GPT-4"
    if (modelId.includes("claude-sonnet")) return "Claude Sonnet"
    if (modelId.includes("claude-opus")) return "Claude Opus"
    return modelId
  }

  const uniqueModels = Array.from(new Set(history.map((item) => item.model)))

  if (selectedItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedItem(null)} className="mb-2">
              ← Zpět na historii
            </Button>
            <h2 className="text-2xl font-bold">Detail analýzy</h2>
          </div>
        </div>
        <AnalysisResults data={selectedItem} brand={selectedItem.brand} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Historie analýz</h2>
          <p className="text-muted-foreground">
            Celkem {history.length} {history.length === 1 ? "analýza" : history.length < 5 ? "analýzy" : "analýz"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportHistory}
            disabled={history.length === 0}
            className="gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            disabled={history.length === 0}
            className="gap-2 text-red-500 hover:text-red-600 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Smazat vše
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Hledat v dotazech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger>
              <SelectValue placeholder="Všechny modely" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny modely</SelectItem>
              {uniqueModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {getModelName(model)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSentiment} onValueChange={setFilterSentiment}>
            <SelectTrigger>
              <SelectValue placeholder="Všechny sentimenty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny sentimenty</SelectItem>
              <SelectItem value="positive">Pozitivní</SelectItem>
              <SelectItem value="neutral">Neutrální</SelectItem>
              <SelectItem value="negative">Negativní</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Seřadit podle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nejnovější</SelectItem>
              <SelectItem value="oldest">Nejstarší</SelectItem>
              <SelectItem value="score-high">Nejvyšší skóre</SelectItem>
              <SelectItem value="score-low">Nejnižší skóre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Žádná historie</h3>
          <p className="text-sm text-muted-foreground">
            {history.length === 0
              ? "Zatím jste neprovedli žádnou analýzu. Začněte vytvořením nové analýzy."
              : "Žádné výsledky odpovídající vašim filtrům."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <Card key={item.timestamp} className="p-6 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Query Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <span className="font-bold text-primary">#{filteredHistory.length - idx}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold leading-tight text-foreground">{item.query}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{item.brand}</Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.timestamp)}
                        </span>
                        <span>•</span>
                        <span>{getModelName(item.model)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center: Metrics */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="mb-1 text-xs text-muted-foreground">Skóre</div>
                    <div className={`text-2xl font-bold ${getScoreColor(item.visibilityScore)}`}>
                      {item.visibilityScore}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-xs text-muted-foreground">Zmínky</div>
                    <div className="flex items-center justify-center gap-1">
                      {item.brandMentions?.found ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-lg font-semibold text-foreground">{item.brandMentions.count}</span>
                        </>
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-xs text-muted-foreground">Sentiment</div>
                    {getSentimentBadge(item.brandMentions?.sentiment || "neutral")}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Detail
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.timestamp)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Trend indicator */}
              {idx < filteredHistory.length - 1 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  {item.visibilityScore > filteredHistory[idx + 1].visibilityScore ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">
                        +{item.visibilityScore - filteredHistory[idx + 1].visibilityScore} bodů od minulé analýzy
                      </span>
                    </>
                  ) : item.visibilityScore < filteredHistory[idx + 1].visibilityScore ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">
                        {item.visibilityScore - filteredHistory[idx + 1].visibilityScore} bodů od minulé analýzy
                      </span>
                    </>
                  ) : (
                    <span>Bez změny</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
