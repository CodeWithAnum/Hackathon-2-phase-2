#!/bin/bash
# One-Command Backend Deployment Script

echo "================================================"
echo "🚀 Backend Deployment to Hugging Face Space"
echo "================================================"
echo ""
echo "This will push the CORS fix to your backend."
echo ""

# Check if we're in the right directory
if [ ! -d "phase-II/backend/hf-space" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

cd phase-II/backend/hf-space

echo "📋 Changes to be deployed:"
git log origin/main..HEAD --oneline
echo ""

echo "================================================"
echo "🔑 Hugging Face Token Required"
echo "================================================"
echo ""
echo "1. Open: https://huggingface.co/settings/tokens"
echo "2. Click 'New token'"
echo "3. Name: 'Backend Deployment'"
echo "4. Access: Select 'Write'"
echo "5. Click 'Generate token'"
echo "6. Copy the token (starts with hf_...)"
echo ""

read -p "Enter your Hugging Face token: " HF_TOKEN

if [ -z "$HF_TOKEN" ]; then
    echo "❌ Error: Token cannot be empty"
    exit 1
fi

echo ""
echo "================================================"
echo "📤 Pushing to Hugging Face Space..."
echo "================================================"
echo ""

git push "https://anumhussain:${HF_TOKEN}@huggingface.co/spaces/anumhussain/backend" main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ SUCCESS! Backend deployed"
    echo "================================================"
    echo ""
    echo "⏳ The Space will rebuild automatically (1-2 minutes)"
    echo ""
    echo "📊 Check status: https://huggingface.co/spaces/anumhussain/backend"
    echo ""
    echo "🧪 After rebuild, test your app:"
    echo "   https://hackathon-2-phase-2-three.vercel.app"
    echo ""
    echo "✨ Your signin/signup should now work!"
    echo ""
else
    echo ""
    echo "================================================"
    echo "❌ ERROR: Push failed"
    echo "================================================"
    echo ""
    echo "Please check:"
    echo "  • Token has 'Write' access"
    echo "  • Token is valid and not expired"
    echo "  • Internet connection is working"
    echo ""
    echo "Alternative: Update via web interface"
    echo "  https://huggingface.co/spaces/anumhussain/backend/blob/main/src/main.py"
    echo ""
fi
