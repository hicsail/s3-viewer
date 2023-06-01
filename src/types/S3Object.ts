export type S3Object = {
  etag?: string;
  name: string;
  location: string;
  lastModified: Date;
  versionId?: string;
  size: number;
  isFolder: boolean;
  ext?: string;
  owner: any;
  fileContent?: string;
  $raw: any;
};
