import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Object } from '../types/S3Object';

const fileToS3Object = (path: string, object: any): S3Object => {
  const name = object.Key.endsWith('/') ? object.Key.split('/').slice(-2, -1)[0] : object.Key.split('/').pop();

  return {
    etag: object.ETag,
    name,
    location: path,
    lastModified: object.LastModified,
    versionId: object.VersionId,
    size: object.Size,
    isFolder: object.Key.endsWith('/'),
    owner: object.Owner,
    $raw: object
  };
};

const folderToS3Object = async (client: S3Client, bucketName: string, path: string, object: any): Promise<S3Object> => {
  const params = {
    Bucket: bucketName,
    Key: object.Prefix
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await client.send(command);

    return {
      etag: response.ETag,
      name: object.Prefix.split('/').slice(-2, -1)[0],
      location: path,
      lastModified: response.LastModified!,
      versionId: response.VersionId,
      size: response.ContentLength ? response.ContentLength : 0,
      isFolder: true,
      $raw: response
    };
  } catch (error) {
    throw new Error('Error getting folders: ' + error);
  }
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
    await client.send(command);

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
    await client.send(new CopyObjectCommand(copyParams));
    await client.send(new DeleteObjectCommand(deleteParams));

    return true;
  } catch (error) {
    throw new Error('Error renaming folder: ' + error);
  }
};

export const getObjects = async (client: S3Client, bucketName: string, path: string = ''): Promise<S3Object[]> => {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: path
  };

  try {
    const command = new ListObjectsV2Command(params);
    const response = await client.send(command);

    const foldersPromises = response.CommonPrefixes?.map(async (content) => {
      const folder = await folderToS3Object(client, bucketName, path, content);

      return folder;
    });

    const folders = foldersPromises ? await Promise.all(foldersPromises) : [];
    const content = response.Contents?.filter((content) => content.Key !== path);
    const files = content?.map((content) => fileToS3Object(path, content)) ?? [];

    return [...folders, ...files];
  } catch (error) {
    throw new Error('Error getting folders: ' + error);
  }
};
