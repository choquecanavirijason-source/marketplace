import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { env } from '../../../../config/env-schema';

export interface ChallengeResponse {
  challenge: 'blink_twice' | 'blink_once' | 'turn_head' | 'none';
  instruction: string;
  nonce: string;
  expires_at: string;
}

export interface VerifyAccepted {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  sha256_id?: string;
  sha256_video?: string;
}

export interface VerifyResult {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  decision: 'APPROVE' | 'REVIEW' | 'REJECT' | null;
  similarity: number | null;
  distance?: number | null;
  threshold?: number | null;
  liveness_score: number | null;
  challenge_passed: boolean | null;
  deepfake_suspicious?: boolean | null;
  model?: string | null;
  receipt_hash?: string | null;
  receipt_signature?: string | null;
  reason?: string | null;
  created_at?: string | null;
  finished_at?: string | null;
}

export interface SubmitVerificationParams {
  contractId: string;
  challenge: string;
  nonce: string;
  idImageBuffer: Buffer;
  idImageMimeType?: string;
  selfieVideoBuffer: Buffer;
  selfieVideoMimeType?: string;
}

@Injectable()
export class BiometricalVerifyAdapter {
  private readonly logger = new Logger(BiometricalVerifyAdapter.name);
  private readonly baseUrl = env.BIOMETRICAL_VERIFY_URL.replace(/\/+$/, '');
  private readonly jwtSecret = env.BIOMETRICAL_VERIFY_JWT_SECRET || '';

  private generateAuthToken(): string | null {
    if (!this.jwtSecret) return null;
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'marketplace-backend',
        iss: 'biometrical',
        aud: 'biometrical-verify',
        iat: now,
        exp: now + 3600,
      }),
    ).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.generateAuthToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getChallenge(): Promise<ChallengeResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/verify/challenge`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return (await response.json()) as ChallengeResponse;
    }

    const errorText = await response.text();
    this.logger.error(`El VPS devolvió estado HTTP ${response.status} al solicitar challenge: ${errorText}`);
    // El nonce debe quedar persistido en el VPS para que /verify/submit lo valide
    // (anti-replay). Inventar uno local aquí produce jobs que el VPS rechaza
    // silenciosamente más adelante, así que es mejor fallar de forma explícita.
    throw new Error(`No se pudo obtener un challenge válido del servicio biométrico (${response.status}).`);
  }

  async submitVerification(params: SubmitVerificationParams): Promise<VerifyAccepted> {
    try {
      const formData = new FormData();
      formData.append('contract_id', params.contractId);
      formData.append('challenge', params.challenge);
      formData.append('nonce', params.nonce);

      const idBlob = new Blob([new Uint8Array(params.idImageBuffer)], {
        type: params.idImageMimeType || 'image/jpeg',
      });
      formData.append('id_image', idBlob, 'document_id.jpg');

      const videoBlob = new Blob([new Uint8Array(params.selfieVideoBuffer)], {
        type: params.selfieVideoMimeType || 'video/webm',
      });
      formData.append('selfie_video', videoBlob, 'selfie_challenge.webm');

      const token = this.generateAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/verify/submit`, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(15000),
      });

      if (response.status === 202 || response.ok) {
        const data = (await response.json()) as VerifyAccepted;
        this.logger.log(`Verificación enviada al VPS exitosamente. Job ID: ${data.job_id}`);
        return data;
      }

      const errorText = await response.text();
      if (response.status === 401) {
        this.logger.error(
          `El VPS requiere autenticación (401). Debes configurar BIOMETRICAL_VERIFY_JWT_SECRET en backend/.env con el JWT_SECRET de tu VPS.`,
        );
        throw new Error(
          'Error de autenticación con el servidor de biometría VPS (401: Falta o es inválido BIOMETRICAL_VERIFY_JWT_SECRET).',
        );
      }

      this.logger.error(`El VPS Biometrical Verify respondió con error ${response.status}: ${errorText}`);
      throw new Error(`Error en el servicio biométrico del VPS (${response.status}): ${errorText || response.statusText}`);
    } catch (err: any) {
      this.logger.error(`Fallo al enviar verificación al VPS: ${err.message}`);
      throw err;
    }
  }

  async getVerification(jobId: string): Promise<VerifyResult> {
    try {
      const token = this.generateAuthToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/verify/${jobId}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        return (await response.json()) as VerifyResult;
      }

      const errorText = await response.text();
      this.logger.error(`Error al consultar job ${jobId} en VPS: ${errorText}`);
      throw new Error(`Error en servicio biométrico: ${response.statusText}`);
    } catch (err: any) {
      this.logger.error(`Excepción al consultar status de verificación ${jobId}: ${err.message}`);
      throw err;
    }
  }
}
