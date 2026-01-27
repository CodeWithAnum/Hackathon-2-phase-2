#!/bin/bash
# Script to push backend updates to Hugging Face Space

echo "=========================================="
echo "Pushing Backend Updates to HF Space"
echo "=========================================="
echo ""

cd "phase-II/backend/hf-space" || exit 1

echo "Current status:"
git status
echo ""

echo "Commits to be pushed:"
git log origin/main..HEAD --oneline
echo ""

echo "=========================================="
echo "IMPORTANT: You need a Hugging Face token"
echo "=========================================="
echo ""
echo "1. Get your token from: https://huggingface.co/settings/tokens"
echo "2. Create a token with 'Write' access"
echo "3. Copy the token (starts with hf_...)"
echo ""
echo "Then run:"
echo "git push https://anumhussain:YOUR_HF_TOKEN@huggingface.co/spaces/anumhussain/backend main"
echo ""
echo "Replace YOUR_HF_TOKEN with your actual token"
echo ""
echo "=========================================="
