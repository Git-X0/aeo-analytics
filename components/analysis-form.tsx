"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Zap, Sparkles } from "lucide-react"
import { AnalysisResults } from "@/components/analysis-results"

const AI_MODELS = [
  { id: "openai/gpt-5-mini", name: "GPT-4 Mini", provider: "OpenAI" },
  { id: "openai/gpt-5", name: "GPT-4", provider: "OpenAI" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "anthropic/claude-3.5-opus", name: "Claude Opus 3.5", provider: "Anthropic" },
]

export function AnalysisForm() {
  const [query, setQuery] = useState("")
  const [brand, setBrand] = useState("")
  const [competitors, setCompetitors] = useState("")
  const [model, setModel] = useState("openai/gpt-5-mini")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!query || !brand) return

    setLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          brand,
          competitors: competitors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          model,
        }),
      })

      const data = await response.json()

      // Save to history
      const history = JSON.parse(localStorage.getItem("analysis_history") || "[]")
      history.push({
        ...data,
        query,
        brand,
        model,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("analysis_history", JSON.stringify(history))

      setAnalysis(data)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const exampleQueries = [
    "Jaké jsou nejlepší CRM nástroje pro malé firmy?",
    "Doporuč mi email marketing platformu",
    "Které projektové nástroje jsou nejlepší pro týmy?",
    "Co je nejlepší řešení pro e-commerce?",
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Nová analýza</h2>
        <p className="text-muted-foreground">Otestujte viditelnost vašeho brandu v různých AI modelech</p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Query Input */}
          <div className="space-y-3">
            <Label htmlFor="query" className="text-base font-semibold">
              Testovací dotaz
            </Label>
            <Textarea
              id="query"
              placeholder="Např: Jaké jsou nejlepší CRM nástroje pro malé firmy?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <p className="w-full text-sm text-muted-foreground">Rychlé příklady:</p>
              {exampleQueries.map((example, idx) => (
                <Button key={idx} variant="outline" size="sm" onClick={() => setQuery(example)} className="text-xs">
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Brand and Model */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="brand" className="text-base font-semibold">
                Váš brand
              </Label>
              <Input id="brand" placeholder="Např: HubSpot" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="model" className="text-base font-semibold">
                AI Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">({m.provider})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Competitors */}
          <div className="space-y-3">
            <Label htmlFor="competitors" className="text-base font-semibold">
              Konkurence <span className="text-sm font-normal text-muted-foreground">(volitelné)</span>
            </Label>
            <Input
              id="competitors"
              placeholder="Např: Salesforce, Pipedrive, Zoho"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Oddělte čárkou pro srovnání více konkurentů</p>
          </div>

          {/* Submit Button */}
          <Button onClick={handleAnalyze} disabled={loading || !query || !brand} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Analyzuji odpověď AI...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Spustit analýzu
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {analysis && <AnalysisResults data={analysis} brand={brand} />}
    </div>
  )
}
