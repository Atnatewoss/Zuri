"""Simple in-memory rate limiter for abuse protection."""

import os
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(self):
        # We use a dictionary to track events per client/key
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """
        Check if the request is allowed under the sliding window rate limit.
        """
        now = time.time()
        bucket = self._events[key]

        # Clean up timestamps older than the window
        while bucket and bucket[0] <= now - window_seconds:
            bucket.popleft()

        # Check if the limit has been reached
        if len(bucket) >= max_requests:
            return False

        # Add the current request timestamp
        bucket.append(now)
        return True

# Initialize a global instance for general chat rate limiting
chat_rate_limiter = SlidingWindowRateLimiter()

