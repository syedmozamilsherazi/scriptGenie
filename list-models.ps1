$apiKey = "AIzaSyByfh4CwBRTrqDNqHEXDYSkiUGHxw4RLBI"
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    $response.models | ForEach-Object {
        Write-Host "Model: $($_.name)" -ForegroundColor Cyan
        Write-Host "Supported Methods: $($_.supportedGenerationMethods -join ', ')"
        Write-Host "--------------------------------"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
