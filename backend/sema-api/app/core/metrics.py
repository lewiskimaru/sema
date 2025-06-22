"""
Prometheus metrics configuration
"""

from prometheus_client import Counter, Histogram


# Request metrics
REQUEST_COUNT = Counter(
    'sema_requests_total', 
    'Total requests', 
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'sema_request_duration_seconds', 
    'Request duration', 
    ['method', 'endpoint']
)

# Translation metrics
TRANSLATION_COUNT = Counter(
    'sema_translations_total', 
    'Total translations', 
    ['source_lang', 'target_lang']
)

CHARACTER_COUNT = Counter(
    'sema_characters_translated_total', 
    'Total characters translated'
)

# Error metrics
ERROR_COUNT = Counter(
    'sema_errors_total', 
    'Total errors', 
    ['error_type']
)
