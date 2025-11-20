# Injective Insight Hub

A comprehensive analytics and intelligence dashboard for the Injective Protocol, built to provide real-time insights into the ecosystem.

## Features

-   **Real-Time Dashboard**: Monitor block height, TPS, active validators, and staked INJ.
-   **Financial Analytics**: Track Open Interest, Insurance Fund, and 24h Trading Volume for Spot and Derivative markets.
-   **Risk Monitoring**: Visual risk buffer indicators and system risk overview.
-   **Market Data**: Detailed views for Orderbook, Trading, Derivatives, and Markets.
-   **Network Insights**: Explore Blocks, Transactions, Cross-Chain activities, and Governance proposals.
-   **Compliance & Staking**: Dedicated sections for compliance monitoring and staking operations.

## Tech Stack

-   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **UI Framework**: [Shadcn UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
-   **Blockchain Interaction**: [@injectivelabs/sdk-ts](https://www.npmjs.com/package/@injectivelabs/sdk-ts)
-   **Charts**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites

Ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm, yarn, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd injective-insight-hub
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    bun install
    ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080` (or the port shown in your terminal).

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

-   `src/components`: Reusable UI components (including Shadcn UI components).
-   `src/contexts`: React contexts (e.g., ThemeContext).
-   `src/hooks`: Custom React hooks.
-   `src/lib`: Utility functions and RPC client setup.
-   `src/pages`: Application pages corresponding to routes (Dashboard, Markets, etc.).
-   `src/App.tsx`: Main application component with routing configuration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
