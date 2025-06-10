# Serverless Deployment Instructions

## Prerequisites
- Node.js (v18 or later)
- pnpm (v10 or later)
- AWS CLI configured with appropriate credentials

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Deploy to AWS Lambda:
   ```bash
   pnpm serverless deploy
   ```

## Development
- Run the development server:
  ```bash
  pnpm dev
  ```

- Run tests:
  ```bash
  pnpm test
  ```

## Notes
- This project uses Vite for building and bundling.
- Ensure your AWS credentials are properly configured in `~/.aws/credentials`.
- For more details, refer to the [Serverless Framework documentation](https://www.serverless.com/framework/docs/). 