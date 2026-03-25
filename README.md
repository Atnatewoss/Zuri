# Zuri AI Concierge

Zuri AI Concierge is a comprehensive hospitality AI platform designed to empower resorts and hotels with a multi-tenant, RAG-powered concierge service. This system provides real-time guest assistance through an embeddable chat widget, managed through a professional resort panel dashboard.

## Technology Stack

**Frontend**: &nbsp; ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**Backend**: &nbsp; ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![SQLModel](https://img.shields.io/badge/SQLModel-EC4899?style=flat-square) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![ChromaDB](https://img.shields.io/badge/ChromaDB-3B82F6?style=flat-square)

**AI Engine**: &nbsp; ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8B5CF6?style=flat-square&logo=google&logoColor=white) ![RAG](https://img.shields.io/badge/RAG-Integration-pink?style=flat-square)

**Deployment**: &nbsp; ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

## Key Features

- **Multi-Tenant Management**: Support for multiple resort locations with isolated settings and knowledge bases.
- **RAG-Powered Chat**: Guest inquiries are answered using resort-specific documentation (PDF, DOCX).
- **Embeddable Widget**: A lightweight JavaScript widget that can be integrated into any resort website.
- **Service & Booking Management**: Track guest requests, staff efficiency, and service availability.
- **Real-Time Dashboard**: Visualize guest activity and backend status with automated KPI calculation.

## Project Structure

- `apps/panel`: The management dashboard built with Next.js.
- `server`: The Python FastAPI backend handling RAG processing and API endpoints.
- `packages/widget`: The core JavaScript bundle for the embeddable guest widget.
- `data`: Seed data and knowledge base documents for various resort tenants.

## Environment Configuration

### Frontend (apps/panel)

Create a `.env.local` file in the `apps/panel` directory with the following variables:

```
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL_DEV=http://localhost:8000
NEXT_PUBLIC_API_URL_PROD=your-production-backend-url
```

- `NEXT_PUBLIC_APP_ENV`: Set to `development` for local testing or `production` for deployed environments.

### Backend (server)

The backend uses a standard `.env` file (see `.env.example` in the `server` directory) for configuring database URLs, AI API keys, and CORS settings.

## Getting Started

### Backend Execution

1. Navigate to the `server` directory.
2. Install dependencies using `uv`:
   ```bash
   uv sync
   ```
3. Run the server:
   ```bash
   uv run uvicorn main:app --reload
   ```

### Frontend Execution

1. Navigate to the `apps/panel` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Render (Backend)

The project includes a `render.yaml` Blueprint for simplified deployment on Render. Ensure the `rootDir` is set to `server` and provide the necessary environment variables in the Render dashboard.

### Vercel (Frontend)

The management panel is optimized for Vercel deployment. Ensure you add the `NEXT_PUBLIC_APP_ENV` and `NEXT_PUBLIC_API_URL_PROD` variables in your Vercel project settings.

## License

MIT License. See the `LICENSE` file for details.
