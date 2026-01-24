# Hugging Face Space Deployment Guide

## Quick Deployment Steps

### Method 1: Git Push to Hugging Face (Recommended)

1. **Clone your HF Space repository:**
```bash
cd phase-II/backend
git clone https://huggingface.co/spaces/anumhussain/backend hf-space
cd hf-space
```

2. **Copy all backend files:**
```bash
# Copy from parent backend directory
cp ../README.md .
cp ../Dockerfile .
cp ../app.py .
cp ../requirements.txt .
cp ../alembic.ini .
cp -r ../src .
cp -r ../alembic .
```

3. **Commit and push:**
```bash
git add .
git commit -m "Deploy FastAPI backend to HF Space"
git push
```

### Method 2: Web Interface Upload

1. Go to: https://huggingface.co/spaces/anumhussain/backend
2. Click "Files" tab
3. Click "Add file" → "Upload files"
4. Upload these files/folders:
   - README.md (must have YAML header)
   - Dockerfile
   - app.py
   - requirements.txt
   - alembic.ini
   - src/ (entire folder)
   - alembic/ (entire folder)

### Environment Variables (Required)

Go to Settings → Repository secrets and add:

```
DATABASE_URL=postgresql://neondb_owner:npg_9FGMa6lBfgWq@ep-bold-cloud-ahbqu5uz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_HOURS=168
BCRYPT_ROUNDS=12
DEBUG=false
LOG_LEVEL=info
API_HOST=0.0.0.0
API_PORT=7860
```

### After Deployment

Your backend will be available at:
- **API Base URL:** https://anumhussain-backend.hf.space
- **API Docs:** https://anumhussain-backend.hf.space/docs
- **Health Check:** https://anumhussain-backend.hf.space/health

### Frontend Configuration

✅ Already configured! Your Vercel frontend is set to use:
`NEXT_PUBLIC_API_URL=https://anumhussain-backend.hf.space`

## Troubleshooting

If the space doesn't start:
1. Check the "Logs" tab in HF Space
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct
4. Check that port 7860 is specified in README.md header
