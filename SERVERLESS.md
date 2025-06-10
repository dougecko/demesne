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
   pnpm deploy
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
- This project uses Vite for building the web app.
- Ensure AWS credentials are properly configured before deployment.
- For more details, refer to the [Serverless Framework documentation](https://www.serverless.com/framework/docs/). 