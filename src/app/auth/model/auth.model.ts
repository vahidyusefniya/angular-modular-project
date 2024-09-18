export interface IToken {
  at_hash: string;
  aud: string;
  auth_time: number;
  cognito: any;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  identities: any;
  iss: string;
  jti: string;
  nonce: string;
  sub: string;
  token_use: string;
}
