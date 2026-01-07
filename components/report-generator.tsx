"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, BarChart3, Target } from "lucide-react"

export function ReportGenerator() {
  const [reportName, setReportName] = useState("")
  const [dateRange, setDateRange] = useState("last-7-days")
  const [reportType, setReportType] = useState("comprehensive")
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    trends: true,
    modelComparison: true,
    recommendations: true,
    detailedAnalyses: true,
    charts: true,
  })

  const toggleSection = (section: string) => {
    setSelectedSections({
      ...selectedSections,
      [section]: !selectedSections[section as keyof typeof selectedSections],
    })
  }

  const generateReport = (format: "pdf" | "html" | "json") => {
    const history = JSON.parse(localStorage.getItem("analysis_history") || "[]")

    // Filter by date range
    const now = new Date()
    let filteredHistory = history

    switch (dateRange) {
      case "last-7-days":
        filteredHistory = history.filter(
          (item: any) => new Date(item.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        )
        break
      case "last-30-days":
        filteredHistory = history.filter(
          (item: any) => new Date(item.timestamp) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        )
        break
      case "last-90-days":
        filteredHistory = history.filter(
          (item: any) => new Date(item.timestamp) > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        )
        break
    }

    // Generate report data
    const reportData = {
      name: reportName || `Brand Visibility Report - ${new Date().toLocaleDateString("cs-CZ")}`,
      generatedAt: new Date().toISOString(),
      dateRange,
      totalAnalyses: filteredHistory.length,
      summary: {
        averageScore: Math.round(
          filteredHistory.reduce((sum: number, item: any) => sum + item.visibilityScore, 0) /
            (filteredHistory.length || 1),
        ),
        mentionRate: Math.round(
          (filteredHistory.filter((item: any) => item.brandMentions?.found).length / (filteredHistory.length || 1)) *
            100,
        ),
        positiveSentiment: Math.round(
          (filteredHistory.filter((item: any) => item.brandMentions?.sentiment === "positive").length /
            (filteredHistory.length || 1)) *
            100,
        ),
      },
      trends: filteredHistory.slice(-10).map((item: any, idx: number) => ({
        analysis: idx + 1,
        score: item.visibilityScore,
        mentions: item.brandMentions?.count || 0,
      })),
      modelComparison: Object.entries(
        filteredHistory.reduce((acc: any, item: any) => {
          const model = item.model || "Unknown"
          if (!acc[model]) {
            acc[model] = { totalScore: 0, count: 0 }
          }
          acc[model].totalScore += item.visibilityScore
          acc[model].count += 1
          return acc
        }, {}),
      ).map(([model, data]: [string, any]) => ({
        model,
        avgScore: Math.round(data.totalScore / data.count),
        count: data.count,
      })),
      detailedAnalyses: filteredHistory.map((item: any) => ({
        query: item.query,
        brand: item.brand,
        score: item.visibilityScore,
        mentioned: item.brandMentions?.found,
        sentiment: item.brandMentions?.sentiment,
        timestamp: item.timestamp,
      })),
    }

    // Export based on format
    switch (format) {
      case "json":
        exportJSON(reportData)
        break
      case "html":
        exportHTML(reportData)
        break
      case "pdf":
        alert("PDF export bude dostupný brzy. Prozatím použijte HTML export a vytiskněte jako PDF.")
        exportHTML(reportData)
        break
    }
  }

  const exportJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    downloadFile(blob, `${data.name}.json`)
  }

  const exportHTML = (data: any) => {
    const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 1200px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat-card h3 { font-size: 14px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 36px; font-weight: bold; color: #667eea; }
        .section { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section h2 { font-size: 24px; margin-bottom: 20px; color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: 600; color: #374151; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        @media print { body { padding: 20px; } .header { background: #667eea; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.name}</h1>
        <p>Vygenerováno: ${new Date(data.generatedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <p>Období: ${dateRange === "last-7-days" ? "Posledních 7 dní" : dateRange === "last-30-days" ? "Posledních 30 dní" : "Posledních 90 dní"}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <h3>Celkem analýz</h3>
            <div class="value">${data.totalAnalyses}</div>
        </div>
        <div class="stat-card">
            <h3>Průměrné skóre</h3>
            <div class="value">${data.summary.averageScore}</div>
        </div>
        <div class="stat-card">
            <h3>Míra zmínění</h3>
            <div class="value">${data.summary.mentionRate}%</div>
        </div>
        <div class="stat-card">
            <h3>Pozitivní sentiment</h3>
            <div class="value">${data.summary.positiveSentiment}%</div>
        </div>
    </div>

    ${
      selectedSections.modelComparison
        ? `
    <div class="section">
        <h2>Srovnání AI modelů</h2>
        <table>
            <thead>
                <tr>
                    <th>Model</th>
                    <th>Průměrné skóre</th>
                    <th>Počet analýz</th>
                </tr>
            </thead>
            <tbody>
                ${data.modelComparison
                  .map(
                    (m: any) => `
                    <tr>
                        <td>${m.model}</td>
                        <td><strong>${m.avgScore}</strong></td>
                        <td>${m.count}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
    `
        : ""
    }

    ${
      selectedSections.detailedAnalyses
        ? `
    <div class="section">
        <h2>Detailní analýzy</h2>
        <table>
            <thead>
                <tr>
                    <th>Dotaz</th>
                    <th>Skóre</th>
                    <th>Zmíněno</th>
                    <th>Sentiment</th>
                    <th>Datum</th>
                </tr>
            </thead>
            <tbody>
                ${data.detailedAnalyses
                  .slice(0, 20)
                  .map(
                    (a: any) => `
                    <tr>
                        <td>${a.query}</td>
                        <td><strong>${a.score}</strong></td>
                        <td>${a.mentioned ? '<span class="badge badge-success">Ano</span>' : '<span class="badge badge-danger">Ne</span>'}</td>
                        <td>${a.sentiment === "positive" ? '<span class="badge badge-success">Pozitivní</span>' : a.sentiment === "negative" ? '<span class="badge badge-danger">Negativní</span>' : '<span class="badge badge-warning">Neutrální</span>'}</td>
                        <td>${new Date(a.timestamp).toLocaleDateString("cs-CZ")}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
        ${data.detailedAnalyses.length > 20 ? `<p style="margin-top: 15px; color: #6b7280;">Zobrazeno prvních 20 z ${data.detailedAnalyses.length} analýz</p>` : ""}
    </div>
    `
        : ""
    }

    ${
      selectedSections.recommendations
        ? `
    <div class="section">
        <h2>Doporučení</h2>
        <ul style="list-style: none; padding: 0;">
            ${
              data.summary.averageScore < 40
                ? `
                <li style="padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 10px; border-radius: 4px;">
                    <strong>Nízká viditelnost:</strong> Zaměřte se na optimalizaci obsahu a zlepšení přítomnosti v AI zdrojích dat.
                </li>
            `
                : ""
            }
            ${
              data.summary.mentionRate < 50
                ? `
                <li style="padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; margin-bottom: 10px; border-radius: 4px;">
                    <strong>Nízká míra zmínění:</strong> Pracujte na autoritě a relevanci vašeho brandu v odpovědích AI.
                </li>
            `
                : ""
            }
            ${
              data.summary.positiveSentiment < 60
                ? `
                <li style="padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; margin-bottom: 10px; border-radius: 4px;">
                    <strong>Sentiment ke zlepšení:</strong> Zvyšte pozitivní asociace prostřednictvím case studies a testimonials.
                </li>
            `
                : ""
            }
            ${
              data.summary.averageScore >= 70
                ? `
                <li style="padding: 15px; background: #d1fae5; border-left: 4px solid #10b981; margin-bottom: 10px; border-radius: 4px;">
                    <strong>Výborná viditelnost:</strong> Udržujte současnou strategii a sledujte trendy pro další optimalizaci.
                </li>
            `
                : ""
            }
        </ul>
    </div>
    `
        : ""
    }

    <div class="footer">
        <p><strong>BrandVision Pro</strong> - Komplexní analýza AI viditelnosti</p>
        <p>© ${new Date().getFullYear()} - Všechna práva vyhrazena</p>
    </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: "text/html" })
    downloadFile(blob, `${data.name}.html`)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Generování reportů</h2>
        <p className="text-muted-foreground">Vytvořte profesionální reporty pro analýzu a sdílení výsledků</p>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="report-name" className="text-base font-semibold">
              Název reportu
            </Label>
            <Input
              id="report-name"
              placeholder="Např: Měsíční analýza viditelnosti Q1 2025"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="date-range" className="text-base font-semibold">
                Časové období
              </Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Posledních 7 dní</SelectItem>
                  <SelectItem value="last-30-days">Posledních 30 dní</SelectItem>
                  <SelectItem value="last-90-days">Posledních 90 dní</SelectItem>
                  <SelectItem value="all">Vše</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="report-type" className="text-base font-semibold">
                Typ reportu
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Komplexní</SelectItem>
                  <SelectItem value="summary">Souhrnný</SelectItem>
                  <SelectItem value="detailed">Detailní</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Sekce v reportu</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="summary"
                  checked={selectedSections.summary}
                  onCheckedChange={() => toggleSection("summary")}
                />
                <label htmlFor="summary" className="flex-1 cursor-pointer text-sm font-medium">
                  Souhrnná statistika
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="trends"
                  checked={selectedSections.trends}
                  onCheckedChange={() => toggleSection("trends")}
                />
                <label htmlFor="trends" className="flex-1 cursor-pointer text-sm font-medium">
                  Vývoj trendů
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="modelComparison"
                  checked={selectedSections.modelComparison}
                  onCheckedChange={() => toggleSection("modelComparison")}
                />
                <label htmlFor="modelComparison" className="flex-1 cursor-pointer text-sm font-medium">
                  Srovnání modelů
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="recommendations"
                  checked={selectedSections.recommendations}
                  onCheckedChange={() => toggleSection("recommendations")}
                />
                <label htmlFor="recommendations" className="flex-1 cursor-pointer text-sm font-medium">
                  Doporučení
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="detailedAnalyses"
                  checked={selectedSections.detailedAnalyses}
                  onCheckedChange={() => toggleSection("detailedAnalyses")}
                />
                <label htmlFor="detailedAnalyses" className="flex-1 cursor-pointer text-sm font-medium">
                  Detailní analýzy
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  id="charts"
                  checked={selectedSections.charts}
                  onCheckedChange={() => toggleSection("charts")}
                />
                <label htmlFor="charts" className="flex-1 cursor-pointer text-sm font-medium">
                  Grafy a vizualizace
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold">Formát exportu</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button onClick={() => generateReport("html")} variant="outline" className="h-auto flex-col gap-3 p-6">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold">HTML Report</div>
              <div className="text-xs text-muted-foreground">Otevřít v prohlížeči</div>
            </div>
          </Button>

          <Button onClick={() => generateReport("pdf")} variant="outline" className="h-auto flex-col gap-3 p-6">
            <Download className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold">PDF Report</div>
              <div className="text-xs text-muted-foreground">Pro tisk a sdílení</div>
            </div>
          </Button>

          <Button onClick={() => generateReport("json")} variant="outline" className="h-auto flex-col gap-3 p-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-semibold">JSON Data</div>
              <div className="text-xs text-muted-foreground">Pro další zpracování</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Quick Stats Preview */}
      <Card className="border-primary/20 bg-primary/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Náhled reportu</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Celkem analýz</div>
            <div className="text-2xl font-bold text-foreground">
              {
                JSON.parse(localStorage.getItem("analysis_history") || "[]").filter((item: any) => {
                  if (dateRange === "all") return true
                  const days = dateRange === "last-7-days" ? 7 : dateRange === "last-30-days" ? 30 : 90
                  return new Date(item.timestamp) > new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }).length
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Vybraných sekcí</div>
            <div className="text-2xl font-bold text-foreground">
              {Object.values(selectedSections).filter(Boolean).length} / 6
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Období</div>
            <div className="text-lg font-semibold text-foreground">
              {dateRange === "last-7-days"
                ? "7 dní"
                : dateRange === "last-30-days"
                  ? "30 dní"
                  : dateRange === "last-90-days"
                    ? "90 dní"
                    : "Vše"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
