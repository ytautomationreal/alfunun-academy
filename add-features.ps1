$features = @(
    @{
        title = "High Speed Internet"
        description = "Fast WiFi connectivity for seamless learning"
        icon = "Wifi"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 1
    },
    @{
        title = "Modern Labs"
        description = "Latest computers and equipment for hands-on practice"
        icon = "Monitor"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 2
    },
    @{
        title = "Expert Mentors"
        description = "Industry experienced teachers to guide you"
        icon = "Users"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 3
    },
    @{
        title = "Flexible Timing"
        description = "Morning and evening batches available"
        icon = "Clock"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 4
    },
    @{
        title = "Filtered Drinking Water"
        description = "Clean and safe drinking water available"
        icon = "Droplets"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 5
    },
    @{
        title = "Laptop Friendly"
        description = "Bring your own device for personalized learning"
        icon = "Laptop"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 6
    },
    @{
        title = "Safe Campus"
        description = "Secure and friendly environment for all"
        icon = "Shield"
        col_span = "md:col-span-1"
        bg_class = "bg-zinc-900/50"
        sort_order = 7
    }
)

foreach ($feature in $features) {
    $json = $feature | ConvertTo-Json -Compress
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/features" -Method Post -Body $json -ContentType "application/json"
        Write-Host "Added: $($feature.title)" -ForegroundColor Green
    } catch {
        Write-Host "Failed: $($feature.title) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Done adding features!" -ForegroundColor Cyan
