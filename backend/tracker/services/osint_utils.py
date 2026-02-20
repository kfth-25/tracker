import requests
import concurrent.futures

def check_username(username):
    """
    Checks if a username exists on popular social media platforms.
    """
    results = {}
    
    # List of platforms to check
    # Format: (Platform Name, URL Pattern, Check Type)
    # Check Type: 'status' (200=Found, 404=Not Found)
    
    platforms = [
        {
            "name": "Instagram",
            "url": f"https://www.instagram.com/{username}/",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "Facebook",
            "url": f"https://www.facebook.com/{username}/",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "Twitter / X",
            "url": f"https://twitter.com/{username}",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "GitHub",
            "url": f"https://github.com/{username}",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "TikTok",
            "url": f"https://www.tiktok.com/@{username}",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "YouTube",
            "url": f"https://www.youtube.com/@{username}",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "Telegram",
            "url": f"https://t.me/{username}",
            "check_type": "status", 
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "Pinterest",
            "url": f"https://www.pinterest.com/{username}/",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        },
        {
            "name": "Reddit",
            "url": f"https://www.reddit.com/user/{username}/",
            "check_type": "status",
            "headers": {"User-Agent": "Mozilla/5.0"}
        }
    ]

    def check_site(site):
        try:
            response = requests.get(site["url"], headers=site.get("headers", {}), timeout=5)
            exists = response.status_code == 200
            
            # Special cases
            if site["name"] == "TikTok" and response.status_code == 200:
                # TikTok sometimes returns 200 even if not found, need to check content
                if "Couldn't find this account" in response.text:
                    exists = False
            
            return {
                "platform": site["name"],
                "url": site["url"],
                "exists": exists,
                "status_code": response.status_code
            }
        except Exception as e:
            return {
                "platform": site["name"],
                "url": site["url"],
                "exists": False,
                "error": str(e)
            }

    # Use threading to speed up checks
    found_accounts = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_site = {executor.submit(check_site, site): site for site in platforms}
        for future in concurrent.futures.as_completed(future_to_site):
            result = future.result()
            if result["exists"]:
                found_accounts.append(result)

    return {
        "username": username,
        "found_count": len(found_accounts),
        "results": found_accounts
    }
