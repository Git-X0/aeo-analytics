"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Check, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TourStep {
  id: string
  title: string
  description: string
  target?: string
  position: "top" | "bottom" | "left" | "right"
  example?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Vítejte v BrandVision AI",
    description:
      "Tento nástroj vám pomůže sledovat a optimalizovat viditelnost vaší značky v AI odpovědích. Projdeme si společně všechny funkce.",
    position: "bottom",
  },
  {
    id: "api-key",
    title: "Nastavení API klíče",
    description:
      "Nejprve potřebujete OpenAI API klíč. Získáte ho na platform.openai.com. Stojí to přibližně $0.01-0.05 na analýzu.",
    position: "right",
    example: "sk-proj-abc123...",
  },
  {
    id: "brand-setup",
    title: "Zadejte váš brand",
    description:
      "Zadejte přesný název vaší značky jak chcete, aby byl zmíněn. Například 'Tesla', 'Zoomsphere', nebo 'OpenAI'.",
    position: "right",
    example: "Tesla",
  },
  {
    id: "queries",
    title: "Přidejte testovací dotazy",
    description:
      "Zadejte dotazy, které by mohli vaši zákazníci položit AI. Například 'nejlepší CRM nástroje' nebo 'jak zvolit marketing platformu'.",
    position: "right",
    example: "What are the best electric cars in 2025?",
  },
  {
    id: "competitors",
    title: "Konkurence (volitelné)",
    description:
      "Zadejte konkurenční značky oddělené čárkou. Systém automaticky detekuje další konkurenci z AI odpovědí.",
    position: "right",
    example: "BMW, Mercedes, Audi",
  },
  {
    id: "regions-personas",
    title: "Vyberte kontexty",
    description:
      "Vyberte regiony a persony pro testování. Doporučujeme testovat napříč všemi kontexty pro komplexní analýzu.",
    position: "left",
  },
  {
    id: "run-analysis",
    title: "Spusťte analýzu",
    description:
      "Klikněte na tlačítko 'Spustit analýzu'. Analýza trvá 1-2 minuty a otestuje vaši viditelnost napříč 9 různými kontexty.",
    position: "top",
  },
  {
    id: "results-overview",
    title: "Pochopení výsledků",
    description:
      "Globální skóre (0-100) ukazuje celkovou viditelnost. 80+ je výborné, 60-79 dobré, 40-59 průměrné, pod 40 potřebuje zlepšení.",
    position: "bottom",
  },
  {
    id: "competitor-ranking",
    title: "Žebříček konkurentů",
    description:
      "Uvidíte jak jste na tom oproti konkurenci. Zelená šipka = zlepšení, červená = pokles pozice oproti minulému měsíci.",
    position: "top",
  },
  {
    id: "action-items",
    title: "Akční kroky",
    description:
      "Doporučené akce jsou automaticky generovány na základě vaší výkonnosti. Začněte s vysokou prioritou (červené).",
    position: "top",
  },
  {
    id: "export",
    title: "Export a reporting",
    description:
      "Exportujte výsledky do PDF nebo JSON. Můžete si také nastavit automatické týdenní nebo měsíční reporty na email.",
    position: "left",
  },
  {
    id: "complete",
    title: "Jste připraveni!",
    description:
      "Nyní můžete začít sledovat viditelnost vaší značky. Pro nejlepší výsledky spouštějte analýzu pravidelně každý týden.",
    position: "bottom",
  },
]

interface OnboardingTourProps {
  onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("brandvision_tour_completed")
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("brandvision_tour_completed", "true")
    setIsVisible(false)
    onComplete()
  }

  const handleComplete = () => {
    localStorage.setItem("brandvision_tour_completed", "true")
    setIsVisible(false)
    onComplete()
  }

  if (!isVisible) return null

  const step = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <Badge variant="outline">
                Krok {currentStep + 1} z {TOUR_STEPS.length}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>

            {step.example && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">Příklad:</div>
                <code className="text-sm text-blue-700">{step.example}</code>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zpět
              </Button>

              <div className="flex gap-2">
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <>
                    <Button variant="outline" onClick={handleSkip}>
                      Přeskočit
                    </Button>
                    <Button onClick={handleNext}>
                      Další
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    Dokončit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
