"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    Download,
    ArrowLeft,
    DollarSign,
    Lightbulb,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Import the new AnalysisConfigForm component
import { AnalysisConfigForm } from "./analysis-config-form";
import { PromptDisplayModal } from "./prompt-display-modal";
import { HistoricalTrends } from "./historical-trends";
// Added Deep Context Analysis import
import { DeepContextAnalysis } from "./deep-context-analysis";
import { CompetitiveIntelligence } from "./competitive-intelligence";
import { AdvancedVisualizations } from "./advanced-visualizations";
import { ActionItems } from "./action-items";
import { ExportManager } from "./export-manager";

import { OnboardingTour } from "./onboarding-tour";
import { MetricTooltip } from "./metric-tooltip";

// Definice person s detailními popisy
const PERSONAS = [
    {
        id: "b2b_decision_maker",
        name: "B2B Decision Maker",
        description:
            "Manažer nebo executive hledající enterprise řešení. Zaměřuje se na ROI, škálovatelnost, bezpečnost a dlouhodobou podporu.",
        prompt: "You are helping a B2B decision maker (manager/executive) looking for enterprise solutions. Focus on ROI, scalability, security, integrations, and business value.",
    },
    {
        id: "b2c_consumer",
        name: "B2C Consumer",
        description:
            "Individuální spotřebitel hledající osobní řešení. Důležitá je jednoduchost použití, cena a okamžitá hodnota.",
        prompt: "You are helping an individual consumer looking for personal solutions. Focus on ease of use, affordability, quick setup, and user experience.",
    },
    {
        id: "developer",
        name: "Software Developer",
        description:
            "Vývojář hledající technické nástroje a API. Zajímá se o dokumentaci, flexibilitu, výkon a developer experience.",
        prompt: "You are helping a software developer looking for technical tools. Focus on APIs, documentation, performance, flexibility, and developer experience.",
    },
    {
        id: "researcher",
        name: "Researcher/Analyst",
        description:
            "Výzkumník nebo analytik hledající nástroje pro analýzu dat. Potřebuje pokročilé funkce, exporty a integraci s dalšími nástroji.",
        prompt: "You are helping a researcher or analyst looking for data analysis tools. Focus on advanced features, data export, accuracy, and integration capabilities.",
    },
    {
        id: "startup_founder",
        name: "Startup Founder",
        description:
            "Zakladatel startupu hledající rychlé a cenově dostupné řešení. Důležitá je rychlost implementace a možnost růstu.",
        prompt: "You are helping a startup founder looking for quick, affordable solutions. Focus on speed of implementation, cost-effectiveness, and ability to scale.",
    },
    {
        id: "marketing_professional",
        name: "Marketing Professional",
        description:
            "Marketingový specialista hledající nástroje pro kampaně a analytics. Potřebuje měření ROI, reporting a automatizaci.",
        prompt: "You are helping a marketing professional looking for campaign and analytics tools. Focus on ROI measurement, reporting, automation, and multi-channel capabilities.",
    },
    {
        id: "it_admin",
        name: "IT Administrator",
        description:
            "IT správce zodpovědný za infrastrukturu a bezpečnost. Vyžaduje snadnou správu, monitoring a compliance.",
        prompt: "You are helping an IT administrator responsible for infrastructure and security. Focus on management ease, monitoring, compliance, and security features.",
    },
    {
        id: "student",
        name: "Student/Educator",
        description:
            "Student nebo učitel hledající vzdělávací nástroje. Důležitá je dostupnost, jednoduchost a vzdělávací zdroje.",
        prompt: "You are helping a student or educator looking for educational tools. Focus on accessibility, ease of learning, educational resources, and student/teacher discounts.",
    },
];

const REGIONS = [
    {
        id: "north_america",
        name: "North America",
        prompt: "You are answering from a North American (US/Canada) perspective, considering mainly US-based companies and solutions popular in North America.",
    },
    {
        id: "europe",
        name: "Europe",
        prompt: "You are answering from a European perspective, considering EU-based companies, GDPR compliance, and solutions popular in Europe.",
    },
    {
        id: "asia_pacific",
        name: "Asia Pacific",
        prompt: "You are answering from an Asia-Pacific perspective, considering companies and solutions popular in Asia-Pacific markets including China, Japan, India, and Southeast Asia.",
    },
    {
        id: "latin_america",
        name: "Latin America",
        prompt: "You are answering from a Latin American perspective, considering companies and solutions popular in Latin American markets.",
    },
];

interface AnalysisResult {
    globalScore: number;
    isDemo?: boolean;
    demoReason?: string;
    noMentionsFound?: boolean;
    regionPerformance: Array<{
        region: string;
        score?: number;
        averageScore?: number;
    }>;
    personaPerformance: Array<{
        persona: string;
        score?: number;
        averageScore?: number;
    }>;
    competitorMentions: Array<{
        brand: string;
        count: number;
        avgPosition: number;
        sentiment: string;
    }>;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    contextAnalysis: Array<{
        context: string;
        mentions: number;
        sentiment: string;
    }>;
    recommendations: string[];
    linksByBrand: Record<
        string,
        Array<{ url: string; brand: string; count: number; title?: string }>
    >;
    deepContextAnalysis?: {
        categories: Array<{
            category: string;
            count: number;
            sentiment: string;
            examples: string[];
        }>;
        quotes: Array<{ text: string; category: string; sentiment: string }>;
        keywordAssociations: Array<{
            keyword: string;
            count: number;
            sentiment: string;
        }>;
    };
    timestamp: string;
    query: string;
    brand: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        cost: number;
        model: string;
    };
}

interface TrendTrackerProps {
    initialAnalysis?: {
        id: string;
        name: string;
        brand: string;
        queries: string[];
        competitors: string[];
        frequency?: "daily" | "weekly" | "monthly";
        enabled: boolean;
        // NEW: Add results and historicalData to the analysis object
        results?: Record<string, AnalysisResult[]>;
        historicalData?: Array<{ date: string; score: number }>;
        totalCost?: number;
        lastRun?: string;
    } | null;
    onSave: (data: any) => void;
    onBack: () => void;
}

export function TrendTracker({
    initialAnalysis,
    onSave,
    onBack,
}: {
    initialAnalysis: any;
    onSave: (data: any) => void;
    onBack: () => void;
}) {
    const [analysisName, setAnalysisName] = useState(
        initialAnalysis?.name || ""
    );
    const [brand, setBrand] = useState(initialAnalysis?.brand || "");
    const [queries, setQueries] = useState<string[]>(
        initialAnalysis?.queries || []
    );
    const [competitors, setCompetitors] = useState(
        initialAnalysis?.competitors?.join(", ") || ""
    );
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
        initialAnalysis?.frequency || "weekly"
    );
    const [autoRunEnabled, setAutoRunEnabled] = useState(
        initialAnalysis?.enabled || false
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use results from initialAnalysis or empty object
    const [results, setResults] = useState<Record<string, AnalysisResult[]>>(
        initialAnalysis?.results || {}
    );

    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeyStored, setApiKeyStored] = useState(false);

    // Use totalCost from initialAnalysis or 0
    const [totalCost, setTotalCost] = useState(initialAnalysis?.totalCost || 0);
    const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState(0);

    // State variables for user selections
    const [currentQuery, setCurrentQuery] = useState("");
    const [selectedModel, setSelectedModel] = useState("openai/gpt-4o");
    const [selectedPersonas, setSelectedPersonas] = useState<string[]>(
        PERSONAS.map((p) => p.id)
    );
    const [selectedRegions, setSelectedRegions] = useState<string[]>(
        REGIONS.map((r) => r.id)
    );

    // Use historicalData from initialAnalysis or empty array
    const [historicalData, setHistoricalData] = useState<
        Array<{ date: string; score: number }>
    >(initialAnalysis?.historicalData || []);

    const [showOnboarding, setShowOnboarding] = useState(false);

    // State to manage the open query accordion item for lazy rendering
    const [openQueryAccordionItem, setOpenQueryAccordionItem] = useState<
        string | undefined
    >(undefined);

    const resetState = () => {
        setAnalysisName("");
        setBrand("");
        setQueries([]);
        setCompetitors("");
        setFrequency("weekly");
        setAutoRunEnabled(false);
        setResults({});
        setHistoricalData([]);
        setError(null);
        setCurrentQuery("");
        setTotalCost(0);
        setEstimatedMonthlyCost(0);
        // Do not reset API key, model, personas, regions as they are user/app settings
    };

    useEffect(() => {
        // Always call resetState when initialAnalysis changes to ensure a clean slate.
        // This handles both new analysis (initialAnalysis is null) and switching between existing ones.
        resetState();

        if (initialAnalysis) {
            // Load configuration from the existing analysis
            setAnalysisName(initialAnalysis.name || "");
            setBrand(initialAnalysis.brand || "");
            setQueries(initialAnalysis.queries || []);
            setCompetitors(initialAnalysis.competitors?.join(", ") || "");
            setFrequency(initialAnalysis.frequency || "weekly");
            setAutoRunEnabled(initialAnalysis.enabled || false);

            // Load results and historical data from the analysis
            setResults(initialAnalysis.results || {});
            setHistoricalData(initialAnalysis.historicalData || []);
            setTotalCost(initialAnalysis.totalCost || 0);
        }
        // If initialAnalysis is null, resetState() already cleared everything, so no need for else block.
    }, [initialAnalysis]); // Dependency array

    useEffect(() => {
        if (results && Object.keys(results).length > 0 && initialAnalysis) {
            const latestResult = Object.values(results)[0]?.[0];
            if (latestResult?.usage?.cost) {
                const costPerRun = latestResult.usage.cost * queries.length;
                let runsPerMonth = 0;

                if (frequency === "daily") runsPerMonth = 30;
                if (frequency === "weekly") runsPerMonth = 4;
                if (frequency === "monthly") runsPerMonth = 1;

                setEstimatedMonthlyCost(costPerRun * runsPerMonth);
            }
        }
    }, [results, queries.length, frequency, initialAnalysis]);

    const addQuery = () => {
        const trimmedQuery = currentQuery.trim();
        if (trimmedQuery && !queries.includes(trimmedQuery)) {
            setQueries([...queries, trimmedQuery]);
            setCurrentQuery("");
        }
    };

    const removeQuery = (query: string) => {
        setQueries(queries.filter((q) => q !== query));
    };

    const runAnalysis = async () => {
        console.log("[v0] Starting analysis...");
        setLoading(true);
        setError(null);

        // Don't clear results immediately - we want to append to existing results
        // setResults({}); // REMOVED - don't clear previous results

        const validQueries = queries.filter((q) => q && q.trim().length > 0);

        if (validQueries.length === 0 || !brand) {
            alert("Prosím zadejte brand a alespoň jeden dotaz");
            setLoading(false);
            return;
        }

        console.log("[v0] Starting analysis with queries:", validQueries);
        setLoading(true);
        const newResults: Record<string, AnalysisResult[]> = { ...results }; // Start with existing results
        let runTotalCost = 0;

        for (const query of validQueries) {
            try {
                console.log("[v0] Running analysis for query:", query);
                const response = await fetch("/api/comprehensive-analysis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: query.trim(),
                        brand: brand,
                        competitors: competitors
                            .split(",")
                            .map((c: string) => c.trim())
                            .filter(Boolean),
                        model: selectedModel,
                        personas: selectedPersonas,
                        regions: selectedRegions,
                        apiKey: apiKey.trim() || undefined,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.error?.includes("API key")) {
                        alert(
                            "OpenAI API klíč není nakonfigurován nebo je neplatný. Zkontrolujte prosím API klíč v konfiguraci nebo nastavte OPENAI_API_KEY v environment variables."
                        );
                        setLoading(false);
                        return;
                    }
                    throw new Error(data.error || "API call failed");
                }

                // Append new result to existing results for this query
                newResults[query] = [...(newResults[query] || []), data];

                if (data.usage?.cost) {
                    runTotalCost += data.usage.cost;
                }

                if (!data.isDemo) {
                    // Update the analysis with new data
                    const updatedAnalysis = {
                        name: analysisName || `Analýza ${brand}`,
                        brand,
                        queries: validQueries,
                        competitors: competitors
                            .split(",")
                            .map((c: string) => c.trim())
                            .filter(Boolean),
                        latestScore: data.globalScore,
                        frequency,
                        enabled: autoRunEnabled,
                        // NEW: Save results and historical data with the analysis
                        results: newResults,
                        historicalData: [
                            ...historicalData,
                            {
                                date: new Date().toLocaleDateString("cs-CZ", {
                                    day: "2-digit",
                                    month: "2-digit",
                                }),
                                score: data.globalScore,
                            },
                        ].slice(-31),
                        totalCost: totalCost + runTotalCost,
                        lastRun: new Date().toISOString(),
                    };

                    onSave(updatedAnalysis);

                    // Update historical data in state
                    setHistoricalData((prev) =>
                        [
                            ...prev,
                            {
                                date: new Date().toLocaleDateString("cs-CZ", {
                                    day: "2-digit",
                                    month: "2-digit",
                                }),
                                score: data.globalScore,
                            },
                        ].slice(-31)
                    );
                }
            } catch (error) {
                console.error(`Analysis failed for query: ${query}`, error);
                alert(
                    `Analýza selhala pro dotaz "${query}". Zkontrolujte konzoli pro detaily.`
                );
                setError(`Chyba při analýze dotazu "${query}".`);
                setLoading(false);
                return;
            }
        }

        // Update total cost
        if (runTotalCost > 0) {
            const newTotalCost = totalCost + runTotalCost;
            setTotalCost(newTotalCost);

            // Also update the analysis with new total cost
            if (initialAnalysis) {
                const updatedAnalysis = {
                    ...initialAnalysis,
                    totalCost: newTotalCost,
                    lastRun: new Date().toISOString(),
                };
                onSave(updatedAnalysis);
            }
        }

        // Update results state
        setResults(newResults);
        setLoading(false);
    };

    const saveApiKey = () => {
        if (apiKey) {
            // Removed localStorage API key saving
            setApiKeyStored(true);
        }
    };

    const clearApiKey = () => {
        // Removed localStorage API key removal
        setApiKey("");
        setApiKeyStored(false);
    };

    const exportToPDF = () => {
        window.print();
    };

    // Výpočet trendu
    const calculateTrend = () => {
        if (historicalData.length < 2) return null;
        const recent =
            historicalData.slice(-7).reduce((sum, d) => sum + d.score, 0) / 7;
        const previous =
            historicalData.slice(-14, -7).reduce((sum, d) => sum + d.score, 0) /
            7;
        const change = recent - previous;
        return {
            direction: change > 2 ? "up" : change < -2 ? "down" : "stable",
            change: Math.abs(change).toFixed(1),
        };
    };

    const trend = calculateTrend();

    const aggregateResults = () => {
        const allResults = Object.values(results).flat();
        console.log("[v0] Aggregating results:", allResults.length, "results");
        if (allResults.length === 0) {
            console.log("[v0] No results to aggregate");
            return null;
        }

        const scores = allResults
            .map((r) => r.globalScore)
            .filter((s) => typeof s === "number" && !isNaN(s));
        console.log("[v0] Valid scores:", scores);

        if (scores.length === 0) {
            console.log("[v0] No valid scores found");
            return null;
        }

        const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        console.log("[v0] Aggregated:", { avgScore, maxScore, minScore });
        return { avgScore, maxScore, minScore, count: allResults.length };
    };

    const aggregated = aggregateResults();
    const latestResults = Object.values(results).flat();

    // Get the latest result (most recent timestamp)
    const latestResult = latestResults.sort(
        (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    console.log("[v0] Latest result:", latestResult);
    console.log("[v0] Has results:", latestResults.length > 0);
    console.log("[v0] Aggregated value:", aggregated);
    console.log("[v0] Latest result truthy check:", !!latestResult);

    const competitorRanking = latestResult?.competitorMentions
        ? [...latestResult.competitorMentions]
              .sort((a, b) => {
                  // Sort by mention count first, then by position
                  if (b.count !== a.count) return b.count - a.count;
                  return a.avgPosition - b.avgPosition;
              })
              .map((comp, index) => ({
                  ...comp,
                  rank: index + 1,
              }))
        : [];

    const competitorIntelligenceData = latestResult?.competitorMentions
        ? latestResult.competitorMentions.map((comp) => ({
              brand: comp.brand,
              count: comp.count,
              avgPosition: comp.avgPosition,
              sentiment: comp.sentiment,
              shareOfVoice:
                  (comp.count /
                      latestResult.competitorMentions.reduce(
                          (sum: number, c: { count: number }) => sum + c.count,
                          0
                      )) *
                  100,
          }))
        : [];

    const totalMentions = latestResult?.competitorMentions
        ? latestResult.competitorMentions.reduce((sum, c) => sum + c.count, 0)
        : 0;

    // Extract query and its results
    const queryResults = queries
        .map((q) => ({
            query: q,
            // Get the most recent result for this query
            result: results[q]?.sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )[0],
        }))
        .filter((item) => item.result);

    return (
        <div className="min-h-screen bg-white">
            {showOnboarding && (
                <OnboardingTour onComplete={() => setShowOnboarding(false)} />
            )}

            <div className="container mx-auto p-6 max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                resetState();
                                onBack();
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Zpět na přehled
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOnboarding(true)}
                        >
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Spustit průvodce
                        </Button>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">
                                Celkové náklady:
                            </span>{" "}
                            ${totalCost.toFixed(4)}
                        </div>
                        {estimatedMonthlyCost > 0 && (
                            <div className="text-sm text-blue-600">
                                <span className="font-medium">
                                    Měsíční odhad:
                                </span>{" "}
                                ${estimatedMonthlyCost.toFixed(2)}
                            </div>
                        )}
                        {initialAnalysis?.lastRun && (
                            <div className="text-sm text-gray-500">
                                <span className="font-medium">
                                    Poslední běh:
                                </span>{" "}
                                {new Date(
                                    initialAnalysis.lastRun
                                ).toLocaleDateString("cs-CZ")}
                            </div>
                        )}
                        {aggregated && (
                            <Button onClick={exportToPDF} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export do PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* NEW: Display analysis info */}
                {initialAnalysis && (
                    <Card className="mb-6 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">
                                        {initialAnalysis.name}
                                    </h3>
                                    <p className="text-sm text-blue-700">
                                        ID: {initialAnalysis.id} • Brand:{" "}
                                        {brand} • {queries.length} dotazů
                                    </p>
                                </div>
                                <div className="text-sm text-blue-800">
                                    <div className="flex gap-4">
                                        <span>
                                            Celkem výsledků:{" "}
                                            {latestResults.length}
                                        </span>
                                        <span>
                                            Historických dat:{" "}
                                            {historicalData.length}
                                        </span>
                                        {latestResult && (
                                            <span>
                                                Poslední analýza:{" "}
                                                {new Date(
                                                    latestResult.timestamp
                                                ).toLocaleDateString("cs-CZ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konfigurace analýzy</CardTitle>
                                <CardDescription>
                                    Nastavte parametry pro sledování
                                    viditelnosti
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AnalysisConfigForm
                                    apiKey={apiKey}
                                    setApiKey={setApiKey}
                                    showApiKey={showApiKey}
                                    setShowApiKey={setShowApiKey}
                                    apiKeyStored={apiKeyStored}
                                    saveApiKey={saveApiKey}
                                    clearApiKey={clearApiKey}
                                    analysisName={analysisName}
                                    setAnalysisName={setAnalysisName}
                                    brand={brand}
                                    setBrand={setBrand}
                                    currentQuery={currentQuery}
                                    setCurrentQuery={setCurrentQuery}
                                    queries={queries}
                                    addQuery={addQuery}
                                    removeQuery={removeQuery}
                                    competitors={competitors}
                                    setCompetitors={setCompetitors}
                                    selectedModel={selectedModel}
                                    setSelectedModel={setSelectedModel}
                                    frequency={frequency}
                                    setFrequency={setFrequency}
                                    autoRunEnabled={autoRunEnabled}
                                    setAutoRunEnabled={setAutoRunEnabled}
                                    onReset={resetState}
                                />

                                <Button
                                    onClick={runAnalysis}
                                    disabled={
                                        loading ||
                                        queries.length === 0 ||
                                        !brand ||
                                        !apiKeyStored
                                    }
                                    className="w-full mt-4"
                                >
                                    {" "}
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzuji...
                                        </>
                                    ) : (
                                        "Spustit analýzu"
                                    )}
                                </Button>

                                {/* NEW: Button to save current state */}
                                {initialAnalysis && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const updatedAnalysis = {
                                                ...initialAnalysis,
                                                name: analysisName,
                                                brand,
                                                queries,
                                                competitors: competitors
                                                    .split(",")
                                                    .map((c: string) =>
                                                        c.trim()
                                                    )
                                                    .filter(Boolean),
                                                frequency,
                                                enabled: autoRunEnabled,
                                                results,
                                                historicalData,
                                                totalCost,
                                                lastRun:
                                                    initialAnalysis.lastRun ||
                                                    new Date().toISOString(),
                                            };
                                            onSave(updatedAnalysis);
                                            alert("Konfigurace uložena!");
                                        }}
                                        className="w-full mt-2"
                                    >
                                        Uložit konfiguraci
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {/* Rest of the UI remains the same... */}
                        {/* Vysvětlení výpočtu skóre */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center text-blue-900">
                                    <Info className="mr-2 h-5 w-5" />
                                    Jak se počítá skóre viditelnosti?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-blue-800 space-y-2">
                                <p>
                                    <strong>Skóre 0-100</strong> se vypočítá na
                                    základě těchto faktorů:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>
                                            Počet zmínek (0-40 bodů):
                                        </strong>{" "}
                                        Každá zmínka vašeho brandu = 20 bodů
                                    </li>
                                    <li>
                                        <strong>
                                            Pozice v odpovědi (0-30 bodů):
                                        </strong>{" "}
                                        Čím dříve je brand zmíněn, tím lépe
                                        <ul className="list-circle list-inside ml-6 text-xs mt-1">
                                            <li>
                                                První třetina odpovědi: +30 bodů
                                            </li>
                                            <li>
                                                Prostřední třetina: +20 bodů
                                            </li>
                                            <li>Poslední třetina: +10 bodů</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>Sentiment (0-20 bodů):</strong>{" "}
                                        Pozitivní zmínka +20, neutrální +10,
                                        negativní 0
                                    </li>
                                    <li>
                                        <strong>
                                            Srovnání s konkurencí (0-10 bodů):
                                        </strong>{" "}
                                        Bonus pokud jste zmíněn mezi konkurenty
                                    </li>
                                </ul>
                                <div className="mt-3 pt-3 border-t border-blue-300">
                                    <strong>Interpretace skóre:</strong>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                        <div className="text-xs">
                                            <span className="font-semibold">
                                                80-100:
                                            </span>{" "}
                                            Výborná viditelnost
                                        </div>
                                        <div className="text-xs">
                                            <span className="font-semibold">
                                                60-79:
                                            </span>{" "}
                                            Dobrá viditelnost
                                        </div>
                                        <div className="text-xs">
                                            <span className="font-semibold">
                                                40-59:
                                            </span>{" "}
                                            Průměrná viditelnost
                                        </div>
                                        <div className="text-xs">
                                            <span className="font-semibold">
                                                0-39:
                                            </span>{" "}
                                            Nízká viditelnost
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CHANGE> Added Historical Trends Section */}
                        {historicalData.length > 7 && (
                            <HistoricalTrends
                                data={historicalData}
                                brandName={brand}
                                competitors={competitors
                                    .split(",")
                                    .map((c: string) => c.trim())
                                    .filter(Boolean)
                                    .slice(0, 2)}
                            />
                        )}

                        {/* Results Section */}
                        {loading && (
                            <Card className="flex flex-col items-center justify-center p-12 text-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <CardTitle>Analyzuji...</CardTitle>
                                <CardDescription>
                                    Právě probíhá komplexní analýza. Tento
                                    proces může trvat až 60 sekund.
                                </CardDescription>
                            </Card>
                        )}

                        {!loading && !aggregated && !error && (
                            <Card className="flex flex-col items-center justify-center p-12 text-center">
                                <Lightbulb className="w-12 h-12 text-blue-500 mb-4" />
                                <CardTitle>Jste připraveni?</CardTitle>
                                <CardDescription>
                                    Nakonfigurujte analýzu vlevo a spusťte ji,
                                    abyste viděli přehled viditelnosti vašeho
                                    brandu.
                                </CardDescription>
                            </Card>
                        )}

                        {error && (
                            <Card className="flex flex-col items-center justify-center p-12 text-center bg-red-50 border-red-200">
                                <Info className="w-12 h-12 text-red-500 mb-4" />
                                <CardTitle>Chyba analýzy</CardTitle>
                                <CardDescription>{error}</CardDescription>
                            </Card>
                        )}

                        {!loading &&
                            latestResult &&
                            (latestResult.noMentionsFound ||
                                latestResult.globalScore === 0) && (
                                <Card className="flex flex-col items-center justify-center p-12 text-center">
                                    <Info className="w-12 h-12 text-gray-500 mb-4" />
                                    <CardTitle>
                                        Nebyly nalezeny žádné zmínky
                                    </CardTitle>
                                    <CardDescription>
                                        V AI odpovědích nebyla nalezena žádná
                                        zmínka o vašem brandu. Zkuste upravit
                                        dotaz nebo změnit persony a regiony.
                                    </CardDescription>
                                </Card>
                            )}

                        {!loading &&
                            aggregated &&
                            latestResult &&
                            !latestResult.noMentionsFound &&
                            latestResult.globalScore > 0 && (
                                <div className="space-y-6">
                                    {/* Hlavní metriky */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle>
                                                        Globální skóre
                                                        viditelnosti
                                                    </CardTitle>
                                                    <MetricTooltip
                                                        metric="Globální skóre"
                                                        description="Průměrné skóre viditelnosti vaší značky napříč všemi testovanými kontexty (regiony × persony). Čím vyšší, tím lépe."
                                                        example="Skóre 75 znamená že vaše značka je zmíněna v 75% případů s pozitivním kontextem."
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {latestResult.globalScore &&
                                                    !isNaN(
                                                        latestResult.globalScore
                                                    )
                                                        ? Math.round(
                                                              latestResult.globalScore
                                                          )
                                                        : 0}
                                                </div>
                                                {trend && (
                                                    <div className="flex items-center mt-2 text-sm">
                                                        {trend.direction ===
                                                            "up" && (
                                                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                                        )}
                                                        {trend.direction ===
                                                            "down" && (
                                                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                                        )}
                                                        {trend.direction ===
                                                            "stable" && (
                                                            <Minus className="h-4 w-4 text-gray-600 mr-1" />
                                                        )}
                                                        <span
                                                            className={
                                                                trend.direction ===
                                                                "up"
                                                                    ? "text-green-600"
                                                                    : trend.direction ===
                                                                      "down"
                                                                    ? "text-red-600"
                                                                    : "text-gray-600"
                                                            }
                                                        >
                                                            {trend.direction ===
                                                            "up"
                                                                ? "+"
                                                                : trend.direction ===
                                                                  "down"
                                                                ? "-"
                                                                : ""}
                                                            {trend.change} bodů
                                                        </span>
                                                    </div>
                                                )}
                                                {latestResult.isDemo && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-300"
                                                    >
                                                        DEMO DATA
                                                    </Badge>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {queries.length > 1 && aggregated && (
                                            <>
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-medium text-gray-600">
                                                            Průměrné skóre
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-gray-900">
                                                            {aggregated.avgScore &&
                                                            !isNaN(
                                                                aggregated.avgScore
                                                            )
                                                                ? Math.round(
                                                                      aggregated.avgScore
                                                                  )
                                                                : 0}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Napříč{" "}
                                                            {aggregated.count}{" "}
                                                            dotazy
                                                        </p>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-medium text-gray-600">
                                                            Nejlepší výsledek
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-green-600">
                                                            {aggregated.maxScore &&
                                                            !isNaN(
                                                                aggregated.maxScore
                                                            )
                                                                ? Math.round(
                                                                      aggregated.maxScore
                                                                  )
                                                                : 0}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-medium text-gray-600">
                                                            Nejhorší výsledek
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-red-600">
                                                            {aggregated.minScore &&
                                                            !isNaN(
                                                                aggregated.minScore
                                                            )
                                                                ? Math.round(
                                                                      aggregated.minScore
                                                                  )
                                                                : 0}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </>
                                        )}
                                    </div>

                                    {latestResult && (
                                        <AdvancedVisualizations
                                            data={{
                                                brandName: brand,
                                                competitors:
                                                    latestResult.competitorMentions,
                                                regionPerformance: (
                                                    latestResult.regionPerformance ||
                                                    []
                                                )
                                                    .filter((r) => r)
                                                    .map((r) => ({
                                                        region: r.region,
                                                        score:
                                                            r.score ||
                                                            r.averageScore ||
                                                            0,
                                                    })),
                                                personaPerformance: (
                                                    latestResult.personaPerformance ||
                                                    []
                                                )
                                                    .filter((p) => p)
                                                    .map((p) => ({
                                                        persona: p.persona,
                                                        score:
                                                            p.score ||
                                                            p.averageScore ||
                                                            0,
                                                    })),
                                                historicalData,
                                            }}
                                        />
                                    )}

                                    {latestResult?.usage && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5" />
                                                    Náklady na analýzu
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-600">
                                                            Input tokeny
                                                        </div>
                                                        <div className="text-lg font-semibold">
                                                            {latestResult.usage.inputTokens.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">
                                                            Output tokeny
                                                        </div>
                                                        <div className="text-lg font-semibold">
                                                            {latestResult.usage.outputTokens.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">
                                                            Model
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            {
                                                                latestResult
                                                                    .usage.model
                                                            }
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">
                                                            Náklady
                                                        </div>
                                                        <div className="text-lg font-semibold text-green-600">
                                                            $
                                                            {latestResult.usage.cost.toFixed(
                                                                4
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Rozbor jednotlivých dotazů */}
                                    {queries.length > 1 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Rozbor jednotlivých dotazů
                                                </CardTitle>
                                                <CardDescription>
                                                    Detailní výsledky pro každý
                                                    testovaný dotaz
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    className="w-full"
                                                    value={
                                                        openQueryAccordionItem
                                                    }
                                                    onValueChange={
                                                        setOpenQueryAccordionItem
                                                    }
                                                >
                                                    {queryResults.map(
                                                        ({ query, result }) => (
                                                            <AccordionItem
                                                                key={query}
                                                                value={query}
                                                            >
                                                                <AccordionTrigger>
                                                                    <div className="flex items-center justify-between w-full pr-4">
                                                                        <span className="text-left font-medium">
                                                                            {
                                                                                query
                                                                            }
                                                                        </span>
                                                                        <Badge
                                                                            variant={
                                                                                result.globalScore >=
                                                                                70
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            Skóre:{" "}
                                                                            {Math.round(
                                                                                result.globalScore
                                                                            )}
                                                                        </Badge>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent>
                                                                    <div className="space-y-4 pt-4">
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-600">
                                                                                    Celkové
                                                                                    skóre
                                                                                </div>
                                                                                <div className="text-2xl font-bold text-blue-600">
                                                                                    {Math.round(
                                                                                        result.globalScore
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-600">
                                                                                    Pozitivní
                                                                                    sentiment
                                                                                </div>
                                                                                <div className="text-2xl font-bold text-green-600">
                                                                                    {result
                                                                                        .sentimentBreakdown
                                                                                        ?.positive ||
                                                                                        0}

                                                                                    %
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-600">
                                                                                    Konkurenční
                                                                                    zmínky
                                                                                </div>
                                                                                <div className="text-2xl font-bold text-gray-900">
                                                                                    {
                                                                                        (
                                                                                            result.competitorMentions ||
                                                                                            []
                                                                                        )
                                                                                            .length
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="font-medium mb-2">
                                                                                Top
                                                                                3
                                                                                konkurenti
                                                                                v
                                                                                této
                                                                                odpovědi:
                                                                            </h4>
                                                                            <div className="space-y-2">
                                                                                {(
                                                                                    result.competitorMentions ||
                                                                                    []
                                                                                )
                                                                                    .slice(
                                                                                        0,
                                                                                        3
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            competitor,
                                                                                            index
                                                                                        ) => (
                                                                                            <div
                                                                                                key={`${competitor.brand}-${index}`}
                                                                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                                                            >
                                                                                                <span className="font-medium">
                                                                                                    {
                                                                                                        competitor.brand
                                                                                                    }
                                                                                                </span>
                                                                                                <div className="flex items-center gap-4 text-sm">
                                                                                                    <span className="text-gray-600">
                                                                                                        {
                                                                                                            competitor.count
                                                                                                        }{" "}
                                                                                                        zmínek
                                                                                                    </span>
                                                                                                    <Badge variant="outline">
                                                                                                        {
                                                                                                            competitor.sentiment
                                                                                                        }
                                                                                                    </Badge>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        )
                                                    )}
                                                </Accordion>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Trend v čase */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Trend viditelnosti v čase
                                            </CardTitle>
                                            <CardDescription>
                                                Vývoj skóre za posledních 30 dní
                                                (demo data)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <LineChart
                                                    data={historicalData}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis domain={[0, 100]} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="score"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2}
                                                        name="Skóre viditelnosti"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Výkon po regionech a personách */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>
                                                        Výkon po regionech
                                                    </span>
                                                    <PromptDisplayModal
                                                        title="Prompt pro regionální analýzu"
                                                        systemPrompt={`You are answering from a [REGION] perspective, considering [REGION]-based companies and solutions popular in that market.\n\nRegions tested:\n- North America: US/Canada perspective\n- Europe: EU perspective with GDPR focus\n- Asia Pacific: Asia-Pacific markets\n- Latin America: LATAM markets`}
                                                        userPrompt={`${
                                                            queries[0] ||
                                                            "User query"
                                                        }`}
                                                        context={{
                                                            region: "various",
                                                            persona: "mixed",
                                                        }}
                                                    />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height={250}
                                                >
                                                    <BarChart
                                                        data={
                                                            latestResult.regionPerformance
                                                        }
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="region" />
                                                        <YAxis
                                                            domain={[0, 100]}
                                                        />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="score"
                                                            fill="#3b82f6"
                                                            name="Skóre"
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>
                                                        Výkon po personách
                                                    </span>
                                                    <PromptDisplayModal
                                                        title="Prompt pro analýzu podle person"
                                                        systemPrompt={`You are helping a [PERSONA] looking for solutions.\n\nPersonas tested:\n- B2B Decision Maker: Focus on ROI and scalability\n- B2C Consumer: Focus on ease of use and affordability\n- Developer: Focus on APIs and technical capabilities\n- Researcher: Focus on objective comparisons\n- Startup Founder: Focus on cost-effectiveness\n- Marketing Professional: Focus on campaign tools\n- IT Administrator: Focus on security and management\n- Student/Educator: Focus on learning resources`}
                                                        userPrompt={`${
                                                            queries[0] ||
                                                            "User query"
                                                        }`}
                                                        context={{
                                                            region: "mixed",
                                                            persona: "various",
                                                        }}
                                                    />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height={250}
                                                >
                                                    <BarChart
                                                        data={
                                                            latestResult.personaPerformance
                                                        }
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis
                                                            dataKey="persona"
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={100}
                                                        />
                                                        <YAxis
                                                            domain={[0, 100]}
                                                        />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="score"
                                                            fill="#10b981"
                                                            name="Skóre"
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Analýza kontextu zmínek */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>
                                                    V jakém kontextu je váš
                                                    brand zmiňován?
                                                </span>
                                                <PromptDisplayModal
                                                    title="Prompt pro kontextovou analýzu"
                                                    systemPrompt={`You are an AI assistant that naturally answers questions while considering various products and solutions in your responses.\n\nNote: The analysis then examines the full AI response to extract how and in what context the brand "${brand}" was mentioned.`}
                                                    userPrompt={`${
                                                        queries[0] ||
                                                        "User query"
                                                    }`}
                                                />
                                            </CardTitle>
                                            <CardDescription>
                                                Analýza toho, jak AI popisuje
                                                váš brand v odpovědích
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {(
                                                    latestResult.contextAnalysis ||
                                                    []
                                                ).map((ctx, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="border rounded-lg p-4"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-gray-900">
                                                                    {
                                                                        ctx.context
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-sm text-gray-600">
                                                                        {
                                                                            ctx.mentions
                                                                        }{" "}
                                                                        {ctx.mentions ===
                                                                        1
                                                                            ? "zmínka"
                                                                            : ctx.mentions <
                                                                              5
                                                                            ? "zmínky"
                                                                            : "zmínek"}
                                                                    </span>
                                                                    <Badge
                                                                        variant={
                                                                            ctx.sentiment ===
                                                                            "positive"
                                                                                ? "default"
                                                                                : ctx.sentiment ===
                                                                                  "negative"
                                                                                ? "destructive"
                                                                                : "secondary"
                                                                        }
                                                                    >
                                                                        {ctx.sentiment ===
                                                                        "positive"
                                                                            ? "Pozitivní"
                                                                            : ctx.sentiment ===
                                                                              "negative"
                                                                            ? "Negativní"
                                                                            : "Neutrální"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Sentiment breakdown */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>Sentiment analýza</span>
                                                <PromptDisplayModal
                                                    title="Prompt pro sentiment analýzu"
                                                    systemPrompt={`You analyze sentiment of brand mentions in AI responses. Classify each mention as positive, negative, or neutral based on the surrounding context and tone.\n\nClassify each mention based on context, tone, and positioning in the answer.`}
                                                    userPrompt={`Analyze sentiment for brand: ${brand}\n\nIn AI responses to: ${
                                                        queries[0] ||
                                                        "User query"
                                                    }`}
                                                />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {latestResult.sentimentBreakdown ? (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                                        <div className="text-3xl font-bold text-green-600">
                                                            {
                                                                latestResult
                                                                    .sentimentBreakdown
                                                                    .positive
                                                            }
                                                            %
                                                        </div>
                                                        <div className="text-sm text-green-800 mt-1">
                                                            Pozitivní
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                        <div className="text-3xl font-bold text-gray-600">
                                                            {
                                                                latestResult
                                                                    .sentimentBreakdown
                                                                    .neutral
                                                            }
                                                            %
                                                        </div>
                                                        <div className="text-sm text-gray-800 mt-1">
                                                            Neutrální
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                                        <div className="text-3xl font-bold text-red-600">
                                                            {
                                                                latestResult
                                                                    .sentimentBreakdown
                                                                    .negative
                                                            }
                                                            %
                                                        </div>
                                                        <div className="text-sm text-red-800 mt-1">
                                                            Negativní
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center">
                                                    Data nejsou k dispozici
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Konkurenční zmínky */}
                                    {competitorRanking.length > 0 && (
                                        <Card className="mb-6">
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>
                                                        Žebříček brandů v AI
                                                        odpovědích
                                                    </span>
                                                    <PromptDisplayModal
                                                        title="Prompt pro detekci konkurence"
                                                        systemPrompt={`You analyze AI responses to identify all mentioned brands/products and calculate their visibility metrics.`}
                                                        userPrompt={`Query: ${
                                                            queries[0] ||
                                                            "User query"
                                                        }

Task: Identify ALL brands/products mentioned in the AI response, count their frequency, calculate average text position, and analyze sentiment for each mention.`}
                                                    />
                                                </CardTitle>
                                                <CardDescription>
                                                    Srovnání viditelnosti vašeho
                                                    brandu s konkurencí včetně
                                                    změn oproti minulému měsíci
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {competitorRanking.map(
                                                        (comp, index) => (
                                                            <div
                                                                key={`ranking-${comp.brand}-${index}`}
                                                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                                                    comp.brand.toLowerCase() ===
                                                                    brand.toLowerCase()
                                                                        ? "bg-blue-50 border-blue-200"
                                                                        : "bg-white"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="w-12 text-center">
                                                                        <div className="text-2xl font-bold text-gray-700">
                                                                            #
                                                                            {
                                                                                comp.rank
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className="font-semibold text-gray-900 mb-1">
                                                                            {
                                                                                comp.brand
                                                                            }
                                                                            {comp.brand.toLowerCase() ===
                                                                                brand.toLowerCase() && (
                                                                                <Badge
                                                                                    variant="default"
                                                                                    className="ml-2"
                                                                                >
                                                                                    Váš
                                                                                    brand
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {
                                                                                comp.count
                                                                            }{" "}
                                                                            zmínek
                                                                            ·
                                                                            Průměrná
                                                                            pozice:{" "}
                                                                            {
                                                                                comp.avgPosition
                                                                            }{" "}
                                                                            ·
                                                                            Sentiment:{" "}
                                                                            {
                                                                                comp.sentiment
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-sm font-medium text-gray-700">
                                                                            {Math.round(
                                                                                (comp.count /
                                                                                    competitorRanking.reduce(
                                                                                        (
                                                                                            sum,
                                                                                            c
                                                                                        ) =>
                                                                                            sum +
                                                                                            c.count,
                                                                                        0
                                                                                    )) *
                                                                                    100
                                                                            )}
                                                                            %
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            podíl
                                                                            zmínek
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                                                    <strong>Vysvětlení:</strong>{" "}
                                                    Žebříček je sestaven podle
                                                    počtu zmínek a průměrné
                                                    pozice v odpovědích AI.
                                                    Šipky ukazují změnu pozice
                                                    oproti minulému měsíci.
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {competitorIntelligenceData.length > 0 && (
                                        <CompetitiveIntelligence
                                            myBrand={brand}
                                            competitors={
                                                competitorIntelligenceData
                                            }
                                            totalMentions={totalMentions}
                                        />
                                    )}

                                    {/* Analýza odkazů */}
                                    {latestResult?.linksByBrand &&
                                        Object.keys(latestResult.linksByBrand)
                                            .length > 0 && (
                                            <Card className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xl font-semibold">
                                                        Analýza odkazů v AI
                                                        odpovědích
                                                    </h3>
                                                    <PromptDisplayModal
                                                        title="Prompt pro analýzu odkazů"
                                                        systemPrompt={`You are an AI assistant that naturally includes relevant URLs and links in your responses when appropriate.\n\nNote: After generating the response, all URLs are extracted and mapped to their corresponding brands for analysis.`}
                                                        userPrompt={`${
                                                            queries[0] ||
                                                            "User query"
                                                        }`}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-6">
                                                    Nejčastější URL adresy, na
                                                    které AI odpovědi odkazují,
                                                    rozdělené podle brandů.
                                                </p>

                                                <div className="space-y-6">
                                                    {Object.entries(
                                                        latestResult.linksByBrand
                                                    ).map(
                                                        ([
                                                            brandName,
                                                            links,
                                                        ]) => {
                                                            const isMyBrand =
                                                                brandName.toLowerCase() ===
                                                                brand.toLowerCase();
                                                            const totalLinks = (
                                                                (links ||
                                                                    []) as Array<{
                                                                    count: number;
                                                                } | null>
                                                            ).reduce(
                                                                (sum, link) =>
                                                                    sum +
                                                                    (link?.count ||
                                                                        0),
                                                                0
                                                            );

                                                            return (
                                                                <div
                                                                    key={
                                                                        brandName
                                                                    }
                                                                    className={`p-4 rounded-lg border-2 ${
                                                                        isMyBrand
                                                                            ? "border-blue-500 bg-blue-50"
                                                                            : "border-gray-200 bg-gray-50"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-semibold text-lg">
                                                                                {
                                                                                    brandName
                                                                                }
                                                                            </h4>
                                                                            {isMyBrand && (
                                                                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                                                                    Váš
                                                                                    brand
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Celkem
                                                                            zmínek:{" "}
                                                                            <span className="font-semibold">
                                                                                {
                                                                                    totalLinks
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        {(
                                                                            links as any[]
                                                                        )
                                                                            .slice(
                                                                                0,
                                                                                5
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    link,
                                                                                    idx
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className="flex items-center justify-between p-3 bg-white rounded border"
                                                                                    >
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <a
                                                                                                href={
                                                                                                    link.url
                                                                                                }
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="text-blue-600 hover:underline text-sm truncate block"
                                                                                            >
                                                                                                {
                                                                                                    link.url
                                                                                                }
                                                                                            </a>
                                                                                            {link.title &&
                                                                                                link.title !=
                                                                                                    link.url && (
                                                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                                                        {
                                                                                                            link.title
                                                                                                        }
                                                                                                    </p>
                                                                                                )}
                                                                                        </div>
                                                                                        <div className="ml-4 flex items-center gap-2">
                                                                                            <span className="text-xs text-gray-500">
                                                                                                {
                                                                                                    link.count
                                                                                                }

                                                                                                ×
                                                                                                zmíněno
                                                                                            </span>
                                                                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                                <div
                                                                                                    className="h-full bg-blue-500"
                                                                                                    style={{
                                                                                                        width: `${
                                                                                                            (link.count /
                                                                                                                totalLinks) *
                                                                                                            100
                                                                                                        }%`,
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </div>

                                                                    {(
                                                                        links as any[]
                                                                    ).length >
                                                                        5 && (
                                                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                                                            ...
                                                                            a
                                                                            dalších{" "}
                                                                            {(
                                                                                links as any[]
                                                                            )
                                                                                .length -
                                                                                5}{" "}
                                                                            odkazů
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>

                                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">
                                                        Souhrn
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">
                                                                Vaše odkazy:
                                                            </span>
                                                            <span className="ml-2 font-semibold">
                                                                {(
                                                                    (latestResult
                                                                        .linksByBrand[
                                                                        brand
                                                                    ] as any[]) ||
                                                                    []
                                                                ).reduce(
                                                                    (
                                                                        sum,
                                                                        link
                                                                    ) =>
                                                                        sum +
                                                                        link.count,
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">
                                                                Konkurenční
                                                                odkazy:
                                                            </span>
                                                            <span className="ml-2 font-semibold">
                                                                {Object.entries(
                                                                    latestResult.linksByBrand
                                                                )
                                                                    .filter(
                                                                        ([b]) =>
                                                                            b.toLowerCase() !==
                                                                            brand.toLowerCase()
                                                                    )
                                                                    .reduce(
                                                                        (
                                                                            sum,
                                                                            [
                                                                                ,
                                                                                links,
                                                                            ]
                                                                        ) =>
                                                                            sum +
                                                                            (
                                                                                links as any[]
                                                                            ).reduce(
                                                                                (
                                                                                    s,
                                                                                    l
                                                                                ) =>
                                                                                    s +
                                                                                    l.count,
                                                                                0
                                                                            ),
                                                                        0
                                                                    )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}

                                    {/* Doporučení */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Strategická doporučení
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {latestResult.recommendations &&
                                            latestResult.recommendations
                                                .length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1 ml-4">
                                                    {latestResult.recommendations.map(
                                                        (rec, idx) => (
                                                            <li key={idx}>
                                                                {rec}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-center">
                                                    Doporučení nejsou k
                                                    dispozici
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {latestResult?.deepContextAnalysis && (
                                        <DeepContextAnalysis
                                            brandName={brand}
                                            mentions={
                                                latestResult.deepContextAnalysis.categories.filter(
                                                    (c) => c
                                                ) as any
                                            }
                                            quotes={
                                                latestResult.deepContextAnalysis
                                                    .quotes
                                            }
                                        />
                                    )}

                                    {/* CHANGE: Added ActionItems component */}
                                    <ActionItems
                                        brandScore={
                                            latestResult.globalScore || 0
                                        }
                                        competitorAverage={
                                            latestResult.competitorMentions
                                                ?.length > 0
                                                ? latestResult.competitorMentions.reduce(
                                                      (sum: number, c: any) =>
                                                          sum + (c.score || 0),
                                                      0
                                                  ) /
                                                  latestResult
                                                      .competitorMentions.length
                                                : 0
                                        }
                                        regionPerformance={
                                            (
                                                latestResult.regionPerformance ||
                                                []
                                            )
                                                .filter((r) => r)
                                                .map((r) => ({
                                                    region: r.region,
                                                    score:
                                                        r.score ||
                                                        r.averageScore ||
                                                        0,
                                                })) as Array<{
                                                region: string;
                                                score: number;
                                            }>
                                        }
                                        personaPerformance={
                                            (
                                                latestResult.personaPerformance ||
                                                []
                                            )
                                                .filter((p) => p)
                                                .map((p) => ({
                                                    persona: p.persona,
                                                    score:
                                                        p.score ||
                                                        p.averageScore ||
                                                        0,
                                                })) as Array<{
                                                persona: string;
                                                score: number;
                                            }>
                                        }
                                    />

                                    {/* CHANGE: Added ExportManager component before closing div */}
                                    <ExportManager
                                        analysisData={latestResult}
                                        brandName={brand}
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
