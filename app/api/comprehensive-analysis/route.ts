import { type NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface ComprehensiveAnalysisRequest {
    query: string;
    brand: string;
    competitors?: string[];
    model?: string;
    personas?: string[];
    regions?: string[];
    apiKey?: string;
}

interface BrandMention {
    brand: string;
    count: number;
    positions: number[];
    sentiment: "positive" | "neutral" | "negative";
}

interface LinkMention {
    url: string;
    brand: string;
    count: number;
    title?: string;
}

interface ContextResult {
    region: string;
    language: string;
    persona: string;
    aiResponse: string;
    brandMentions: BrandMention[];
    detectedCompetitors: string[];
    visibilityScore: number;
    links: LinkMention[];
}

const REGION_LANGUAGES: Record<string, string> = {
    north_america: "en",
    europe: "en",
    asia_pacific: "en",
    latin_america: "es",
    // Add other region-language mappings as needed
};

const REGION_PROMPTS = {
    north_america:
        "You are answering from a North American (US/Canada) perspective, considering mainly US-based companies and solutions popular in North America.",
    europe: "You are answering from a European perspective, considering EU-based companies, GDPR compliance, and solutions popular in Europe.",
    asia_pacific:
        "You are answering from an Asia-Pacific perspective, considering companies and solutions popular in Asia-Pacific markets including China, Japan, India, and Southeast Asia.",
    latin_america:
        "You are answering from a Latin American perspective, considering companies and solutions popular in Latin American markets.",
};

const PERSONA_PROMPTS = {
    b2b_decision_maker:
        "You are helping a B2B decision maker (manager/executive) looking for enterprise solutions. Focus on ROI, scalability, security, integrations, and business value.",
    b2c_consumer:
        "You are helping an individual consumer looking for personal solutions. Focus on ease of use, affordability, quick setup, and user experience.",
    developer:
        "You are helping a software developer looking for technical tools. Focus on APIs, documentation, performance, flexibility, and developer experience.",
    researcher:
        "You are helping a researcher or analyst looking for data analysis tools. Focus on advanced features, data export, accuracy, and integration capabilities.",
    startup_founder:
        "You are helping a startup founder looking for quick, affordable solutions. Focus on speed of implementation, cost-effectiveness, and ability to scale.",
    marketing_professional:
        "You are helping a marketing professional looking for campaign and analytics tools. Focus on ROI measurement, reporting, automation, and multi-channel capabilities.",
    it_admin:
        "You are helping an IT administrator responsible for infrastructure and security. Focus on management ease, monitoring, compliance, and security features.",
    student:
        "You are helping a student or educator looking for educational tools. Focus on accessibility, ease of learning, educational resources, and student/teacher discounts.",
};

const LANGUAGE_NAMES = {
    en: "English",
    cs: "Czech",
    de: "German",
    es: "Spanish",
};

const OPENAI_PRICING = {
    "gpt-4o": { input: 5.0, output: 15.0 }, // $ per 1M tokens
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4-turbo": { input: 10.0, output: 30.0 },
    "gpt-3.5-turbo-0125": { input: 0.5, output: 1.5 },
};

function calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
): number {
    const pricing =
        OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] ||
        OPENAI_PRICING["gpt-4o-mini"];
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
}

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
    initialDelay = 1000
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (
                response.ok ||
                (response.status >= 400 && response.status < 500)
            ) {
                return response;
            }

            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries - 1) {
                break;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            console.log(
                `[v0] Retry attempt ${
                    attempt + 1
                }/${maxRetries} after ${delay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError || new Error("Max retries exceeded");
}

async function getDeepContextAnalysis(
    text: string,
    brand: string,
    apiKey: string
): Promise<any> {
    try {
        const response = await fetchWithRetry(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: `You are a data analysis expert. Analyze the provided text which consists of multiple AI-generated responses. Your task is to perform a deep context analysis about the brand "${brand}". Structure your response as a valid JSON object with the following keys: "categories", "quotes", "keywordAssociations".
- "categories": An array of objects, where each object has "category" (e.g., "Pricing", "Features", "Support"), "count" (number of times this category is mentioned), "sentiment" ("positive", "neutral", or "negative"), and "examples" (an array of 2-3 short, relevant sentences from the text).
- "quotes": An array of up to 5 most representative quote objects from the text that mention "${brand}". Each object should have "text" (the quote), "category" (the most relevant category), and "sentiment".
- "keywordAssociations": An array of objects identifying keywords frequently associated with "${brand}". Each object should have "keyword", "count", and "sentiment".`,
                        },
                        {
                            role: "user",
                            content: `Here is the text to analyze:\n\n${text}`,
                        },
                    ],
                    temperature: 0.5,
                    max_tokens: 1500,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "[v0] Deep context analysis API error:",
                response.status,
                errorText
            );
            return null;
        }

        const data = await response.json();
        const jsonResponse = JSON.parse(data.choices?.[0]?.message?.content);
        return jsonResponse;
    } catch (error) {
        console.error("[v0] Error in getDeepContextAnalysis:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
        const body: ComprehensiveAnalysisRequest = await request.json();
        const apiKey = body.apiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error: "API key not configured",
                    message:
                        "Please provide an OpenAI API key in the form or set OPENAI_API_KEY environment variable.",
                    instructions:
                        "Go to https://platform.openai.com/api-keys to create a new API key.",
                },
                { status: 500 }
            );
        }

        if (!apiKey.startsWith("sk-")) {
            return NextResponse.json(
                {
                    error: "Invalid API key format",
                    message:
                        "OpenAI API key must start with 'sk-'. Please check your key.",
                    instructions:
                        "Verify your API key at https://platform.openai.com/api-keys",
                },
                { status: 400 }
            );
        }

        const {
            query,
            brand,
            competitors = [],
            model: rawModel,
            regions,
            personas,
        } = body;

        const model = rawModel ? rawModel.split("/").pop() : "gpt-4o-mini";

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        if (!brand || typeof brand !== "string" || brand.trim().length === 0) {
            return NextResponse.json(
                { error: "Brand is required" },
                { status: 400 }
            );
        }

        const selectedRegions =
            regions && regions.length > 0
                ? regions
                : Object.keys(REGION_PROMPTS);
        const selectedPersonas =
            personas && personas.length > 0
                ? personas
                : Object.keys(PERSONA_PROMPTS);

        const contexts = selectedRegions.flatMap((region) =>
            selectedPersonas.map((persona) => ({
                region,
                language: REGION_LANGUAGES[region] || "en",
                persona,
            }))
        );

        const contextResults = await Promise.all(
            contexts.map(async (ctx) => {
                try {
                    const regionPrompt =
                        REGION_PROMPTS[
                            ctx.region as keyof typeof REGION_PROMPTS
                        ];
                    const personaPrompt =
                        PERSONA_PROMPTS[
                            ctx.persona as keyof typeof PERSONA_PROMPTS
                        ];

                    const systemPrompt = `${regionPrompt}\n${personaPrompt}`;

                    const response = await fetchWithRetry(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${apiKey}`,
                            },
                            body: JSON.stringify({
                                model: model || "gpt-4o-mini",
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: query },
                                ],
                                temperature: 0.7,
                                max_tokens: 500,
                            }),
                        }
                    );

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(
                            "[v0] OpenAI API error:",
                            response.status,
                            errorText
                        );
                        return null;
                    }

                    const data = await response.json();
                    const aiResponse = data.choices?.[0]?.message?.content;

                    if (!aiResponse || typeof aiResponse !== "string") {
                        console.error("[v0] Invalid AI response");
                        return null;
                    }

                    const inputTokens = data.usage?.prompt_tokens || 0;
                    const outputTokens = data.usage?.completion_tokens || 0;

                    totalInputTokens += inputTokens;
                    totalOutputTokens += outputTokens;

                    const allBrands = [brand, ...competitors].filter(
                        (b): b is string =>
                            typeof b === "string" && b.trim() !== ""
                    );

                    const brandMentionsPromises = allBrands.map(
                        async (brandName) => {
                            if (!brandName || typeof brandName !== "string") {
                                return null;
                            }

                            const brandLower = brandName.toLowerCase();
                            const responseLower = aiResponse.toLowerCase();
                            const mentions = [];
                            let index = 0;

                            while (
                                (index = responseLower.indexOf(
                                    brandLower,
                                    index
                                )) !== -1
                            ) {
                                mentions.push(index);
                                index += brandLower.length;
                            }

                            if (mentions.length === 0) {
                                return null;
                            }

                            const sentimentResponse = await fetchWithRetry(
                                "https://api.openai.com/v1/chat/completions",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${apiKey}`,
                                    },
                                    body: JSON.stringify({
                                        model: "gpt-4o-mini",
                                        messages: [
                                            {
                                                role: "system",
                                                content:
                                                    "You are a sentiment analysis expert. Analyze the sentiment of the brand mention in the provided text. Respond with only one word: 'positive', 'neutral', or 'negative'.",
                                            },
                                            {
                                                role: "user",
                                                content: `Text: "${aiResponse}"\n\nBrand: "${brandName}"`,
                                            },
                                        ],
                                        temperature: 0,
                                        max_tokens: 5,
                                    }),
                                }
                            );

                            let sentiment: "positive" | "neutral" | "negative" =
                                "neutral";
                            if (sentimentResponse.ok) {
                                const sentimentData =
                                    await sentimentResponse.json();
                                const sentimentText =
                                    sentimentData.choices?.[0]?.message?.content
                                        .toLowerCase()
                                        .trim();
                                if (
                                    [
                                        "positive",
                                        "neutral",
                                        "negative",
                                    ].includes(sentimentText)
                                ) {
                                    sentiment = sentimentText;
                                }
                                totalInputTokens +=
                                    sentimentData.usage?.prompt_tokens || 0;
                                totalOutputTokens +=
                                    sentimentData.usage?.completion_tokens || 0;
                            }

                            return {
                                brand: brandName,
                                count: mentions.length,
                                positions: mentions,
                                sentiment: sentiment,
                            };
                        }
                    );

                    const brandMentions = await Promise.all(
                        brandMentionsPromises
                    );

                    const validBrandMentions = brandMentions.filter(
                        (m): m is NonNullable<typeof m> =>
                            m !== null &&
                            m.brand !== undefined &&
                            typeof m.brand === "string"
                    );

                    const urlRegex = /https?:\/\/[^\s]+/g;
                    const potentialUrls = aiResponse.match(urlRegex) || [];
                    const urls = potentialUrls.map((url) =>
                        url.replace(/[.,;:)\]}>]+$/, "")
                    );

                    const linkMentions = urls.reduce<LinkMention[]>((acc, url) => {
                        try {
                            if (!url || typeof url !== "string") {
                                return acc;
                            }

                            let matchedBrand = "Unknown";

                            for (const brandName of allBrands) {
                                if (
                                    typeof brandName === "string" &&
                                    brandName.trim().length > 0
                                ) {
                                    try {
                                        const brandSlug = brandName
                                            .toLowerCase()
                                            .replace(/\s+/g, "");
                                        const urlHostname = new URL(url)
                                            .hostname;
                                        const cleanedHostname =
                                            urlHostname.replace(
                                                /^(www\.|app\.)|(\.com|\.org|\.net|\.co|\.io)$/g,
                                                ""
                                            );

                                        if (
                                            cleanedHostname.includes(brandSlug)
                                        ) {
                                            matchedBrand = brandName;
                                            break;
                                        }
                                    } catch (e) {
                                        // Fallback for invalid URLs
                                        if (
                                            url.toLowerCase().includes(
                                                brandName
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "")
                                            )
                                        ) {
                                            matchedBrand = brandName;
                                            break;
                                        }
                                    }
                                }
                            }

                            acc.push({
                                url,
                                brand: matchedBrand,
                                count: 1,
                                title: url,
                            });
                        } catch (error) {
                            console.error(
                                "[v0] Error processing URL:",
                                url,
                                error
                            );
                        }
                        return acc;
                    }, []);

                    const myBrandMention = validBrandMentions.find((m) => {
                        if (
                            !m?.brand ||
                            typeof m.brand !== "string" ||
                            !brand ||
                            typeof brand !== "string"
                        ) {
                            return false;
                        }
                        return m.brand.toLowerCase() === brand.toLowerCase();
                    });

                    let visibilityScore = 0;
                    if (myBrandMention) {
                        const mentionCount = myBrandMention.positions.length;
                        const avgPosition =
                            myBrandMention.positions.reduce(
                                (a, b) => a + b,
                                0
                            ) / mentionCount;

                        visibilityScore += mentionCount * 20;
                        visibilityScore +=
                            avgPosition <= 3 ? 30 : avgPosition <= 6 ? 20 : 10;
                        visibilityScore +=
                            myBrandMention.sentiment === "positive"
                                ? 20
                                : myBrandMention.sentiment === "neutral"
                                ? 10
                                : 0;

                        if (validBrandMentions.length > 1) {
                            visibilityScore += 10;
                        }

                        visibilityScore = Math.min(100, visibilityScore);
                    }

                    const detectedCompetitors = validBrandMentions
                        .filter((m) => {
                            if (
                                !m?.brand ||
                                typeof m.brand !== "string" ||
                                !brand ||
                                typeof brand !== "string"
                            ) {
                                return false;
                            }
                            return (
                                m.brand.toLowerCase() !== brand.toLowerCase()
                            );
                        })
                        .map((m) => m.brand);

                    return {
                        region: ctx.region,
                        language: ctx.language,
                        persona: ctx.persona,
                        aiResponse,
                        brandMentions: validBrandMentions,
                        detectedCompetitors,
                        visibilityScore,
                        links: linkMentions,
                    };
                } catch (error) {
                    console.error("[v0] Error processing context:", ctx, error);
                    return null;
                }
            })
        );

        const validContextResults = contextResults.filter(
            (r): r is ContextResult => r !== null
        );

        if (validContextResults.length === 0) {
            return NextResponse.json(
                {
                    error: "All context analyses failed. Please check your API key and try again.",
                    cost: 0,
                    tokenUsage: { input: 0, output: 0 },
                },
                { status: 500 }
            );
        }

        const totalCost = calculateCost(
            model || "gpt-4o-mini",
            totalInputTokens,
            totalOutputTokens
        );

        const hasInsufficientData = validContextResults.every(
            (r) => r.brandMentions.length === 0
        );

        if (hasInsufficientData) {
            const brandName = typeof brand === "string" ? brand : "Unknown";
            return NextResponse.json({
                globalScore: 0,
                noMentionsFound: true,
                contextResults: validContextResults,
                regionPerformance: [],
                personaPerformance: [],
                competitorMentions: [],
                allDetectedCompetitors: [brand],
                sentimentBreakdown: { positive: 0, neutral: 100, negative: 0 },
                contextAnalysis: [],
                recommendations: [
                    "No mentions of your brand were found in the AI-generated responses. Try a broader query or different personas/regions."
                ],
                deepContextAnalysis: null,
                linksByBrand: {},
                timestamp: new Date().toISOString(),
                query,
                brand: brandName,
                usage: {
                    inputTokens: totalInputTokens,
                    outputTokens: totalOutputTokens,
                    totalTokens: totalInputTokens + totalOutputTokens,
                    cost: totalCost,
                    model: model || "gpt-4o-mini",
                },
            });
        }

        const allAIResponses = validContextResults
            .map((r) => r.aiResponse)
            .join(" ");

        const deepContextAnalysis = await getDeepContextAnalysis(
            allAIResponses,
            brand,
            apiKey
        );

        const globalScore = Math.round(
            validContextResults.reduce((sum, r) => sum + r.visibilityScore, 0) /
                validContextResults.length
        );

        const regionGroups = validContextResults.reduce((acc, r) => {
            if (!acc[r.region]) {
                acc[r.region] = [];
            }
            acc[r.region].push(r.visibilityScore);
            return acc;
        }, {} as Record<string, number[]>);

        const regionPerformance = Object.entries(regionGroups).map(
            ([region, scores]) => ({
                region,
                score: Math.round(
                    scores.reduce((sum, s) => sum + s, 0) / scores.length
                ),
            })
        );

        const personaGroups = validContextResults.reduce((acc, r) => {
            if (!acc[r.persona]) {
                acc[r.persona] = [];
            }
            acc[r.persona].push(r.visibilityScore);
            return acc;
        }, {} as Record<string, number[]>);

        const personaPerformance = Object.entries(personaGroups).map(
            ([persona, scores]) => ({
                persona,
                score: Math.round(
                    scores.reduce((sum, s) => sum + s, 0) / scores.length
                ),
            })
        );

        const allMentionedBrands = [
            ...new Set([
                brand,
                ...validContextResults.flatMap((r) => r.detectedCompetitors),
            ]),
        ].filter(
            (c): c is string => typeof c === "string" && c.trim().length > 0
        );

        const competitorStats = allMentionedBrands
            .map((competitor) => {
                if (
                    !competitor ||
                    typeof competitor !== "string" ||
                    !competitor.trim()
                ) {
                    return null;
                }

                try {
                    const competitorLower = competitor.toLowerCase();
                    const mentions = validContextResults
                        .flatMap((r) => r.brandMentions)
                        .filter((m) => {
                            if (
                                !m ||
                                !m.brand ||
                                typeof m.brand !== "string" ||
                                !m.brand.trim()
                            ) {
                                return false;
                            }
                            return m.brand.toLowerCase() === competitorLower;
                        });

                    if (mentions.length === 0) {
                        return null;
                    }

                    const avgPosition =
                        mentions.reduce(
                            (sum, m) => sum + (m.positions[0] || 999),
                            0
                        ) / mentions.length;

                    const sentiments = mentions.map((m) => m.sentiment);
                    const positiveMentions = sentiments.filter(
                        (s) => s === "positive"
                    ).length;

                    return {
                        name: competitor,
                        totalMentions: mentions.length,
                        averagePosition: Math.round(avgPosition),
                        positiveSentiment: Math.round(
                            (positiveMentions / mentions.length) * 100
                        ),
                    };
                } catch (error) {
                    console.error(
                        "[v0] Error processing competitor stats for:",
                        competitor,
                        error
                    );
                    return null;
                }
            })
            .filter((stat): stat is NonNullable<typeof stat> => stat !== null);

        const allBrandMentions = validContextResults.flatMap(
            (r) => r.brandMentions
        );
        const sentimentCounts = allBrandMentions.reduce((acc, mention) => {
            acc[mention.sentiment] = (acc[mention.sentiment] || 0) + 1;
            return acc;
        }, {} as Record<"positive" | "neutral" | "negative", number>);

        const totalMentions = allBrandMentions.length;
        const sentimentBreakdown =
            totalMentions > 0
                ? {
                      positive: Math.round(
                          ((sentimentCounts.positive || 0) / totalMentions) *
                              100
                      ),
                      neutral: Math.round(
                          ((sentimentCounts.neutral || 0) / totalMentions) * 100
                      ),
                      negative: Math.round(
                          ((sentimentCounts.negative || 0) / totalMentions) *
                              100
                      ),
                  }
                : { positive: 0, neutral: 100, negative: 0 };

        const brandName = typeof brand === "string" ? brand : "Unknown";
        const contextAnalysis = deepContextAnalysis?.categories?.map((cat: any) => ({
            context: cat.examples?.[0] || `Brand mentioned in context of ${cat.category}`,
            mentions: cat.count,
            sentiment: cat.sentiment,
        })) || [];

        const topCompetitor = competitorStats[0]?.name || "konkurence";
        const topRegion =
            regionPerformance.sort((a, b) => b.score - a.score)[0]?.region ||
            "North America";
        const worstRegion =
            regionPerformance.sort((a, b) => a.score - b.score)[0]?.region ||
            "Latin America";
        const recommendations = [
            `Vaše viditelnost je ${
                globalScore > 70
                    ? "nadprůměrná"
                    : globalScore > 50
                    ? "průměrná"
                    : "podprůměrná"
            } (${globalScore}/100). Zaměřte se na zvýšení pozitivního sentimentu v odpovědích.`,
            `Máte silnou pozici v regionu ${topRegion} (${
                regionPerformance.find((r) => r.region === topRegion)?.score ||
                0
            }), ale nižší v ${worstRegion} (${
                regionPerformance.find((r) => r.region === worstRegion)
                    ?.score || 0
            }). Zvažte lokální marketing.`,
            `${topCompetitor} má ${
                competitorStats[0]?.totalMentions || 0
            } zmínek. ${
                competitorStats[0]?.totalMentions >
                allBrandMentions.filter(
                    (m) => m.brand.toLowerCase() === brand.toLowerCase()
                ).length
                    ? "Zvyšte PR aktivitu a SEO optimalizaci."
                    : "Udržujte si vedoucí pozici."
            }`,
            `Sentiment breakdown ukazuje ${
                sentimentBreakdown.negative
            }% negativních zmínek. ${
                sentimentBreakdown.negative > 10
                    ? "Pracujte na řešení častých problémů zákazníků."
                    : "Udržujte si pozitivní sentiment."
            }`,
        ];

        const allLinks = validContextResults.flatMap((r) => r.links);
        const linkStats = allLinks.reduce((acc, link) => {
            const existing = acc.find((l) => l.url === link.url);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ ...link });
            }
            return acc;
        }, [] as LinkMention[]);

        const linksByBrand = linkStats.reduce((acc, link) => {
            if (!acc[link.brand]) {
                acc[link.brand] = [];
            }
            acc[link.brand].push(link);
            return acc;
        }, {} as Record<string, LinkMention[]>);

        Object.keys(linksByBrand).forEach((brandName) => {
            linksByBrand[brandName].sort((a, b) => b.count - a.count);
        });

        const competitorMentions = competitorStats
            .map((stat) => ({
                brand: stat.name,
                count: stat.totalMentions,
                avgPosition: stat.averagePosition,
                sentiment:
                    stat.positiveSentiment > 60
                        ? ("positive" as const)
                        : stat.positiveSentiment < 40
                        ? ("negative" as const)
                        : ("neutral" as const),
            }))
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.avgPosition - b.avgPosition;
            });

        return NextResponse.json({
            globalScore,
            contextResults: validContextResults,
            regionPerformance,
            personaPerformance,
            competitorMentions,
            allDetectedCompetitors: allMentionedBrands,
            sentimentBreakdown,
            contextAnalysis,
            recommendations,
            deepContextAnalysis,
            linksByBrand,
            timestamp: new Date().toISOString(),
            query,
            brand: brandName,
            usage: {
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
                totalTokens: totalInputTokens + totalOutputTokens,
                cost: totalCost,
                model: model || "gpt-4o-mini",
            },
        });
    } catch (error) {
        console.error("[v0] Comprehensive analysis error:", error);
        return NextResponse.json(
            {
                error: "Analysis failed",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
