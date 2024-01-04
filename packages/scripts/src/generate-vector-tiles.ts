import { exec } from 'node:child_process';
import path from 'node:path';

const files = [
  'data/processed/cessions.geojson',
  'data/processed/lars.geojson',
  'data/processed/parcels.geojson',
  'data/processed/tribe-parcel-links.geojson',
  'data/processed/university-parcel-links.geojson',
  'data/processed/townships.geojson'
];

/**
 * Generate PMTiles archives for a subset of GeoJSON datasets in data/processed.
 */
const main = async () => {
  for await (const file of files) {
    const name = path.parse(file).name;
    const outFile = file.replace('.geojson', '.pmtiles');
    const cmd = `tippecanoe -zg -o ${outFile} -l ${name} --extend-zooms-if-still-dropping --force ${file}`;
    console.log(`Generating PMTiles for ${file}.`);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Failed to convert input file ${file} to PMTiles.`, err);
        return;
      }

      console.log(stdout);
      console.error(stderr);
    });
  }
};

main();
