# WiFiFly VPS Upload Script (PowerShell)
# Uploads all necessary files to your VPS
# Usage: .\deploy-to-vps.ps1 -VpsIP "YOUR_VPS_IP" -Username "root"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/home/aaawififly"
)

$green = @{ ForegroundColor = "Green" }
$yellow = @{ ForegroundColor = "Yellow" }
$red = @{ ForegroundColor = "Red" }
$cyan = @{ ForegroundColor = "Cyan" }

Write-Host "================================================" @cyan
Write-Host "  WiFiFly VPS Upload Script" @cyan
Write-Host "================================================" @yellow
Write-Host ""

# Validate inputs
if (-not $VpsIP -or $VpsIP -eq "") {
    Write-Host "Error: VPS IP is required" @red
    exit 1
}

# Add SSH credentials format
$remoteConnection = "$Username@$VpsIP"
$remoteDest = "$remoteConnection`:$RemotePath"

Write-Host "Configuration:" @yellow
Write-Host "  VPS IP: $VpsIP"
Write-Host "  Username: $Username"
Write-Host "  Remote Path: $RemotePath"
Write-Host "  Connection: $remoteConnection"
Write-Host ""

# Get local path
$localPath = Get-Location
Write-Host "Local Path: $localPath" @yellow
Write-Host ""

# Test SSH connection
Write-Host "Testing SSH connection..." @yellow
try {
    ssh -o ConnectTimeout=5 $remoteConnection "echo 'SSH connection successful'" | Out-Null
    Write-Host "✓ SSH connection successful" @green
} catch {
    Write-Host "✗ SSH connection failed. Check your IP, username, and SSH key." @red
    exit 1
}

# Define essential files to upload
$configFiles = @(
    "Dockerfile",
    "docker-compose.yml",
    "nginx.conf",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "eslint.config.mjs",
    ".env.example",
    ".env.production",
    ".dockerignore",
    ".gitignore",
    "VPS_DEPLOYMENT_GUIDE.md",
    "deploy-vps-automated.sh",
    "README.md"
)

$directories = @(
    "src",
    "public"
)

Write-Host "Files to upload:" @yellow
Write-Host "  Configuration files: $($configFiles.Count)" @green
Write-Host "  Directories: $($directories.Count)" @green
Write-Host ""

# Check for missing files
$missingFiles = @()
foreach ($file in $configFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Warning: Missing files:" @yellow
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" @red
    }
    Write-Host ""
}

# Confirm before uploading
$proceed = Read-Host "Proceed with upload? (yes/no)"
if ($proceed -ne "yes") {
    Write-Host "Upload cancelled." @yellow
    exit 0
}

Write-Host ""
Write-Host "Starting upload..." @yellow
Write-Host ""

# Create remote directory
Write-Host "Creating remote directory..." @yellow
ssh $remoteConnection "mkdir -p $RemotePath" | Out-Null
Write-Host "✓ Remote directory created" @green

# Upload config files
Write-Host ""
Write-Host "Uploading configuration files..." @yellow
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  Uploading $file..."
        scp "$file" "$remoteDest/" | Out-Null
        Write-Host "  ✓ $file uploaded" @green
    }
}

# Upload directories
Write-Host ""
Write-Host "Uploading source directories..." @yellow
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "  Uploading $dir/..."
        scp -r "$dir" "$remoteDest/" | Out-Null
        Write-Host "  ✓ $dir uploaded" @green
    }
}

# Create ssl directory
Write-Host ""
Write-Host "Creating SSL directory..." @yellow
ssh $remoteConnection "mkdir -p $RemotePath/ssl" | Out-Null
Write-Host "✓ SSL directory created" @green

Write-Host ""
Write-Host "================================================" @cyan
Write-Host "✓ Upload Complete!" @green
Write-Host "================================================" @cyan
Write-Host ""

Write-Host "Next steps:" @yellow
Write-Host "  1. SSH into your VPS:"
Write-Host "     ssh $remoteConnection"
Write-Host ""
Write-Host "  2. Run the automated deployment:"
Write-Host "     bash $RemotePath/deploy-vps-automated.sh"
Write-Host ""
Write-Host "  3. Or manually deploy:"
Write-Host "     cd $RemotePath"
Write-Host "     docker-compose build --no-cache"
Write-Host "     docker-compose up -d"
Write-Host ""

Write-Host "Documentation:" @yellow
Write-Host "  See VPS_DEPLOYMENT_GUIDE.md for detailed instructions"
Write-Host ""
