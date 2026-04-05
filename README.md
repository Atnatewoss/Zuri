# Zuri AI Concierge

**Multilingual AI Assistant for Ethiopian Hospitality**

Zuri is a professional, action-oriented AI Concierge designed for the 2026 Hospitality Hackathon. It addresses the critical communication gap in the East African tourism sector by providing a 24/7, high-utility assistant that speaks the guest's language—natively.

> **"Hotels don’t lose guests because of rooms—they lose them in the moments they can’t respond."**

In Ethiopia and across East Africa, guests often face delays due to phone-based support, limited-hour front desks, or language barriers. Zuri solves this by turning a property's knowledge (PDFs, menus, handbooks) into an **Action-Capable Agent** that handles inquiries and bookings instantly.

## Demo Video

[![Zuri AI Demo](https://img.youtube.com/vi/RUp7V8arhIA/0.jpg)](https://youtu.be/RUp7V8arhIA)

*Click the image above to watch the full platform walkthrough.*

## Key Features

- **Native Multilingual Support**: Built-in, high-fidelity support for **Amharic, Oromifa, and Tigrinya**, alongside major international languages.
- **RAG-Powered Intelligence**: Securely ingests resort documentation to provide property-specific answers with zero hallucinations.
- **Agentic Actions**: Beyond simple Q&A—Zuri is authorized to perform direct actions like spa bookings and room service requests.
- **Single-Line Deployment**: Integrates with any existing resort website in under 60 seconds with no infrastructure changes.
- **Multi-Tenant Dashboard**: Manage knowledge bases, review live transcripts, and monitor bookings in a unified command center.
- **Privacy & Security**: Per-tenant data isolation and dynamic domain whitelisting (CORS) for production-grade safety.

## Technology Stack

| Category | Stack |
|:---|:---|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![SQLModel](https://img.shields.io/badge/SQLModel-EC4899?style=flat-square) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![ChromaDB](https://img.shields.io/badge/ChromaDB-3B82F6?style=flat-square) |
| **AI Engine** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8B5CF6?style=flat-square&logo=google&logoColor=white) ![Addis AI](https://img.shields.io/badge/Addis_AI-Integrating-blue?style=flat-square) ![RAG](https://img.shields.io/badge/RAG-Integration-pink?style=flat-square) |
| **Deployment** | ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

## Project Structure

- `apps/panel`: The management dashboard built with Next.js.
- `server`: The Python FastAPI backend handling RAG processing and API endpoints.
- `packages/widget`: The core JavaScript bundle for the embeddable guest widget.
- `data`: Seed data and knowledge base documents for various resort tenants.

## Security & Architecture

The system has undergone a comprehensive remediation to ensure production readiness:

- **Identity-First Security**: All tenant data access is strictly enforced via JWT-derived `hotel_id`, eliminating IDOR vulnerabilities.
- **Dynamic CORS**: The backend uses a custom middleware to validate `Origin` headers against the database's allowed domains for each tenant.
- **Performance**: Document ingestion is handled via FastAPI `BackgroundTasks` to ensure a non-blocking UI.
- **Rate Limiting**: Integrated sliding window rate limiting for the chat API.


## Environment Configuration

### Frontend (apps/panel)

Create a `.env.local` file in the `apps/panel` directory with the following variables:

```
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL_DEV=http://localhost:8000
NEXT_PUBLIC_API_URL_PROD='your-production-backend-url'
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

The project includes a `render.yaml` Blueprint for simplified deployment on Render.

It provisions:
- A web service (`zuri-backend`)
- A cron keep-alive service (`zuri-backend-keepalive`) that pings `/health` every 14 minutes

Set this env var on the cron service:
- `BACKEND_HEALTH_URL=https://<your-backend-service>.onrender.com/health`

Provide the required backend env vars in the Render dashboard (`DATABASE_URL`, `APP_SECRET_KEY`, Gemini/Chroma keys, and `CORS_ORIGINS`).

### Vercel (Frontend)

The management panel is optimized for Vercel deployment. Ensure you add the `NEXT_PUBLIC_APP_ENV` and `NEXT_PUBLIC_API_URL_PROD` variables in your Vercel project settings.

## Team (Exp-Ethiopia)

- **Amer Abdulqeum**
- **Atnatewos Hailealem**
- **Brook Teklebrhan**
- **Yonatan Getachew**

## License

MIT License. See the `LICENSE` file for details.
