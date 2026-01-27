#!/bin/bash

echo "=========================================="
echo "🧪 TESTING SIGNIN/SIGNUP FLOW"
echo "=========================================="
echo ""

# Generate unique email
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"
PASSWORD="Test123456"

echo "Test Email: $EMAIL"
echo "Test Password: $PASSWORD"
echo ""

echo "1️⃣ Testing SIGNUP..."
SIGNUP_RESPONSE=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

if echo "$SIGNUP_RESPONSE" | grep -q "access_token"; then
    echo "✅ SIGNUP SUCCESSFUL"
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo "❌ SIGNUP FAILED"
    echo "$SIGNUP_RESPONSE"
    exit 1
fi

echo ""
echo "2️⃣ Testing SIGNIN..."
SIGNIN_RESPONSE=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signin \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

if echo "$SIGNIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ SIGNIN SUCCESSFUL"
    TOKEN=$(echo "$SIGNIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ SIGNIN FAILED"
    echo "$SIGNIN_RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣ Testing TASKS API..."
TASKS_RESPONSE=$(curl -s -X GET "https://anumhussain-backend.hf.space/users/${USER_ID}/tasks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app")

if echo "$TASKS_RESPONSE" | grep -q "items"; then
    echo "✅ TASKS API WORKING"
    echo "   Response: $TASKS_RESPONSE"
else
    echo "❌ TASKS API FAILED"
    echo "$TASKS_RESPONSE"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ALL TESTS PASSED!"
echo "=========================================="
echo ""
echo "Your app is working correctly:"
echo "  • Signup: ✅"
echo "  • Signin: ✅"
echo "  • Tasks API: ✅"
echo ""
echo "🌐 Test it yourself:"
echo "   https://hackathon-2-phase-2-three.vercel.app"
echo ""
echo "📝 Test credentials:"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo ""
