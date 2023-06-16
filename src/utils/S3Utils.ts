import { CopyObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Object } from '../types/S3Object';

const fileToS3Object = (path: string, object: any): S3Object => {
  const name = object.Key.endsWith('/') ? object.Key.split('/').slice(-2, -1)[0] : object.Key.split('/').pop();

  return {
    etag: object.ETag,
    name,
    location: path.replace(/\/+$/, ''),
    lastModified: object.LastModified,
    versionId: object.VersionId,
    size: object.Size,
    isFolder: object.Key.endsWith('/'),
    owner: object.Owner,
    ext: name?.split('.').pop(),
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
      location: path.replace(/\/+$/, ''),
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
export const createFolder = async (client: S3Client, bucketName: string, path: string = '', folderName: string): Promise<boolean> => {
  const params = {
    Bucket: bucketName,
    Key: path ? `${path}/${folderName.trim()}/` : `${folderName.trim()}/`
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
 * Deletes a file or folder in the specified bucket.
 * If the object is a folder, all files and folders inside it will be deleted as well.
 *
 * @returns a boolean value indicating whether the file or folder was deleted successfully
 * @throws an error if the file or folder could not be deleted
 */
export const deleteFileOrFolder = async (client: S3Client, bucketName: string, object: S3Object): Promise<boolean> => {
  if (object.isFolder) {
    const params = {
      Bucket: bucketName,
      Prefix: `${object.location}${object.location ? '/' : ''}${object.name}`
    };

    try {
      const command = new ListObjectsV2Command(params);
      const response = await client.send(command);

      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: response.Contents?.map((content) => ({ Key: content.Key }))
        }
      };

      await client.send(new DeleteObjectsCommand(deleteParams));

      return true;
    } catch (error) {
      throw new Error('Error deleting folder: ' + error);
    }
  } else {
    const params = {
      Bucket: bucketName,
      Key: object.$raw.Key
    };

    try {
      const command = new DeleteObjectCommand(params);
      await client.send(command);

      return true;
    } catch (error) {
      throw new Error('Error deleting folder: ' + error);
    }
  }
};

/**
 * Renames a file or folder in the specified bucket.
 *
 * @returns a boolean value indicating whether the file or folder was renamed successfully
 */
export const renameFileOrFolder = async (client: S3Client, bucketName: string, object: S3Object, newName: string): Promise<boolean> => {
  const sourceParam = {
    Bucket: bucketName,
    Prefix: `${object.location}${object.location ? '/' : ''}${object.name}`
  };

  try {
    const command = new ListObjectsV2Command(sourceParam);
    const response = await client.send(command);

    const copyParams = response.Contents?.map((content) => {
      const sourceKey = `${object.location}${object.location ? '/' : ''}${object.name}`;
      const newKey = content.Key?.replace(sourceKey, `${object.location}${object.location ? '/' : ''}${newName}`);
      return {
        Bucket: bucketName,
        CopySource: `/${bucketName}/${content.Key}`,
        Key: newKey
      };
    });

    for (const param of copyParams!) {
      await client.send(new CopyObjectCommand(param));
    }

    await deleteFileOrFolder(client, bucketName, object);

    return true;
  } catch (error) {
    throw new Error('Error renaming folder: ' + error);
  }
};

/**
 * Fetch all folders and files at the specified path in the specified bucket.
 *
 * @returns an array of S3Object
 * @throws an error if the folders and files could not be fetched
 */
export const getFoldersAndFiles = async (client: S3Client, bucketName: string, path: string = ''): Promise<S3Object[]> => {
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

/**
 * Fetch all folders and files in the specified bucket.
 *
 * @returns an array of S3Object
 */
export const getAllFoldersAndFiles = async (client: S3Client, bucketName: string, path: string = ''): Promise<S3Object[]> => {
  const objects = await getFoldersAndFiles(client, bucketName, path);
  if (objects.length === 0) {
    return [];
  }

  const folders = objects.filter((object) => object.isFolder);
  for (const folder of folders) {
    const subObjects = await getAllFoldersAndFiles(client, bucketName, `${folder.location}${folder.location ? '/' : ''}${folder.name}/`);
    objects.push(...subObjects);
  }

  return objects;
};

export const searchFoldersAndFiles = async (client: S3Client, bucketName: string, query: string): Promise<S3Object[]> => {
  const objects = await getAllFoldersAndFiles(client, bucketName);
  if (objects.length === 0) {
    return [];
  }

  const results = objects.filter((object) => object.name.toLowerCase().includes(query.toLowerCase()));

  return results;
};

/**
 * Uploads a file to the specified bucket. Space before and after the file name will be trimmed.
 * If the file already exists, it will be overwritten.
 *
 * @returns a boolean value indicating whether the file was uploaded successfully
 * @throws an error if the file could not be uploaded
 */
export const uploadFile = async (client: S3Client, bucketName: string, path: string = '', file: File): Promise<boolean> => {
  const params = {
    Bucket: bucketName,
    Key: path ? `${path}/${file.name.trim()}` : `${file.name.trim()}`,
    Body: file,
    ContentType: file.type
  };

  try {
    const command = new PutObjectCommand(params);
    await client.send(command);

    return true;
  } catch (error) {
    throw new Error('Error uploading file: ' + error);
  }
};

/**
 * Downloads a file from the specified bucket.
 * If the file is a folder, it will not be downloaded.
 *
 * @returns a boolean value indicating whether the file was downloaded successfully
 */
export const downloadFile = async (getSignedUrl: (bucket: string, key: string, expires: number) => Promise<string>, bucketName: string, file: S3Object): Promise<boolean> => {
  if (file.isFolder) {
    console.error('Cannot download a folder');
    return false;
  }

  try {
    const url = await getSignedUrl(bucketName, file.$raw.Key, 60);

    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.name;
    link.click();

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
