/* Label.js
 * Author: Jonas Vanen
 * GitHub: https://github.com/jonas-vanen
 */

'use strict';
function Label(options) {
  // Validate the options.
  options.text = options.text || '';
  options.class = options.class || '';
  options.x = options.x || 0;
  options.y = options.y || 0;
  options.width = options.width === undefined ? 25 : options.width;
  options.height = options.height === undefined ? 10 : options.height;

  const self = {
    this: this,
    // Create a div element.
    element: document.createElement('div'),
    options: options
  };

  const label = this.element = document.createElement('div');
  label.className = 'label ' + self.options.class;
  // Set the dimensions of the label.
  label.style.top = self.options.y + 'px';
  label.style.left = self.options.x + 'px';
  label.style.width = self.options.width + 'px';
  label.style.height = self.options.height + 'px';
  // Set the text.
  label.innerText = self.options.text;

  // Get or set the text of the label.
  Object.defineProperty(this, 'text', {
    get: function () { return self.element.innerText },
    set: function (value) { self.element.innerText = value; }
  });
}
