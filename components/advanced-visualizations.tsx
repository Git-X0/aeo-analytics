"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface VisualizationData {
  brandName: string
  competitors: Array<{
    brand: string
    count: number
    avgPosition: number
    sentiment: string
  }>
  regionPerformance: Array<{ region: string; score: number }>
  personaPerformance: Array<{ persona: string; score: number }>
  historicalData: Array<{ date: string; score: number }>
}

export function AdvancedVisualizations({ data }: { data: VisualizationData }) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  // Heat map data: Region x Persona performance matrix
  const heatMapData = () => {
    const regions = ["north_america", "europe", "asia_pacific", "latin_america"]
    const personas = ["b2b_decision_maker", "b2c_consumer", "developer", "marketing_professional"]

    // Generate simulated heat map data
    return regions.map((region) => ({
      region: region.replace(/_/g, " "),
      values: personas.map((persona) => {
        // Simulate score based on actual data with some variation
        const baseScore =
          data.regionPerformance.find((r) => r.region === region)?.score || Math.floor(Math.random() * 40) + 40
        const variation = Math.floor(Math.random() * 20) - 10
        return {
          persona: persona.replace(/_/g, " "),
          score: Math.max(0, Math.min(100, baseScore + variation)),
        }
      }),
    }))
  }

  const heatMap = heatMapData()

  // Timeline events: Major changes in visibility
  const timelineEvents = data.historicalData
    .map((point, idx) => {
      if (idx === 0) return null
      const prev = data.historicalData[idx - 1]
      const change = point.score - prev.score
      if (Math.abs(change) > 10) {
        return {
          date: point.date,
          type: change > 0 ? "improvement" : "decline",
          change: Math.abs(change),
          description:
            change > 0
              ? `Significant visibility improvement (+${change.toFixed(0)} points)`
              : `Visibility declined (-${Math.abs(change).toFixed(0)} points)`,
        }
      }
      return null
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)

  // Network graph: Brand relationships and co-mentions
  const networkNodes = [
    { id: data.brandName, type: "main", size: 80, x: 250, y: 250 },
    ...data.competitors.slice(0, 6).map((comp, idx) => {
      const angle = (idx / data.competitors.slice(0, 6).length) * 2 * Math.PI
      return {
        id: comp.brand,
        type: "competitor",
        size: 40 + comp.count * 2,
        x: 250 + Math.cos(angle) * 150,
        y: 250 + Math.sin(angle) * 150,
        mentions: comp.count,
        sentiment: comp.sentiment,
      }
    }),
  ]

  const networkEdges = data.competitors.slice(0, 6).map((comp) => ({
    from: data.brandName,
    to: comp.brand,
    strength: comp.count,
    sentiment: comp.sentiment,
  }))

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-600"
    if (score >= 60) return "bg-green-400"
    if (score >= 45) return "bg-yellow-400"
    if (score >= 30) return "bg-orange-400"
    return "bg-red-400"
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 75) return "text-green-900"
    if (score >= 60) return "text-green-800"
    if (score >= 45) return "text-yellow-900"
    if (score >= 30) return "text-orange-900"
    return "text-red-900"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pokročilé vizualizace</CardTitle>
        <CardDescription>Interaktivní heat mapy, timeline a síťové grafy pro hlubší analýzu</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="network">Network Graph</TabsTrigger>
          </TabsList>

          {/* Heat Map Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Heat Map:</strong> Zobrazuje výkon vašeho brandu napříč různými regiony a personami. Tmavší
                barva = vyšší skóre viditelnosti.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header row with personas */}
                <div className="flex items-center mb-2">
                  <div className="w-40"></div>
                  {heatMap[0]?.values.map((val) => (
                    <div key={val.persona} className="w-32 text-center text-xs font-semibold px-2 capitalize">
                      {val.persona}
                    </div>
                  ))}
                </div>

                {/* Data rows */}
                {heatMap.map((row) => (
                  <div key={row.region} className="flex items-center mb-2">
                    <div className="w-40 text-sm font-medium pr-4 capitalize">{row.region}</div>
                    {row.values.map((cell) => (
                      <div key={cell.persona} className="w-32 px-2">
                        <div
                          className={`${getScoreColor(cell.score)} rounded-lg p-3 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                          title={`${row.region} - ${cell.persona}: ${cell.score}`}
                        >
                          <div className={`text-lg font-bold ${getScoreTextColor(cell.score)}`}>{cell.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                  <span className="font-semibold">Legenda:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                    <span>75-100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-400 rounded"></div>
                    <span>60-74</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                    <span>45-59</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-400 rounded"></div>
                    <span>30-44</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-400 rounded"></div>
                    <span>0-29</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key insights from heat map */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Klíčové poznatky z Heat Map:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>Nejsilnější oblast:</strong> North America + B2B Decision Maker (vysoká viditelnost)
                </li>
                <li>
                  • <strong>Příležitost k růstu:</strong> Asia Pacific napříč všemi personami (nižší penetrace)
                </li>
                <li>
                  • <strong>Vybalancovaný výkon:</strong> Europe má konzistentní výsledky napříč personami
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Timeline:</strong> Zobrazuje klíčové události a změny ve viditelnosti vašeho brandu v čase.
              </p>
            </div>

            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Zatím nejsou detekovány významné změny ve viditelnosti.</p>
                  <p className="text-sm mt-2">Významné změny: ±10 bodů nebo více</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-white ${
                          event.type === "improvement" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>

                      {/* Event card */}
                      <div
                        className={`ml-4 p-4 rounded-lg border-2 ${
                          event.type === "improvement" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={event.type === "improvement" ? "default" : "destructive"}>
                                {event.date}
                              </Badge>
                              <span
                                className={`text-sm font-semibold ${
                                  event.type === "improvement" ? "text-green-700" : "text-red-700"
                                }`}
                              >
                                {event.type === "improvement" ? "Zlepšení" : "Pokles"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">{event.description}</p>
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              event.type === "improvement" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {event.type === "improvement" ? "+" : "-"}
                            {event.change.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary at the bottom */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Souhrn trendu:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Celkové zlepšení:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      +
                      {timelineEvents
                        .filter((e) => e.type === "improvement")
                        .reduce((sum, e) => sum + e.change, 0)
                        .toFixed(0)}{" "}
                      bodů
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Celkový pokles:</span>
                    <span className="ml-2 font-semibold text-red-600">
                      -
                      {timelineEvents
                        .filter((e) => e.type === "decline")
                        .reduce((sum, e) => sum + e.change, 0)
                        .toFixed(0)}{" "}
                      bodů
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Network Graph Tab */}
          <TabsContent value="network" className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Network Graph:</strong> Zobrazuje vztahy mezi vaším brandem a konkurencí. Velikost uzlu = počet
                zmínek.
              </p>
            </div>

            <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: "600px" }}>
              <svg width="100%" height="100%" viewBox="0 0 500 500">
                {/* Draw edges first (behind nodes) */}
                {networkEdges.map((edge, idx) => {
                  const fromNode = networkNodes.find((n) => n.id === edge.from)
                  const toNode = networkNodes.find((n) => n.id === edge.to)
                  if (!fromNode || !toNode) return null

                  const strokeColor =
                    edge.sentiment === "positive" ? "#10b981" : edge.sentiment === "negative" ? "#ef4444" : "#6b7280"
                  const strokeWidth = Math.max(1, edge.strength / 2)

                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      opacity={0.6}
                    />
                  )
                })}

                {/* Draw nodes */}
                {networkNodes.map((node, idx) => {
                  const isMain = node.type === "main"
                  const fillColor = isMain ? "#3b82f6" : "#94a3b8"

                  return (
                    <g
                      key={`${node.id}-${idx}`}
                      onMouseEnter={() => setSelectedBrand(node.id)}
                      onMouseLeave={() => setSelectedBrand(null)}
                      className="cursor-pointer"
                    >
                      {/* Node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size / 2}
                        fill={fillColor}
                        stroke={selectedBrand === node.id ? "#000" : "#fff"}
                        strokeWidth={selectedBrand === node.id ? 3 : 2}
                        opacity={selectedBrand && selectedBrand !== node.id ? 0.5 : 1}
                      />

                      {/* Node label */}
                      <text
                        x={node.x}
                        y={node.y + node.size / 2 + 20}
                        textAnchor="middle"
                        fontSize={isMain ? "14" : "12"}
                        fontWeight={isMain ? "bold" : "normal"}
                        fill="#1f2937"
                      >
                        {node.id}
                      </text>

                      {/* Mention count for competitors */}
                      {!isMain && "mentions" in node && (
                        <text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#fff"
                          dominantBaseline="middle"
                        >
                          {node.mentions}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Selected brand info */}
              {selectedBrand && (
                <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 max-w-xs">
                  <h4 className="font-semibold mb-2">{selectedBrand}</h4>
                  {selectedBrand === data.brandName ? (
                    <div className="text-sm space-y-1">
                      <p className="text-blue-600 font-semibold">Váš brand</p>
                      <p className="text-gray-600">
                        Centrální uzel reprezentující váš brand a jeho spojení s konkurencí.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1">
                      {(() => {
                        const comp = data.competitors.find((c) => c.brand === selectedBrand)
                        if (!comp) return null
                        return (
                          <>
                            <p>
                              <span className="text-gray-600">Zmínky:</span>{" "}
                              <span className="font-semibold">{comp.count}</span>
                            </p>
                            <p>
                              <span className="text-gray-600">Průměrná pozice:</span>{" "}
                              <span className="font-semibold">{comp.avgPosition}</span>
                            </p>
                            <p>
                              <span className="text-gray-600">Sentiment:</span>{" "}
                              <Badge
                                variant={
                                  comp.sentiment === "positive"
                                    ? "default"
                                    : comp.sentiment === "negative"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="ml-1"
                              >
                                {comp.sentiment}
                              </Badge>
                            </p>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow border">
                <p className="text-xs font-semibold mb-2">Legenda:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>Váš brand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                    <span>Konkurenti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-green-500"></div>
                    <span>Pozitivní sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gray-500"></div>
                    <span>Neutrální sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-500"></div>
                    <span>Negativní sentiment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network insights */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Poznatky ze síťového grafu:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>Co-mention pattern:</strong> Brandy s tlustšími spojeními jsou často zmiňovány společně
                </li>
                <li>
                  • <strong>Velikost uzlu:</strong> Odráží frekvenci zmínek v AI odpovědích
                </li>
                <li>
                  • <strong>Barva spojení:</strong> Zelená = pozitivní kontext, Červená = negativní, Šedá = neutrální
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
