Add-Type -AssemblyName System.Drawing
$path = Join-Path $PSScriptRoot "..\..\..\Logo.png"
if (-not (Test-Path $path)) {
  Write-Error "Logo.png not found at $path"
  exit 1
}
$img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
$outDir = Join-Path $PSScriptRoot "..\public"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Save-Resize {
  param([int]$TargetW, [int]$TargetH, [string]$OutPath)
  $bmp = New-Object System.Drawing.Bitmap $TargetW, $TargetH
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $TargetW, $TargetH)
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Save-Resize 16 16 (Join-Path $outDir "favicon-16x16.png")
Save-Resize 32 32 (Join-Path $outDir "favicon-32x32.png")
Save-Resize 48 48 (Join-Path $outDir "favicon-48x48.png")
Save-Resize 180 180 (Join-Path $outDir "apple-touch-icon.png")
Save-Resize 512 512 (Join-Path $outDir "og-image.png")

$maxW = 320
$ratio = [double]$maxW / [double]$img.Width
$nw = [Math]::Max(1, [int]([double]$img.Width * $ratio))
$nh = [Math]::Max(1, [int]([double]$img.Height * $ratio))
Save-Resize $nw $nh (Join-Path $outDir "company-logo.png")

$img.Dispose()
Get-ChildItem $outDir -Filter "*.png" | Select-Object Name, Length

Push-Location (Join-Path $PSScriptRoot "..")
try {
  node "./scripts/png-to-svg-sprites.mjs"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}
