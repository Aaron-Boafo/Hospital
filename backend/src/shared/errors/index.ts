export class ServerError extends Error {
  public readonly status: number;
  public readonly data: Record<string, unknown>;
  public readonly isDev: boolean;

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ServerError";
    this.status = status;
    this.data = data;
    this.isDev = process.env.NODE_ENV === "development";
  }
}
