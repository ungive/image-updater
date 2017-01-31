/* Checkbox.js
 * Author: Jonas Vanen
 * GitHub: https://github.com/jonas-vanen
 */

'use strict';
function CheckBox(options) {
  // Validate the options.
  options.text = options.text || '';
  options.class = options.class || '';
  options.x = options.x || 0;
  options.y = options.y || 0;

  // Properties associated with this object.
  const self = {
    this: this,
    // Create the elements of the check box.
    element: {
      // Label as container for the check box and the text box.
      label: document.createElement('label'),
      // The check box itself.
      checkBox: document.createElement('input'),
      // Create a span element that contains the text.
      textBox: document.createElement('span')
    },
    onchange: options.onchange
  };

  const label = this.element = self.element.label;
  label.className = options.class;
  label.style.position = 'absolute';
  // Set the position of the label.
  label.style.left = options.x + 'px';
  label.style.top = options.y + 'px';

  const checkBox = self.element.checkBox;
  checkBox.name = checkBox.type = 'checkbox';
  // Set the event handler.
  checkBox.onchange = function () {
    if (typeof self.onchange === 'function')
      self.onchange.call(self.this);
  };

  const textBox = self.element.textBox;
  textBox.innerText = options.text;

  // Append the check box and the text box to the label.
  label.appendChild(checkBox);
  label.appendChild(textBox);

  // Accessors for the x position of the combo box.
  this.define('x', {
    get: function ()      { return parseInt(self.element.label.style.left); },
    set: function (value) { self.element.label.style.left = value + 'px'; }
  });

  // Accessors for the y position.
  this.define('y', {
    get: function ()      { return parseInt(self.element.label.style.top); },
    set: function (value) { self.element.label.style.top = value + 'px'; }
  });

  // Get or set the event handler for the check box.
  this.define('onchange', {
    get: function ()     { return self.onchange; },
    set: function (func) { self.onchange = func; }
  });

  // Get or set the checked status of the check box.
  this.define('checked', {
    get: function ()      { return self.element.checkBox.checked },
    set: function (value) {
      self.element.checkBox.checked = !!value;
      console.log('here', typeof self.onchange);
      if (typeof self.onchange === 'function')
        self.onchange();
    }
  });

  // Get or set the text of the check box.
  this.define('text', {
    get: function ()      { return self.element.textBox.innerText },
    set: function (value) { self.element.textBox.innerText = value; }
  });

  // Enable the checkbox.
  this.enable = function () {
    self.element.checkBox.disabled = false;
    self.element.label.classList.remove('disabled');
  };

  // Disable the checkbox.
  this.disable = function () {
    self.element.checkBox.disabled = true;
    self.element.label.classList.add('disabled');
  };
}
