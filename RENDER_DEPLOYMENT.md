# Telegram Downloader Bot - Deployment Guide

## Project Overview
This is a Node.js Telegram bot built with `node-telegram-bot-api` that provides Instagram and YouTube downloading services.

- **Entry Point**: `index.js`
- **Node Version**: >=16.0.0
- **Package Manager**: npm

## Environment Variables

### Required Variables
- `BOT_TOKEN` - Your Telegram bot token (get from @BotFather)

## Installation & Setup

### Local Development
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your BOT_TOKEN to .env
BOT_TOKEN=your_token_here

# Run the bot
npm start
```

### Project Structure
```
.
├── index.js                 # Main entry point
├── src/
│   ├── handlers.js          # Message handlers
│   ├── config/              # Configuration files
│   ├── services/            # Business logic
│   ├── sotuv/               # Product/menu management
│   ├── til/                 # Language support
│   └── utils/               # Utilities
├── data/                    # Data storage
├── package.json             # Dependencies
└── .env                     # Environment variables (NOT committed)
```

## Deployment on Render

### Step 1: Prepare Repository
```bash
git add .
git commit -m "fix render deployment"
git push
```

### Step 2: Create New Service on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: saveinstayutubetgbot
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid for better uptime)

### Step 3: Add Environment Variables
1. In Render dashboard, go to your service
2. Click "Environment"
3. Add variable:
   - **Key**: `BOT_TOKEN`
   - **Value**: Your Telegram bot token

### Step 4: Deploy
- Service will auto-deploy on every git push

## Dependencies

### Production
- **node-telegram-bot-api** (^0.61.0) - Telegram Bot API client
- **dotenv** (^16.5.0) - Environment variable loader

## Features

✅ Telegram bot polling (long polling for free services)
✅ Language support (Uzbek, Russian, English)
✅ Premium plans & subscription management
✅ Star-based payment system
✅ Admin integration
✅ Error handling & logging

## Important Notes for Render Deployment

1. **Free Tier Limitations**:
   - Free services auto-spin down after 15 minutes of inactivity
   - For continuous operation, upgrade to Paid tier
   
2. **Polling vs Webhooks**:
   - Current implementation uses polling (works on free tier)
   - For production, consider webhooks (requires paid tier + custom domain)

3. **Continuous Operation**:
   - Bot requires active Node process
   - Render free tier will put service to sleep → polling will stop
   - Upgrade to Paid for 24/7 operation

4. **File Storage**:
   - Data folder uses local storage (ephemeral on free tier)
   - Consider adding database for persistent data

## Troubleshooting

### Bot not responding
- Verify `BOT_TOKEN` is correct in Render Environment
- Check Render deployment logs
- Ensure polling is active in logs

### Service keeps crashing
- Check logs in Render dashboard
- Verify all dependencies installed: `npm install`
- Ensure Node version compatibility

### Environment variables not loaded
- Verify variable is set in Render dashboard
- Redeploy service after adding variables
- Check that `.env` is NOT in `.gitignore` for local testing (it IS committed to gitignore for security)

## Database Considerations

Currently data is stored in local JSON files. For production with multiple instances:
- Consider MongoDB or PostgreSQL
- Add database connection strings to environment variables

## Next Steps

1. Deploy to Render for first time
2. Monitor logs for errors
3. Upgrade to Paid tier if 24/7 uptime required
4. Add database layer if needed

---
**Last Updated**: 2026-06-17
**Status**: Ready for Render Deployment ✅
