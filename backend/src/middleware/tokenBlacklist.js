const revokedTokens = new Set();
const MAX_REVOKED_TOKENS = 10000;

export const revokeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return;
  }

  if (revokedTokens.size >= MAX_REVOKED_TOKENS) {
    const iterator = revokedTokens.values();
    for (let i = 0; i < MAX_REVOKED_TOKENS / 2; i++) {
      iterator.next();
      revokedTokens.delete(iterator.current);
    }
  }

  revokedTokens.add(token);
};

export const isTokenRevoked = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  return revokedTokens.has(token);
};
