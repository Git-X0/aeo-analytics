# Příklady konkrétních promptů

## 1. Regionální analýza - Praktický příklad

### Input
```
Brand: "Figma"
Query: "best design collaboration tools 2024"
```

### System Prompt
```
You are a regional market analyst specializing in brand visibility across different geographical markets.

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
}
```

### User Prompt
```
Analyze brand visibility for "Figma" across US, EU, Asia, and LATAM regions.

User query: "best design collaboration tools 2024"

For each region, consider:
- Regional market leaders
- Local preferences and regulations
- Cultural relevance
- Language considerations

Provide detailed regional breakdown.
```

### Očekávaný výstup
```json
{
  "regions": [
    {
      "region": "us",
      "score": 92,
      "mentions": 18,
      "averagePosition": 1.2,
      "sentiment": "positive",
      "competitors": ["Adobe XD", "Sketch", "InVision"],
      "reasoning": "Figma dominates US market with strong presence in tech companies. Often mentioned as #1 choice for remote design teams."
    },
    {
      "region": "eu",
      "score": 88,
      "mentions": 15,
      "averagePosition": 1.5,
      "sentiment": "positive",
      "competitors": ["Sketch", "Framer", "Penpot"],
      "reasoning": "Strong adoption in EU with emphasis on GDPR compliance. Penpot gaining traction as open-source alternative."
    },
    {
      "region": "asia",
      "score": 75,
      "mentions": 10,
      "averagePosition": 2.1,
      "sentiment": "neutral",
      "competitors": ["Pixso", "MasterGo", "Sketch"],
      "reasoning": "Growing presence but faces competition from local tools like Pixso (China) and MasterGo."
    },
    {
      "region": "latam",
      "score": 70,
      "mentions": 8,
      "averagePosition": 2.5,
      "sentiment": "positive",
      "competitors": ["Adobe XD", "Canva", "InVision"],
      "reasoning": "Increasing adoption but price sensitivity leads to consideration of alternatives like Canva."
    }
  ]
}
```

---

## 2. Sentiment analýza - Praktický příklad

### Input
```
Brand: "Notion"
Query: "best productivity apps for teams"
```

### Očekávaný výstup
```json
{
  "overall": {
    "sentiment": "positive",
    "score": 82,
    "confidence": 0.91
  },
  "categories": [
    {
      "category": "product",
      "sentiment": "very_positive",
      "score": 88,
      "mentions": 25,
      "keyPoints": [
        "Highly flexible and customizable",
        "All-in-one workspace solution",
        "Beautiful, intuitive interface"
      ],
      "quotes": [
        "Notion has become our team's single source of truth",
        "The flexibility is unmatched - we use it for docs, wikis, and project management"
      ]
    },
    {
      "category": "price",
      "sentiment": "neutral",
      "score": 65,
      "mentions": 12,
      "keyPoints": [
        "Free tier is generous",
        "Paid plans can get expensive for large teams",
        "Good value for small teams"
      ],
      "quotes": [
        "Free version is great for personal use",
        "Pricing adds up quickly as team grows"
      ]
    },
    {
      "category": "performance",
      "sentiment": "mixed",
      "score": 58,
      "mentions": 18,
      "keyPoints": [
        "Can be slow with large databases",
        "Offline support needs improvement",
        "Mobile app performance varies"
      ],
      "quotes": [
        "Sometimes laggy with complex pages",
        "Wish it worked better offline"
      ]
    },
    {
      "category": "support",
      "sentiment": "positive",
      "score": 75,
      "mentions": 8,
      "keyPoints": [
        "Great documentation and templates",
        "Active community",
        "Response times could be better for paid plans"
      ]
    }
  ],
  "summary": "Notion receives overwhelmingly positive sentiment for product quality and flexibility, with some concerns about performance and pricing at scale. Users love the all-in-one approach but wish for better offline capabilities."
}
```

---

## 3. Konkurenční analýza - Praktický příklad

### Input
```
Brand: "Vercel"
Query: "best platforms for Next.js deployment"
```

### Očekávaný výstup
```json
{
  "competitors": [
    {
      "brand": "Vercel",
      "mentions": 28,
      "averagePosition": 1.1,
      "sentiment": "positive",
      "sentimentScore": 90,
      "shareOfVoice": 42.4,
      "strengths": [
        "Built by Next.js creators",
        "Zero-config deployment",
        "Excellent developer experience",
        "Edge network performance"
      ],
      "weaknesses": [
        "Can be expensive at scale",
        "Limited backend capabilities"
      ],
      "reasoning": "Clear market leader for Next.js hosting with strongest brand association"
    },
    {
      "brand": "Netlify",
      "mentions": 18,
      "averagePosition": 2.2,
      "sentiment": "positive",
      "sentimentScore": 78,
      "shareOfVoice": 27.3,
      "strengths": [
        "Great for static sites",
        "Good free tier",
        "Easy to use"
      ],
      "weaknesses": [
        "Not optimized specifically for Next.js",
        "Slower build times"
      ]
    },
    {
      "brand": "AWS Amplify",
      "mentions": 10,
      "averagePosition": 3.5,
      "sentiment": "neutral",
      "sentimentScore": 62,
      "shareOfVoice": 15.2,
      "strengths": [
        "Full AWS integration",
        "Scalable infrastructure"
      ],
      "weaknesses": [
        "Complex setup",
        "Steeper learning curve"
      ]
    },
    {
      "brand": "Railway",
      "mentions": 6,
      "averagePosition": 3.8,
      "sentiment": "positive",
      "sentimentScore": 72,
      "shareOfVoice": 9.1,
      "strengths": [
        "Simple deployment",
        "Good for full-stack apps"
      ],
      "weaknesses": [
        "Less mature platform",
        "Smaller community"
      ]
    }
  ],
  "shareOfVoice": {
    "Vercel": 42.4,
    "Netlify": 27.3,
    "AWS Amplify": 15.2,
    "Railway": 9.1,
    "Other": 6.0
  },
  "marketInsights": {
    "leader": "Vercel",
    "challenger": "Netlify",
    "trend": "Vercel consolidating lead, Railway gaining momentum with indie developers"
  }
}
```

---

## 4. Analýza odkazů - Praktický příklad

### Input
```
Brand: "Stripe"
Query: "best payment processor for SaaS"
```

### Očekávaný výstup
```json
{
  "links": [
    {
      "url": "https://stripe.com/payments",
      "domain": "stripe.com",
      "brand": "Stripe",
      "mentions": 15,
      "context": "official_website",
      "sentiment": "positive",
      "description": "Official Stripe payments page, frequently linked in recommendations"
    },
    {
      "url": "https://stripe.com/docs",
      "domain": "stripe.com",
      "brand": "Stripe",
      "mentions": 12,
      "context": "documentation",
      "sentiment": "very_positive",
      "description": "Stripe documentation praised for quality and completeness"
    },
    {
      "url": "https://www.g2.com/products/stripe/reviews",
      "domain": "g2.com",
      "brand": "Stripe",
      "mentions": 8,
      "context": "reviews",
      "sentiment": "positive",
      "description": "G2 reviews page for Stripe with 4.5/5 rating"
    },
    {
      "url": "https://paddle.com",
      "domain": "paddle.com",
      "brand": "Paddle",
      "mentions": 6,
      "context": "competitor",
      "sentiment": "positive",
      "description": "Competitor mentioned as alternative for SaaS billing"
    }
  ],
  "domainRanking": [
    {
      "domain": "stripe.com",
      "mentions": 27,
      "brands": ["Stripe"],
      "types": ["official_website", "documentation", "blog"]
    },
    {
      "domain": "g2.com",
      "mentions": 10,
      "brands": ["Stripe", "Paddle", "Braintree"],
      "types": ["reviews"]
    },
    {
      "domain": "paddle.com",
      "mentions": 6,
      "brands": ["Paddle"],
      "types": ["official_website"]
    }
  ],
  "insights": {
    "dominantBrand": "Stripe",
    "officialSiteVisibility": "high",
    "reviewSitePresence": "strong",
    "competitorLinkage": ["Paddle", "Braintree", "PayPal"]
  }
}
```

---

## Tipy pro ladění promptů

### 1. Buď specifický s formátem výstupu
❌ Špatně: "Analyze sentiment"
✅ Dobře: "Return JSON with fields: sentiment (positive/negative/neutral), score (0-100), confidence (0-1)"

### 2. Dej příklady
```
Example output:
{
  "region": "us",
  "score": 85,
  "mentions": 12
}
```

### 3. Specifikuj metriky
❌ Špatně: "How popular is the brand?"
✅ Dobře: "Rate popularity on scale 0-100 based on: mention frequency, position in recommendations, sentiment"

### 4. Použij Chain-of-Thought
```
Think step by step:
1. First, identify all brand mentions
2. Then, calculate average position
3. Finally, determine sentiment from context
```

### 5. Testuj na reálných datech
- Ulož si několik typických queries
- Testuj prompty na stejných datech
- Porovnej kvalitu výstupů
