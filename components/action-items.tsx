"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, TrendingUp, DollarSign, Clock } from "lucide-react"
import type { JSX } from "react" // Declare JSX variable

interface ActionItem {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  estimatedCost: string
  estimatedTime: string
  expectedImpact: string
  category: string
}

interface ActionItemsProps {
  brandScore: number
  competitorAverage: number
  regionPerformance: Array<{ region: string; score: number }>
  personaPerformance: Array<{ persona: string; score: number }>
}

export function ActionItems({
  brandScore,
  competitorAverage,
  regionPerformance,
  personaPerformance,
}: ActionItemsProps) {
  const generateActionItems = (): ActionItem[] => {
    const items: ActionItem[] = []

    // Performance-based actions
    if (brandScore < competitorAverage) {
      items.push({
        id: "1",
        title: "Optimize content for AI discovery",
        description:
          "Your brand visibility is below competitor average. Create comprehensive, structured content that AI can easily reference.",
        priority: "high",
        estimatedCost: "$2,000 - $5,000",
        estimatedTime: "2-4 weeks",
        expectedImpact: "+15-25% visibility",
        category: "Content",
      })
    }

    // Region-based actions
    const weakestRegion = regionPerformance.sort((a, b) => a.score - b.score)[0]
    if (weakestRegion && weakestRegion.score < 50) {
      items.push({
        id: "2",
        title: `Strengthen presence in ${weakestRegion.region.toUpperCase()}`,
        description: `Low visibility in ${weakestRegion.region.toUpperCase()} region. Localize content and build regional partnerships.`,
        priority: "medium",
        estimatedCost: "$1,000 - $3,000",
        estimatedTime: "3-6 weeks",
        expectedImpact: "+20-30% in region",
        category: "Geographic",
      })
    }

    // Persona-based actions
    const weakestPersona = personaPerformance.sort((a, b) => a.score - b.score)[0]
    if (weakestPersona && weakestPersona.score < 50) {
      items.push({
        id: "3",
        title: `Create content for ${weakestPersona.persona.toUpperCase()} audience`,
        description: `Low engagement with ${weakestPersona.persona} persona. Develop targeted case studies and testimonials.`,
        priority: "medium",
        estimatedCost: "$800 - $2,000",
        estimatedTime: "2-3 weeks",
        expectedImpact: "+15-20% in segment",
        category: "Audience",
      })
    }

    // Always recommend these strategic items
    items.push(
      {
        id: "4",
        title: "Build structured data markup",
        description: "Implement Schema.org markup to help AI better understand your content structure and offerings.",
        priority: "high",
        estimatedCost: "$500 - $1,500",
        estimatedTime: "1-2 weeks",
        expectedImpact: "+10-15% discoverability",
        category: "Technical",
      },
      {
        id: "5",
        title: "Create FAQ and documentation hub",
        description:
          "Comprehensive FAQ content is highly referenced by AI. Build detailed answers to common questions.",
        priority: "medium",
        estimatedCost: "$1,500 - $3,000",
        estimatedTime: "2-4 weeks",
        expectedImpact: "+20-30% citation rate",
        category: "Content",
      },
      {
        id: "6",
        title: "Monitor and respond to brand mentions",
        description:
          "Set up alerts for brand mentions in AI training data sources and address any negative information.",
        priority: "low",
        estimatedCost: "$300/month",
        estimatedTime: "Ongoing",
        expectedImpact: "Prevent -5-10% drops",
        category: "Monitoring",
      },
    )

    return items
  }

  const actionItems = generateActionItems()
  const highPriority = actionItems.filter((item) => item.priority === "high")
  const mediumPriority = actionItems.filter((item) => item.priority === "medium")
  const lowPriority = actionItems.filter((item) => item.priority === "low")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />
      case "medium":
        return <TrendingUp className="h-4 w-4" />
      case "low":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Actions</CardTitle>
        <CardDescription>Strategic initiatives to improve your brand visibility in AI responses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              High Priority ({highPriority.length})
            </h3>
            {highPriority.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-yellow-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Medium Priority ({mediumPriority.length})
            </h3>
            {mediumPriority.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Low Priority ({lowPriority.length})
            </h3>
            {lowPriority.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActionItemCard({
  item,
  getPriorityColor,
  getPriorityIcon,
}: {
  item: ActionItem
  getPriorityColor: (priority: string) => string
  getPriorityIcon: (priority: string) => JSX.Element | null
}) {
  return (
    <Card className="border-2">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(item.priority)}>
                {getPriorityIcon(item.priority)}
                <span className="ml-1">{item.priority.toUpperCase()}</span>
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{item.estimatedCost}</div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{item.estimatedTime}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{item.expectedImpact}</div>
                  <div className="text-xs text-muted-foreground">Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
