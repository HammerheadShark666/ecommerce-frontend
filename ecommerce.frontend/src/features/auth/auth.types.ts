export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  jwtToken?: string;
  pendingToken?: string;
  pendingTokenId?: string;
}