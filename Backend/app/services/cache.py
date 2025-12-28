import time
from typing import Any, Dict, Optional

class InMemoryCache:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            item = self._cache[key]
            if item["expires_at"] > time.time():
                return item["value"]
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int):
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }

    def clear(self):
        self._cache.clear()

cache = InMemoryCache()