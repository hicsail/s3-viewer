import { ReactNode } from 'react';
import { S3Object } from '../../types/S3Object';
import { Plugin } from '../../types/Plugin';

export class FileComment implements Plugin {
  name: string;
  description: string;
  fileExtensions: string[];

  constructor() {
    this.name = 'Comment';
    this.description = 'Comment on documents';
    this.fileExtensions = ['bmp', 'csv', 'odt', 'doc', 'docx', 'gif', 'jpg', 'jpeg', 'pdf', 'png', 'ppt', 'pptx', 'tiff', 'txt', 'xls', 'xlsx'];
  }

  getView(_object: S3Object): ReactNode {
    return <></>;
  }
}
