import requests
import re
from urllib.parse import urlparse
from .network_utils import get_ip_info

def detect_tech(target_url):
    """
    Detects technology stack of a target website using Passive Reconnaissance.
    Analyzes HTTP headers and HTML content patterns.
    """
    original_target = target_url
    if not target_url.startswith('http'):
        target_url = 'http://' + target_url

    results = {
        "server": None,
        "cms": None,
        "programming_language": None,
        "javascript_frameworks": [],
        "cdn": None,
        "others": [],
        "ip_info": {} # New field for IP/Geo info
    }

    try:
        # 0. Get IP & Geo Info (Passive/Active Hybrid)
        try:
            domain = urlparse(target_url).netloc
            # If netloc is empty (e.g. if user just typed "google.com" and we added http://), it should be fine
            if not domain:
                 domain = original_target
            
            # Remove port if present
            if ':' in domain:
                domain = domain.split(':')[0]

            ip_data = get_ip_info(domain)
            results['ip_info'] = {
                'ip': ip_data.get('dns', {}).get('resolved_ip') or domain,
                'country': ip_data.get('geoip', {}).get('country'),
                'city': ip_data.get('geoip', {}).get('city'),
                'isp': ip_data.get('geoip', {}).get('isp')
            }
        except Exception as e:
            results['ip_info'] = {'error': str(e)}

        # 1. Fetch Headers and Content
        # FIX: Tambahkan verify=False untuk menghindari SSL Error pada target tertentu
        # Disable insecure request warning agar log tidak penuh
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        response = requests.get(target_url, timeout=10, verify=False, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        headers = response.headers
        content = response.text.lower()

        # 2. Analyze Headers
        if 'Server' in headers:
            results['server'] = headers['Server']
        
        if 'X-Powered-By' in headers:
            powered_by = headers['X-Powered-By']
            if 'PHP' in powered_by:
                results['programming_language'] = 'PHP'
            elif 'ASP.NET' in powered_by:
                results['programming_language'] = 'ASP.NET'
            elif 'Express' in powered_by:
                results['javascript_frameworks'].append('Express.js')
            results['others'].append(f"Powered By: {powered_by}")

        # 3. Analyze Content (HTML) - CMS Detection
        # WordPress
        if 'wp-content' in content or '<meta name="generator" content="wordpress' in content:
            results['cms'] = 'WordPress'
        # Joomla
        elif 'joomla' in content or '<meta name="generator" content="joomla' in content:
            results['cms'] = 'Joomla'
        # Drupal
        elif 'drupal' in content or '<meta name="generator" content="drupal' in content:
            results['cms'] = 'Drupal'
        # Shopify
        elif 'shopify' in content:
            results['cms'] = 'Shopify'
        # Wix
        elif 'wix.com' in content:
            results['cms'] = 'Wix'

        # 4. JavaScript Frameworks
        if 'react' in content or 'data-reactroot' in content:
            results['javascript_frameworks'].append('React')
        if 'vue' in content or 'data-v-' in content:
            results['javascript_frameworks'].append('Vue.js')
        if 'ng-version' in content or 'angular' in content:
            results['javascript_frameworks'].append('Angular')
        if 'jquery' in content:
            results['javascript_frameworks'].append('jQuery')

        # 5. CDN Detection (Header or Content)
        if 'cf-ray' in headers or 'cloudflare' in content:
            results['cdn'] = 'Cloudflare'
        elif 'akamai' in headers or 'akamai' in content:
            results['cdn'] = 'Akamai'

        # Clean up
        if not results['javascript_frameworks']:
            results['javascript_frameworks'] = None
        else:
            results['javascript_frameworks'] = list(set(results['javascript_frameworks'])) # Unique

        return {
            "status": "success",
            "target": target_url,
            "data": results
        }

    except Exception as e:
        return {
            "status": "failed",
            "target": target_url,
            "error": str(e)
        }
