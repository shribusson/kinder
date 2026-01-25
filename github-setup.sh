#!/bin/bash
# GitHub Push Helper Script

echo "🚀 Kinder CRM - GitHub Setup"
echo "======================================"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "✅ Remote 'origin' already configured:"
    git remote get-url origin
    echo ""
    echo "To push to GitHub:"
    echo "  git push -u origin main"
else
    echo "📝 Configure your GitHub remote:"
    echo ""
    echo "Option 1 - SSH (recommended if you have SSH keys):"
    echo "  git remote add origin git@github.com:YOUR_USERNAME/kinder-crm.git"
    echo "  git push -u origin main"
    echo ""
    echo "Option 2 - HTTPS:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/kinder-crm.git"
    echo "  git push -u origin main"
    echo ""
fi

echo "======================================"
echo "📊 Current Status:"
echo "  Branch: $(git branch --show-current)"
echo "  Commits: $(git rev-list --count HEAD)"
echo "  Files: $(git ls-files | wc -l | tr -d ' ')"
echo "  Last commit: $(git log -1 --format='%h - %s')"
echo ""
echo "💡 Next Steps:"
echo "  1. Create repo on GitHub: https://github.com/new"
echo "  2. Name it: kinder-crm"
echo "  3. Don't initialize with README (we have one)"
echo "  4. Run the commands above"
echo ""
