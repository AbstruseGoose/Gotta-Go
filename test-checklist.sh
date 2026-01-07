#!/bin/bash

# Quick Test Script - Run before deploying
# This tests auth locally to ensure everything works

echo "🚽 GottaGo - Quick Test Checklist"
echo "=================================="
echo ""
echo "Testing locally at http://localhost:3000"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Dev server not running!"
    echo "   Run: npm run dev"
    exit 1
fi

echo "✅ Dev server is running"
echo ""
echo "Manual test checklist:"
echo ""
echo "1. Authentication"
echo "   [ ] Click account menu (👤)"
echo "   [ ] Click 'Sign In'"
echo "   [ ] Try creating account with email"
echo "   [ ] Try signing in with email"
echo "   [ ] Try Google OAuth (may not work yet - that's OK)"
echo ""
echo "2. After sign-in:"
echo "   [ ] Profile shows in account menu"
echo "   [ ] Email shows correctly"
echo ""
echo "3. Make yourself admin:"
echo "   [ ] Go to Supabase SQL Editor"
echo "   [ ] Run: UPDATE user_profiles SET role = 'admin' WHERE email = 'YOUR@EMAIL.COM';"
echo "   [ ] Refresh app"
echo "   [ ] 'Admin Panel' option appears in menu"
echo ""
echo "4. Add bathroom:"
echo "   [ ] Click 'Add Bathroom' button"
echo "   [ ] Fill in details (must be signed in)"
echo "   [ ] Submit"
echo "   [ ] Should redirect to homepage"
echo "   [ ] New bathroom appears on map"
echo ""
echo "5. Check database:"
echo "   [ ] Go to Supabase → Database → bathrooms table"
echo "   [ ] Should see your new entry"
echo ""
echo "If all tests pass, you're ready to deploy! 🚀"
echo ""
echo "Next: ./deploy-setup.sh"
