$apiKey = "AIzaSyByfh4CwBRTrqDNqHEXDYSkiUGHxw4RLBI"
$body = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Hello" }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$models = @(
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite-001",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-pro-exp-02-05"
)

foreach ($model in $models) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/$($model):generateContent?key=$apiKey"
    Write-Host "Testing $model..."
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
        Write-Host "Success: $($response.candidates[0].content.parts[0].text)" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
             $stream = $_.Exception.Response.GetResponseStream()
             $reader = New-Object System.IO.StreamReader($stream)
             Write-Host "Details: $($reader.ReadToEnd())" -ForegroundColor Red
        }
    }
    Write-Host "--------------------------------"
}
