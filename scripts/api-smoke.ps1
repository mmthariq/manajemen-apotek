$base='http://localhost:3000'

function Read-ErrorBody($exception) {
  $status = 0
  $bodyText = ''

  try { $status = $exception.Response.StatusCode.value__ } catch {}

  try {
    $stream = $exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      $bodyText = $reader.ReadToEnd()
      $reader.Close()
    }
  } catch {}

  return [PSCustomObject]@{ status = $status; body = $bodyText }
}

function Test-JsonApi($name, $method, $path, $body, $token) {
  try {
    $params = @{ Uri = "$base$path"; Method = $method; ErrorAction = 'Stop' }
    if ($token) { $params.Headers = @{ Authorization = "Bearer $token" } }
    if ($null -ne $body) {
      $params.ContentType = 'application/json'
      $params.Body = ($body | ConvertTo-Json -Depth 10)
    }

    $resp = Invoke-RestMethod @params
    return [PSCustomObject]@{
      name = $name
      method = $method
      path = $path
      ok = $true
      status = 200
      body = ($resp | ConvertTo-Json -Compress -Depth 10)
    }
  } catch {
    $err = Read-ErrorBody $_.Exception
    return [PSCustomObject]@{
      name = $name
      method = $method
      path = $path
      ok = $false
      status = $err.status
      body = $err.body
    }
  }
}

function Test-MultipartApi($name, $method, $path, $form, $token) {
  try {
    $headers = @{}
    if ($token) { $headers.Authorization = "Bearer $token" }

    $resp = Invoke-RestMethod -Uri "$base$path" -Method $method -Form $form -Headers $headers -ErrorAction Stop
    return [PSCustomObject]@{
      name = $name
      method = $method
      path = $path
      ok = $true
      status = 200
      body = ($resp | ConvertTo-Json -Compress -Depth 10)
    }
  } catch {
    $err = Read-ErrorBody $_.Exception
    return [PSCustomObject]@{
      name = $name
      method = $method
      path = $path
      ok = $false
      status = $err.status
      body = $err.body
    }
  }
}

function Test-CurlMultipartPatch($name, $path, $filePath, $token) {
  try {
    $httpCode = curl.exe -s -o NUL -w "%{http_code}" -X PATCH "$base$path" -H "Authorization: Bearer $token" -F "paymentProof=@$filePath;type=image/png"
    $ok = $httpCode -eq '200'

    return [PSCustomObject]@{
      name = $name
      method = 'PATCH'
      path = $path
      ok = $ok
      status = [int]$httpCode
      body = ''
    }
  } catch {
    return [PSCustomObject]@{
      name = $name
      method = 'PATCH'
      path = $path
      ok = $false
      status = 0
      body = $_.Exception.Message
    }
  }
}

$results = @()

$results += Test-JsonApi 'status' 'GET' '/api/status' $null $null

$adminLogin = Test-JsonApi 'login-admin' 'POST' '/api/auth/login' @{ email = 'admin'; password = '123456'; role = 'admin' } $null
$results += $adminLogin
$adminToken = $null
if ($adminLogin.ok) { $adminToken = ((($adminLogin.body | ConvertFrom-Json).token)) }

$kasirLogin = Test-JsonApi 'login-kasir' 'POST' '/api/auth/login' @{ email = 'kasir'; password = '123456'; role = 'kasir' } $null
$results += $kasirLogin
$kasirToken = $null
if ($kasirLogin.ok) { $kasirToken = ((($kasirLogin.body | ConvertFrom-Json).token)) }

$customerLogin = Test-JsonApi 'login-customer-seed' 'POST' '/api/auth/login' @{ email = 'customer@apotek.local'; password = '123456'; role = 'customer' } $null
$results += $customerLogin
$customerToken = $null
if ($customerLogin.ok) { $customerToken = ((($customerLogin.body | ConvertFrom-Json).token)) }

$results += Test-JsonApi 'auth-me-admin' 'GET' '/api/auth/me' $null $adminToken

$unique = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$newCustomerEmail = "customer.$unique@apotek.local"
$registerCustomer = Test-JsonApi 'register-customer' 'POST' '/api/customers/register' @{ name = "Customer $unique"; email = $newCustomerEmail; password = '123456'; phone = '08123456789'; address = 'Jl. Test' } $null
$results += $registerCustomer

$supplierCreate = Test-JsonApi 'create-supplier' 'POST' '/api/suppliers' @{ name = "Supplier Test $unique"; contactPerson = 'Tester'; phone = '0811111111'; address = 'Alamat Supplier' } $adminToken
$results += $supplierCreate
$supplierId = $null
if ($supplierCreate.ok) { $supplierId = (($supplierCreate.body | ConvertFrom-Json).data.id) }

$drugCreate = Test-JsonApi 'create-drug' 'POST' '/api/obat' @{ name = "Paracetamol Test $unique"; description = 'Obat uji'; stock = 10; unit = 'strip'; price = 5000; supplierId = $supplierId } $adminToken
$results += $drugCreate
$drugId = $null
if ($drugCreate.ok) { $drugId = (($drugCreate.body | ConvertFrom-Json).data.id) }

$results += Test-JsonApi 'update-drug' 'PUT' "/api/obat/$drugId" @{ name = "Paracetamol Test Updated $unique"; stock = 15; unit = 'strip'; price = 5500; supplierId = $supplierId } $adminToken

$purchaseCreate = Test-JsonApi 'create-purchase' 'POST' '/api/purchases' @{ supplierId = $supplierId; items = @(@{ drugId = $drugId; quantity = 5; unitPrice = 4500 }) } $adminToken
$results += $purchaseCreate
$purchaseId = $null
if ($purchaseCreate.ok) { $purchaseId = (($purchaseCreate.body | ConvertFrom-Json).data.id) }

$results += Test-JsonApi 'get-purchase-by-id' 'GET' "/api/purchases/$purchaseId" $null $adminToken

$customCreate = Test-JsonApi 'create-custom-medicine' 'POST' '/api/custom-medicine' @{ nama = "Racikan Test $unique"; harga = 15000; stok = 8; komposisi = @(@{ drugId = $drugId; jumlah = 1; satuan = 'tablet' }) } $adminToken
$results += $customCreate
$customId = $null
if ($customCreate.ok) { $customId = (($customCreate.body | ConvertFrom-Json).data.id) }

$results += Test-JsonApi 'get-custom-medicine-by-id' 'GET' "/api/custom-medicine/$customId" $null $adminToken
$results += Test-JsonApi 'update-custom-medicine' 'PUT' "/api/custom-medicine/$customId" @{ nama = "Racikan Test Updated $unique"; harga = 16000; stok = 7; komposisi = @(@{ drugId = $drugId; jumlah = 2; satuan = 'tablet' }) } $adminToken
$results += Test-JsonApi 'record-custom-transaction' 'POST' "/api/custom-medicine/$customId/transaction" @{ customerId = 3; quantity = 1 } $adminToken

$orderCreate = Test-JsonApi 'create-online-order' 'POST' '/api/orders' @{ items = @(@{ drugId = $drugId; quantity = 1; unitPrice = 5500 }) } $customerToken
$results += $orderCreate
$orderId = $null
if ($orderCreate.ok) { $orderId = (($orderCreate.body | ConvertFrom-Json).data.id) }

$results += Test-JsonApi 'get-orders-customer' 'GET' '/api/orders' $null $customerToken
$results += Test-JsonApi 'get-order-by-id' 'GET' "/api/orders/$orderId" $null $customerToken

$proofFile = Join-Path $PSScriptRoot 'smoke-proof.png'
[IO.File]::WriteAllBytes($proofFile, [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZxJ8AAAAASUVORK5CYII='))

$payOrder = Test-CurlMultipartPatch 'pay-order' "/api/orders/$orderId/pay" $proofFile $customerToken
$results += $payOrder

$results += Test-JsonApi 'verify-payment' 'PATCH' "/api/orders/$orderId/verify-payment" $null $kasirToken
$results += Test-JsonApi 'complete-order' 'PATCH' "/api/orders/$orderId/status" @{ orderStatus = 'COMPLETED'; usageInstructions = 'Minum 3x sehari setelah makan' } $kasirToken

$cancelOrderCreate = Test-JsonApi 'create-order-to-cancel' 'POST' '/api/orders' @{ items = @(@{ drugId = $drugId; quantity = 1; unitPrice = 5500 }) } $customerToken
$results += $cancelOrderCreate
$cancelOrderId = $null
if ($cancelOrderCreate.ok) { $cancelOrderId = (($cancelOrderCreate.body | ConvertFrom-Json).data.id) }

$results += Test-JsonApi 'cancel-order' 'PATCH' "/api/orders/$cancelOrderId/cancel" $null $customerToken
$results += Test-JsonApi 'delete-cancelled-order' 'DELETE' "/api/orders/$cancelOrderId" $null $customerToken

$results += Test-JsonApi 'dashboard-summary' 'GET' '/api/dashboard/summary' $null $adminToken
$results += Test-JsonApi 'report-export' 'GET' '/api/reports/analytics/export' $null $adminToken

$results | ConvertTo-Json -Depth 8
