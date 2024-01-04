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
    { directory: 'processed', name: 'sections-16-36' },
    { directory: 'processed', name: 'sections-other' },
    { directory: 'processed', name: 'territories-1790' },
    { directory: 'processed', name: 'territories-1800' },
    { directory: 'processed', name: 'territories-1810' },
    { directory: 'processed', name: 'territories-1820' },
    { directory: 'processed', name: 'territories-1830' },
    { directory: 'processed', name: 'territories-1840' },
    { directory: 'processed', name: 'territories-1850' },
    { directory: 'processed', name: 'territories-1860' },
    { directory: 'processed', name: 'territories-1870' },
    { directory: 'processed', name: 'territories-1880' },
    { directory: 'processed', name: 'territories-1890' },
    { directory: 'processed', name: 'territories-1900' },
    { directory: 'processed', name: 'territories-1910' },
    { directory: 'processed', name: 'territories-1920' },
    { directory: 'processed', name: 'university-parcel-links' },
    { directory: 'processed', name: 'tribe-parcel-links' },
    { directory: 'processed', name: 'parcel-centroids-rewound' },
    { directory: 'processed', name: 'texas-albers' },
    { directory: 'processed', name: 'tx-viz-parcels-smol-albers' },
    { directory: 'processed', name: 'us-albers' },
    { directory: 'raw', name: 'states' },
    { directory: 'raw', name: 'texas' },
    { directory: 'raw', name: 'tribes' },
    { directory: 'raw', name: 'tx-viz-parcels-smol' },
    { directory: 'raw', name: 'universities' },
    { directory: 'raw', name: 'us' },
    { directory: 'raw', name: 'wa-trust-lands' }
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
      ACL: 'public-read',
      ContentType: 'application/json'
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
