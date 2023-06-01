import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Object } from '../types/S3Object';

const responseToS3Object = (response: any): S3Object => {
  const name = response.Key.endsWith('/') ? response.Key.split('/')[response.Key.split('/').length - 2] : response.Key.split('/')[response.Key.split('/').length - 1];

  return {
    etag: response.ETag,
    name,
    location: response.Key,
    lastModified: response.LastModified,
    versionId: response.VersionId,
    size: response.Size,
    isFolder: response.Key.endsWith('/'),
    owner: response.Owner,
    $raw: response
  };
};

/**
 * Creates a folder in the specified bucket. Space before and after the folder name will be trimmed.
 *
 * @returns a boolean value indicating whether the folder was created successfully
 * @throws an error if the folder could not be created
 */
export const createFolder = async (client: S3Client, bucketName: string, folderName: string, path: string = ''): Promise<boolean> => {
  const params = {
    Bucket: bucketName,
    Key: path + folderName.trim() + '/'
  };

  try {
    const command = new PutObjectCommand(params);
    await client.send(command);

    const folder = new GetObjectCommand(params);
    console.log(folder);
    return true;
  } catch (error) {
    throw new Error('Error creating folder: ' + error);
  }
};

/**
 * Deletes a folder in the specified bucket. Space before and after the folder name will be trimmed.
 *
 * @returns a boolean value indicating whether the folder was deleted successfully
 * @throws an error if the folder could not be deleted
 */
export const deleteFolder = async (client: S3Client, bucketName: string, folderName: string, path: string = ''): Promise<boolean> => {
  const params = {
    Bucket: bucketName,
    Key: path + folderName.trim() + '/'
  };

  try {
    const command = new DeleteObjectCommand(params);
    const response = await client.send(command);
    console.log(response);
    return true;
  } catch (error) {
    throw new Error('Error deleting folder: ' + error);
  }
};

/**
 * Renames a folder in the specified bucket. Space before and after the folder name will be trimmed.
 *
 * @returns a boolean value indicating whether the folder was renamed successfully
 * @throws an error if the folder could not be renamed
 */
export const renameFolder = async (client: S3Client, bucketName: string, folderName: string, newFolderName: string, path: string = ''): Promise<boolean> => {
  const copyParams = {
    Bucket: bucketName,
    CopySource: `${bucketName}/${folderName.trim() + '/'}`,
    Key: path + newFolderName.trim() + '/'
  };
  const deleteParams = {
    Bucket: bucketName,
    Key: path + folderName.trim() + '/'
  };

  try {
    const response0 = await client.send(new CopyObjectCommand(copyParams));
    const response1 = await client.send(new DeleteObjectCommand(deleteParams));
    console.log(response0);
    console.log(response1);
    return true;
  } catch (error) {
    throw new Error('Error renaming folder: ' + error);
  }
};

export const getFolders = async (client: S3Client, bucketName: string, path: string = ''): Promise<S3Object[]> => {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: path
  };

  try {
    const command = new ListObjectsV2Command(params);
    const response = await client.send(command);
    return response.CommonPrefixes!.map((folder: any) => responseToS3Object(folder));
  } catch (error) {
    throw new Error('Error getting folders: ' + error);
  }
};
