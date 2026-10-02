$items = @(@{id='15'; title='File:Flag_of_the_United_States_(1795-1818).svg'},@{id='38'; title='File:Flag_of_the_United_States_(1877–1890).svg'},@{id='45'; title='File:Flag_of_the_United_States_(1896–1908).svg'})
foreach ($item in $items) {
 $uri = 'https://commons.wikimedia.org/wiki/' + [Uri]::EscapeDataString($item.title)
 Invoke-WebRequest -Uri $uri -OutFile ('research/bulk-02/figures-flags/cache/us-' + $item.id + '-license.html')
 $html = Get-Content ('research/bulk-02/figures-flags/cache/us-' + $item.id + '-license.html') -Raw
 $match = [regex]::Match($html, '<div class="fullImageLink"[^>]*>.*?<a href="([^"]+)"', 'Singleline')
 if (!$match.Success) { throw 'Original SVG URL missing' }
 $assetUri = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
 Invoke-WebRequest -Uri $assetUri -OutFile ('research/bulk-02/figures-flags/staged-assets/us-' + $item.id + '.svg')
 Write-Output ($item.id + ' ' + $assetUri)
}
