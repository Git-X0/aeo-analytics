"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Globe, User, Languages, MapPin, Loader2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ContextConfig {
  region: string
  language: string
  persona: string
  device: string
}

interface ContextResult {
  context: ContextConfig
  visibilityScore: number
  brandMentions: {
    found: boolean
    count: number
    sentiment: string
  }
  aiResponse: string
}

const REGIONS = [
  { id: "us", name: "USA", flag: "🇺🇸" },
  { id: "eu", name: "Evropa", flag: "🇪🇺" },
  { id: "asia", name: "Asie", flag: "🌏" },
  { id: "latam", name: "Latinská Amerika", flag: "🌎" },
]

const LANGUAGES = [
  { id: "en", name: "Angličtina" },
  { id: "cs", name: "Čeština" },
  { id: "de", name: "Němčina" },
  { id: "es", name: "Španělština" },
]

const PERSONAS = [
  { id: "b2b", name: "B2B Decision Maker", description: "Vedoucí pracovník hledající enterprise řešení" },
  { id: "b2c", name: "B2C Consumer", description: "Běžný spotřebitel hledající osobní řešení" },
  { id: "developer", name: "Developer", description: "Vývojář hledající technické nástroje" },
  { id: "researcher", name: "Researcher", description: "Analytik srovnávající možnosti" },
]

const DEVICES = [
  { id: "desktop", name: "Desktop" },
  { id: "mobile", name: "Mobilní zařízení" },
  { id: "tablet", name: "Tablet" },
]

interface ContextSimulatorProps {
  query: string
  brand: string
  competitors: string[]
}

export function ContextSimulator({ query, brand, competitors }: ContextSimulatorProps) {
  const [region, setRegion] = useState("us")
  const [language, setLanguage] = useState("en")
  const [persona, setPersona] = useState("b2b")
  const [device, setDevice] = useState("desktop")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ContextResult[]>([])

  const runAnalysis = async (context: ContextConfig) => {
    const response = await fetch("/api/analyze-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        brand,
        competitors,
        context,
      }),
    })
    return response.json()
  }

  const handleTestSingleContext = async () => {
    setLoading(true)
    try {
      const context = { region, language, persona, device }
      const result = await runAnalysis(context)
      setResults([{ context, ...result }])
    } catch (error) {
      console.error("[v0] Context analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestAllContexts = async () => {
    setLoading(true)
    setResults([])

    try {
      const contexts: ContextConfig[] = []

      // Generate combinations of different contexts
      REGIONS.forEach((reg) => {
        LANGUAGES.forEach((lang) => {
          PERSONAS.forEach((pers) => {
            contexts.push({
              region: reg.id,
              language: lang.id,
              persona: pers.id,
              device: "desktop",
            })
          })
        })
      })

      // Run analyses in batches to avoid overwhelming the API
      const batchSize = 3
      const allResults: ContextResult[] = []

      for (let i = 0; i < Math.min(contexts.length, 12); i += batchSize) {
        const batch = contexts.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(async (context) => {
            const result = await runAnalysis(context)
            return { context, ...result }
          }),
        )
        allResults.push(...batchResults)
        setResults([...allResults])
      }
    } catch (error) {
      console.error("[v0] Multi-context analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = results.map((result) => ({
    name: `${REGIONS.find((r) => r.id === result.context.region)?.flag} ${LANGUAGES.find((l) => l.id === result.context.language)?.name}`,
    score: result.visibilityScore,
    mentions: result.brandMentions.count,
  }))

  const globalAverage =
    results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.visibilityScore, 0) / results.length) : 0

  const bestContext =
    results.length > 0
      ? results.reduce((best, current) => (current.visibilityScore > best.visibilityScore ? current : best))
      : null

  const worstContext =
    results.length > 0
      ? results.reduce((worst, current) => (current.visibilityScore < worst.visibilityScore ? current : worst))
      : null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Kontrolované testování kontextů</h3>
        <p className="text-sm text-muted-foreground">
          Simulujte různé uživatelské kontexty a zjistěte, jak se viditelnost vašeho brandu mění podle geolokace, jazyka
          a typu uživatele
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h4 className="mb-4 font-semibold">Konfigurace kontextu</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Region
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.flag} {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Jazyk
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="persona" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Persona
              </Label>
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger id="persona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Zařízení
              </Label>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger id="device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICES.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleTestSingleContext} disabled={loading || !query || !brand} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testuji...
              </>
            ) : (
              "Testovat tento kontext"
            )}
          </Button>
          <Button
            onClick={handleTestAllContexts}
            disabled={loading || !query || !brand}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testuji všechny...
              </>
            ) : (
              "Testovat všechny kombinace"
            )}
          </Button>
        </div>
      </Card>

      {results.length > 0 && (
        <>
          {/* Global Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Globální průměr</div>
              <div className="mt-2 text-3xl font-bold">{globalAverage}</div>
              <p className="mt-1 text-xs text-muted-foreground">Ze {results.length} testů</p>
            </Card>

            {bestContext && (
              <Card className="p-6">
                <div className="text-sm text-muted-foreground">Nejlepší kontext</div>
                <div className="mt-2 text-3xl font-bold text-green-500">{bestContext.visibilityScore}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {REGIONS.find((r) => r.id === bestContext.context.region)?.flag}{" "}
                    {REGIONS.find((r) => r.id === bestContext.context.region)?.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {LANGUAGES.find((l) => l.id === bestContext.context.language)?.name}
                  </Badge>
                </div>
              </Card>
            )}

            {worstContext && (
              <Card className="p-6">
                <div className="text-sm text-muted-foreground">Nejhorší kontext</div>
                <div className="mt-2 text-3xl font-bold text-red-500">{worstContext.visibilityScore}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {REGIONS.find((r) => r.id === worstContext.context.region)?.flag}{" "}
                    {REGIONS.find((r) => r.id === worstContext.context.region)?.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {LANGUAGES.find((l) => l.id === worstContext.context.language)?.name}
                  </Badge>
                </div>
              </Card>
            )}
          </div>

          {/* Chart */}
          <Card className="p-6">
            <h4 className="mb-6 font-semibold">Srovnání skóre podle kontextu</h4>
            <ChartContainer
              config={{
                score: {
                  label: "Skóre viditelnosti",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Detailed Results Table */}
          <Card className="p-6">
            <h4 className="mb-4 font-semibold">Detailní výsledky</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium">Jazyk</th>
                    <th className="pb-3 font-medium">Persona</th>
                    <th className="pb-3 font-medium text-right">Skóre</th>
                    <th className="pb-3 font-medium text-right">Zmínky</th>
                    <th className="pb-3 font-medium">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3">
                        {REGIONS.find((r) => r.id === result.context.region)?.flag}{" "}
                        {REGIONS.find((r) => r.id === result.context.region)?.name}
                      </td>
                      <td className="py-3">{LANGUAGES.find((l) => l.id === result.context.language)?.name}</td>
                      <td className="py-3">{PERSONAS.find((p) => p.id === result.context.persona)?.name}</td>
                      <td className="py-3 text-right font-semibold">{result.visibilityScore}</td>
                      <td className="py-3 text-right">{result.brandMentions.count}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            result.brandMentions.sentiment === "positive"
                              ? "bg-green-500/10 text-green-500"
                              : result.brandMentions.sentiment === "negative"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                          }
                        >
                          {result.brandMentions.sentiment === "positive"
                            ? "Pozitivní"
                            : result.brandMentions.sentiment === "negative"
                              ? "Negativní"
                              : "Neutrální"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Key Insights */}
          <Card className="border-primary/20 bg-primary/5 p-6">
            <h4 className="mb-4 font-semibold">Klíčová zjištění</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Viditelnost se liší mezi kontexty o{" "}
                  {bestContext && worstContext && (
                    <strong className="text-foreground">
                      {bestContext.visibilityScore - worstContext.visibilityScore} bodů
                    </strong>
                  )}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Nejlepší výsledky v regionu:{" "}
                  <strong className="text-foreground">
                    {bestContext && REGIONS.find((r) => r.id === bestContext.context.region)?.name}
                  </strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Nejhorší výsledky v regionu:{" "}
                  <strong className="text-foreground">
                    {worstContext && REGIONS.find((r) => r.id === worstContext.context.region)?.name}
                  </strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Pro konzistentní globální viditelnost optimalizujte obsah pro nejslabší trhy a jazykové mutace
                </span>
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
