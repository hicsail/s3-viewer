import type { Meta, StoryObj } from '@storybook/react';
import { S3Viewer } from './S3Viewer';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DocViewPlugin } from '../Plugin/DocViewer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileComment } from '../Plugin/FileComment';

const meta: Meta<typeof S3Viewer> = {
  title: 'S3 Viewer',
  component: S3Viewer,
  argTypes: {
    client: { control: false },
    bucket: { control: false },
    bucketDisplayedName: { control: 'text' },
    disableActions: { control: 'boolean' },
    disableRead: { control: 'boolean' },
    disableWrite: { control: 'boolean' },
    disableUpload: { control: 'boolean' },
    disablePreview: { control: 'boolean' },
    disableDelete: { control: 'boolean' },
    disableDownload: { control: 'boolean' },
    disableRename: { control: 'boolean' },
    disableCreateFolder: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<typeof S3Viewer>;

const s3Client = new S3Client({
  region: import.meta.env.VITE_TEST_BUCKET_REGION,
  endpoint: import.meta.env.VITE_TEST_ENDPOINT || undefined,
  forcePathStyle: import.meta.env.VITE_TEST_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: import.meta.env.VITE_TEST_AWS_KEY,
    secretAccessKey: import.meta.env.VITE_TEST_AWS_SECRET
  }
});

const s3PresignGetURL = (bucket: string, key: string, expires: number): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expires });
};

export const Primary: Story = (args: any) => <S3Viewer {...args} />;
Primary.args = {
  client: s3Client,
  getSignedUrl: s3PresignGetURL,
  plugins: [new DocViewPlugin(), new FileComment()],
  bucket: import.meta.env.VITE_TEST_BUCKET_NAME,
  bucketDisplayedName: 'Test Bucket',
  disableActions: false,
  disableRead: false,
  disableWrite: false,
  disableUpload: false,
  disablePreview: false,
  disableDelete: false,
  disableDownload: false,
  disableRename: false,
  disableCreateFolder: false
};
