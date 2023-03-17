import { IsBoolean, IsEmail, IsInt, IsString, validate } from "class-validator";

// TODO convert to zod
export class EmailConfig {
  @IsString()
  public readonly host: string;

  @IsInt()
  public readonly port: number;

  @IsBoolean()
  public readonly useSsl: boolean;

  @IsEmail()
  public readonly user: string;

  @IsString()
  public readonly password: string;

  @IsString()
  public readonly myEmail: string;

  @IsString()
  public readonly fromAddress: string;

  @IsString()
  public readonly myName: string;

  constructor(env: {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USE_SSL?: string;
    SMTP_USERNAME?: string;
    SMTP_PASSWORD?: string;
    MY_EMAIL_ADDRESS?: string;
    FROM_ADDRESS?: string;
    MY_NAME?: string;
  }) {
    const separator = ",";
    if (!env.SMTP_PORT) {
      throw new Error("Missing env var");
    }
    // handled on higher level: we validate the object and can thus assume all values are defined. else we throw.
    this.host = env.SMTP_HOST!;
    this.port = Number.parseInt(env.SMTP_PORT, 10);
    this.useSsl = env.SMTP_USE_SSL !== "false";
    this.user = env.SMTP_USERNAME!;
    this.password = env.SMTP_PASSWORD!;
    this.myEmail = env.MY_EMAIL_ADDRESS!;
    this.fromAddress = env.FROM_ADDRESS!;
    this.myName = env.MY_NAME!;
  }
}

const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USE_SSL",
  "SMTP_USERNAME",
  "SMTP_PASSWORD",
  "MY_EMAIL_ADDRESS",
  "FROM_ADDRESS",
  "MY_NAME",
] as const;
export const getEmailConfig = async (
  env = process.env as {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USE_SSL?: string;
    SMTP_USERNAME?: string;
    SMTP_PASSWORD?: string;
    MY_EMAIL_ADDRESS?: string;
    FROM_ADDRESS?: string;
  }
) => {
  const cfg = new EmailConfig(env);
  const validation = await validate(cfg);
  if (validation.length > 0) {
    throw new Error(`Missing env var. Required: ${requiredEnvVars.join(", ")}`);
  }
  return cfg;
};
