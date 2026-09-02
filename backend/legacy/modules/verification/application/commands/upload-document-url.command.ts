import { DocumentType } from '../../../../shared';

export class UploadDocumentUrlCommand {
  constructor(
    public readonly userId: string,
    public readonly documentType: DocumentType,
    public readonly mimeType: string,
    public readonly fileSizeBytes: number,
  ) {}
}
