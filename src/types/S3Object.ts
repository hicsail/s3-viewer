export type S3Object = {
  id?: string;
  etag?: string;
  name: string;
  location: string;
  uploadDate?: Date;
  lastModified: Date;
  versionId?: string;
  size: number;
  isFolder: boolean;
  ext?: string;
  owner?: any;
  fileContent?: string;
  $raw: any;
};

export type Metadata = {
  [key: string]: string;
};
