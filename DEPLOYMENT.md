# Deployment Guide

This guide will help you deploy the Demesne application to AWS.

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Node.js 18.x or later
3. CDK CLI installed (`npm install -g aws-cdk`)

## Environment Variables

Create a `.env` file in the `apps/web` directory:

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
```

## Deployment Steps

### 1. Deploy Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy CDK stack
npm run cdk deploy
```

After deployment, note the following outputs:
- CloudFront distribution domain name
- API Gateway endpoint URL

### 2. Prepare Lambda Functions

```bash
# Navigate to API directory
cd apps/api

# Make scripts executable
chmod +x scripts/prepare-lambdas.sh

# Run preparation script
./scripts/prepare-lambdas.sh
```

### 3. Deploy Web Application

```bash
# Navigate to web app directory
cd apps/web

# Make deployment script executable
chmod +x scripts/deploy.sh

# Set CloudFront distribution ID
export CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id

# Run deployment script
./scripts/deploy.sh
```

## Post-Deployment

1. Update your domain name (if you have one) to point to the CloudFront distribution
2. Test the application by visiting the CloudFront domain name
3. Monitor the application using AWS CloudWatch

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify API Gateway CORS settings
   - Check that the web app is using the correct API URL

2. **Lambda Timeouts**
   - Check CloudWatch logs for Lambda execution times
   - Adjust Lambda timeout settings if needed

3. **S3 Access Issues**
   - Verify CloudFront Origin Access Identity settings
   - Check S3 bucket policy

### Useful Commands

```bash
# View CloudWatch logs for Lambda functions
aws logs tail /aws/lambda/SpellLambda
aws logs tail /aws/lambda/CreatureLambda

# Check S3 bucket contents
aws s3 ls s3://demesne-web

# List CloudFront distributions
aws cloudfront list-distributions
```

## Security Considerations

1. The WAF is configured with:
   - Rate limiting (2000 requests per IP)
   - AWS Managed Rules Common Rule Set
   - CloudWatch metrics for monitoring

2. All traffic is served over HTTPS
3. S3 bucket has public access blocked
4. API Gateway has CORS configured

## Maintenance

1. Regularly check CloudWatch metrics for:
   - Lambda execution times
   - API Gateway latency
   - WAF blocked requests

2. Monitor costs in AWS Cost Explorer
3. Keep dependencies updated
4. Regularly review security settings 