$apiKey = $env:VITE_OPENAI_API_KEY
if (-not $apiKey) {
    Write-Host "Error: VITE_OPENAI_API_KEY environment variable is not set" -ForegroundColor Red
    Write-Host "Please add it to your .env file" -ForegroundColor Yellow
    exit 1
}

$body = @{
    model = "gpt-4o-mini"
    messages = @(
        @{
            role = "system"
            content = "You are a helpful assistant."
        },
        @{
            role = "user"
            content = "Say hello!"
        }
    )
    temperature = 0.7
} | ConvertTo-Json -Depth 10

Write-Host "Testing OpenAI API..."
try {
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" -Method Post -Body $body -ContentType "application/json" -Headers @{"Authorization" = "Bearer $apiKey"}
    Write-Host "Success: $($response.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
