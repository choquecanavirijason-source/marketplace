import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { assetsTable } from '../../../../infrastructure/database/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateUploadSessionDto } from '../dto/assets.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async createUploadSession(userId: string | null, dto: CreateUploadSessionDto) {
    const storageKey = `uploads/${Date.now()}-${dto.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const url = `https://storage.ferromax.com/${storageKey}`;

    const [asset] = await this.drizzle.db
      .insert(assetsTable)
      .values({
        filename: dto.filename,
        originalName: dto.filename,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        url,
        storageKey,
        visibility: dto.visibility,
        status: 'active',
        uploadedByUserId: userId,
      })
      .returning();

    return {
      assetId: asset.id,
      uploadUrl: `https://upload.ferromax.com/presigned-put/${storageKey}`,
      publicUrl: asset.url,
      storageKey: asset.storageKey,
    };
  }

  async listAssets() {
    return this.drizzle.db
      .select()
      .from(assetsTable)
      .orderBy(desc(assetsTable.createdAt))
      .limit(50);
  }
}
