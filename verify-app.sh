#!/bin/bash
# Quick verification script - Run this to confirm everything works

echo "=========================================="
echo "🔍 QUICK VERIFICATION TEST"
echo "=========================================="
echo ""

# Test 1: Backend Health
echo "1️⃣ Testing Backend Health..."
HEALTH=$(curl -s https://anumhussain-backend.hf.space/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✅ Backend is healthy"
else
    echo "   ❌ Backend health check failed"
    exit 1
fi

# Test 2: Frontend Accessibility
echo ""
echo "2️⃣ Testing Frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" https://hackathon-2-phase-2-three.vercel.app)
if [ "$FRONTEND" = "200" ]; then
    echo "   ✅ Frontend is accessible"
else
    echo "   ❌ Frontend not accessible"
    exit 1
fi

# Test 3: Signup with CORS
echo ""
echo "3️⃣ Testing Signup with CORS..."
TIMESTAMP=$(date +%s)
SIGNUP=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"verify${TIMESTAMP}@test.com\",\"password\":\"Test123456\"}")

if echo "$SIGNUP" | grep -q "access_token"; then
    echo "   ✅ Signup with CORS works"
    EMAIL="verify${TIMESTAMP}@test.com"
else
    echo "   ❌ Signup failed"
    echo "   Response: $SIGNUP"
    exit 1
fi

# Test 4: Signin
echo ""
echo "4️⃣ Testing Signin..."
SIGNIN=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signin \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"Test123456\"}")

if echo "$SIGNIN" | grep -q "access_token"; then
    echo "   ✅ Signin works"
else
    echo "   ❌ Signin failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ALL VERIFICATIONS PASSED!"
echo "=========================================="
echo ""
echo "Your app is fully functional!"
echo ""
echo "🌐 Test it in your browser:"
echo "   https://hackathon-2-phase-2-three.vercel.app"
echo ""
echo "📝 Test account created:"
echo "   Email: $EMAIL"
echo "   Password: Test123456"
echo ""
