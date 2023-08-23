import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { S3Object } from '../types/S3Object';

const fileToS3Object = async (client: S3Client, bucketName: string, path: string, object: any): Promise<S3Object> => {
  const name = object.Key.endsWith('/') ? object.Key.split('/').slice(-2, -1)[0] : object.Key.split('/').pop();
  let metadata: Record<string, string> = object.Metadata;
  if (!metadata) {
    const key = object.$raw ? object.$raw.Key : object.Key;
    const params = {
      Bucket: bucketName,
      Key: key
    };

    try {
      const command = new HeadObjectCommand(params);
      const response = await client.send(command);

      if (!response.Metadata?.id) {
        metadata = {
          id: uuid(),
          'upload-date': response.LastModified!.toISOString()
        };
        const success = await updateMetadata(client, bucketName, key, metadata);
        if (!success) {
          throw new Error('Error updating metadata');
        }
      } else {
        metadata = {
          id: response.Metadata.id,
          'upload-date': response.Metadata['upload-date']
        };
      }
    } catch (error) {
      throw new Error('Error getting file: ' + error);
    }
  }

  return {
    id: metadata.id,
    etag: object.ETag,
    name,
    location: path.replace(/\/+$/, ''),
    uploadDate: new Date(metadata['upload-date']),
    lastModified: object.LastModified,
    versionId: object.VersionId,
    size: object.Size ? object.Size : object.ContentLength,
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
      Prefix: `${object.location}${object.location ? '/' : ''}${object.name}/`
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
 * Fetches a file from the specified bucket.
 *
 * @returns an S3Object
 */
export const getFileByNameAndPath = async (client: S3Client, bucketName: string, path: string, name: string): Promise<S3Object> => {
  const params = {
    Bucket: bucketName,
    Key: `${path}${path ? '/' : ''}${name}`
  };

  try {
    const command = new HeadObjectCommand(params);
    const response = await client.send(command);

    return fileToS3Object(client, bucketName, path, { ...response, Key: `${path}${path ? '/' : ''}${name}` });
  } catch (error) {
    throw new Error('Error getting file: ' + error);
  }
};

/**
 * Fetches a file from the specified bucket.
 *
 * @returns an S3Object
 */
export const getFileByObject = async (client: S3Client, bucketName: string, object: S3Object): Promise<S3Object> => {
  const params = {
    Bucket: bucketName,
    Key: object.$raw.Key
  };

  try {
    const command = new HeadObjectCommand(params);
    const response = await client.send(command);

    return fileToS3Object(client, bucketName, object.location, { ...response, ...object.$raw });
  } catch (error) {
    throw new Error('Error getting file: ' + error);
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

    const filesPromises = content?.map(async (content) => {
      const file = await fileToS3Object(client, bucketName, path, content);
      return file;
    });

    const files = filesPromises ? await Promise.all(filesPromises) : [];

    return [...folders, ...files];
  } catch (error) {
    throw new Error('Error getting folders and files: ' + error);
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

/**
 * Fetch all folders and files in the specified bucket that match the specified query.
 *
 * @returns an array of S3Object
 */
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
    ContentType: file.type,
    Metadata: {
      id: uuid(),
      'upload-date': new Date().toISOString()
    }
  };

  try {
    const command = new PutObjectCommand(params);
    await client.send(command);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateMetadata = async (client: S3Client, bucketName: string, key: string, metadata: Record<string, string>): Promise<boolean> => {
  const params = {
    Bucket: bucketName,
    CopySource: `/${bucketName}/${key}`,
    Key: key,
    Metadata: metadata,
    MetadataDirective: 'REPLACE'
  };

  try {
    const command = new CopyObjectCommand(params);
    await client.send(command);

    const newMetaData = (await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }))).Metadata;
    for (const key of Object.keys(metadata)) {
      if (metadata[key] !== newMetaData?.[key]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
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
