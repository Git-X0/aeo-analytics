"use client"

import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MetricTooltipProps {
  metric: string
  description: string
  example?: string
}

export function MetricTooltip({ metric, description, example }: MetricTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{metric}</div>
            <div className="text-sm text-gray-600">{description}</div>
            {example && (
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                <span className="font-medium">Příklad:</span> {example}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
