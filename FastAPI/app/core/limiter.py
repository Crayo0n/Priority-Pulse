import os
from slowapi import Limiter
from slowapi.util import get_remote_address

rate_limit = os.getenv("RATE_LIMIT", "5/minute")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[rate_limit],
    storage_uri="memory://"
)
