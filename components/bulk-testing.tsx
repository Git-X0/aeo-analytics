"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Zap, Plus, X, Upload, Download, CheckCircle2, XCircle, AlertCircle, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

export function BulkTesting() {
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("openai/gpt-5-mini")
  const [queries, setQueries] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])

  const addQuery = () => {
    setQueries([...queries, ""])
  }

  const removeQuery = (index: number) => {
    setQueries(queries.filter((_, i) => i !== index))
  }

  const updateQuery = (index: number, value: string) => {
    const updated = [...queries]
    updated[index] = value
    setQueries(updated)
  }

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      setQueries(lines)
    }
    reader.readAsText(file)
  }

  const handleBulkTest = async () => {
    if (!brand || queries.filter((q) => q.trim()).length === 0) return

    setLoading(true)
    setProgress(0)
    setResults([])

    const validQueries = queries.filter((q) => q.trim())
    const allResults: any[] = []
    const increment = 100 / validQueries.length

    for (let i = 0; i < validQueries.length; i++) {
      const query = validQueries[i]
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            brand,
            model,
          }),
        })

        const data = await response.json()

        allResults.push({
          query,
          ...data,
        })

        setProgress((prev) => Math.min(prev + increment, 100))
        setResults([...allResults])
      } catch (error) {
        console.error(`Failed to analyze query "${query}":`, error)
      }
    }

    // Save to history
    const history = JSON.parse(localStorage.getItem("analysis_history") || "[]")
    allResults.forEach((result) => {
      history.push({
        ...result,
        brand,
        model,
        timestamp: new Date().toISOString(),
      })
    })
    localStorage.setItem("analysis_history", JSON.stringify(history))

    setLoading(false)
    setProgress(100)
  }

  const exportResults = () => {
    const csv = [
      ["Dotaz", "Skóre", "Zmíněno", "Počet zmínek", "Sentiment", "První pozice"].join(","),
      ...results.map((r) =>
        [
          `"${r.query}"`,
          r.visibilityScore,
          r.brandMentions?.found ? "Ano" : "Ne",
          r.brandMentions?.count || 0,
          r.brandMentions?.sentiment || "-",
          r.brandMentions?.positions[0] || "-",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bulk-analysis-${brand}-${Date.now()}.csv`
    a.click()
  }

  const getAverageScore = () => {
    if (results.length === 0) return 0
    return Math.round(results.reduce((sum, r) => sum + r.visibilityScore, 0) / results.length)
  }

  const getMentionRate = () => {
    if (results.length === 0) return 0
    const mentioned = results.filter((r) => r.brandMentions?.found).length
    return Math.round((mentioned / results.length) * 100)
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

  const getChartData = () => {
    return results.map((r, idx) => ({
      name: `Q${idx + 1}`,
      score: r.visibilityScore,
      mentions: r.brandMentions?.count || 0,
    }))
  }

  const exampleQueries = [
    "Jaké jsou nejlepší CRM nástroje pro malé firmy?",
    "Doporuč mi projektový management software",
    "Co je nejlepší řešení pro email marketing?",
    "Které účetní nástroje jsou nejvhodnější?",
  ]

  const loadExamples = () => {
    setQueries(exampleQueries)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Hromadné testování</h2>
        <p className="text-muted-foreground">Otestujte viditelnost vašeho brandu pro více dotazů najednou</p>
      </div>

      {/* Setup Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="bulk-brand" className="text-base font-semibold">
                Váš brand
              </Label>
              <Input
                id="bulk-brand"
                placeholder="Např: Monday.com"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="bulk-model" className="text-base font-semibold">
                AI Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="bulk-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai/gpt-5-mini">GPT-4 Mini</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-4</SelectItem>
                  <SelectItem value="anthropic/claude-sonnet-4.5">Claude Sonnet 4.5</SelectItem>
                  <SelectItem value="anthropic/claude-3.5-opus">Claude Opus 3.5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Testovací dotazy</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadExamples} className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Načíst příklady
                </Button>
                <Button variant="outline" size="sm" onClick={addQuery} className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Přidat dotaz
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {queries.map((query, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={`Dotaz ${idx + 1}`}
                    value={query}
                    onChange={(e) => updateQuery(idx, e.target.value)}
                    className="flex-1"
                  />
                  {queries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuery(idx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                <input id="file-upload" type="file" accept=".txt,.csv" onChange={loadFromFile} className="hidden" />
                <span className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2">
                  <Upload className="h-4 w-4" />
                  Nebo nahrajte soubor s dotazy (.txt, .csv)
                </span>
              </Label>
            </div>
          </div>

          <Button
            onClick={handleBulkTest}
            disabled={loading || !brand || queries.filter((q) => q.trim()).length === 0}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Testuji {queries.filter((q) => q.trim()).length} dotazů...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Spustit hromadný test
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Průběh testování</span>
                <span className="font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Dokončeno {results.length} z {queries.filter((q) => q.trim()).length} dotazů
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Průměrné skóre</h3>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(getAverageScore())}`}>{getAverageScore()}</div>
              <p className="mt-2 text-sm text-muted-foreground">z {results.length} testovaných dotazů</p>
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Míra zmínění</h3>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-foreground">{getMentionRate()}%</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {results.filter((r) => r.brandMentions?.found).length} z {results.length} odpovědí
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-muted-foreground">Nejlepší skóre</h3>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-4xl font-bold text-green-500">
                {Math.max(...results.map((r) => r.visibilityScore))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">maximální dosažené skóre</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vývoj skóre</h3>
                <Button variant="outline" size="sm" onClick={exportResults} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getChartData()}>
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
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} name="Skóre" />
                  <Line type="monotone" dataKey="mentions" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Zmínky" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Distribuce skóre</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getChartData()}>
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
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Results Table */}
          <Card className="p-6">
            <h3 className="mb-6 text-lg font-semibold">Detailní výsledky</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Dotaz</TableHead>
                    <TableHead className="text-center">Skóre</TableHead>
                    <TableHead className="text-center">Zmíněno</TableHead>
                    <TableHead className="text-center">Počet</TableHead>
                    <TableHead className="text-center">Sentiment</TableHead>
                    <TableHead className="text-center">Pozice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-sm">{result.query}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={getScoreColor(result.visibilityScore)}>
                          {result.visibilityScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.brandMentions?.found ? (
                          <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="mx-auto h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{result.brandMentions?.count || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getSentimentBadge(result.brandMentions?.sentiment || "neutral")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">#{result.brandMentions?.positions[0] || "-"}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Insights */}
          <Card className="border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Analýza výsledků</h3>
            <ul className="space-y-2">
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  Váš brand byl zmíněn v <strong>{getMentionRate()}%</strong> testovaných dotazů
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  Průměrné skóre <strong>{getAverageScore()}</strong> indikuje{" "}
                  {getAverageScore() >= 70 ? "výbornou" : getAverageScore() >= 40 ? "průměrnou" : "nízkou"} viditelnost
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground">
                  Nejlepší výsledek dosažen u dotazu:{" "}
                  <strong>
                    "
                    {
                      results.reduce((best, current) =>
                        current.visibilityScore > best.visibilityScore ? current : best,
                      ).query
                    }
                    "
                  </strong>
                </span>
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
