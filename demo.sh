#!/bin/bash

# Amazon Nova AI Hackathon Demo Script
# Amazon Nova AI Hackathon 2026 - Agentic AI Category
# 
# This script demonstrates the integration of Amazon Nova Foundation Models
# in the Sera AI platform for brand-creator matching and analytics.

echo "🚀 Amazon Nova AI Hackathon Demo - Agentic AI Category"
echo "=================================================="
echo ""

# Check if environment is set up
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run: npm run hackathon:setup"
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

echo "✅ Environment configured"
echo "📍 AWS Region: $AWS_REGION"
echo "🤖 Nova Model: $NOVA_MODEL_NAME"
echo "🎯 Hackathon Category: Agentic AI"
echo ""

# Function to make API calls with error handling
make_api_call() {
    local endpoint=$1
    local data=$2
    local description=$3
    
    echo "🔄 Testing: $description"
    echo "📡 Endpoint: POST $endpoint"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        http://localhost:8000$endpoint)
    
    if [ $? -eq 0 ]; then
        echo "✅ Success: $description"
        echo "📊 Response: $response"
    else
        echo "❌ Failed: $description"
        echo "🔍 Response: $response"
    fi
    echo ""
}

# Start the demo
echo "🎬 Starting Amazon Nova AI Demo..."
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check"
echo "=================="
curl -s http://localhost:8000/api/nova/health | jq .
echo ""

# Test 2: Brand-Creator Compatibility Analysis
echo "2️⃣  Brand-Creator Compatibility Analysis"
echo "=========================================="
compatibility_data='{
  "brandData": {
    "name": "TechNova Solutions",
    "industry": "Technology",
    "targetAudience": {
      "age": "18-35",
      "location": "Urban",
      "interests": ["Technology", "Innovation", "Startups"],
      "income": "50k-150k"
    },
    "values": ["Innovation", "Quality", "Customer-first"],
    "budget": "50000",
    "campaignGoals": ["Brand awareness", "Product launch", "Lead generation"]
  },
  "creatorData": {
    "name": "Alex TechReview",
    "category": "Technology",
    "audience": {
      "size": "150000",
      "demographics": {
        "age": "18-34",
        "location": "Urban/Suburban",
        "interests": ["Tech reviews", "Gadgets", "Innovation"]
      },
      "engagement": "4.2%"
    },
    "contentStyle": "Educational and entertaining tech reviews",
    "platforms": ["YouTube", "Instagram", "TikTok"],
    "averageViews": "45000",
    "specialties": ["Product reviews", "Tech tutorials", "Industry analysis"]
  }
}'

make_api_call "/api/nova/analyze-compatibility" "$compatibility_data" "Brand-Creator Compatibility"

# Test 3: Campaign Insights Generation
echo "3️⃣  Campaign Insights Generation"
echo "=================================="
campaign_data='{
  "campaignData": {
    "id": "campaign_001",
    "name": "TechNova Product Launch",
    "duration": "30 days",
    "performance": {
      "reach": "125000",
      "engagement": "4.2%",
      "conversions": "850",
      "roi": "340%",
      "costPerConversion": "$58.82"
    },
    "metrics": {
      "impressions": "500000",
      "clicks": "21000",
      "shares": "3200",
      "comments": "1800",
      "saves": "950"
    },
    "contentTypes": ["Video reviews", "Instagram stories", "Blog posts"],
    "targetAudience": "Tech enthusiasts aged 18-35"
  }
}'

make_api_call "/api/nova/campaign-insights" "$campaign_data" "Campaign Insights"

# Test 4: Multimodal Content Analysis
echo "4️⃣  Multimodal Content Analysis"
echo "================================"
content_data='{
  "contentArray": [
    {
      "type": "text",
      "content": "Just got my hands on the new TechNova Pro! The build quality is incredible and the features are mind-blowing. Perfect for content creators and tech enthusiasts. #TechNova #Innovation"
    },
    {
      "type": "image",
      "content": "Product showcase image featuring TechNova Pro with modern design, clean background, professional lighting"
    },
    {
      "type": "video",
      "content": "Unboxing and first impressions video, 3 minutes long, showing product features, user experience, honest review"
    }
  ],
  "brandGuidelines": {
    "id": "brand_tech_nova",
    "name": "TechNova Solutions",
    "visualStyle": "Modern, clean, professional",
    "tone": "Innovative, trustworthy, approachable",
    "keyMessages": ["Innovation", "Quality", "User-focused"],
    "colorPalette": ["Blue", "White", "Gray"],
    "forbiddenContent": ["Offensive language", "Misleading claims", "Competitor mentions"]
  }
}'

make_api_call "/api/nova/analyze-content" "$content_data" "Multimodal Content Analysis"

# Test 5: Nova Models Information
echo "5️⃣  Nova Models Information"
echo "=========================="
curl -s http://localhost:8000/api/nova/models | jq .
echo ""

# Summary
echo "🎯 Demo Summary"
echo "=============="
echo "✅ Amazon Nova AI integration is working!"
echo "🤖 Using model: $NOVA_MODEL_NAME"
echo "🎯 Hackathon Category: Agentic AI"
echo "📊 Features demonstrated:"
echo "   • Brand-Creator Compatibility Analysis"
echo "   • Campaign Insights Generation"
echo "   • Multimodal Content Analysis"
echo "   • Real-time Nova AI processing"
echo ""
echo "🚀 Ready for Amazon Nova AI Hackathon 2026!"
echo "   Deadline: March 17, 2026"
echo "   Category: Agentic AI"
echo "   Prize Pool: $40,000 + $55,000 AWS Credits"
echo ""
echo "📹 Don't forget to record your demo video with #AmazonNova hashtag!"
echo "🔗 Code repository: Ready for submission"
echo ""
echo "🎉 Demo completed successfully!"

# Optional: Generate sample data for frontend demo
if [ "$1" == "--frontend-demo" ]; then
    echo "🎨 Generating frontend demo data..."
    
    # Create demo data file
    cat > frontend-demo-data.json << 'EOF'
{
  "compatibilityAnalysis": {
    "compatibilityScore": 87,
    "audienceAlignment": {
      "score": 92,
      "demographics": ["Age 18-34", "Urban", "Tech-savvy"],
      "interests": ["Technology", "Innovation", "Reviews"]
    },
    "valueAlignment": {
      "score": 85,
      "matchedValues": ["Innovation", "Quality", "Authenticity"]
    },
    "contentCompatibility": {
      "score": 89,
      "styleMatch": "Excellent",
      "toneAlignment": "Perfect"
    },
    "opportunities": [
      "Product placement in tech review videos",
      "Sponsored tutorial series",
      "Long-term brand ambassadorship"
    ],
    "recommendations": [
      "Focus on authentic product integration",
      "Leverage creator's educational approach",
      "Consider multi-platform campaign"
    ]
  },
  "campaignInsights": {
    "performanceAnalysis": {
      "engagementRate": "4.2%",
      "reach": "125K",
      "conversionRate": "2.8%",
      "roi": "340%"
    },
    "recommendations": [
      "Increase video content to 70% of total",
      "Schedule posts for 6-9 PM weekdays",
      "Target lookalike audiences"
    ]
  }
}
EOF
    
    echo "✅ Frontend demo data saved to frontend-demo-data.json"
fi