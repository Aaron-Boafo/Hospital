class ServerError implements Error {
  public message: string;
  public status: number;
  public data = {};
  public name = "ServerError";
  public isDev = process.env.NODE_ENV === "development";

  constructor(message: string, status: number) {
    this.message = message;
    this.status = status;
  }
}

export default ServerError;
