import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression';

export default defineConfig({
  viewportHeight: 720,
  viewportWidth: 1280,
  e2e: {
    env: {
      visualRegression: {
        type: 'regression',
      },
    },
    baseUrl: 'http://localhost:8000',
    setupNodeEvents(on, config) {
      configureVisualRegression(on);

      require('cypress-terminal-report/src/installLogsPrinter')(on);

      return config;
    },
  },
  reporterEnabled: 'spec, junit',
  junitReporterOptions: {
    mochaFile: 'cypress/report-[hash].xml',
  },
});
