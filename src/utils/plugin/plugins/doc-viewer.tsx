import { Plugin } from '../plugin';
import { ReactElement, FC } from 'react';

export class DocViewPlugin implements Plugin {
  name: string;
  description: string;
  component: ReactElement;
  fileExtensions: string[];

  constructor() {
    this.name = 'Document Viewer';
    this.description = 'View images, PDFs, and Office Files';
    this.component = <DocViewComponent />;
    this.fileExtensions = ['bmp', 'csv', 'odt', 'doc', 'docx', 'gif', 'jpg',
                           'jpeg', 'pdf', 'png', 'ppt', 'pptx', 'tiff', 'txt',
                           'xls', 'xlsx'];
  }
}

const DocViewComponent: FC = () => {
  return <p>Hello</p>;
}
