# Image Updater

#### Quick Download
- [**Windows**](https://github.com/jonas-vanen/image-updater/releases/download/v0.0.2-win/ImageUpdater-win.zip)  
- [**Mac OS X**](https://github.com/jonas-vanen/image-updater/releases/download/v0.0.1-mac/ImageUpdater-mac.zip)  

--

* [`Settings`](#settings)
* [`Configuration`](#configuration)
* [`Source`](#source)

![imgupd_inactive](http://i.imgur.com/HZaEXQY.png)  

## Settings
### Version
>Select the version of YGOPro you are playing. The options are `YGOPro1` and `YGOPro2`.  
Default is `YGOPro2`.  

--

### Type
>Select which Images you want to download. The options are `All Images`, `Picture`, `Field` and `Close-up`.  
**All Images:** Downloads all pictures in the order that they are appearing above.  
**Pics:** Downloads pictures of all cards in the selected [`Style`](#style) (Resolution: 223x325px).  
**Field:** Downloads the artworks of the field spells (Resolution: 544x544px).  
**Close-up:** Downloads the close-up artworks of all cards without their background (Resolution: 544x544px).  

--

### Style
>Select the style of the card pictures.  
`Rose` and `Vanguard` are yet unavailable.  

--

### Updating
>By ticking the checkbox `☐ Overwrite Images` you overwrite all existing images.  
If kept unticked only images that are outdated will be downloaded.  

--

### Download
>Once you have set your preferences click the `Download` button to start the process.  
The speed of the download depends on your internet connection. 

![imgupd_downloading](http://i.imgur.com/7GwEDoI.png)

---

## Configuration

This application runs in the browser and communicates with a server that you start by double-clicking your executable.  
The config.json file in the `imgupd_data` folder contains the following three options:  
* `port`: The port that the server is running on (default: 3000).  
* `delay`: The delay between the asynchronous download requests in milliseconds (default: 500).  
* `download_stack_size`: The maximum amount of downloads that are allowed to be processed simultaneously (default: 10).  

You are free to change these settings, but be aware that too many requests at the same time can overload your connection  
to the internet and cause unexpected issues/results, like missing image data or large internet performance drops.  
The port is arbitrary and does not contribute to this.  

---

## Source

`©2016 Jonas Vanen` `Images: HQ Card Project`  
If you are interested to use my Windows-style CSS/JS pack, you can find it here:  
https://github.com/jonas-vanen/ms-windows-html  
Join our Discord community:  

[![YGOPro Percy](http://i.imgur.com/v732Scx.png)](https://discord.gg/Rae2vZV)
