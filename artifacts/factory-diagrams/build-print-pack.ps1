$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$mmdc = "pnpm"
$common = @(
  "-p", ".\puppeteer-config.json",
  "-c", ".\mermaid-print.json",
  "-C", ".\print-page.css",
  "-t", "neutral",
  "-w", "2520",
  "-H", "1680",
  "-s", "1.25",
  "-f",
  "-q"
)

$slides = @(
  "00-document-cover",
  "01-architecture",
  "02-erd",
  "03-api-routes",
  "04-production-lifecycle",
  "05-capacity-model",
  "06-user-navigation",
  "07-api-sequence",
  "08-business-scenario",
  "09-roadmap",
  "10-user-cycles-all-paths"
)

foreach ($name in $slides) {
  $input = ".\$name.mmd"
  $output = ".\$name.pdf"
  if (-not (Test-Path -LiteralPath $input)) { throw "Missing input: $input" }
  Write-Host "Rendering $name ..."
  $argList = @("dlx", "@mermaid-js/mermaid-cli@10.9.1") + $common + @("-i", $input, "-o", $output)
  & $mmdc @argList
  if ($LASTEXITCODE -ne 0) { throw "mmdc failed for $name" }
}

$merged = Join-Path $PSScriptRoot "Factory-Data-Hub-Diagrams-Print.pdf"
python (Join-Path $PSScriptRoot "merge_pdfs.py")
if ($LASTEXITCODE -ne 0) { throw "merge_pdfs.py failed" }
Write-Host "Done: $merged"
