import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression';

export default defineConfig({
  e2e: {
    env: {
      visualRegression: {
        type: 'regression',
      },
    },
    baseUrl: 'http://localhost:8000',
    setupNodeEvents(on) {
      configureVisualRegression(on);
    },
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/report-[hash].xml',
  },
});
