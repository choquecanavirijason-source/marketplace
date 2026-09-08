export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export const isPublishedStatus = (status: string): boolean => status === ProductStatus.PUBLISHED;
