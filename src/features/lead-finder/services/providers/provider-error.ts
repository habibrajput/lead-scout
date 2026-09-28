/** An upstream platform (Google, Overpass, Reddit…) rejected or failed a request. */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
