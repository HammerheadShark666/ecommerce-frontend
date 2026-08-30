export interface TwofaEnrolementRequest {
  email: string;
}

export interface TwofaEnrolementResponse {
  qrCodeBase64: string;
  qtpAuthUri: string;
}

export interface VerifyTwofaRequest
{
  email: string;
  code: string;
}

export interface VerifyTwofaResponse
{
  method: string;
}

export interface RecoveryCodesRequest {
  email: string;
}

export interface RecoveryCodesResponse {
  recoveryCodes: string[];
}