export interface TranslateRequest {
  text: string;
  from: string;
  to: string;
}

export interface TranslateResult {
  success: boolean;
  data?: string;
  error?: string;
  detectedLang?: string;
}
