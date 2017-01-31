/* ComboBox.js
 * Author: Jonas Vanen
 * GitHub: https://github.com/jonas-vanen
 */

'use strict';
function ComboBox(options) {
  // Validate options.
  options.optionHeight = options.optionHeight === undefined ? 14 : options.optionHeight;
  options.width = options.width === undefined ? 120 : options.width;
  options.options = options.options || [];
  options.x = options.x || 0;
  options.y = options.y || 0;
  options.z = options.z || 0;

  // Properties associated with this object.
  const self = {
    this: this,
    element: {
      // Create the combo box container.
      comboBox: document.createElement('div'),
      // The input element that will display which option is selected.
      comboBoxInput: document.createElement('input'),
      // The arrow of the combo box.
      comboBoxArrow: document.createElement('span'),
      // The container for the option elements.
      optionContainer: document.createElement('div')
    },
    // The state of the combo box menu and its options.
    state: {
      // The state of the dropdown menu itself.
      enabled: true,
      // The state of the options.
      options: [],
      pushed: {enabled: true, options: []}
    },
    onselect: options.onselect,
    options: options
  };

  // Selects an option by closing the dropdown and setting the
  // inner text of the input element that serves as text field.
  const selectOption = function () {
    const option = this;
    // Do not select the option if it is disabled.
    if (option.classList.contains('disabled'))
      return;

    // Get all input elements.
    const textInputs = self.element.comboBox.getElementsByTagName('input');
    if (textInputs.length < 1)
      return;

    // Set the value of the input element to
    // the value of the selected option.
    const textInput = textInputs[0];
    textInput.value = option.innerHTML;

    // Update the selected index.
    const options = optionContainer.querySelectorAll('div.comboBoxOption');
    for (let i = 0; i < options.length; ++i) {
      if (option === options[i]) {
        self.options.selectedIndex = i;
        break;
      }
    }

    // Invoke the onselect event handler.
    if (typeof self.onselect === 'function')
      self.onselect.call(self.this, textInput.value);
  };

  // Highlights an option.
  const highlightOption = function () {
    const option = this;
    // Only highlight if the option is not disabled.
    if (!option.classList.contains('disabled'))
      option.classList.add('selected');
  };

  // Unhighlights an option.
  const unhighlightOption = function () {
    const option = this;
    option.classList.remove('selected');
  }

  const toggleOptions = function (e) {
    // Do not toggle the options if the selected option is disabled.
    if (!e.target.classList.contains('disabled')) {
      const isVisible = optionContainer.style.display === 'block';
      optionContainer.style.display = isVisible ? 'none' : 'block';
    }
  };

  const comboBox = this.element = self.element.comboBox;
  comboBox.className = 'comboBox winform';
  // Set the position of the combo box.
  comboBox.style.left = options.x + 'px';
  comboBox.style.top = options.y + 'px';
  // Set the dimensions.
  comboBox.style.width = options.width + 'px';
  comboBox.style.zIndex = options.z;
  // Set the event handler.
  comboBox.onclick = toggleOptions;

  const comboBoxInput = self.element.comboBoxInput;
  comboBoxInput.className = 'comboBoxInput';
  comboBoxInput.type = 'text';
  // The input element is disabled,
  // because it's just there to show text.
  comboBoxInput.disabled = 'disabled';
  comboBoxInput.style.width = options.width + 'px';

  // Small arrow to the right of the combo box.
  const comboBoxArrow = self.element.comboBoxArrow;
  comboBoxArrow.className = 'comboBoxArrow';

  // The option container contains all options.
  const optionContainer = self.element.optionContainer;
  optionContainer.className = 'comboBoxOptionsContainer';
  optionContainer.style.width = options.width + 'px';

  // Create as many option elements as in the passed array.
  let optionsTotalHeight = 0;
  for (let i = 0; i < self.options.options.length; i += 1) {
    // Create a new option.
    const option = document.createElement('div');
    option.innerHTML = self.options.options[i];
    option.className = 'comboBoxOption';

    // An option has the same width as its container.
    option.style.width = self.element.optionContainer.style.width;
    option.style.height = self.options.optionHeight + 'px';
    // Set the event handlers.
    option.onclick = selectOption;
    option.onmouseover = highlightOption;
    option.onmouseout = unhighlightOption;

    // Each option is enabled by default.
    self.state.options.push(true);
    self.state.pushed.options.push(true);

    // Append the options to the container.
    self.element.optionContainer.appendChild(option);
    optionsTotalHeight += self.options.optionHeight + 2;
  }

  optionContainer.style.height = optionsTotalHeight + 'px';
  // Hide the options.
  optionContainer.style.display = 'none';
  optionContainer.style.visibility = 'visible';

  // Append the input element to the combo box.
  comboBox.appendChild(comboBoxInput);
  // Append the arrow.
  comboBox.appendChild(comboBoxArrow);
  // Append the option container.
  comboBox.appendChild(optionContainer);

  // Sets the status of the combo box.
  const setStatus = function (enable, index) {
    const func = enable ? 'remove' : 'add';
    // If an index is supplied, enable/disable a
    // specific node in the combo box.
    if (index) {
      if (index < 0) return;
      // Get all options.
      const allOptions = optionContainer.querySelectorAll('div.comboBoxOption');
      if (index >= allOptions.length) return;
      // Enable/disable the specified option.
      allOptions[index].classList[func]('disabled');
      // Update the status of the option.
      self.state.options[index] = enable;
    }
    // Enable/disable the entire combo box.
    else {
      self.element.comboBox.classList[func]('disabled');
      self.element.comboBoxInput.classList[func]('disabled');
      self.element.comboBoxArrow.classList[func]('disabled');
      // Update the state of the element.
      self.state.enabled = enable;
    }
  };

  // Enables one option or the entire combo box.
  this.enable = function (index) { setStatus(true, index); };
  // Disables one option or the entire combo box.
  this.disable = function (index) { setStatus(false, index); };

  // Pushes the current state of the combo box and its options.
  this.push = function () {
    const pushed = self.state.pushed = {};
    pushed.enabled = self.state.enabled;
    pushed.options = [];
    for (let i = 0; i < self.state.options.length; ++i)
      pushed.options.push(self.state.options[i]);
    return this;
  };

  // Restores the previously pushed state
  // of the combo box and its options.
  this.pop = function () {
    const previous = self.state;
    const pushed = self.state.pushed;
    if (pushed.enabled !== previous.enabled)
      this.toggle();
    for (let i = 0; i < previous.options.length && i < pushed.options.length; ++i)
      if (pushed[i] !== previous[i])
        this.toggle(i);
    return this;
  };

  // Toggles the state of the combo box or a single option.
  this.toggle = function (index) {
    if (this.isEnabled)
      this.disable(index);
    else this.enable(index);
  };

  // Getter and setter for the onselect event handler.
  this.define('onselect', {
    get: function () { return self.onselect; },
    set: function (value) { self.onselect = value; }
  });

  // Getter to get the options.
  this.define('options', {
    get: function () { return self.options.options; }
  });

  // Accessors for the x position of the combo box.
  this.define('x', {
    get: function ()      { return parseInt(self.element.comboBox.style.left); },
    set: function (value) { self.element.comboBox.style.left = value + 'px'; }
  });

  // Accessors for the y position.
  this.define('y', {
    get: function ()      { return parseInt(self.element.comboBox.style.top); },
    set: function (value) { self.element.comboBox.style.top = value + 'px'; }
  });

  // Accessors for the z position.
  this.define('z', {
    get: function ()      { return self.element.comboBox.style.zIndex; },
    set: function (value) { self.element.comboBox.style.zIndex = value; }
  });

  // Getter and setter for the selected index.
  this.define('selectedIndex', {
    get: function ()      { return self.options.selectedIndex; },
    set: function (index) {
      if (index < 0) return;
      // Get all options.
      const allOptions = self.element.optionContainer.querySelectorAll('div.comboBoxOption');
      if (index >= allOptions.length)
        return;

      self.options.selectedIndex = index;
      // Get the value from the option at the specified index.
      const option = allOptions[index].innerHTML;
      self.element.comboBoxInput.value = option;
      // Invoke the event handler.
      if (typeof self.onselect === 'function')
        self.onselect(option);
    }
  });

  // Close the combo box if the user clicks elsewhere in the document.
  window.addEventListener('mousedown', function (e) {
    if (e.target.parentNode !== self.element.optionContainer &&
        e.target !== self.element.comboBoxInput &&
        e.target !== self.element.comboBox) {
      self.element.optionContainer.style.display = 'none';
    }
  });

  // Close the combo box if the user switches to another window
  window.addEventListener('blur', function () {
    self.element.optionContainer.style.display = 'none';
  });
}
