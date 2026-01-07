import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { query, brand, competitors = [] } = await req.json()

    if (!query || !brand) {
      return Response.json({ error: "Query and brand are required" }, { status: 400 })
    }

    // Generate AI response for the query
    const { text: aiResponse } = await generateText({
      model: "openai/gpt-5-mini",
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

      // Analyze sentiment using AI
      const { text: sentimentText } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Analyze the sentiment of how "${brand}" is mentioned in this text. Respond with only one word: "positive", "negative", or "neutral".\n\nText: ${aiResponse}`,
        maxOutputTokens: 20, // Increased from 10 to 20 (minimum is 16)
      })

      const sentiment = sentimentText.toLowerCase().trim()
      if (sentiment.includes("positive")) {
        brandMentions.sentiment = "positive"
      } else if (sentiment.includes("negative")) {
        brandMentions.sentiment = "negative"
      }
    }

    // Analyze competitor mentions
    const competitorMentions = await Promise.all(
      competitors.map(async (competitor: string) => {
        const compLower = competitor.toLowerCase()
        const count = (responseLower.match(new RegExp(compLower, "g")) || []).length

        let sentiment: "positive" | "neutral" | "negative" = "neutral"

        if (count > 0) {
          const { text: sentimentText } = await generateText({
            model: "openai/gpt-5-mini",
            prompt: `Analyze the sentiment of how "${competitor}" is mentioned in this text. Respond with only one word: "positive", "negative", or "neutral".\n\nText: ${aiResponse}`,
            maxOutputTokens: 20, // Increased from 10 to 20 (minimum is 16)
          })

          const sentimentResult = sentimentText.toLowerCase().trim()
          if (sentimentResult.includes("positive")) {
            sentiment = "positive"
          } else if (sentimentResult.includes("negative")) {
            sentiment = "negative"
          }
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
      visibilityScore += 40 // Base score for being mentioned
      visibilityScore += Math.min(brandMentions.count * 10, 20) // Up to 20 points for multiple mentions

      if (brandMentions.positions[0] <= 2) {
        visibilityScore += 15 // Bonus for early mention
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

    return Response.json({
      aiResponse,
      brandMentions,
      competitorMentions: competitorMentions.filter((c) => c.count > 0),
      visibilityScore: Math.min(visibilityScore, 100),
      recommendations,
    })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return Response.json({ error: "Analysis failed" }, { status: 500 })
  }
}
