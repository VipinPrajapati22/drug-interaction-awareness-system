# Drug Interaction Awareness System

A production-ready full-stack pharmacovigilance-inspired platform for pharmacists, pharmacy students, and patients. DIAS helps identify drug-drug interactions, drug-food interactions, adverse reaction risks, and counseling warnings before self-medication or routine drug use.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express.js, JWT, Multer, SheetJS
- Database: MongoDB Atlas with Mongoose schemas
- Exports: CSV API exports and client-side PDF ICSR export

## Project Structure

```text
client/
  src/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    seed/
    services/
    utils/
```

## Quick Start

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

The app runs in demo mode when `MONGO_URI` is empty. Demo mode seeds realistic in-memory data automatically so evaluators can run the project without an Atlas account.

Demo accounts:

```text
Admin: admin@dias.local / Admin@123
Pharmacist: pharmacist@dias.local / Pharma@123
User: user@dias.local / User@123
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user and allow your IP address.
3. Copy `.env.example` to `server/.env`.
4. Set:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/drug_interaction_awareness
DEMO_MODE=false
JWT_SECRET=<long-random-secret>
CLIENT_URL=http://localhost:5173
```

5. Seed the database:

```bash
npm run seed
```

## API Documentation

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Drugs:

- `GET /api/drugs?q=warfarin`
- `POST /api/drugs` Admin or Pharmacist
- `PUT /api/drugs/:id` Admin or Pharmacist
- `DELETE /api/drugs/:id` Admin

Interactions:

- `POST /api/interactions/check`
- `GET /api/interactions/history`
- `POST /api/interactions/counseling`
- `GET /api/interactions/export`

Food interactions:

- `POST /api/food/check`
- `POST /api/food` Admin or Pharmacist

ICSR:

- `POST /api/icsr/report`
- `GET /api/icsr/reports`
- `GET /api/icsr/export`

Excel upload:

- `POST /api/excel/upload`
- Multipart field: `file`
- Body: `type=drugs|interactions|food|icsr`, `import=true|false`

Analytics:

- `GET /api/dashboard/analytics`

Use `Authorization: Bearer <token>` for protected routes.

## Seed Data

The project generates:

- 50 WHO-DD inspired medicine records
- 30 drug-drug interactions
- 20 drug-food interactions
- 25 MedDRA-inspired SOC/PT/LLT terms
- 15 mock ICSR reports

Required examples are included:

- Warfarin + Aspirin
- Sildenafil + Nitrates
- Ibuprofen + ACE inhibitors
- Metronidazole + Alcohol
- Ciprofloxacin + Dairy
- Warfarin + Vitamin K foods

## Deployment

### Frontend on Vercel

1. Set root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

### Backend on Render

1. Set root directory to `server`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add environment variables from `.env.example`.
5. Set `CLIENT_URL` to the Vercel URL.

## Notes for Academic Use

This application is designed for awareness, education, and portfolio demonstration. It is not a substitute for licensed medical judgment, national formularies, local protocols, or validated clinical decision-support systems.
