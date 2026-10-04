# 🚀 Online Hosting & Deployment Guide

This repository is pre-configured for instant zero-configuration deployment on **Netlify**, **Render**, **Vercel**, and **Railway**.

---

## 1. Deploy on Netlify (Static Frontend + Serverless Functions)

1. Log into [Netlify.com](https://www.netlify.com).
2. Click **"Add new site"** → **"Import an existing project"** → select **GitHub**.
3. Select your repository: `climet`.
4. Netlify will automatically detect [`netlify.toml`](./netlify.toml) with all settings pre-filled:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
   - **Node version**: `22` (via `.nvmrc`)
5. *(Optional)* Under **Environment variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key for live AI Situation Reports.
6. Click **Deploy climet**!

---

## 2. Deploy on Render (Full-Stack Web Service - Recommended)

1. Log into [Render.com](https://render.com).
2. Click **"New +"** → **"Web Service"** → connect your GitHub repository.
3. Render automatically detects [`render.yaml`](./render.yaml):
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
5. Click **Create Web Service**. Your app will be live at `https://nercp-vijayawada-relief.onrender.com`!

---

## 3. Deploy on Vercel

1. Log into [Vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"** → import `vinayharsha08/climet`.
3. Vercel automatically detects [`vercel.json`](./vercel.json).
4. Add `GEMINI_API_KEY` under Environment Variables.
5. Click **Deploy**.

---

## 4. Run Locally (Localhost)

```bash
# 1. Install dependencies
npm install
npm run install:client

# 2. Build production assets
npm run build

# 3. Start full-stack platform
npm start
```
- Open **http://localhost:5000** in your browser.
- Responsive mobile & desktop interface works out-of-the-box!
