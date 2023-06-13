import { Plugin } from '../plugin';
import { ReactNode, FC, useState, useEffect } from 'react';
import DocViewer, { IDocument } from '@cyntler/react-doc-viewer';
import { S3Object } from '../../../types/S3Object';
import { useS3Context } from '../../../contexts/s3-context';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {GetObjectCommand} from '@aws-sdk/client-s3';

export class DocViewPlugin implements Plugin {
  name: string;
  description: string;
  fileExtensions: string[];

  constructor() {
    this.name = 'Document Viewer';
    this.description = 'View images, PDFs, and Office Files';
    this.fileExtensions = ['bmp', 'csv', 'odt', 'doc', 'docx', 'gif', 'jpg',
                           'jpeg', 'pdf', 'png', 'ppt', 'pptx', 'tiff', 'txt',
                           'xls', 'xlsx'];
  }

  getView(object: S3Object): ReactNode {
    return <DocViewWrapper object={object} />;
  }
}

const DocViewWrapper: FC<{ object: S3Object }> = ({ object }) => {
  const { client, bucket } = useS3Context();
  const [docs, setDocs] = useState<IDocument[]>([]);

  useEffect(() => {
    const getURI = async () => {
      const objCmd = new GetObjectCommand({ Bucket: bucket, Key: object.$raw.Key });
      const obj = await client.send(objCmd);
      console.log(obj);

      const uri = await getSignedUrl(client, objCmd);
      console.log(uri);
      setDocs([{ uri }]);
    };
    getURI();
  }, []);
  return (
    <DocViewer documents={docs} />
  );
};
