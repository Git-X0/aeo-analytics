"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, Clock, Play } from "lucide-react"
import { TrendTracker } from "@/components/trend-tracker"

interface SavedAnalysis {
  id: string
  name: string
  brand: string
  queries: string[]
  competitors: string[]
  lastRun: string
  nextRun?: string
  frequency?: "daily" | "weekly" | "monthly"
  enabled: boolean
  latestScore?: number
  scoreChange?: number
}

export default function Home() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<SavedAnalysis | null>(null)
  const [showTracker, setShowTracker] = useState(false)

  // Load saved analyses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("brandvision_analyses")
    if (saved) {
      setSavedAnalyses(JSON.parse(saved))
    }
  }, [])

  // Save analyses to localStorage
  useEffect(() => {
    if (savedAnalyses.length > 0) {
      localStorage.setItem("brandvision_analyses", JSON.stringify(savedAnalyses))
    }
  }, [savedAnalyses])

  const createNewAnalysis = () => {
    setCurrentAnalysis(null)
    setShowTracker(true)
  }

  const openAnalysis = (analysis: SavedAnalysis) => {
    setCurrentAnalysis(analysis)
    setShowTracker(true)
  }

  const handleSaveAnalysis = (analysisData: Partial<SavedAnalysis>) => {
    const now = new Date().toISOString()
    if (currentAnalysis) {
      // Update existing
      setSavedAnalyses((prev) =>
        prev.map((a) => (a.id === currentAnalysis.id ? { ...a, ...analysisData, lastRun: now } : a)),
      )
    } else {
      // Create new
      const newAnalysis: SavedAnalysis = {
        id: Date.now().toString(),
        name: analysisData.name || `Analýza ${savedAnalyses.length + 1}`,
        brand: analysisData.brand || "",
        queries: analysisData.queries || [],
        competitors: analysisData.competitors || [],
        lastRun: now,
        enabled: false,
        ...analysisData,
      }
      setSavedAnalyses((prev) => [newAnalysis, ...prev])
    }
  }

  const deleteAnalysis = (id: string) => {
    setSavedAnalyses((prev) => prev.filter((a) => a.id !== id))
    localStorage.setItem("brandvision_analyses", JSON.stringify(savedAnalyses.filter((a) => a.id !== id)))
  }

  if (showTracker) {
    return (
      <TrendTracker
        initialAnalysis={currentAnalysis}
        onSave={handleSaveAnalysis}
        onBack={() => setShowTracker(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BrandVision AI</h1>
          <p className="text-gray-600">Sledování viditelnosti vašeho brandu v AI odpovědích</p>
        </div>

        <div className="mb-6">
          <Button onClick={createNewAnalysis} size="lg" className="w-full md:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Vytvořit novou analýzu
          </Button>
        </div>

        {savedAnalyses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-gray-400 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Zatím žádné analýzy</h3>
              <p className="text-gray-500 mb-6">Vytvořte první analýzu pro sledování viditelnosti vašeho brandu</p>
              <Button onClick={createNewAnalysis}>
                <Plus className="mr-2 h-4 w-4" />
                Začít
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedAnalyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openAnalysis(analysis)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{analysis.name}</CardTitle>
                      <CardDescription>{analysis.brand}</CardDescription>
                    </div>
                    {analysis.enabled && (
                      <Badge variant="default" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Aktivní
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.latestScore !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Aktuální skóre:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">{analysis.latestScore}</span>
                          {analysis.scoreChange !== undefined && analysis.scoreChange !== 0 && (
                            <div
                              className={`flex items-center text-sm ${analysis.scoreChange > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {analysis.scoreChange > 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(analysis.scoreChange)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <div className="text-xs text-gray-500 mb-1">Sledované dotazy:</div>
                      <div className="text-sm font-medium">{analysis.queries.length} dotazů</div>
                    </div>

                    {analysis.frequency && (
                      <div className="pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {analysis.frequency === "daily" && "Denně"}
                          {analysis.frequency === "weekly" && "Týdně"}
                          {analysis.frequency === "monthly" && "Měsíčně"}
                        </Badge>
                      </div>
                    )}

                    <div className="pt-2 text-xs text-gray-500">
                      Poslední test:{" "}
                      {new Date(analysis.lastRun).toLocaleDateString("cs-CZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="pt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          openAnalysis(analysis)
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Spustit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Opravdu chcete smazat tuto analýzu?")) {
                            deleteAnalysis(analysis.id)
                          }
                        }}
                      >
                        Smazat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
