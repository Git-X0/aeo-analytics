"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalysisConfigFormProps {
  apiKey: string
  setApiKey: (key: string) => void
  showApiKey: boolean
  setShowApiKey: (show: boolean) => void
  apiKeyStored: boolean
  saveApiKey: () => void
  clearApiKey: () => void
  analysisName: string
  setAnalysisName: (name: string) => void
  brand: string
  setBrand: (brand: string) => void
  currentQuery: string
  setCurrentQuery: (query: string) => void
  queries: string[]
  addQuery: () => void
  removeQuery: (query: string) => void
  competitors: string
  setCompetitors: (competitors: string) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  frequency: "daily" | "weekly" | "monthly"
  setFrequency: (freq: "daily" | "weekly" | "monthly") => void
  autoRunEnabled: boolean
  setAutoRunEnabled: (enabled: boolean) => void
}

export function AnalysisConfigForm({
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
  apiKeyStored,
  saveApiKey,
  clearApiKey,
  analysisName,
  setAnalysisName,
  brand,
  setBrand,
  currentQuery,
  setCurrentQuery,
  queries,
  addQuery,
  removeQuery,
  competitors,
  setCompetitors,
  selectedModel,
  setSelectedModel,
  frequency,
  setFrequency,
  autoRunEnabled,
  setAutoRunEnabled,
}: AnalysisConfigFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">OpenAI API klíč *</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? "Skrýt" : "Zobrazit"}
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            {!apiKeyStored && apiKey && (
              <Button type="button" size="sm" onClick={saveApiKey}>
                Uložit API klíč
              </Button>
            )}
            {apiKeyStored && (
              <Button type="button" variant="destructive" size="sm" onClick={clearApiKey}>
                Smazat API klíč
              </Button>
            )}
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Bezpečnostní upozornění</p>
              <p className="text-xs text-amber-700 mt-1">
                Pro produkční použití nastavte API klíč v environment variables (OPENAI_API_KEY). Toto pole je pouze pro
                testování v v0 prostředí.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              className="text-blue-600 underline"
              rel="noreferrer"
            >
              Získejte API klíč zde
            </a>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Název analýzy</Label>
        <Input
          id="name"
          value={analysisName}
          onChange={(e) => setAnalysisName(e.target.value)}
          placeholder="např. Analýza hlavních konkurentů"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Název vašeho brandu *</Label>
        <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="např. Nike, Adidas" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="query">Dotazy k testování *</Label>
        <div className="flex gap-2">
          <Input
            id="query"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            placeholder="např. Jaké jsou nejlepší běžecké boty?"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addQuery()
              }
            }}
          />
          <Button type="button" size="sm" onClick={addQuery}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {queries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {queries.map((q, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                {q}
                <button onClick={() => removeQuery(q)} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitors">Konkurenční brandy (oddělené čárkou)</Label>
        <Input
          id="competitors"
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          placeholder="např. Puma, New Balance"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai/gpt-4o">GPT-4o (Nejvýkonnější)</SelectItem>
            <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (Doporučeno)</SelectItem>
            <SelectItem value="openai/gpt-4-turbo">GPT-4 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoRun">Automatické testování</Label>
          <input
            id="autoRun"
            type="checkbox"
            checked={autoRunEnabled}
            onChange={(e) => setAutoRunEnabled(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
        {autoRunEnabled && (
          <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Denně</SelectItem>
              <SelectItem value="weekly">Týdně</SelectItem>
              <SelectItem value="monthly">Měsíčně</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
