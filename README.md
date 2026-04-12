# Bay College Decision Tool

An AI-powered college comparison tool built for Bay School college counselors and students. Add schools by name, Claude automatically researches and scores each one across 12 factors, and students can adjust weights, add personal ratings, and generate an AI narrative summary.

---

## File Structure

```
/
├── index.html                        # Full frontend (single file)
├── netlify.toml                      # Netlify routing config
├── package.json                      # Project metadata
├── README.md                         # This file
└── netlify/
    └── functions/
        └── claude-proxy.js           # Serverless proxy to Anthropic API
```

---

## Setup Instructions (Start to Finish)

### 1. Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it (e.g. `bay-college-decision-tool`)
4. Set it to **Private**
5. Click **Create repository**

### 2. Upload the Files

Upload the following files maintaining the exact folder structure:

| File | Location in repo |
|------|-----------------|
| `index.html` | root `/` |
| `netlify.toml` | root `/` |
| `package.json` | root `/` |
| `README.md` | root `/` |
| `claude-proxy.js` | `netlify/functions/` |

**To upload via GitHub web interface:**
1. Drag and drop `index.html`, `netlify.toml`, `package.json`, `README.md` into the root
2. For the proxy: click **Add file → Create new file**, type `netlify/functions/claude-proxy.js` as the filename (GitHub will auto-create the folders), then paste the contents

### 3. Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select your repository
5. Build settings are detected automatically from `netlify.toml` — leave everything as-is
6. Click **Deploy site**

### 4. Add Your Anthropic API Key

1. In Netlify: go to **Site configuration → Environment variables**
2. Click **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (starts with `sk-ant-...`)
5. Click **Save**
6. Go to **Deploys → Trigger deploy → Deploy site** to redeploy with the key active

### 5. Verify It Works

1. Open your Netlify site URL
2. Enter a student name and select an Academic Focus
3. Type a college name and click **Look up school**
4. The school should appear in the ranking panel within 10–15 seconds

---

## Features

- **12 AI-scored factors** per school including Learning Services and Academic Focus Match
- **Personalized scoring** — Academic Focus dropdown tailors program strength scores to the student's major
- **Factor weight sliders** with hover tooltips explaining each score's methodology
- **Custom factors** — add up to 3 family-defined factors with custom weights
- **Personal ratings** — students rate each school on gut feel (growth potential, comfort)
- **CSV upload** — batch-load schools from a simple names-only CSV
- **AI Narrative** — generates a counselor-style 2-paragraph summary of results
- **Download CSV** — full export with scores, explanations, weights, and ratings
- **Save as PDF** — clean print layout for sharing with family or counselors
- **Guided tour** — 10-step interactive walkthrough built into the tool

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |

---

## Notes

- No database or backend storage — all data lives in the browser session
- The Anthropic API key is never exposed to the browser — all API calls go through the Netlify serverless proxy
- AI-generated scores are approximations for comparison purposes only
- Always verify data directly with institutions before making college decisions
