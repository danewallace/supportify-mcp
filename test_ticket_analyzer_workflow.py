#!/usr/bin/env python3
"""
Demonstrate how the ticket analyzer would use Apple Training integration
to enhance KB articles with official training content
"""

import requests
import json

BASE_URL = "http://localhost:51345"

def print_header(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def simulate_ticket_category_analysis():
    """
    Simulate the ticket analyzer identifying common issue categories
    and finding relevant training content for each
    """
    print_header("TICKET ANALYZER WORKFLOW: Training Integration")

    # These would come from analyze_tickets.py output
    ticket_categories = [
        {
            "category": "backup",
            "frequency": 12,
            "search_terms": ["backup", "restore", "icloud backup"]
        },
        {
            "category": "wifi_network",
            "frequency": 30,
            "search_terms": ["wifi", "network", "connectivity"]
        },
        {
            "category": "performance",
            "frequency": 23,
            "search_terms": ["performance", "slow", "diagnostics"]
        },
        {
            "category": "mdm_management",
            "frequency": 18,
            "search_terms": ["mdm", "enrollment", "device management"]
        },
        {
            "category": "login_issue",
            "frequency": 15,
            "search_terms": ["password", "login", "keychain"]
        }
    ]

    enhanced_kb_data = []

    for category in ticket_categories:
        print(f"📊 Category: {category['category']} ({category['frequency']} tickets)")
        print(f"   Searching training for: {category['search_terms']}\n")

        training_links = []

        # Try each search term
        for term in category['search_terms']:
            url = f"{BASE_URL}/training/search"
            params = {"q": term}
            response = requests.get(url, params=params)
            data = response.json()

            if data['results']:
                for result in data['results'][:2]:  # Top 2 per search term
                    if result not in training_links:
                        training_links.append({
                            'title': result['title'],
                            'url': result['url'],
                            'duration': result.get('estimatedTime', 'N/A'),
                            'chapter': f"{result.get('volume', 'N/A')} > {result.get('chapter', 'N/A')}"
                        })

        if training_links:
            print(f"   ✅ Found {len(training_links)} relevant training tutorial(s):\n")
            for link in training_links[:3]:  # Show top 3
                print(f"   • {link['title']}")
                print(f"     Duration: {link['duration']}")
                print(f"     Location: {link['chapter']}")
                print(f"     URL: {link['url']}\n")
        else:
            print(f"   ⚠️  No training found (will use general troubleshooting guides)\n")

        enhanced_kb_data.append({
            'category': category['category'],
            'frequency': category['frequency'],
            'training_resources': training_links
        })

        print()

    return enhanced_kb_data

def generate_sample_kb_article(category_data):
    """
    Generate a sample KB article section with training resources
    """
    print_header("SAMPLE KB ARTICLE SECTION")

    category = category_data['category']
    frequency = category_data['frequency']
    training = category_data['training_resources']

    print(f"# How to Resolve {category.replace('_', ' ').title()} Issues on macOS\n")
    print(f"**Based on analysis of {frequency} support tickets**\n")
    print("## Quick Resolution Steps\n")
    print("[Quick steps would go here from Apple Support Guide...]\n")
    print("## Official Apple Training Resources\n")
    print("For in-depth learning on this topic, Apple provides the following ")
    print("official training tutorials:\n")

    if training:
        for i, resource in enumerate(training[:3], 1):
            print(f"{i}. **[{resource['title']}]({resource['url']})**")
            print(f"   - Duration: {resource['duration']}")
            print(f"   - Course Section: {resource['chapter']}\n")
    else:
        print("*No specific training tutorials available for this category.*\n")
        print("Refer to the Apple Platform Deployment Guide for general best practices.\n")

    print("## When to Escalate\n")
    print("[Escalation criteria...]\n")
    print("---\n")
    print(f"💡 **Tip**: Complete the training tutorial{'' if len(training) == 1 else 's'} above ")
    print("to build expertise in resolving these issues efficiently.\n")

def main():
    print("\n" + "="*80)
    print("  TICKET ANALYZER + APPLE TRAINING INTEGRATION DEMO")
    print("="*80)
    print("\nThis demonstrates how the ticket analyzer would:")
    print("1. Identify common ticket categories")
    print("2. Search for relevant Apple training content")
    print("3. Generate KB articles with training links\n")

    try:
        # Step 1: Analyze tickets and find training
        enhanced_data = simulate_ticket_category_analysis()

        # Step 2: Generate sample KB article with training
        backup_category = next((x for x in enhanced_data if x['category'] == 'backup'), None)
        if backup_category:
            generate_sample_kb_article(backup_category)

        print_header("✓ Integration Test Complete")
        print("The ticket analyzer can now:")
        print("  ✅ Search Apple training by topic")
        print("  ✅ Find relevant tutorials for each ticket category")
        print("  ✅ Generate KB articles with training links")
        print("  ✅ Provide help desk staff with official Apple education\n")

        print("Real-world impact:")
        print("  • Help desk staff get official Apple training links")
        print("  • KB articles include authoritative learning resources")
        print("  • Support team builds expertise through structured training")
        print("  • Ticket deflection through better-trained support staff\n")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to dev server")
        print("   Make sure the server is running: npm run dev")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
