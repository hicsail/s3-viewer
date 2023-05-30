import type { Meta, StoryObj } from '@storybook/react';
import { S3Viewer } from './S3Viewer';

const meta: Meta<typeof S3Viewer> = {
  title: 'S3 Viewer',
  component: S3Viewer,
};

export default meta;
type Story = StoryObj<typeof S3Viewer>;

export const Primary: Story = {
  render: () => <S3Viewer />,
};
