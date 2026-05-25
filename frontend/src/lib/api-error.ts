export function getApiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;

  if (typeof message === 'string') return message;

  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === 'string').join(' ');
    if (joined) return joined;
  }

  if (message && typeof message === 'object') {
    const nested = (message as { message?: unknown }).message;

    if (typeof nested === 'string') return nested;
    if (Array.isArray(nested)) {
      const joined = nested.filter((item) => typeof item === 'string').join(' ');
      if (joined) return joined;
    }
  }

  return fallback;
}
