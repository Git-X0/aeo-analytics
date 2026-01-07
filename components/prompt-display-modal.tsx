"use client"

import { Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PromptDisplayModalProps {
  title: string
  systemPrompt: string
  userPrompt: string
  context?: {
    region?: string
    persona?: string
    language?: string
  }
}

export function PromptDisplayModal({ title, systemPrompt, userPrompt, context }: PromptDisplayModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Info className="h-4 w-4 text-gray-500 hover:text-blue-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Přesný prompt použitý pro získání těchto dat z AI modelu</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {context && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Kontext:</h3>
              <div className="flex gap-2 flex-wrap">
                {context.region && <Badge variant="outline">Region: {context.region.toUpperCase()}</Badge>}
                {context.persona && <Badge variant="outline">Persona: {context.persona}</Badge>}
                {context.language && <Badge variant="outline">Jazyk: {context.language}</Badge>}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">System Prompt:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">{systemPrompt}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">User Prompt:</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">{userPrompt}</pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
