# Návod pro implementaci specializovaných AI promptů

## Přehled

Aktuálně aplikace používá 9 paralelních API requestů (kombinace region × persona × language) a pak agreguje výsledky pro různé sekce. Tento návod ukáže, jak implementovat **dedikované prompty** pro každou analytickou sekci.

---

## Architektura

### Současný stav
```
1 dotaz → 9 AI requestů (různé kontexty) → agregace výsledků
```

### Nový přístup
```
1 dotaz → N specializovaných AI requestů → specifické výsledky pro každou sekci
```

---

## Krok 1: Definice specializovaných promptů

Vytvoř soubor `lib/prompts.ts` s následujícím obsahem:

```typescript
export interface PromptConfig {
  id: string
  name: string
  systemPrompt: string
  userPromptTemplate: (brand: string, query: string) => string
  parseResponse: (response: string) => any
}

// 1. REGIONÁLNÍ ANALÝZA
export const REGIONAL_ANALYSIS_PROMPT: PromptConfig = {
  id: 'regional_analysis',
  name: 'Regionální výkon',
  systemPrompt: `You are a regional market analyst specializing in brand visibility across different geographical markets.

Your task is to analyze how a brand performs in different regions (US, EU, Asia, LATAM) based on user queries.

For each region, evaluate:
- Brand mentions and visibility
- Position in recommendations (1st, 2nd, 3rd, etc.)
- Sentiment (positive, neutral, negative)
- Local competitor presence

Return results in JSON format:
{
  "regions": [
    {
      "region": "us",
      "score": 85,
      "mentions": 12,
      "averagePosition": 2.3,
      "sentiment": "positive",
      "competitors": ["Brand A", "Brand B"],
      "reasoning": "Strong presence in North American market..."
    }
  ]
}`,
  
  userPromptTemplate: (brand: string, query: string) => 
    `Analyze brand visibility for "${brand}" across US, EU, Asia, and LATAM regions.

User query: "${query}"

For each region, consider:
- Regional market leaders
- Local preferences and regulations
- Cultural relevance
- Language considerations

Provide detailed regional breakdown.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data.regions || []
    } catch {
      return []
    }
  }
}

// 2. PERSONA ANALÝZA
export const PERSONA_ANALYSIS_PROMPT: PromptConfig = {
  id: 'persona_analysis',
  name: 'Analýza podle person',
  systemPrompt: `You are a user persona analyst specializing in how different user types perceive brands.

Analyze brand performance for these personas:
- B2B Decision Maker (enterprise, ROI-focused)
- B2C Consumer (price-conscious, reviews-driven)
- Developer (technical, integration-focused)
- Researcher (academic, data-driven)
- Startup Founder (innovative, scalable solutions)

For each persona, evaluate:
- Brand relevance
- Mention frequency
- Position in recommendations
- Key pain points addressed

Return JSON format:
{
  "personas": [
    {
      "persona": "b2b",
      "score": 78,
      "relevance": "high",
      "keyStrengths": ["Enterprise features", "Scalability"],
      "concerns": ["Pricing", "Support"],
      "sentiment": "positive"
    }
  ]
}`,
  
  userPromptTemplate: (brand: string, query: string) =>
    `Analyze how "${brand}" is perceived by different user personas.

User query: "${query}"

For each persona (B2B, B2C, Developer, Researcher, Startup Founder):
- How often is it mentioned?
- What position in recommendations?
- What are the key strengths for this persona?
- What are the concerns?

Provide detailed persona breakdown.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data.personas || []
    } catch {
      return []
    }
  }
}

// 3. SENTIMENT ANALÝZA
export const SENTIMENT_ANALYSIS_PROMPT: PromptConfig = {
  id: 'sentiment_analysis',
  name: 'Sentiment analýza',
  systemPrompt: `You are a sentiment analysis expert specializing in brand perception.

Analyze sentiment across different dimensions:
- Overall sentiment (positive/neutral/negative)
- Category breakdown (product, price, quality, support, performance, security, usability, features)
- Sentiment intensity (0-100)
- Key positive and negative points

Return JSON format:
{
  "overall": {
    "sentiment": "positive",
    "score": 75,
    "confidence": 0.85
  },
  "categories": [
    {
      "category": "product",
      "sentiment": "positive",
      "score": 82,
      "mentions": 15,
      "keyPoints": ["Excellent features", "Intuitive interface"]
    }
  ],
  "summary": "Generally positive sentiment with strong product quality..."
}`,
  
  userPromptTemplate: (brand: string, query: string) =>
    `Analyze sentiment for "${brand}" across all dimensions.

User query: "${query}"

Break down sentiment by:
- Product quality
- Pricing
- Customer support
- Performance
- Security
- Usability
- Features

Include specific positive and negative points with examples.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data
    } catch {
      return { overall: { sentiment: 'neutral', score: 50 }, categories: [] }
    }
  }
}

// 4. KONKURENČNÍ ANALÝZA
export const COMPETITOR_ANALYSIS_PROMPT: PromptConfig = {
  id: 'competitor_analysis',
  name: 'Žebříček konkurentů',
  systemPrompt: `You are a competitive intelligence analyst.

Identify all brands mentioned in responses to user queries and rank them by:
- Mention frequency
- Average position in recommendations
- Sentiment
- Market share indicators

Return JSON format:
{
  "competitors": [
    {
      "brand": "Brand Name",
      "mentions": 25,
      "averagePosition": 1.8,
      "sentiment": "positive",
      "sentimentScore": 82,
      "shareOfVoice": 35.2,
      "strengths": ["Market leader", "Strong brand"],
      "weaknesses": ["Expensive", "Complex"]
    }
  ],
  "shareOfVoice": {
    "Brand A": 35.2,
    "Brand B": 28.5,
    "Brand C": 20.1
  }
}`,
  
  userPromptTemplate: (brand: string, query: string) =>
    `Identify and rank all brands (including "${brand}") mentioned in AI responses.

User query: "${query}"

For each brand found:
- Count total mentions
- Track position (1st, 2nd, 3rd recommendation)
- Analyze sentiment
- Calculate share of voice
- List key strengths and weaknesses

Rank by overall visibility and sentiment.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data.competitors || []
    } catch {
      return []
    }
  }
}

// 5. ANALÝZA ODKAZŮ
export const LINK_ANALYSIS_PROMPT: PromptConfig = {
  id: 'link_analysis',
  name: 'Analýza webových odkazů',
  systemPrompt: `You are a web presence analyst specializing in link visibility in AI responses.

Analyze which URLs and domains are recommended by AI for given queries.

Track:
- All URLs mentioned
- Associated brands
- Domain authority indicators
- Context of mention (official site, review, comparison, documentation)

Return JSON format:
{
  "links": [
    {
      "url": "https://example.com",
      "domain": "example.com",
      "brand": "Brand Name",
      "mentions": 8,
      "context": "official_website",
      "sentiment": "positive",
      "description": "Official product page with features..."
    }
  ],
  "domainRanking": [
    { "domain": "example.com", "mentions": 8, "brands": ["Brand A"] }
  ]
}`,
  
  userPromptTemplate: (brand: string, query: string) =>
    `Analyze all URLs and web links mentioned in AI responses for "${brand}".

User query: "${query}"

For each URL found:
- Extract domain
- Associate with brand
- Determine context (official, review, comparison, docs, blog)
- Count mentions
- Analyze sentiment

Include URLs for competitors as well for comparison.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data.links || []
    } catch {
      return []
    }
  }
}

// 6. KONTEXTOVÁ ANALÝZA
export const CONTEXT_ANALYSIS_PROMPT: PromptConfig = {
  id: 'context_analysis',
  name: 'Kontextová analýza',
  systemPrompt: `You are a context analyst specializing in understanding how brands are discussed.

Analyze the context and categories of brand mentions:
- Product features
- Pricing discussions
- Quality assessments
- Customer support mentions
- Performance benchmarks
- Security considerations
- Usability feedback
- Feature comparisons

For each category, extract:
- Key quotes
- Sentiment
- Frequency
- Associated keywords

Return JSON format:
{
  "categories": [
    {
      "category": "product",
      "mentions": 15,
      "sentiment": "positive",
      "sentimentScore": 78,
      "quotes": [
        {
          "text": "Excellent feature set with...",
          "sentiment": "positive"
        }
      ],
      "keywords": ["features", "quality", "reliable"]
    }
  ],
  "overallContext": "Brand is primarily discussed in context of..."
}`,
  
  userPromptTemplate: (brand: string, query: string) =>
    `Analyze the context in which "${brand}" is mentioned.

User query: "${query}"

Categorize mentions into:
- Product features (what features are highlighted)
- Pricing (is it seen as expensive/affordable)
- Quality (reliability, performance)
- Support (customer service mentions)
- Performance (speed, efficiency)
- Security (data protection, compliance)
- Usability (ease of use, interface)
- Features (specific capabilities)

Extract actual quotes and identify keywords for each category.`,
  
  parseResponse: (response: string) => {
    try {
      const data = JSON.parse(response)
      return data.categories || []
    } catch {
      return []
    }
  }
}

// Export všech promptů
export const ALL_PROMPTS = [
  REGIONAL_ANALYSIS_PROMPT,
  PERSONA_ANALYSIS_PROMPT,
  SENTIMENT_ANALYSIS_PROMPT,
  COMPETITOR_ANALYSIS_PROMPT,
  LINK_ANALYSIS_PROMPT,
  CONTEXT_ANALYSIS_PROMPT
]
```

---

## Krok 2: Vytvoření nového API endpointu

Vytvoř soubor `app/api/specialized-analysis/route.ts`:

```typescript
import { ALL_PROMPTS, type PromptConfig } from '@/lib/prompts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { brand, query, apiKey, prompts = ['all'] } = body

    // Validace
    if (!brand || !query) {
      return Response.json({ error: 'Brand and query are required' }, { status: 400 })
    }

    const openaiKey = apiKey || process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 401 })
    }

    // Vyber které prompty použít
    const selectedPrompts = prompts.includes('all') 
      ? ALL_PROMPTS 
      : ALL_PROMPTS.filter(p => prompts.includes(p.id))

    // Spusť všechny prompty paralelně
    const results = await Promise.all(
      selectedPrompts.map(async (promptConfig) => {
        try {
          const result = await executePrompt(promptConfig, brand, query, openaiKey)
          return {
            promptId: promptConfig.id,
            promptName: promptConfig.name,
            success: true,
            data: result
          }
        } catch (error) {
          console.error(`[v0] Error in ${promptConfig.id}:`, error)
          return {
            promptId: promptConfig.id,
            promptName: promptConfig.name,
            success: false,
            error: error.message
          }
        }
      })
    )

    // Sestavení odpovědi
    const response = {
      brand,
      query,
      timestamp: new Date().toISOString(),
      results: results.reduce((acc, result) => {
        acc[result.promptId] = result
        return acc
      }, {})
    }

    return Response.json(response)
  } catch (error) {
    console.error('[v0] API error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

async function executePrompt(
  config: PromptConfig,
  brand: string,
  query: string,
  apiKey: string
) {
  const userPrompt = config.userPromptTemplate(brand, query)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const aiResponse = data.choices[0]?.message?.content || ''

  return config.parseResponse(aiResponse)
}
```

---

## Krok 3: Integrace do TrendTracker komponenty

Uprav `components/trend-tracker.tsx`:

```typescript
// Přidej novou funkci pro spuštění specializované analýzy
const runSpecializedAnalysis = async () => {
  if (!brand || queries.length === 0) {
    alert('Prosím vyplňte brand a alespoň jeden dotaz')
    return
  }

  setIsAnalyzing(true)

  try {
    const allResults = []

    // Pro každý query spusť specializovanou analýzu
    for (const query of queries.filter(q => q.trim())) {
      const response = await fetch('/api/specialized-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          query,
          apiKey, // pokud je vyplněn z UI
          prompts: ['all'] // nebo vyber konkrétní: ['regional_analysis', 'sentiment_analysis']
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      allResults.push(data)
    }

    // Zpracuj výsledky
    const processedResults = processSpecializedResults(allResults)
    
    // Ulož do state
    setResults(prev => [...prev, processedResults])
    
    // Ulož do localStorage
    localStorage.setItem('brandvision_analysis_results', JSON.stringify([...results, processedResults]))

  } catch (error) {
    console.error('[v0] Analysis failed:', error)
    alert('Analýza selhala: ' + error.message)
  } finally {
    setIsAnalyzing(false)
  }
}

// Pomocná funkce pro zpracování výsledků
function processSpecializedResults(results: any[]) {
  // Agreguj data ze všech queries
  const regionalData = results.flatMap(r => r.results.regional_analysis?.data || [])
  const personaData = results.flatMap(r => r.results.persona_analysis?.data || [])
  const sentimentData = results.map(r => r.results.sentiment_analysis?.data).filter(Boolean)
  const competitorData = results.flatMap(r => r.results.competitor_analysis?.data || [])
  const linkData = results.flatMap(r => r.results.link_analysis?.data || [])
  const contextData = results.flatMap(r => r.results.context_analysis?.data || [])

  return {
    timestamp: new Date().toISOString(),
    brand: results[0]?.brand,
    queries: results.map(r => r.query),
    regionPerformance: aggregateRegionalData(regionalData),
    personaPerformance: aggregatePersonaData(personaData),
    sentimentAnalysis: aggregateSentimentData(sentimentData),
    competitorRanking: aggregateCompetitorData(competitorData),
    linkAnalysis: aggregateLinkData(linkData),
    contextAnalysis: aggregateContextData(contextData),
    globalScore: calculateGlobalScore(regionalData, personaData, sentimentData)
  }
}
```

---

## Krok 4: Testování

### Test jednotlivých promptů

```bash
# Test regionální analýzy
curl -X POST http://localhost:3000/api/specialized-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Tesla",
    "query": "best electric cars 2024",
    "prompts": ["regional_analysis"]
  }'

# Test sentiment analýzy
curl -X POST http://localhost:3000/api/specialized-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Tesla",
    "query": "best electric cars 2024",
    "prompts": ["sentiment_analysis"]
  }'

# Test všech promptů najednou
curl -X POST http://localhost:3000/api/specialized-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Tesla",
    "query": "best electric cars 2024",
    "prompts": ["all"]
  }'
```

---

## Krok 5: Výhody a nevýhody

### Výhody specializovaných promptů
✅ Každá sekce má přesně cílený prompt
✅ Lepší kvalita dat pro specifické analýzy
✅ Snadnější ladění jednotlivých sekcí
✅ Možnost spouštět jen vybrané analýzy
✅ Transparentnost - každá sekce má viditelný prompt

### Nevýhody
❌ Více API requestů = vyšší náklady
❌ Delší doba zpracování
❌ Složitější agregace výsledků
❌ Potřeba parsovat JSON z každé odpovědi

---

## Doporučení

Pro začátek implementuj **hybridní přístup**:
1. Ponech současný systém jako primární
2. Přidej specialized prompts jako experimentální feature
3. Umožni uživateli vybrat si: "Fast mode" (současný) vs "Detailed mode" (specialized)
4. Porovnej kvalitu výsledků a náklady

---

## Otázky a odpovědi

**Q: Kolik to bude stát?**
A: 6 specialized promptů × průměrně 1500 tokenů = ~9000 tokenů per query. Pro GPT-4o je to ~$0.045 per query.

**Q: Jak dlouho to bude trvat?**
A: Při paralelním spuštění ~5-10 sekund. Sekvenčně ~30-60 sekund.

**Q: Můžu cachovat výsledky?**
A: Ano! Pro stejný brand + query můžeš cachovat na 1-7 dní.

**Q: Jak debugovat prompty?**
A: Přidej do UI tlačítko "Show prompt" které zobrazí system + user prompt pro každou sekci.
