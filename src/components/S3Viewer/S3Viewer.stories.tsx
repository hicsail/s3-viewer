import type { Meta, StoryObj } from '@storybook/react';
import { S3Viewer } from './S3Viewer';
import { S3Client } from '@aws-sdk/client-s3';

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

export const Primary: Story = (args: any) => <S3Viewer {...args} />;
Primary.args = {
  client: new S3Client({
    region: import.meta.env.VITE_TEST_BUCKET_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_TEST_AWS_KEY,
      secretAccessKey: import.meta.env.VITE_TEST_AWS_SECRET
    }
  }),
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
