# Disclaimer: For demo and poc use only. 
> This app is not suitable for production. The Okta API token is persisted in browser `localStorage`, and the RSA private key is stored as a plain-text environment variable in `.env.local`. Neither is an acceptable secret storage mechanism for a production system. Use this app in a controlled lab or demo environment with a non-production Okta tenant only.


# BYO SSF Provider

A web application for sending CAEP (Continuous Access Evaluation Protocol) Risk Change events to Okta via the Shared Signals Framework (SSF). The app walks you through a guided 4-step setup — generating signing keys, configuring your Okta connection, registering a provider, and sending risk events — entirely through the browser UI.


## Features

- **In-browser key generation** — generate RSA 2048-bit signing keys and write them directly to `.env.local`, no terminal required
- **One-click provider registration** — register this app as a Security Events Provider in your Okta tenant via the API
- **Send risk events** — send CAEP Risk Change events with configurable risk levels (low, medium, high, critical)
- **Email and Okta User ID** subject identifiers supported
- **Event history** — view sent events with expandable decoded JWT payload and Okta response
- **Duplicate provider handling** — detects when an issuer is already registered in Okta and surfaces the existing provider instead of erroring
- **SSF discovery** — serves a `.well-known/ssf-configuration` document for Okta's provider registration flow
- **JWKS endpoint** — publishes the RSA public key so Okta can verify event token signatures

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and follow the 4-step UI.

### 3. Expose the App Publicly (required for Okta)

Okta must be able to reach the app's JWKS endpoint over HTTPS. Use ngrok or similar:

```bash
ngrok http 3000
```

Copy the generated HTTPS URL — you will enter it in the app as the **Public App HTTPS URL**.

### 4. Follow the In-App Steps

| Step | Action |
|------|--------|
| 1 | **Generate Signing Keys** — creates an RSA key pair and saves it to `.env.local` |
| 2 | **Configure Okta Connection** — enter your Okta tenant URL, API token, and public HTTPS URL |
| 3 | **Create Security Events Provider** — registers this app with Okta via the API |
| 4 | **Send Risk Events** — send CAEP Risk Change events to Okta |

## Deployment to Vercel (web hosting)

### 1. Deploy

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 2. Set Environment Variables

In the Vercel dashboard, add the following environment variables (generated in Step 1 of the UI, found in `.env.local`):

- `SSF_KEY_ID`
- `SSF_PRIVATE_KEY`
- `SSF_PUBLIC_KEY`
- `APP_URL` — set to your Vercel deployment URL

### 3. Register the Provider in Okta

Use the in-app Step 3 with your Vercel deployment URL as the Public App HTTPS URL.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SSF_KEY_ID` | Unique identifier for the RSA key pair |
| `SSF_PRIVATE_KEY` | RSA private key (PEM, newlines escaped as `\n`) |
| `SSF_PUBLIC_KEY` | RSA public key (PEM, newlines escaped as `\n`) |
| `APP_URL` | Override the public app URL (required when running behind a tunnel or on a custom domain) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-keys` | GET | Check whether signing keys are configured |
| `/api/generate-keys` | POST | Generate a new RSA key pair and write to `.env.local` |
| `/api/create-provider` | POST | Register this app as a Security Events Provider in Okta |
| `/api/transmit` | POST | Sign and send a SET to Okta |
| `/api/jwks` | GET | JWKS public key endpoint (used by Okta to verify tokens) |
| `/.well-known/ssf-configuration` | GET | SSF discovery document |

## Security Event Token (SET) Format

The app generates SETs following the CAEP specification using Okta's SSF event type for user risk changes:

```json
{
  "iss": "https://your-app.example.com",
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
- Tailwind CSS with Okta brand theme
- Inter font (via `next/font/google`)
- jose (JWT signing and JWKS)

## License

MIT
