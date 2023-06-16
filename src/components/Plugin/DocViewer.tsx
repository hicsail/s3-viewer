import { Plugin } from '../../types/Plugin';
import { ReactNode, FC, useState, useEffect } from 'react';
import DocViewer, { IDocument } from '@cyntler/react-doc-viewer';
import { S3Object } from '../../types/S3Object';
import { useS3Context } from '../../contexts/s3-context';

export class DocViewPlugin implements Plugin {
  name: string;
  description: string;
  fileExtensions: string[];

  constructor() {
    this.name = 'Document Viewer';
    this.description = 'View images, PDFs, and Office Files';
    this.fileExtensions = ['bmp', 'csv', 'odt', 'doc', 'docx', 'gif', 'jpg', 'jpeg', 'pdf', 'png', 'ppt', 'pptx', 'tiff', 'txt', 'xls', 'xlsx'];
  }

  getView(object: S3Object): ReactNode {
    return <DocViewWrapper object={object} />;
  }
}

const DocViewWrapper: FC<{ object: S3Object }> = ({ object }) => {
  const { bucket, getSignedUrl } = useS3Context();
  const [docs, setDocs] = useState<IDocument[]>([]);

  useEffect(() => {
    const getURI = async () => {
      const uri = await getSignedUrl(bucket, object.$raw.Key, 60);
      setDocs([{ uri }]);
    };
    getURI();
  }, []);
  return <DocViewer documents={docs} />;
};
