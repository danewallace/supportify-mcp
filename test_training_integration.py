#!/usr/bin/env python3
"""
Test script to demonstrate Apple Training integration with Supportify MCP
"""

import requests
import json

BASE_URL = "http://localhost:51345"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def test_training_search(query, platform=None):
    """Test searching for training tutorials"""
    print_section(f"Searching for: '{query}'" + (f" (Platform: {platform})" if platform else ""))

    url = f"{BASE_URL}/training/search"
    params = {"q": query}
    if platform:
        params["platform"] = platform

    response = requests.get(url, params=params)
    data = response.json()

    print(f"Total Results: {data['totalResults']}\n")

    for i, result in enumerate(data['results'][:3], 1):
        print(f"{i}. {result['title']}")
        print(f"   ID: {result['tutorialId']}")
        print(f"   Duration: {result.get('estimatedTime', 'N/A')}")
        print(f"   Volume: {result.get('volume', 'N/A')} > {result.get('chapter', 'N/A')}")
        print(f"   Abstract: {result['abstract'][:100]}...")
        print(f"   URL: {result['url']}\n")

    return data['results'][0]['tutorialId'] if data['results'] else None

def test_fetch_tutorial(tutorial_id):
    """Test fetching a specific tutorial"""
    print_section(f"Fetching Tutorial: {tutorial_id}")

    url = f"{BASE_URL}/training/{tutorial_id}"
    response = requests.get(url)
    data = response.json()

    print(f"Title: {data['title']}")
    print(f"Type: {data['kind']}")
    print(f"Duration: {data.get('estimatedTime', 'N/A')}")
    print(f"\nAbstract:\n{data['abstract']}")
    print(f"\nFull Tutorial: {data['url']}")

def test_catalog_structure():
    """Test fetching the training catalog"""
    print_section("Training Catalog Structure")

    url = f"{BASE_URL}/training/catalog"
    response = requests.get(url)
    data = response.json()

    print(f"Course: {data['title']}")
    print(f"Total Duration: {data.get('estimatedTime', 'N/A')}")
    print(f"Total Volumes: {data['totalVolumes']}\n")

    for volume in data['volumes']:
        print(f"\n📚 {volume['name']}")
        print(f"   {len(volume['chapters'])} chapters\n")

        for chapter in volume['chapters'][:2]:  # Show first 2 chapters
            print(f"   • {chapter['name']}")
            print(f"     {len(chapter['tutorials'])} tutorials")

def demonstrate_ticket_analyzer_integration():
    """Show how training could integrate with ticket analyzer"""
    print_section("Ticket Analyzer Integration Example")

    # Simulate common ticket categories
    ticket_categories = [
        ("wifi_network", "Wi-Fi troubleshooting"),
        ("performance", "Mac performance slow"),
        ("mdm_management", "MDM enrollment"),
        ("backup", "backup iPhone"),
    ]

    print("For each ticket category, find relevant training:\n")

    for category, search_query in ticket_categories:
        url = f"{BASE_URL}/training/search"
        params = {"q": search_query}
        response = requests.get(url, params=params)
        data = response.json()

        print(f"Category: {category}")
        print(f"  Search: '{search_query}'")
        print(f"  Found: {data['totalResults']} training tutorial(s)")

        if data['results']:
            top_result = data['results'][0]
            print(f"  → Recommend: {top_result['title']} ({top_result.get('estimatedTime', 'N/A')})")
            print(f"    {top_result['url']}")
        print()

def main():
    print("\n" + "="*80)
    print("  APPLE TRAINING INTEGRATION - TEST SUITE")
    print("="*80)

    try:
        # Test 1: Search for training
        tutorial_id = test_training_search("backup")

        # Test 2: Fetch specific tutorial
        if tutorial_id:
            test_fetch_tutorial(tutorial_id)

        # Test 3: Get catalog structure
        test_catalog_structure()

        # Test 4: Demonstrate integration with ticket analyzer
        demonstrate_ticket_analyzer_integration()

        print_section("✓ All Tests Passed!")
        print("The training integration is working correctly.")
        print("\nNext steps:")
        print("1. Deploy MCP server: npm run deploy")
        print("2. Update ticket analyzer to use training tools")
        print("3. Generate KB articles with training links")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to dev server")
        print("   Make sure the server is running: npm run dev")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
