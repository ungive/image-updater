/* Button.js
 * Author: Jonas Vanen
 * GitHub: https://github.com/jonas-vanen
 */

'use strict';
function Button (options) {
  // Validate the options.
  options.class = options.class || '';
  options.x = options.x || 0;
  options.y = options.y || 0;
  options.width = options.width === undefined ? 100 : options.width;
  options.height = options.height === undefined ? 20 : options.height;

  // Properties associated with this object.
  const self = {
    this: this,
    // Create a new button element.
    element: document.createElement('button'),
    onclick: options.onclick,
    options: options
  };

  const button = this.element = self.element;
  // The button is a winform and a button.
  button.className = 'winform ' + self.options.class;
  // Set its position and dimensions.
  button.style.left = self.options.x + 'px';
  button.style.top = self.options.y + 'px';
  button.style.width = self.options.width + 'px';
  button.style.height = self.options.height + 'px';
  // Set the text.
  button.innerHTML = self.options.text;
  // Add the event handler.
  button.onclick = function () {
    if (typeof self.onclick === 'function')
      self.onclick.call(self.this);
  };

  // Accessors for the x position of the button.
  this.define('x', {
    get: function ()      { return parseInt(self.element.style.left); },
    set: function (value) { self.element.style.left = value + 'px'; }
  });

  // Accessors for the y position.
  this.define('y', {
    get: function ()      { return parseInt(self.element.style.top); },
    set: function (value) { self.element.style.top = value + 'px'; }
  });

  // Get or set the text of the button.
  this.define('text', {
    get: function ()      { return self.element.innerText; },
    set: function (value) { self.element.innerText = value; }
  });

  // Get or set the event handler for the button.
  this.define('onclick', {
    get: function ()     { return self.element.onclick; },
    set: function (func) { self.onclick = func; }
  });

  this.toggle  = function () { self.element.disabled = !self.element.disabled; };
  this.enable  = function () { self.element.disabled = false; }; // Enable the button
  this.disable = function () { self.element.disabled = true; }; // Disable the button
}
