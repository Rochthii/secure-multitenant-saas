$filePath = "e:\MULTITENANT_TEMPLES\supabase\functions\rag-chat\index.ts"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Fix the misaligned closing brace: "         }" should be "            }"
# The pattern is the })(); followed by wrong indentation brace
$bad  = "               })();`r`n         }`r`n"
$good = "               })();`r`n            }`r`n"

if ($content.Contains($bad)) {
    $content = $content.Replace($bad, $good)
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "SUCCESS: Fixed brace alignment"
} else {
    # Try LF only
    $bad2  = "               })();`n         }`n"
    $good2 = "               })();`n            }`n"
    if ($content.Contains($bad2)) {
        $content = $content.Replace($bad2, $good2)
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "SUCCESS (LF): Fixed brace alignment"
    } else {
        Write-Host "PATTERN NOT FOUND - need manual check"
    }
}
