const importUrls = [
  // TODO: Test for printables doesn't work in headless mode
  // 'https://www.printables.com/model/696887-random-hexagon-wall-panel',

  // TODO: Fix thingiverse.com fetcha
  // 'https://www.thingiverse.com/thing:6196548', // Parametric pedestal by rlb408
  // 'https://www.thingiverse.com/thing:12856', // OpenSCAD Pirate Ship by MakerBlock
  'https://fossies.org/linux/privat/openscad-2021.01.src.tar.gz/openscad-2021.01/examples/Advanced/offset.scad?m=t', // Example for offset() usage in OpenSCAD by Torsten Paul
];

describe('editor', () => {
  it('can render simple cube', () => {
    cy.visit('/', {});

    // Wait for initial rendering to finish
    cy.get('button')
      .contains('Render')
      .find('span.MuiButton-startIcon')
      .should('not.exist');

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

  it('can render text through customizer', () => {
    cy.intercept(
      /https:\/\/codeload.github.com\/shantigilbert\/liberation-fonts-ttf\/zip\/refs\/heads\/master/
    ).as('liberationFonts');

    cy.visit('/', {});

    // Wait for initial rendering to finish
    cy.get('button')
      .contains('Render')
      .find('span.MuiButton-startIcon')
      .should('not.exist');

    cy.get('textarea').clear();
    cy.get('textarea').type(
      'mytext = "Hello World";\n\nlinear_extrude() text(mytext);'
    );
    cy.get('button').contains('Render').click();

    cy.wait(1000);

    // Expect that the console has an error with "WARNING: Can't get font"
    cy.get('[data-testid=console] pre').should(
      'contain',
      "WARNING: Can't get font"
    );

    // Go to the fonts tab
    cy.get('button[aria-label="Fonts"]').click();

    // Click the download button for the Liberation fonts
    cy.get(
      'button[data-trim-from-start-path="liberation-fonts-ttf-master/"]'
    ).click();

    // Wait for the download to finish
    cy.wait('@liberationFonts', { timeout: 10000 });

    // Go to the Customizer tab
    cy.get('button[aria-label="Customizer"]').click();

    // Set the `mytext` parameter to "Foo Bar"
    cy.get('input[name="mytext"]').type('Foo Bar');

    cy.get('button').contains('Render').click();

    // Wait for the rendering to finish
    cy.get('button')
      .contains('Render')
      .find('span.MuiButton-startIcon')
      .should('not.exist');

    // And wait for another 1000ms to make sure the rendering of the canvas is finished too.
    cy.wait(1000);

    cy.compareSnapshot('editor-text', 0.1);
  });

  importUrls.forEach((url) => {
    it(`can render imported file ${url}`, () => {
      cy.intercept('/openscad.wasm').as('openscadWasm');

      cy.visit('/', {});

      // Wait for the rendering to finish
      cy.get('button')
        .contains('Render')
        .find('span.MuiButton-startIcon')
        .should('not.exist');

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

      // And wait for another 3 seconds to make sure the rendering of the canvas is finished too.
      cy.wait(3000);

      cy.compareSnapshot(`editor-import-${sanitizeUrl(url)}`, 0.1);
    });
  });
});

function sanitizeUrl(url: string) {
  return url.replace('https://www.', '').replace(/[^a-zA-Z0-9]/g, '-');
}
