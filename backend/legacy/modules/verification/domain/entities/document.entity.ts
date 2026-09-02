import { DocumentType } from '../../../../shared';

export interface DocumentProps {
  id: string;
  verificationId: string;
  documentType: DocumentType;
  s3Key: string;
  mimeType: string;
  fileSizeBytes: number;
  status: string;
  createdAt: Date;
}

export class DocumentEntity {
  private props: DocumentProps;

  constructor(props: DocumentProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get verificationId(): string { return this.props.verificationId; }
  get documentType(): DocumentType { return this.props.documentType; }
  get s3Key(): string { return this.props.s3Key; }
  get mimeType(): string { return this.props.mimeType; }
  get fileSizeBytes(): number { return this.props.fileSizeBytes; }
  get status(): string { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }

  toJSON() {
    return {
      id: this.id,
      verificationId: this.verificationId,
      documentType: this.documentType,
      s3Key: this.s3Key,
      mimeType: this.mimeType,
      fileSizeBytes: this.fileSizeBytes,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
