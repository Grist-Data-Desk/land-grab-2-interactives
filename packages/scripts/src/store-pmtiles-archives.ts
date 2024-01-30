import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const PMTILES_PATH = 'land-grab-ii/dev/data/pmtiles';

/**
 * Store PMTiles archives in the Grist DigitalOcean Spaces bucket, s3://grist.
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

  const tilesets = [
    'lars',
    'parcels',
    'university-parcel-links',
    'tribe-parcel-links',
    'cessions',
    'townships'
  ];

  for (const tileset of tilesets) {
    console.log(`Uploading ${tileset}.pmtiles.`);

    const file = await fs.readFile(
      path.resolve(__dirname, `../data/processed/${tileset}.pmtiles`)
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'grist',
      Key: `${PMTILES_PATH}/${tileset}.pmtiles`,
      Body: file,
      ACL: 'public-read'
    });
    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${tileset}.pmtiles`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
