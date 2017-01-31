/* Window.js
 * Author: Jonas Vanen
 * GitHub: https://github.com/jonas-vanen
 */

'use strict';
// Returns the width of one side of an element's border.
function borderWidth(element, side) {
  return parseInt(getComputedStyle(element, null)
    .getPropertyValue('border-' + side + '-width'));
}

function Window(options) {
  // Validate the options.
  options.title = options.title || '';
  options.width = options.width === undefined ? 640 : options.width;
  options.height = options.height === undefined ? 360 : options.height;
  options.moveToFront = options.moveToFront === undefined ? true : options.moveToFront;

  // Properties associated with this object.
  const self = {
    this: this,
    options: options
  };

  // Moves the window to the front if it's clicked.
  this.moveToFront = self.options.moveToFront;

  // Accessors for the window's width property.
  this.define('x', {
    get: function ()      { return parseFloat(frame.style['margin-left']); },
    set: function (value) {
      frame.style['margin-left'] = value + 'px';
      self.options.width = value;
      frame.style.width = self.options.width + 'px';
    }
  });

  // Accessors for the window's width property.
  this.define('width', {
    get: function ()      { return self.options.width; },
    set: function (value) {
      self.options.width = value;
      frame.style.width = self.options.width + 'px';
    }
  });

  // Accessors for the window's height property.
  this.define('height', {
    get: function ()      { return self.options.height; },
    set: function (value) {
      self.options.height = value;
      frame.style.height = self.options.height + 'px';
    }
  });

  // Accessors for the window's title property.
  this.define('title', {
    get: function ()      { return title.innerText; },
    set: function (value) { title.innerText = value; }
  });

  let alwaysInFront = false;
  // Gets or sets if the window is always in the front.
  this.define('alwaysInFront', {
    get: function ()      { return alwaysInFront; },
    set: function (value) {
      alwaysInFront = value;
      frame.style['z-index'] = alwaysInFront ? 2 : 0;
    }
  });

  // The div container that is the app's frame.
  const frame = document.createElement('div');
  frame.className = 'window';
  // Set the dimensions of the window.
  frame.style.width = self.options.width + 'px';
  frame.style.height = self.options.height + 'px';
  // Set the position of the window if given.
  if (self.options.x) frame.style['margin-left'] = self.options.x + 'px';
  if (self.options.y) frame.style['margin-top'] = self.options.y + 'px';
  // The app's window.
  const app = document.createElement('div');
  app.className = 'app';

  // Append the frame to the document's body.
  document.body.appendChild(frame);
  // Append the app to the frame div.
  frame.appendChild(app);

  // Stores a boolean value that indicates if the frame is being dragged.
  let draggingFrame = false;
  // Stores the location of the first click of a drag.
  const clicked = new Vector();
  // Stores the origin of the frame before it's dragged.
  const origin = new Vector();

  frame.addEventListener('mousedown', function (e) {
    if (self.this.moveToFront) {
      // Move all windows into the background.
      var allWindows = document.querySelectorAll('div.window');
      for (let i = 0; i < allWindows.length; ++i)
        // A window with a z-index of 2 is always in the front.
        if (allWindows[i].style['z-index'] !== '2')
          allWindows[i].style['z-index'] = 0;
      
      // Move the clicked/dragged one into the foreground.
      if (!alwaysInFront)
        frame.style['z-index'] = 1;
    }

    // Drag the frame if the mouse clicked the border.
    draggingFrame = e.offsetX <= 0 || e.offsetX >= this.clientWidth ||
                    e.offsetY <= 0 || e.offsetY >= this.clientHeight;
    
    // These are the coordinates relative to the frame's origin.
    const framePos = new Vector(
      e.offsetX + borderWidth(this, 'left'),
      e.offsetY + borderWidth(this, 'top')
    );

    // Set the 'clicked' vector to the current mouse position.
    clicked.set(e.clientX, e.clientY);

    // Set the frame's origin relative to the window's origin.
    origin.set(clicked.x - framePos.x, clicked.y - framePos.y);
  });
  window.addEventListener('mouseup', function (e) {
    // Stop dragging when the mouse is released.
    draggingFrame = false;
  });
  window.addEventListener('mousemove', function (e) {
    if (draggingFrame) {
      // The vector that points from the first click's position to the current position.
      const direction = new Vector(e.clientX - clicked.x, e.clientY - clicked.y);
      // The new position of the frame's origin.
      const position = direction.add(origin);

      // Update the frame's position.
      frame.style['margin-left'] = position.x + 'px';
      frame.style['margin-top'] = position.y + 'px';
    }
  });

  // Set the title of the window
  const title = document.createElement('div');
  title.className = 'windowTitle';
  title.innerText = self.options.title;
  frame.appendChild(title);

  // Set the icon of the window.
  const icon = document.createElement('img');
  icon.className = 'windowIcon';
  if (self.options.icon)
    icon.src = self.options.icon;
  icon.draggable = false;
  frame.appendChild(icon);

  // Append's an element to the window.
  this.append = function (element) {
    app.appendChild(element);
  };
}
