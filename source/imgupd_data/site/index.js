//
// Create a new sockect.
//
const socket = io.connect('/');
socket.on('message', function (message) {
  const response = JSON.parse(message);
  const content = response.content;

  switch (response.type) {
    case 'file_count': {
      const progress = elements.progressBar;
      progress.max = content.file_count;
      break;
    }
    case 'file': {
      const progress = elements.progressBar;
      progress.value = content.number;

      const percent = progress.value / progress.max * 100;
      const type = currentDownloadType ? (currentDownloadType + ': ') : '';
      app.title = 'Downloading ' + type + content.name + ' - ' + percent.toFixed(1) + '%';
      app.width = appWidth.withThumbnail;

      imageThumbnail.src = content.path;
      break;
    }
    case 'collecting_files': {
      app.title = 'Retrieving data...';
      currentDownloadType = content.type;
      break;
    }
    case 'finished': {
      // Enable the dropdowns, the check box and
      // the download button and disable this button.
      elements.versionDropdown.pop();
      elements.typeDropdown.pop();
      elements.styleDropdown.pop();
      elements.updateCheckBox.enable();
      elements.downloadButton.enable();
      elements.cancelButton.disable();

      // Reset the title and the progress bar.
      app.title = 'Image Updater';
      elements.progressBar.value = 0;
      // Remove the image.
      imageThumbnail.src = '';

      app.title += ' - Finished';
      app.width = appWidth.withoutThumbnail;
      setTimeout(function () {
        app.title = 'Image Updater';
      }, 1500);
      break;
    }
  }
});

//
// This object stores the information
// about the current download settings.
//
const downloadInformation = {
  version: 'YGOPro2',
  type: 'All Images',
  style: 'Series 9',
  overwrite: false
};

const labelWidth = 60;
const appWidth = {
  withThumbnail: 494,
  withoutThumbnail: 412
};
//
// This object contains all elements
// that will be seen in the app's window.
//
const elements = {
  // The button that starts the download of the images.
  downloadButton: new Button({
    x: 210,
    y: 10,
    width: 180,
    height: 28,
    text: 'Download',
    class: 'button'
  }),
  // The button that cancels the download.
  cancelButton: new Button({
    x: 210,
    y: 45,
    width: 180,
    height: 28,
    text: 'Cancel',
    class: 'button'
  }),
  separatorLabel: new Label({
    text: '',
    x: 200,
    y: 10,
    width: 2,
    height: 96,
    class: 'dropdown separator'
  }),
  versionLabel: new Label({
    text: 'Version',
    x: 10,
    y: 10,
    width: labelWidth,
    height: 20,
    class: 'dropdown'
  }),
  // The dropdown menu to select the version
  // of the game that the user is playing.
  versionDropdown: new ComboBox({
    x: labelWidth + 10,
    y: 10,
    z: 3,
    options: ['YGOPro1', 'YGOPro2']
  }),
  typeLabel: new Label({
    text: 'Type',
    x: 10,
    y: 38,
    width: labelWidth,
    height: 20,
    class: 'dropdown'
  }),
  // The dropdown menu to select the download type.
  typeDropdown: new ComboBox({
    x: labelWidth + 10,
    y: 38,
    z: 2,
    options: ['All Images', 'Pics', 'Field', 'Close-up']
  }),
  styleLabel: new Label({
    text: 'Style',
    x: 10,
    y: 66,
    width: labelWidth,
    height: 20,
    class: 'dropdown'
  }),
  // The dropdown menu to select the card artwork style.
  styleDropdown: new ComboBox({
    x: labelWidth + 10,
    y: 66,
    z: 1,
    options: ['Series 9', 'Anime', 'Full Art v1', 'Full Art v3', 'Rose', 'Vanguard']
  }),
  // A check box to specify if only outdated pictures are updated.
  updateCheckBox: new CheckBox({
    x: 8,
    y: 91,
    text: 'Overwrite images',
    class: 'updateCheckBox'
  }),
  progressBar: new ProgressBar({
    x: 210,
    y: 80,
    width: 180,
    height: 28,
    value: (0).toFixed(1),
    max: 100
  })
};

elements.downloadButton.onclick = function () {
  // Push the status of each element.
  // Disable the dropdown menus, the checkbox and
  // the download button and enable the cancel button.
  elements.versionDropdown.push().disable();
  elements.typeDropdown.push().disable();
  elements.styleDropdown.push().disable();
  elements.updateCheckBox.disable();
  elements.cancelButton.enable();
  this.disable();

  // Send a message to the server to start the download.
  socket.send(JSON.stringify({
    type: 'download_start',
    data: {
      options: downloadInformation
    }
  }));
};

elements.cancelButton.onclick = function () {
  this.disable();
  app.title += ' - Canceling';
  // Send a message to the server to stop the download.
  socket.send(JSON.stringify({
    type: 'download_cancel'
  }));
};

elements.versionDropdown.onselect = function (item) {
  downloadInformation.version = item;

  if (item === elements.versionDropdown.options[0]) {
    // Enable style selection if the user selected YGOPro1 and
    // the selected type is not 'Field' and 'Close-up'.
    const type = elements.typeDropdown;
    const selectedType = type.options[type.selectedIndex];
    if (selectedType !== type.options[2] && selectedType !== type.options[3])
      elements.styleDropdown.enable();
    // Disable close-ups for YGOPro1.
    elements.typeDropdown.disable(3);
    // Set the type to 'All Images' if close-ups were selected.
    if (elements.typeDropdown.selectedIndex === 3)
      elements.typeDropdown.selectedIndex = 0;
  }
  else if (item === elements.versionDropdown.options[1]) {
    // Disable style selection if the user selected YGOPro2.
    elements.styleDropdown.disable();
    // Reset the style back to Series 9.
    elements.styleDropdown.selectedIndex = 0;
    // Enable close-ups for YGOPro2.
    elements.typeDropdown.enable(3);
  }
};

elements.typeDropdown.onselect = function (item) {
  downloadInformation.type = item;

  const version = elements.versionDropdown;
  const selectedVersion = version.options[version.selectedIndex];
  if (selectedVersion === version.options[1])
    return;

  if (item === elements.typeDropdown.options[2] ||
      item === elements.typeDropdown.options[3]) {
    elements.styleDropdown.disable();
  } else
    elements.styleDropdown.enable();
};

elements.styleDropdown.onselect = function (item) {
  downloadInformation.style = item;
};

elements.updateCheckBox.onchange = function () {
  downloadInformation.overwrite = elements.updateCheckBox.checked;
};

//
// Create a new app window.
//
const app = new Window({
  width: appWidth.withoutThumbnail,
  height: 152,
  title: 'Image Updater',
  icon: './favicon.ico'
});

// The type of the current download.
// E.g. 'Downloading pics: ...', where 'pics' is the type.
let currentDownloadType = '';

//
// Append all elements to the app's window.
//
for (let e in elements) {
  if (elements.hasOwnProperty(e) &&
      elements[e].hasOwnProperty('element')) {
    app.append(elements[e].element);
  }
}

elements.versionDropdown.selectedIndex = 1; // Default version is 'YGOPro2'.
elements.typeDropdown.selectedIndex = 0;    // Default type is 'All Images'.
elements.styleDropdown.selectedIndex = 0;   // Default style is 'Series 9'.
// Outdated card's are updated by default.
elements.updateCheckBox.checked = false;
// The cancel button is only disabled while a download is running.
elements.cancelButton.disable();

const imageThumbnail = document.createElement('img');
imageThumbnail.className = 'imageThumbnail';
imageThumbnail.style.left = '398px';
imageThumbnail.style.top = '10px';

app.append(imageThumbnail);
