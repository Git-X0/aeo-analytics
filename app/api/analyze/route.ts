import { generateText } from "ai"
import OpenAI from "openai"
import { NextResponse } from "next/server"; // Import NextResponse for richer error handling

export const maxDuration = 30

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
    const { query, brand, competitors = [], apiKey: requestApiKey } = await req.json()

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

    if (!query || !brand) {
      return NextResponse.json({ error: "Query and brand are required" }, { status: 400 })
    }

    // Generate AI response for the query
    const { text: aiResponse } = await generateText({
      model: openai.chat("gpt-5-mini"),
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

      // Analyze sentiment using AI helper function
      brandMentions.sentiment = await getSentiment(openai, brand, aiResponse);
    }

    // Analyze competitor mentions
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
        "Váš brand nebyl zmíněn v AI odpovědi. Zvažte optimalizaci obsahu a přítomnosti ve zdrojích dat AI modelů.",
      )
      recommendations.push("Vytvářejte kvalitní obsah a recenze, které pomohou AI lépe porozumět vašemu produktu.")
    } else {
      if (brandMentions.positions[0] > 3) {
        recommendations.push("Váš brand je zmíněn, ale až později v odpovědi. Pracujte na autoritě a relevanci.")
      }

      if (brandMentions.sentiment === "negative") {
        recommendations.push("Sentiment zmínky je negativní. Zaměřte se na zlepšení pověsti a zákaznické zkušenosti.")
      } else if (brandMentions.sentiment === "neutral") {
        recommendations.push(
          "Sentiment je neutrální. Zvyšte pozitivní asociace prostřednictvím case studies a testimonials.",
        )
      }
    }

    const topCompetitor = competitorMentions.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)[0]

    if (topCompetitor && topCompetitor.count > brandMentions.count) {
      recommendations.push(`${topCompetitor.name} má více zmínek než váš brand. Analyzujte jejich strategii a obsah.`)
    }

    return NextResponse.json({ // Use NextResponse.json here
      aiResponse,
      brandMentions,
      competitorMentions: competitorMentions.filter((c) => c.count > 0),
      visibilityScore: Math.min(visibilityScore, 100),
      recommendations,
    })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
