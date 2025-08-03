# Paylis

Paylis is a full-stack payment application that allows users to send and receive payments, with a focus on cryptocurrency transactions. It provides a merchant registration system, transaction management, and a faucet for testing purposes.

## Features

- **User Authentication:** Secure user login and session management using SIWE (Sign-In with Ethereum).
- **Merchant Registration:** Allows users to register as merchants to receive payments.
- **Payment Gateway:** Facilitates payments using various cryptocurrencies.
- **Transaction History:** View and manage transaction history.
- **Cryptocurrency Faucet:** A faucet to get test tokens for development and testing.
- **Relayer Support:** Utilizes a relayer for gasless transactions.

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express (via react-router-serve)
- **Database:** PostgreSQL with NeonDB
- **ORM:** Drizzle ORM
- **Blockchain:** Ethers.js, Wagmi, Viem for wallet interaction and blockchain communication.
- **Deployment:** Docker, Netlify

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (for local development and deployment)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd apps
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. You can refer to `.env.example` for a template.

```
VITE_PROJECT_ID=
VITE_RELAYER_API_KEY=
VITE_RELAYER_API_SECRET=

DATABASE_URL=
JWT_SECRET=
PRIVATE_KEY=
```

### Database Setup

1.  Make sure you have a PostgreSQL database running.
2.  Run the database migrations:
    ```bash
    pnpm run db:migrate
    ```
3.  (Optional) Seed the database with initial data:
    ```bash
    pnpm run db:seed
    ```

### Development

Start the development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t paylis-app .

# Run the container
docker run -p 3000:3000 paylis-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Netlify Deployment

This project is configured for deployment on Netlify. Simply connect your Git repository to Netlify and it will automatically build and deploy the application.

---

Built with ❤️ using React Router.