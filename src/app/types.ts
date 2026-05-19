export interface Signature {
  name: string;
  status: string;
  color: string;
}

export interface AnalysisResult {
  targetId: string;
  classification: string;
  threatLevel: string;
  threatColor: string;
  confidence: string;
  description: string;
  signatures: Signature[];
  origin: string;
  recommendations: string;
  ocrText?: string;
  potential?: string;
  safetyRadius?: string;
  radarCrossSection?: string;
  exifData?: {
    lat?: number;
    lon?: number;
    make?: string;
    model?: string;
    date?: string;
  };
}
