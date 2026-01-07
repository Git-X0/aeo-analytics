import { generateText } from "ai"
import OpenAI from "openai"
import { NextResponse } from "next/server"; // Import NextResponse for richer error handling

export const maxDuration = 60

interface ContextConfig {
  region: string
  language: string
  persona: string
  device: string
}

const REGION_CONTEXTS = {
  north_america: "You are answering from a North American (US/Canada) perspective, considering mainly US-based companies and solutions popular in North America.",
  europe: "You are answering from a European perspective, considering EU-based companies, GDPR compliance, and solutions popular in Europe.",
  asia_pacific: "You are answering from an Asia-Pacific perspective, considering companies and solutions popular in Asia-Pacific markets including China, Japan, India, and Southeast Asia.",
  latin_america:
    "You are answering from a Latin American perspective, considering companies and solutions popular in Latin American markets.",
}

const LANGUAGE_CONTEXTS = {
  en: "English",
  cs: "Czech",
  de: "German",
  es: "Spanish",
}

const PERSONA_CONTEXTS = {
  b2b_decision_maker:
    "You are helping a B2B decision maker (manager/executive) looking for enterprise solutions. Focus on ROI, scalability, security, integrations, and business value.",
  b2c_consumer:
    "You are helping an individual consumer looking for personal solutions. Focus on ease of use, affordability, quick setup, and user experience.",
  developer:
    "You are helping a software developer looking for technical tools. Focus on APIs, documentation, performance, flexibility, and developer experience.",
  researcher:
    "You are helping a researcher or analyst looking for data analysis tools. Focus on advanced features, data export, accuracy, and integration capabilities.",
}

// Helper function to analyze sentiment
async function getSentiment(openai: OpenAI, brandName: string, text: string): Promise<"positive" | "neutral" | "negative"> {
  try {
    const { text: sentimentText } = await generateText({
      model: openai.chat("gpt-5-mini"),
      prompt: `Analyze the sentiment of how "${brandName}" is mentioned in this text. Respond with only one word: "positive", "negative", or "neutral".\n\nText: ${text}`,
      maxOutputTokens: 20,
    })

    const sentimentResult = sentimentText.toLowerCase().trim()
    if (sentimentResult.includes("positive")) {
      return "positive"
    } else if (sentimentResult.includes("negative")) {
      return "negative"
    }
    return "neutral"
  } catch (sentimentError) {
    console.error("[v0] Sentiment analysis failed for", brandName, sentimentError);
    return "neutral"; // Default to neutral if sentiment analysis fails
  }
}

export async function POST(req: Request) {
  try {
    const { query, brand, competitors = [], context, apiKey: requestApiKey } = await req.json()

    const apiKey = requestApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API key not configured",
          message: "Please provide an OpenAI API key in the form or set OPENAI_API_KEY environment variable.",
          instructions: "Go to https://platform.openai.com/api-keys to create a new API key.",
        },
        { status: 500 }
      );
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        {
          error: "Invalid API key format",
          message: "OpenAI API key must start with 'sk-'. Please check your key.",
          instructions: "Verify your API key at https://platform.openai.com/api-keys",
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    if (!query || !brand || !context) {
      return NextResponse.json({ error: "Query, brand, and context are required" }, { status: 400 })
    }

    const ctx = context as ContextConfig

    // Build context-aware system prompt
    const systemPrompt = `${REGION_CONTEXTS[ctx.region as keyof typeof REGION_CONTEXTS]}
${PERSONA_CONTEXTS[ctx.persona as keyof typeof PERSONA_CONTEXTS]}
Answer in ${LANGUAGE_CONTEXTS[ctx.language as keyof typeof LANGUAGE_CONTEXTS]}.
User is on ${ctx.device}.`

    // Generate AI response with context
    const { text: aiResponse } = await generateText({
      model: openai.chat("gpt-5-mini"),
      system: systemPrompt,
      prompt: query,
      maxOutputTokens: 1000,
    })

    // Analyze brand mentions
    const brandLower = brand.toLowerCase()
    const responseLower = aiResponse.toLowerCase()

    const brandMentions = {
      found: responseLower.includes(brandLower),
      count: (responseLower.match(new RegExp(brandLower, "g")) || []).length,
      positions: [] as number[],
      contexts: [] as string[],
      sentiment: "neutral" as "positive" | "neutral" | "negative",
    }

    // Find positions and contexts
    if (brandMentions.found) {
      const sentences = aiResponse.split(/[.!?]+/).filter((s) => s.trim())
      sentences.forEach((sentence, idx) => {
        if (sentence.toLowerCase().includes(brandLower)) {
          brandMentions.positions.push(idx + 1)
          brandMentions.contexts.push(sentence.trim())
        }
      })

      // Analyze sentiment
      brandMentions.sentiment = await getSentiment(openai, brand, aiResponse);
    }

    // Analyze competitors
    const competitorMentions = await Promise.all(
      competitors.map(async (competitor: string) => {
        const compLower = competitor.toLowerCase()
        const count = (responseLower.match(new RegExp(compLower, "g")) || []).length

        let sentiment: "positive" | "neutral" | "negative" = "neutral"

        if (count > 0) {
          sentiment = await getSentiment(openai, competitor, aiResponse);
        }

        return {
          name: competitor,
          count,
          sentiment,
        }
      }),
    )

    // Calculate visibility score
    let visibilityScore = 0

    if (brandMentions.found) {
      visibilityScore += 40
      visibilityScore += Math.min(brandMentions.count * 10, 20)

      if (brandMentions.positions[0] <= 2) {
        visibilityScore += 15
      }

      if (brandMentions.sentiment === "positive") {
        visibilityScore += 25
      } else if (brandMentions.sentiment === "neutral") {
        visibilityScore += 15
      }
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (!brandMentions.found) {
      recommendations.push(
        `Váš brand není viditelný v ${ctx.region.toUpperCase()} regionu pro ${ctx.persona} personu. Optimalizujte obsah pro tento trh.`,
      )
    } else {
      if (brandMentions.sentiment !== "positive") {
        recommendations.push(`Zlepšete sentiment vašeho brandu v ${ctx.region.toUpperCase()} regionu.`)
      }
    }

    const topCompetitor = competitorMentions.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)[0]

    if (topCompetitor && topCompetitor.count > brandMentions.count) {
      recommendations.push(
        `${topCompetitor.name} má lepší viditelnost v tomto kontextu (${ctx.region}, ${ctx.language}).`,
      )
    }

    return NextResponse.json({
      aiResponse,
      brandMentions,
      competitorMentions: competitorMentions.filter((c) => c.count > 0),
      visibilityScore: Math.min(visibilityScore, 100),
      recommendations,
      context: ctx,
    })
  } catch (error) {
    console.error("[v0] Context analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
