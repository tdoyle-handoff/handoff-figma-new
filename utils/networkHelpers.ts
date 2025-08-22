// DEPRECATED: legacy network helpers removed. Use supabase-js directly.

export async function safeParseJson(_: Response): Promise<any> {
  return {};
}

export async function makeAuthRequest(): Promise<any> {
  throw new Error('Server auth fallback was removed. Use supabase-js directly.');
}
