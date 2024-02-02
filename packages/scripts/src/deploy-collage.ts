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
const COLLAGE_PATH = 'land-grab-ii/dev/collage/dist/assets';

/**
 * Delete the previous build artifacts of the collage package.
 *
 * @param s3Client – The S3 client to use for deleting objects.
 */
const deleteBuild = async (s3Client: S3Client): Promise<void> => {
  try {
    // List all objects in the collage/dist/assets directory.
    const listObjectsCommand = new ListObjectsCommand({
      Bucket: 'grist',
      Prefix: COLLAGE_PATH
    });

    // Grab the contents and delete them in a single request.
    const { Contents } = await s3Client.send(listObjectsCommand);

    if (!Contents) {
      console.log(`No objects found at ${COLLAGE_PATH}. Moving on.`);
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

    console.log(`Successfully deleted objects at ${COLLAGE_PATH}.`);
  } catch (error) {
    console.error(
      `Failed to delete objects at ${COLLAGE_PATH}. Error: `,
      error
    );
  }
};

/**
 * Deploy the source code located at `packages/collage/dist/assets` to the
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

  console.log(`Deleting objects at ${COLLAGE_PATH}`);
  await deleteBuild(s3Client);

  const files = await fs.readdir(
    path.resolve(__dirname, '../../collage/dist/assets'),
    { recursive: true }
  );

  console.log(`Uploading build artifacts from packages/collage/dist/assets.`);
  for (const file of files) {
    if (path.extname(file) === '.js') {
      const Body = await fs.readFile(
        path.resolve(__dirname, '../../collage/dist/assets/', file)
      );
      const putObjectCommand = new PutObjectCommand({
        Bucket: 'grist',
        Key: `${COLLAGE_PATH}/${file}`,
        Body,
        ACL: 'public-read',
        ContentType: 'text/javascript'
      });

      try {
        const response = await s3Client.send(putObjectCommand);
        console.log(`Successfully uploaded ${file}`);
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
  }
};

main();
