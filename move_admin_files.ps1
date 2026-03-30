$dest = "src\app\admin\(dashboard)"
if (!(Test-Path $dest)) { New-Item -Path $dest -ItemType Directory -Force }
if (Test-Path "src\app\admin\layout.tsx") { Move-Item "src\app\admin\layout.tsx" $dest }
$folders = @("batches", "content", "courses", "dashboard", "features", "fees", "gallery", "messages", "reviews", "settings", "students", "teachers", "technologies", "theme")
foreach ($f in $folders) {
    if (Test-Path "src\app\admin\$f") {
        Move-Item "src\app\admin\$f" $dest
    } else {
        Write-Host "Folder $f not found, skipping."
    }
}
Write-Host "Move complete."
