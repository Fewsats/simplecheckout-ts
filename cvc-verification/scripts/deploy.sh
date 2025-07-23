#!/bin/bash

# Deploy CVC Verification to Cloudflare R2
# This script can be run locally or in CI/CD

set -e  # Exit on any error

echo "🚀 Starting deployment to Cloudflare R2..."

# Check if required environment variables are set
required_vars=("R2_BUCKET_NAME" "R2_ACCESS_KEY_ID" "R2_SECRET_ACCESS_KEY" "CLOUDFLARE_ACCOUNT_ID")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var environment variable is not set"
    exit 1
  fi
done

echo "🔑 Using R2 Access Key authentication"

# Build the project
echo "📦 Building project..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Build may have failed."
  exit 1
fi

# Configure AWS CLI for R2
echo "🔧 Configuring AWS CLI for R2..."
aws configure set aws_access_key_id "$R2_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$R2_SECRET_ACCESS_KEY"
aws configure set region auto

# Set R2 endpoint
R2_ENDPOINT="https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com"
echo "🌐 Using R2 endpoint: $R2_ENDPOINT"

echo "☁️ Uploading files to Cloudflare R2..."

# Upload HTML files with proper content type and cache control
echo "  📄 Uploading HTML files..."
aws s3 cp dist/index.html s3://$R2_BUCKET_NAME/index.html \
  --endpoint-url=$R2_ENDPOINT \
  --content-type="text/html" \
  --cache-control="public, max-age=300"

aws s3 cp dist/verification-success.html s3://$R2_BUCKET_NAME/verification-success.html \
  --endpoint-url=$R2_ENDPOINT \
  --content-type="text/html" \
  --cache-control="public, max-age=300"

# Upload assets with long-term caching
echo "  📦 Uploading assets..."
if [ -d "dist/assets" ]; then
  for file in dist/assets/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      echo "    📁 Uploading $filename..."
      
      if [[ "$filename" == *.js ]]; then
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --content-type="application/javascript" \
          --cache-control="public, max-age=31536000, immutable"
      elif [[ "$filename" == *.css ]]; then
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --content-type="text/css" \
          --cache-control="public, max-age=31536000, immutable"
      elif [[ "$filename" == *.svg ]]; then
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --content-type="image/svg+xml" \
          --cache-control="public, max-age=31536000, immutable"
      elif [[ "$filename" == *.png ]]; then
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --content-type="image/png" \
          --cache-control="public, max-age=31536000, immutable"
      elif [[ "$filename" == *.jpg ]] || [[ "$filename" == *.jpeg ]]; then
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --content-type="image/jpeg" \
          --cache-control="public, max-age=31536000, immutable"
      else
        aws s3 cp "$file" s3://$R2_BUCKET_NAME/assets/$filename \
          --endpoint-url=$R2_ENDPOINT \
          --cache-control="public, max-age=31536000, immutable"
      fi
    fi
  done
else
  echo "  ⚠️ No assets directory found, skipping asset upload"
fi

# Purge Cloudflare cache if CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN are provided
if [ -n "$CLOUDFLARE_ZONE_ID" ] && [ -n "$CLOUDFLARE_API_TOKEN" ]; then
  echo "🔄 Purging Cloudflare cache..."
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Cache purged successfully"
  else
    echo "⚠️ Cache purge failed, but deployment was successful"
  fi
else
  echo "⚠️ CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN not set, skipping cache purge"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your CVC verification page should be available at your custom domain"
echo "📊 Files uploaded:"
echo "  • index.html (HTML with 5min cache)"
echo "  • verification-success.html (HTML with 5min cache)"
if [ -d "dist/assets" ]; then
  asset_count=$(find dist/assets -type f | wc -l)
  echo "  • $asset_count asset files (with 1-year cache)"
fi
echo "" 