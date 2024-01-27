import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const GEOJSON_PATH = 'land-grab-ii/dev/data/geojson';

/**
 * Store GeoJSON files in the Grist DigitalOcean Spaces bucket, s3://grist.
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

  const geojsonSources = [
    { directory: 'processed', name: 'university-parcel-links' },
    { directory: 'processed', name: 'tribe-parcel-links' },
    { directory: 'processed', name: 'parcel-centroids-rewound' },
    { directory: 'raw', name: 'universities' },
    { directory: 'raw', name: 'states' },
    { directory: 'raw', name: 'us' }
  ];

  for (const geojsonSource of geojsonSources) {
    console.log(`Uploading ${geojsonSource.name}.geojson.`);

    const file = await fs.readFile(
      path.resolve(
        __dirname,
        `../data/${geojsonSource.directory}/${geojsonSource.name}.geojson`
      )
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'grist',
      Key: `${GEOJSON_PATH}/${geojsonSource.name}.geojson`,
      Body: file,
      ACL: 'public-read'
    });
    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${geojsonSource.name}.geojson`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
