'use strict';
function ProgressBar(options) {
  // Validate options.
  options.text = options.text || '';
  options.max = options.max === undefined ? 100 : options.max;
  options.value = options.value || 0;
  options.x = options.x || 0;
  options.y = options.y || 0;
  options.width = options.width === undefined ? 158 : options.width;
  options.height = options.height === undefined ? 14 : options.height;

  // Properties associated with this object.
  const self = {
    this: this,
    // Create the elements.
    element: {
      container: document.createElement('div'),
      progress: document.createElement('progress'),
      status: document.createElement('span')
    },
    options: options
  };

  const container = this.element = self.element.container;
  container.style.position = 'absolute';
  // Set the position of the container.
  container.style.left = self.options.x + 'px';
  container.style.top = self.options.y + 'px';

  const progress = self.element.progress;
  progress.className = 'progressBar';
  // Apply the settings.
  progress.value = self.options.value;
  progress.max = self.options.max;
  // Set the dimensions of the progress bar.
  progress.style.width = self.options.width + 'px';
  progress.style.height = self.options.height + 'px';

  const status = self.element.status;
  status.className = 'progressStatus';
  // Preset the passed value.
  status.innerText = self.options.text;

  // Append the progress bar and the status span to the container.
  container.appendChild(progress);
  container.appendChild(status);

  // Accessors for the x position of the progress bar.
  this.define('x', {
    get: function ()      { return parseInt(self.element.container.style.left); },
    set: function (value) { self.element.container.style.left = value + 'px'; }
  });

  // Accessors for the y position.
  this.define('y', {
    get: function ()      { return parseInt(self.element.container.style.top); },
    set: function (value) { self.element.container.style.top = value + 'px'; }
  });

  // Accessors for the width.
  this.define('width', {
    get: function ()      { return parseInt(self.element.container.style.width); },
    set: function (value) { self.element.container.style.width = value + 'px'; }
  });

  // Accessors for the height.
  this.define('height', {
    get: function ()      { return parseInt(self.element.container.style.height); },
    set: function (value) { self.element.container.style.height = value + 'px'; }
  });

  // Accessors for the progress bar's value.
  this.define('value', {
    get: function ()      { return self.element.progress.value; },
    set: function (value) { self.element.progress.value = value; }
  });

  // Accessors for the maximum value.
  this.define('max', {
    get: function ()      { return self.element.progress.max; },
    set: function (value) { self.element.progress.max = value; }
  });

  // Accessors for the text.
  this.define('text', {
    get: function ()      { return self.element.status.innerText; },
    set: function (value) { self.element.status.innerText = value; }
  });
}
