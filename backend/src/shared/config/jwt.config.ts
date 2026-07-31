import jwt, {
  type Algorithm,
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";
import "dotenv/config";

type ExpiresIn = Exclude<SignOptions["expiresIn"], undefined>;

export class JwtConfig {
  private readonly secret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly expiresIn: ExpiresIn;
  private readonly algorithm: Algorithm;

  constructor() {
    this.secret = this.requireEnv("JWT_SECRET");
    this.issuer = this.requireEnv("JWT_ISSUER");
    this.audience = this.requireEnv("JWT_AUDIENCE");
    this.expiresIn = this.requireEnv("JWT_EXPIRES_IN") as ExpiresIn;
    this.algorithm = this.requireEnv("JWT_ALGORITHM") as Algorithm;
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not defined`);
    return value;
  }

  sign(payload: object): string {
    const options: SignOptions = {
      algorithm: this.algorithm,
      issuer: this.issuer,
      audience: this.audience,
      expiresIn: this.expiresIn,
    };

    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.secret, {
      algorithms: [this.algorithm],
      issuer: this.issuer,
      audience: this.audience,
    });
    if (typeof decoded === "string") {
      throw new Error("Unexpected JWT payload");
    }
    return decoded;
  }
}

export const jwtConfig = new JwtConfig();
