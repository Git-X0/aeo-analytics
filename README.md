# BrandVision AI - Analýza viditelnosti brandu v AI odpovědích

Komplexní nástroj pro sledování a analýzu toho, jak AI modely (ChatGPT, Claude, atd.) zmiňují váš brand v odpovědích. Získejte hlubší vhled do své pozice vůči konkurenci a optimalizujte svou viditelnost v AI ekosystému.

## 🚀 Klíčové funkce

### Pokročilá Analýza
- **Historické trendy** - Sledování vývoje viditelnosti v čase s detekcí významných změn
- **Kontextová analýza** - Kategorizace zmínek podle typu (produkt, cena, kvalita, podpora)
- **Sentiment analýza** - Pozitivní/negativní/neutrální hodnocení zmínek
- **Konkurenční intelligence** - Share of voice a side-by-side srovnání s konkurencí

### Vizualizace
- **Heat mapy** - Výkon napříč regiony a personami
- **Timeline grafy** - Vývoj skóre v čase
- **Network diagramy** - Vztahy mezi brandy
- **Interaktivní dashboardy** - Real-time metriky a trendy

### Pokročilé Funkce
- **Multi-model analýza** - Testování napříč různými AI modely
- **Bulk testing** - Hromadné testování stovek dotazů
- **Action items** - Konkrétní doporučení s prioritami a odhady nákladů
- **Export & Scheduling** - PDF reporty a automatické emailové reporty
- **Onboarding tour** - Interaktivní průvodce pro nové uživatele

## 📦 Instalace a nastavení

### Požadavky
- Node.js 18+ 
- OpenAI API klíč ([získejte zde](https://platform.openai.com/api-keys))

### Kroky instalace

1. **Nainstalujte závislosti:**
```bash
npm install
```

2. **Nastavte OpenAI API klíč:**

**V0 uživatelé:**
- Klikněte na ikonu "Vars" (proměnné) v bočním panelu
- Přidejte novou environment variable:
  - Název: `OPENAI_API_KEY`
  - Hodnota: `sk-your-actual-api-key-here`
- Klikněte "Save"

**Lokální development:**
- Vytvořte soubor `.env.local` v root složce
- Přidejte: `OPENAI_API_KEY=sk-your-actual-api-key-here`

3. **Spusťte vývojový server:**
```bash
npm run dev
```

4. **Otevřete aplikaci:**
Přejděte na [http://localhost:3000](http://localhost:3000)

## 🔐 Bezpečnost API klíče

**DŮLEŽITÉ:** API klíč je bezpečně uložen pouze na serveru a NIKDY není exponován klientovi.

### Jak to funguje:
- ✅ API klíč je uložen v server-side environment variables
- ✅ Klient NIKDY nevidí API klíč
- ✅ Všechna volání OpenAI API probíhají přes server
- ✅ API klíč není součástí bundle kódu
- ❌ NIKDY nepoužívejte `NEXT_PUBLIC_` prefix pro API klíč

### Kde nastavit API klíč:

**V v0 (doporučeno):**
1. Otevřete boční panel v chatu
2. Klikněte na ikonu "Vars" (proměnné)
3. Přidejte `OPENAI_API_KEY` s vaší hodnotou
4. Uložte změny

**Lokálně:**
Vytvořte `.env.local`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Na Vercel:**
1. Přejděte do Project Settings
2. Sekce Environment Variables
3. Přidejte `OPENAI_API_KEY`
4. Redeploy projektu

## 📊 Jak to funguje

### 1. Výpočet Skóre Viditelnosti (0-100)

Skóre se vypočítá na základě:

- **Počet zmínek (0-40 bodů):** Každá zmínka = 20 bodů
- **Pozice v odpovědi (0-30 bodů):** První třetina = +30, prostřední = +20, poslední = +10
- **Sentiment (0-20 bodů):** Pozitivní = +20, neutrální = +10, negativní = 0
- **Srovnání s konkurencí (0-10 bodů):** Bonus za zmínění mezi konkurenty

**Interpretace:**
- 80-100: Výborná viditelnost
- 60-79: Dobrá viditelnost
- 40-59: Průměrná viditelnost
- 0-39: Nízká viditelnost

### 2. Testování Kontextů

Aplikace testuje váš brand napříč:
- **4 regiony:** North America, Europe, Asia Pacific, Latin America
- **8 person:** B2B Decision Maker, B2C Consumer, Developer, Researcher, Startup Founder, Marketing Professional, IT Admin, Student/Educator

Celkem **32 různých kontextů** pro komplexní analýzu.

### 3. Konkurenční Analýza

- Automatická detekce zmíněných konkurentů
- Výpočet share of voice
- Srovnání průměrné pozice v odpovědích
- Identifikace silných a slabých stránek

## 💰 Náklady

Aplikace používá OpenAI API, náklady závisí na zvoleném modelu:

| Model | Input | Output | Doporučení |
|-------|-------|--------|------------|
| GPT-4o Mini | $0.15/1M tokenů | $0.60/1M tokenů | ⭐ Doporučeno (nejlevnější) |
| GPT-4o | $2.50/1M tokenů | $10.00/1M tokenů | Pro náročné analýzy |
| GPT-4 Turbo | $10.00/1M tokenů | $30.00/1M tokenů | Premium kvalita |

**Odhad nákladů:**
- Jedna kompletní analýza (32 kontextů): ~$0.05-0.15
- 100 analýz měsíčně: ~$5-15/měsíc

## 🎯 Příklad použití

### Základní analýza

1. Otevřete aplikaci
2. Zadejte název vašeho brandu: `"Tesla"`
3. Přidejte dotazy k testování:
   - `"What are the best electric cars?"`
   - `"Compare EV manufacturers"`
4. Zadejte konkurenty: `"BMW, Mercedes, Volkswagen"`
5. Klikněte "Spustit analýzu"

### Pokročilá konfigurace

- Vyberte regiony pro testování (NA, EU, APAC, LATAM)
- Zvolte persony (B2B, B2C, Developer, atd.)
- Nastavte automatické testování (denně/týdně/měsíčně)
- Exportujte výsledky do PDF nebo JSON

## 📈 Dashboard Metriky

Dashboard zobrazuje:
- **Průměrné skóre:** Celková viditelnost napříč všemi analýzami
- **Celkem analýz:** Počet provedených testů
- **Míra zmínění:** % analýz kde byl brand zmíněn
- **Trend:** Změna oproti minulému období

## 🛠️ Technologie

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **Grafy:** Recharts
- **AI:** OpenAI API (server-side only)
- **Storage:** LocalStorage (persistence výsledků)

## 🐛 Řešení problémů

### "API key not configured" chyba

**V v0:**
1. Otevřete boční panel (ikona se třemi čárkami)
2. Klikněte na "Vars" (ikona proměnných)
3. Přidejte `OPENAI_API_KEY` s vaší hodnotou z OpenAI
4. Uložte a zkuste analýzu znovu

**Lokálně:**
1. Vytvořte `.env.local` v root složce projektu
2. Přidejte: `OPENAI_API_KEY=sk-your-key-here`
3. Restartujte dev server (`npm run dev`)

### API klíč je správně, ale stále nefunguje

1. Zkontrolujte že klíč začíná `sk-`
2. Ověřte že máte dostatečný kredit v OpenAI účtu
3. Zkontrolujte konzoli v prohlížeči (F12) pro detailní chybové hlášky
4. V v0: Ujistěte se že environment variable je v sekci "Vars"

### Výsledky se nezobrazují

1. Zkontrolujte že jste zadali brand a alespoň jeden dotaz
2. Zkontrolujte konzoli v prohlížeči (F12) pro chyby
3. Ujistěte se že API klíč je správně nakonfigurován

### Vysoké náklady

1. Použijte `gpt-4o-mini` místo `gpt-4o` (10x levnější)
2. Redukujte počet testovaných kontextů
3. Testujte méně dotazů najednou
4. Nastavte limit v OpenAI dashboardu

## 📄 Architektura

### Bezpečnostní model

```
┌─────────────┐      HTTPS      ┌──────────────┐
│   Browser   │ ◄───────────────► │  Next.js API │
│  (Klient)   │   JSON data      │   (Server)   │
└─────────────┘   NO API KEY!    └──────────────┘
                                        │
                                        │ API KEY
                                        │ (secure)
                                        ▼
                                  ┌──────────┐
                                  │ OpenAI   │
                                  │   API    │
                                  └──────────┘
```

**Klíčové bezpečnostní prvky:**
1. API klíč existuje POUZE na serveru
2. Klient NIKDY nevidí API klíč
3. Všechna volání OpenAI API probíhají server-side
4. API klíč není v bundle kódu
5. Environment variables jsou oddělené od klientského kódu

## 🔄 Aktualizace

Pro aktualizaci na nejnovější verzi:

```bash
git pull origin main
npm install
npm run dev
```

## 🎉 Co dál?

Vyzkoušejte:
1. **Onboarding tour** - Klikněte na "Spustit průvodce" v aplikaci
2. **Demo data** - Aplikace automaticky zobrazí demo data pro pochopení funkcí
3. **Export reportů** - Vygenerujte PDF report pro prezentaci
4. **Scheduling** - Nastavte automatické týdenní reporty

## ❓ FAQ

**Q: Kde vidím svůj API klíč?**
A: API klíč NENÍ nikde zobrazen v UI pro bezpečnost. Nastavte ho v sekci "Vars" v bočním panelu.

**Q: Můžu použít jiný AI model než OpenAI?**
A: Momentálně podporujeme pouze OpenAI modely (GPT-4o, GPT-4o-mini, GPT-4 Turbo).

**Q: Jak často mám spouštět analýzy?**
A: Doporučujeme týdenní nebo měsíční analýzy pro sledování trendů bez vysokých nákladů.

**Q: Ukládají se moje výsledky?**
A: Ano, výsledky jsou uloženy v prohlížeči (LocalStorage). Pro dlouhodobé ukládání použijte export funkci.

---

**Vytvořeno s ❤️ pro lepší viditelnost vašich brandů v AI ekosystému**
