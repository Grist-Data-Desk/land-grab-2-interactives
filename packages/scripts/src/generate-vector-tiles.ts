import { exec } from 'node:child_process';
import path from 'node:path';

/**
 * Generate vector tile archives for a GeoJSON dataset.
 *
 * @param inFile – Path to the input GeoJSON file, relative to process.cwd().
 * @param format – The archive format to generate, either "mbtiles" or "pmtiles".
 */
const generateVectorTiles = async (
  inFile: string,
  format: 'mbtiles' | 'pmtiles'
) => {
  const name = path.parse(inFile).name;
  const outFile = inFile.replace('.geojson', `.${format}`);
  const cmd = `tippecanoe -zg -o ${outFile} -l ${name} --extend-zooms-if-still-dropping --force ${inFile}`;
  console.log(
    `Generating ${format.slice(0, 2).toUpperCase()}Tiles for ${inFile}.`
  );

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`Failed to convert input file ${inFile} to ${format}`, err);
      return;
    }

    console.log(stdout);
    console.error(stderr);
  });
};

/**
 * Generate vector tile archives for a subset of GeoJSON datasets in data/processed.
 */
const main = async () => {
  const files = [
    'data/processed/lars.geojson',
    'data/processed/parcels.geojson',
    'data/processed/tribe-parcel-links.geojson',
    'data/processed/university-parcel-links.geojson'
  ];

  for (const file of files) {
    await generateVectorTiles(file, 'mbtiles');
    await generateVectorTiles(file, 'pmtiles');
  }
};

main();
