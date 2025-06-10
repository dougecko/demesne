# Serverless Framework Guide

This guide explains how to use Serverless Framework for local development and deployment of the Demesne API.

## Prerequisites

1. Node.js 18.x or later
2. AWS CLI installed and configured
3. Serverless Framework CLI installed:
   ```bash
   npm install -g serverless
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

   This will start the Serverless Offline server at `http://localhost:3001` with the following endpoints:
   - `GET /api/spells` - Get a random spell
   - `GET /api/creatures` - Get a random creature

3. Test the endpoints:
   ```bash
   curl http://localhost:3001/api/spells
   curl http://localhost:3001/api/creatures
   ```

## Deployment

1. Deploy to development environment:
   ```bash
   npm run deploy
   ```

2. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

## Configuration

The Serverless configuration is in `serverless.yml`. Key features:

- Node.js 18.x runtime
- CORS enabled
- Environment variables support
- Local development port: 3001
- Lambda port: 3002

## Environment Variables

Create a `.env` file in the `apps/api` directory:

```env
NODE_ENV=development
```

## Testing

1. Run tests:
   ```bash
   npm test
   ```

2. Watch mode:
   ```bash
   npm run test:watch
   ```

3. Coverage report:
   ```bash
   npm run test:coverage
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - If port 3001 is in use, change it in `serverless.yml`:
     ```yaml
     custom:
       serverless-offline:
         httpPort: <new-port>
     ```

2. **AWS Credentials**
   - Ensure AWS credentials are configured:
     ```bash
     aws configure
     ```

3. **CORS Issues**
   - Check that the web app is using the correct API URL
   - Verify CORS headers in Lambda responses

### Useful Commands

```bash
# View deployed functions
serverless info

# View function logs
serverless logs -f spells
serverless logs -f creatures

# Invoke function locally
serverless invoke local -f spells
serverless invoke local -f creatures
```

## Security

1. The API is configured with CORS to allow requests from any origin
2. Environment variables are used for configuration
3. AWS IAM roles are automatically configured by Serverless

## Maintenance

1. Keep dependencies updated:
   ```bash
   npm update
   ```

2. Monitor CloudWatch logs for deployed functions
3. Check AWS Lambda console for function metrics
4. Review and update security settings regularly 