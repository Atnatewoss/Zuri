# Zuri AI Concierge

Zuri AI Concierge is a comprehensive hospitality AI platform designed to empower resorts and hotels with a multi-tenant, RAG-powered concierge service. This system provides real-time guest assistance through an embeddable chat widget, managed through a professional resort panel dashboard.

<div align="center">

### Technology Stack

**Frontend**
Next.js | TypeScript | Tailwind CSS | Recharts | Lucide Icons

**Backend**
Python | FastAPI | SQLModel | PostgreSQL (Supabase) | ChromaDB | uv

**AI Engine**
Google Gemini AI (2.0 Flash) | RAG Integration

**Deployment**
Render (Backend) | Vercel (Frontend)

</div>

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
NEXT_PUBLIC_API_URL_PROD=https://zuri-backend-rkws.onrender.com
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
