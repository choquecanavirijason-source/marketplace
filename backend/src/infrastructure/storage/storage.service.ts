import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageConfig } from '../../config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = storageConfig.bucket;
    this.s3Client = new S3Client({
      endpoint: storageConfig.endpoint,
      region: storageConfig.region,
      credentials: storageConfig.credentials,
      forcePathStyle: storageConfig.forcePathStyle,
    });
  }

  /**
   * Optimiza y estandariza cualquier imagen a formato WebP moderno,
   * reduciendo significativamente su tamaño (hasta 80%) y aplicando auto-rotación EXIF.
   */
  async optimizeImage(
    inputBuffer: Buffer,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {},
  ): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
    const { maxWidth = 1200, maxHeight = 1200, quality = 85, format = 'webp' } = options;

    try {
      let pipeline = sharp(inputBuffer).rotate();

      if (maxWidth || maxHeight) {
        pipeline = pipeline.resize({
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      if (format === 'webp') {
        pipeline = pipeline.webp({ quality, effort: 4 });
        const buffer = await pipeline.toBuffer();
        return { buffer, mimeType: 'image/webp', extension: 'webp' };
      } else if (format === 'png') {
        pipeline = pipeline.png({ quality });
        const buffer = await pipeline.toBuffer();
        return { buffer, mimeType: 'image/png', extension: 'png' };
      } else {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        const buffer = await pipeline.toBuffer();
        return { buffer, mimeType: 'image/jpeg', extension: 'jpg' };
      }
    } catch (error: any) {
      this.logger.warn(
        `Error al optimizar imagen con sharp (${error.message}). Continuando con buffer original.`,
      );
      return {
        buffer: inputBuffer,
        mimeType: 'image/webp',
        extension: 'webp',
      };
    }
  }

  /**
   * Sube un Buffer de archivo directamente a AWS S3 / Cloudflare R2 / MinIO
   * y retorna la URL pública resultante.
   */
  async uploadBuffer(key: string, buffer: Buffer, mimeType = 'image/webp'): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      // Calcular URL pública
      let publicUrl: string;
      if (storageConfig.endpoint.includes('amazonaws.com')) {
        publicUrl = `https://${this.bucket}.s3.${storageConfig.region}.amazonaws.com/${key}`;
      } else {
        const cleanEndpoint = storageConfig.endpoint.replace(/\/$/, '');
        publicUrl = `${cleanEndpoint}/${this.bucket}/${key}`;
      }

      this.logger.log(`Archivo subido exitosamente a S3: ${key} -> ${publicUrl}`);
      return publicUrl;
    } catch (error: any) {
      this.logger.warn(
        `No se pudo conectar con S3 (${error.message}). Aplicando fallback de almacenamiento local...`,
      );

      // Fallback para entornos locales de desarrollo donde MinIO/S3 no esté levantado
      try {
        const localUploadsDir = path.resolve(process.cwd(), 'uploads', path.dirname(key));
        if (!fs.existsSync(localUploadsDir)) {
          fs.mkdirSync(localUploadsDir, { recursive: true });
        }
        const localFilePath = path.resolve(process.cwd(), 'uploads', key);
        fs.writeFileSync(localFilePath, buffer);
        this.logger.log(`Archivo guardado localmente en: ${localFilePath}`);
      } catch (fsError: any) {
        this.logger.error(`Error guardando archivo local: ${fsError.message}`);
      }

      // Si S3 no está disponible, retornar el Data URL optimizado para visualización inmediata
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
  }

  /**
   * Genera una Presigned URL para que el cliente suba directamente a S3
   */
  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds = 300,
  ): Promise<{ uploadUrl: string; s3Key: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    const cleanEndpoint = storageConfig.endpoint.replace(/\/$/, '');
    const publicUrl = storageConfig.endpoint.includes('amazonaws.com')
      ? `https://${this.bucket}.s3.${storageConfig.region}.amazonaws.com/${key}`
      : `${cleanEndpoint}/${this.bucket}/${key}`;

    return { uploadUrl, s3Key: key, publicUrl };
  }

  /**
   * Genera una URL presignada para descargar/visualizar archivos privados
   */
  async getPresignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Elimina un objeto de S3 por su clave
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error: any) {
      this.logger.warn(`Error al eliminar objeto de S3 (${key}): ${error.message}`);
    }
  }
}
