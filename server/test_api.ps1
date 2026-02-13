$apiKey = "AIzaSyAhhy_AwN0NUAt12E4diQOBLpoYJd5MmZs"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"
$body = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Hello" }
            )
        }
    )
} | ConvertTo-Json

try {
    Write-Host "Sending request to $url..."
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "SUCCESS! API responded:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "FAILED!"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Details:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host $reader.ReadToEnd()
}
