import { generateText } from "ai"

export const maxDuration = 60

interface ContextConfig {
  region: string
  language: string
  persona: string
  device: string
}

const REGION_CONTEXTS = {
  us: "You are answering from a US perspective, considering mainly US-based companies and solutions popular in North America.",
  eu: "You are answering from a European perspective, considering EU-based companies, GDPR compliance, and solutions popular in Europe.",
  asia: "You are answering from an Asian perspective, considering companies and solutions popular in Asia-Pacific markets.",
  latam:
    "You are answering from a Latin American perspective, considering companies and solutions popular in Latin America.",
}

const LANGUAGE_CONTEXTS = {
  en: "English",
  cs: "Czech",
  de: "German",
  es: "Spanish",
}

const PERSONA_CONTEXTS = {
  b2b: "You are helping a B2B decision maker (C-level executive or department head) looking for enterprise solutions. Focus on scalability, ROI, and business value.",
  b2c: "You are helping an individual consumer looking for personal solutions. Focus on ease of use, affordability, and personal benefits.",
  developer:
    "You are helping a software developer looking for technical tools. Focus on technical capabilities, APIs, documentation, and developer experience.",
  researcher:
    "You are helping a researcher comparing different options systematically. Provide balanced, objective comparisons with specific data points.",
}

export async function POST(req: Request) {
  try {
    const { query, brand, competitors = [], context } = await req.json()

    if (!query || !brand || !context) {
      return Response.json({ error: "Query, brand, and context are required" }, { status: 400 })
    }

    const ctx = context as ContextConfig

    // Build context-aware system prompt
    const systemPrompt = `${REGION_CONTEXTS[ctx.region as keyof typeof REGION_CONTEXTS]}
${PERSONA_CONTEXTS[ctx.persona as keyof typeof PERSONA_CONTEXTS]}
Answer in ${LANGUAGE_CONTEXTS[ctx.language as keyof typeof LANGUAGE_CONTEXTS]}.
User is on ${ctx.device}.`

    // Generate AI response with context
    const { text: aiResponse } = await generateText({
      model: "openai/gpt-5-mini",
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
      const { text: sentimentText } = await generateText({
        model: "openai/gpt-5-mini",
        prompt: `Analyze the sentiment of how "${brand}" is mentioned in this text. Respond with only one word: "positive", "negative", or "neutral".\n\nText: ${aiResponse}`,
        maxOutputTokens: 20,
      })

      const sentiment = sentimentText.toLowerCase().trim()
      if (sentiment.includes("positive")) {
        brandMentions.sentiment = "positive"
      } else if (sentiment.includes("negative")) {
        brandMentions.sentiment = "negative"
      }
    }

    // Analyze competitors
    const competitorMentions = await Promise.all(
      competitors.map(async (competitor: string) => {
        const compLower = competitor.toLowerCase()
        const count = (responseLower.match(new RegExp(compLower, "g")) || []).length

        let sentiment: "positive" | "neutral" | "negative" = "neutral"

        if (count > 0) {
          const { text: sentimentText } = await generateText({
            model: "openai/gpt-5-mini",
            prompt: `Analyze the sentiment of how "${competitor}" is mentioned in this text. Respond with only one word: "positive", "negative", or "neutral".\n\nText: ${aiResponse}`,
            maxOutputTokens: 20,
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

    return Response.json({
      aiResponse,
      brandMentions,
      competitorMentions: competitorMentions.filter((c) => c.count > 0),
      visibilityScore: Math.min(visibilityScore, 100),
      recommendations,
      context: ctx,
    })
  } catch (error) {
    console.error("[v0] Context analysis error:", error)
    return Response.json({ error: "Analysis failed" }, { status: 500 })
  }
}
