const importUrls = [
  'https://www.printables.com/model/696887-random-hexagon-wall-panel',
  'https://www.thingiverse.com/thing:6196548', // Parametric pedestal by rlb408
  'https://www.thingiverse.com/thing:12856', // OpenSCAD Pirate Ship by MakerBlock
  'https://fossies.org/linux/privat/openscad-2021.01.src.tar.gz/openscad-2021.01/examples/Advanced/offset.scad?m=t', // Example for offset() usage in OpenSCAD by Torsten Paul
];

describe('editor', () => {
  it('can render simple cube', () => {
    cy.visit('/', {});

    cy.get('textarea').clear();
    cy.get('textarea').type('cube([100, 20, 20]);');
    cy.get('button').contains('Render').click();

    // Wait for the rendering to finish
    cy.get('button')
      .contains('Render')
      .find('span.MuiButton-startIcon')
      .should('not.exist');

    // And wait for another 1000ms to make sure the rendering of the canvas is finished too.
    cy.wait(1000);

    cy.compareSnapshot('editor', 0.1);
  });

  importUrls.forEach((url) => {
    it(`can render imported file ${url}`, () => {
      cy.intercept('/openscad.wasm').as('openscadWasm');

      cy.visit('/', {});

      cy.get('button[aria-label="menu"]').click();
      cy.get('li[role="menuitem"]').contains('Import from URL').click();

      cy.get('input[type="url"]').type(url);

      cy.get('button').contains('Import').click();

      // Wait for the wasm file to be loaded, which means the rendering has started.
      cy.wait('@openscadWasm', { timeout: 10000 });

      // Wait for the rendering to finish
      cy.get('button')
        .contains('Render')
        .find('span.MuiButton-startIcon')
        .should('not.exist');

      // And wait for another 500ms to make sure the rendering of the canvas is finished too.
      cy.wait(1000);

      cy.compareSnapshot(`editor-import-${sanitizeUrl(url)}`, 0.1);
    });
  });
});

function sanitizeUrl(url: string) {
  return url.replace('https://www.', '').replace(/[^a-zA-Z0-9]/g, '-');
}
