#!/bin/bash
# Setup script for testing environment

echo "Setting up Selenium testing environment..."

# Create necessary directories
mkdir -p logs
mkdir -p reports
mkdir -p screenshots

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please update with your credentials"
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with test credentials"
echo "2. Make sure your application is running on http://localhost:3001"
echo "3. Run: python run_tests.py"
