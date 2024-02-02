import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import {
  PutObjectCommand,
  DeleteObjectsCommand,
  S3Client,
  ListObjectsCommand
} from '@aws-sdk/client-s3';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const VIDEO_TOPPER_PATH = 'land-grab-ii/dev/video-topper/dist/assets';

/**
 * Delete the previous build artifacts of the video-topper package.
 *
 * @param s3Client – The S3 client to use for deleting objects.
 */
const deleteBuild = async (s3Client: S3Client): Promise<void> => {
  try {
    // List all objects in the video-topper/dist/assets directory.
    const listObjectsCommand = new ListObjectsCommand({
      Bucket: 'grist',
      Prefix: VIDEO_TOPPER_PATH
    });

    // Grab the contents and delete them in a single request.
    const { Contents } = await s3Client.send(listObjectsCommand);

    if (!Contents) {
      console.log(`No objects found at ${VIDEO_TOPPER_PATH}. Moving on.`);
      return;
    }

    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: 'grist',
      Delete: {
        Objects: Contents.map(({ Key }) => ({ Key })),
        Quiet: false
      }
    });

    await s3Client.send(deleteObjectsCommand);

    console.log(`Successfully deleted objects at ${VIDEO_TOPPER_PATH}.`);
  } catch (error) {
    console.error(
      `Failed to delete objects at ${VIDEO_TOPPER_PATH}. Error: `,
      error
    );
  }
};

/**
 * Derive the Content-Type header from the file extension.
 *
 * @param file — The name of the file on disk.
 */
const deriveContentType = (file: string): string => {
  const ext = path.extname(file);

  switch (ext) {
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    default:
      console.warn(`Attempting to upload file with unknown extension: ${ext}.`);
      break;
  }
};

/**
 * Deploy the source code located at `packages/video-topper/dist/assets` to the
 * Grist Digital Ocean Spaces bucket.
 */
const main = async (): Promise<void> => {
  const s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com/',
    forcePathStyle: false,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET
    }
  });

  console.log(`Deleting objects at ${VIDEO_TOPPER_PATH}`);
  await deleteBuild(s3Client);

  const files = await fs.readdir(
    path.resolve(__dirname, '../../video-topper/dist/assets'),
    { recursive: true }
  );

  console.log(
    `Uploading build artifacts from packages/video-topper/dist/assets.`
  );
  for (const file of files) {
    const Body = await fs.readFile(
      path.resolve(__dirname, '../../video-topper/dist/assets/', file)
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'grist',
      Key: `${VIDEO_TOPPER_PATH}/${file}`,
      Body,
      ACL: 'public-read',
      ContentType: deriveContentType(file)
    });

    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${file}`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
