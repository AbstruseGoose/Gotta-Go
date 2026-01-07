#!/bin/bash

# GottaGo Quick Setup Script
# Run this after creating your GitHub repo

echo "🚽 GottaGo Setup Script"
echo "======================="
echo ""

# Check if git repo exists
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Initialize first with: git init"
    exit 1
fi

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Git remote already configured"
    git remote -v
else
    echo "📝 No git remote found."
    echo ""
    echo "Please create a GitHub repository first, then run:"
    echo "  git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git"
    echo ""
    read -p "Have you created a GitHub repo? Enter the URL (or press Enter to skip): " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote added: $REPO_URL"
    fi
fi

echo ""
echo "📦 Staging all files..."
git add .

echo ""
echo "💾 Creating commit..."
git commit -m "Initial commit - GottaGo bathroom finder app

Features:
- Next.js 16 with TypeScript and Tailwind CSS 4
- Supabase authentication (Email + Google OAuth)
- Interactive map with Mapbox
- Bathroom submissions with ratings
- Admin panel for moderation
- Mobile-responsive design"

echo ""
echo "📤 Pushing to GitHub..."
if git remote | grep -q origin; then
    git branch -M main
    git push -u origin main
    echo "✅ Code pushed to GitHub!"
else
    echo "⚠️  Skipping push - no remote configured"
    echo "   Run this after adding remote: git push -u origin main"
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/"
echo "2. Click 'Import Project'"
echo "3. Select your GitHub repository"
echo "4. Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo "5. Deploy!"
echo ""
echo "After deployment:"
echo "- Update Google OAuth callback URLs"
echo "- Sign in to your app"
echo "- Run SQL to make yourself admin"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
echo "=========================================="
