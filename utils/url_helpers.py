from django.urls import reverse
from django.conf import settings


def get_full_api_url(request, url_name, *args, **kwargs):
    """
    Generate full API URL based on request and URL name with optional arguments
    """
    if not request:
        return None

    try:
        base_url = getattr(settings, 'FRONTEND_URL', None)
        if not base_url:
            base_url = request.build_absolute_uri('/')

        # Get the URL pattern using Django's reverse
        url_pattern = reverse(url_name, args=args, kwargs=kwargs)

        # Combine base URL with the URL pattern
        full_url = f"{base_url.rstrip('/')}/{url_pattern.lstrip('/')}"
        return full_url
    except Exception:
        return None
