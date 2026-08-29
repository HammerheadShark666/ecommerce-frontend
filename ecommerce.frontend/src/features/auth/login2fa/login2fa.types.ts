export interface Login2faRequest {
  email: string | null;
  pendingToken: string | null;
  pendingTokenId: string | null;
  code: string | null;
}

export interface Login2faResponse {
  jwtToken?: string;
}