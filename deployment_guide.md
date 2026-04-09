# Deployment Guide: GitHub & Vercel

Follow these steps to host your Shopify Flagging Dashboard online.

## Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `shopify-flagging-dashboard`.
4. Keep it Public or Private (your choice) and click **Create repository**.
5. Copy the HTTPS/SSH URL of the repository.

## Step 2: Push Your Code
Open your terminal in the project directory (`c:\Users\aditya tyagi\OneDrive\Desktop\antigravity\saksham`) and run these commands:

```bash
# Replace <YOUR_REPO_URL> with the URL you copied
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import the `shopify-flagging-dashboard` repository.
4. Vercel will automatically detect Vite. Click **Deploy**.
5. Once finished, you will have a live URL!

---

**Note**: Your `large_sample_orders.csv` and `generate_sample.js` are ignored by git to keep your repository clean.
