import fs from 'fs';

import parseParameters from '../src/lib/openSCAD/parseParameter';

describe('testing parameter parsing of openscad scripts', () => {
  const testFixture = (path) => (fileName) => {
    if (fileName.endsWith('.scad')) {
      test(`testing ${fileName}`, () => {
        const script = fs.readFileSync(path + fileName, 'utf8');
        const parameters = parseParameters(script);
        expect(parameters).toMatchSnapshot(fileName);
      });
    }
  };

  const pathWithTestFixtures = [
    __dirname + '/fixtures/openSCAD/customizer/',
    __dirname + '/fixtures/openSCAD/',
  ];

  pathWithTestFixtures.forEach((path) => {
    fs.readdirSync(path).forEach(testFixture(path));
  });
});
