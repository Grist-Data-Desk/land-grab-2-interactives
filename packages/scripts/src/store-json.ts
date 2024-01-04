import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const JSON_PATH = 'land-grab-ii/dev/data/json';

/**
 * Store JSON data in the Grist DigitalOcean Spaces bucket, s3://grist.
 */
const main = async () => {
  const s3Client = new S3Client({
    endpoint: 'https://nyc3.digitaloceanspaces.com/',
    forcePathStyle: false,
    region: 'nyc3',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET
    }
  });

  const jsonFiles = ['bounds-by-tribe'];

  for (const jsonFile of jsonFiles) {
    console.log(`Uploading ${jsonFile}.json`);

    const file = await fs.readFile(
      path.resolve(__dirname, `../data/processed/${jsonFile}.json`)
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'grist',
      Key: `${JSON_PATH}/${jsonFile}.json`,
      Body: file,
      ACL: 'public-read',
      ContentType: 'application/json'
    });
    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${jsonFile}.json`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
