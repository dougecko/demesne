#!/bin/bash

# Exit on error
set -e

# Build the web app
echo "Building web app..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync ./out s3://demesne-web --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!" 