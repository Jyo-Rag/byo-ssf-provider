# SSF Transmitter for Okta

A web application for manually sending CAEP (Continuous Access Evaluation Protocol) Risk Change events to Okta via the Shared Signals Framework (SSF).

## Features

- Send Assurance Level Change events to Okta
- Configure risk levels (low, medium, high, critical)
- Support for email and Okta User ID identifiers
- Event history tracking
- JWKS endpoint for Okta verification

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate RSA Keys

```bash
npm run generate-keys
```

This will output environment variables. Copy them to `.env.local`:

```bash
# Create .env.local and paste the generated values
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure Okta

1. Go to your Okta Admin Console
2. Navigate to **Security → Identity Threat Protection → Shared Signals**
3. Click **Add shared signal provider**
4. Configure with:
   - **Issuer URL**: `https://your-app.vercel.app` (or `http://localhost:3000` for local testing)
   - **JWKS URL**: `https://your-app.vercel.app/api/jwks`
5. Save the configuration

## Deployment to Vercel

### 1. Deploy

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 2. Set Environment Variables

In Vercel dashboard, add the environment variables:
- `SSF_KEY_ID`
- `SSF_PRIVATE_KEY`
- `SSF_PUBLIC_KEY`

### 3. Update Okta Configuration

Update your Okta SSF provider with your Vercel deployment URL.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jwks` | GET | JWKS public key endpoint |
| `/api/transmit` | POST | Send SET to Okta |
| `/.well-known/ssf-configuration` | GET | SSF discovery document |

## Security Event Token (SET) Format

The app generates SETs following the CAEP specification:

```json
{
  "iss": "https://your-app.vercel.app",
  "aud": "https://your-okta-org.okta.com",
  "iat": 1706000000,
  "jti": "evt_unique_id",
  "events": {
    "https://schemas.openid.net/secevent/caep/event-type/assurance-level-change": {
      "subject": {
        "format": "email",
        "email": "user@example.com"
      },
      "current_level": "high",
      "previous_level": "low",
      "change_direction": "increase",
      "event_timestamp": 1706000000
    }
  }
}
```

## Verification

After sending an event, check the Okta System Log for:
- Event type: `security.events.provider.receive_event`

## Tech Stack

- Next.js 14 (App Router)
- React
- Tailwind CSS
- jose (JWT library)

## License

MIT
