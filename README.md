# TinyMCE URL Dialog Demo

![Imp](https://user-images.githubusercontent.com/33558430/111506954-28e51a00-8718-11eb-8a73-9e200080d495.png)


## Overview

URL dialogs are TinyMCE UI components used to display external web pages. These dialogs are used in scenarios where standard TinyMCE plugins and dialogs do not suffice. The external page displayed in the URL dialog may be hosted on a completely different domain than the TinyMCE parent.

This repo demonstrates how to create a URL dialog and then communicate between the external webpage and the parent TinyMCE.

[Demo Link](https://jeffholst.github.io/tinymce-url-dialog/index.html)

## Getting Started
```
git clone https://github.com/jeffholst/tinymce-url-dialog.git
cd tinymce-url-dialog
```

Then open index.html in a browser.

## Demo Walkthrough

1) open the **index.html** file in a web browser
1) click the **Open URL Dialog** button in the TinyMCE toolbar to open a new dialog window
1) in the **URL Dialog** click the **Get TinyMCE Content** button to retrieve the **“Hello, World!”** content of the parent TinyMCE editor
1) in the **URL Dialog** update the TextArea to say **“Hello, Galaxy!”** instead of **“Hello, World!”**
1) in the **URL Dialog** click the **Set TinyMCE Content** button to update the parent TinyMCE with the new message
1) close the **URL Dialog** by clicking the **X** in the top right corner
1) The TinyMCE content should now say **“Hello, Galaxy!”**
