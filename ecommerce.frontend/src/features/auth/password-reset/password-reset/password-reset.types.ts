export interface TwofaStatusRequest {
  token: string;
}

export interface TwofaStatusResponse {
  isEnabled: boolean;
}