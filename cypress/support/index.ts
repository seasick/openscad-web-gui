// The page wouldn't load if we don't override the beforeunload event.
// Taken from https://github.com/cypress-io/cypress/issues/2938#issuecomment-549565158
Cypress.on('window:before:load', function (window) {
  const original = window.EventTarget.prototype.addEventListener;

  window.EventTarget.prototype.addEventListener = function (...args) {
    if (args && args[0] === 'beforeunload') {
      return;
    }
    return original.apply(this, args);
  };

  Object.defineProperty(window, 'onbeforeunload', {
    get: function () {},
    set: function () {},
  });
});
