from django.urls import reverse
from .url_patterns import get_url_pattern


def get_full_api_url(request, url_name, *args, **kwargs):
    """
    Generate full API URL based on request and URL name with optional arguments
    """
    if not request:
        return None

    # Get the base URL (e.g., http://localhost:8000)
    base_url = request.build_absolute_uri('/')

    # Get the URL pattern from url_patterns.py
    url_pattern = get_url_pattern(kwargs.get('app_name', ''), url_name, **kwargs)

    # If no pattern is found, try to reverse the URL name directly
    if not url_pattern:
        try:
            url_pattern = reverse(url_name, args=args, kwargs=kwargs)
        except:
            return None

    # Combine base URL with the URL pattern
    full_url = f"{base_url.rstrip('/')}/{url_pattern.lstrip('/')}"
    return full_url


