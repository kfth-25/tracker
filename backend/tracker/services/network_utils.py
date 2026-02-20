import socket
import json
import urllib.request
import urllib.error
import re

def is_valid_ip(target):
    try:
        socket.inet_aton(target)
        return True
    except socket.error:
        return False

def get_ip_info(target):
    """
    Get DNS, GeoIP, and RDAP info for a target (IP or Domain).
    """
    result = {
        "target": target,
        "type": "unknown",
        "dns": {},
        "geoip": {},
        "whois": {}
    }

    # 1. Identify Type & DNS Lookup
    ip_address = None
    if is_valid_ip(target):
        result["type"] = "IP Address"
        ip_address = target
        try:
            hostname, alias, addresslist = socket.gethostbyaddr(target)
            result["dns"]["hostname"] = hostname
            result["dns"]["aliases"] = alias
        except Exception as e:
            result["dns"]["error"] = str(e)
    else:
        result["type"] = "Domain"
        try:
            ip_address = socket.gethostbyname(target)
            result["dns"]["resolved_ip"] = ip_address
        except Exception as e:
            result["dns"]["error"] = f"Could not resolve domain: {str(e)}"
            return result # Cannot proceed without IP

    # 2. GeoIP Lookup (using ip-api.com - Free for non-commercial)
    if ip_address:
        try:
            with urllib.request.urlopen(f"http://ip-api.com/json/{ip_address}") as url:
                data = json.loads(url.read().decode())
                result["geoip"] = data
        except Exception as e:
            result["geoip"]["error"] = str(e)

    # 3. RDAP/Whois Lookup
    # Using open RDAP services
    try:
        # Determine endpoint based on type
        rdap_url = ""
        if result["type"] == "IP Address":
            rdap_url = f"https://rdap.arin.net/registry/ip/{target}" # Try ARIN first, they often redirect
            # Or use a unified one
            rdap_url = f"https://rdap.org/ip/{target}"
        else:
            rdap_url = f"https://rdap.org/domain/{target}"

        req = urllib.request.Request(
            rdap_url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        
        with urllib.request.urlopen(req) as url:
            data = json.loads(url.read().decode())
            # Simplify RDAP response for frontend
            whois_info = {}
            if 'events' in data:
                whois_info['events'] = data['events']
            if 'entities' in data:
                whois_info['entities'] = []
                for entity in data['entities']:
                    role = entity.get('roles', ['unknown'])[0]
                    handle = entity.get('handle', 'N/A')
                    whois_info['entities'].append(f"{role}: {handle}")
            
            if 'name' in data: whois_info['name'] = data['name']
            if 'handle' in data: whois_info['handle'] = data['handle']
            
            result["whois"] = whois_info
            result["whois"]["raw_source"] = rdap_url

    except Exception as e:
        result["whois"]["error"] = f"RDAP lookup failed: {str(e)}"

    return result
