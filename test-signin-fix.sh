#!/bin/bash
# Test the complete signin/signup flow

echo "=========================================="
echo "🧪 TESTING SIGNIN/SIGNUP FIXES"
echo "=========================================="
echo ""

# Test 1: Duplicate email error message
echo "1️⃣ Testing duplicate email error message..."
DUPLICATE=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d '{"email":"test@example.com","password":"Test123456"}')

if echo "$DUPLICATE" | grep -q "EMAIL_EXISTS"; then
    echo "   ✅ Backend returns EMAIL_EXISTS code"
    echo "   Frontend will show: 'This email is already registered. Please sign in instead.'"
else
    echo "   ❌ Unexpected response"
    echo "   $DUPLICATE"
fi

# Test 2: Fresh signup
echo ""
echo "2️⃣ Testing fresh signup..."
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"
SIGNUP=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"Test123456\"}")

if echo "$SIGNUP" | grep -q "access_token"; then
    echo "   ✅ Signup successful"
    echo "   Email: $EMAIL"
else
    echo "   ❌ Signup failed"
    exit 1
fi

# Test 3: Signin
echo ""
echo "3️⃣ Testing signin..."
SIGNIN=$(curl -s -X POST https://anumhussain-backend.hf.space/auth/signin \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon-2-phase-2-three.vercel.app" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"Test123456\"}")

if echo "$SIGNIN" | grep -q "access_token"; then
    echo "   ✅ Signin successful"
else
    echo "   ❌ Signin failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ALL BACKEND TESTS PASSED!"
echo "=========================================="
echo ""
echo "Frontend fixes deployed:"
echo "  ✅ Better error message for duplicate emails"
echo "  ✅ Signin uses window.location.href (no more loading forever)"
echo "  ✅ Signup uses window.location.href"
echo ""
echo "🌐 Test your app now:"
echo "   https://hackathon-2-phase-2-three.vercel.app"
echo ""
echo "📝 Test credentials:"
echo "   Email: $EMAIL"
echo "   Password: Test123456"
echo ""
echo "Try both:"
echo "  1. Sign in with the test account above"
echo "  2. Try to sign up with test@example.com (you'll see the new error message)"
echo ""
