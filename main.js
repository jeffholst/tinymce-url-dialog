const allowDebugOrigin = true; // allow debugging from localhost or 127.0.01
const targetOrigin = "https://jeffholst.github.io"; // external URL dialog URL

// HTML DOM Ids
const parentTinyMCEId = "parentTinyMCE"; // parent TinyMCE element
const dialogTextAreaId = "dialogTextArea"; // dialog textarea for get/set TinyMCE content
const dialogEventListId = "dialogEventList"; // dialog <ul> updated when messages received
const parentEventListId = "parentEventList"; // parent <ul> updated when messages received

/* match one of the following to be true
  - http(s)://localhost (case insensitive)
  - http(s)://127.0.0.1 (case insensitive) */
const regex = /http[s]?:\/\/(127.0.0.1|localhost)/i;

initializeParent = () => {
  // Initialize the parent page

  // Setup TinyMCE
  tinymce.init({
    selector: `#${parentTinyMCEId}`, // id of TinyMCE element
    toolbar1: "OpenDialog", // Add 'OpenDialog' button to toolbar
    setup: function (editor) {
      // Add button to toolbar for URL Dialog
      editor.ui.registry.addButton("OpenDialog", {
        // Create 'OpenDialog' button
        text: "Open URL Dialog", // Name of button displayed on toolbar
        // open URL Dialog when button clicked
        onAction: function () {
          // The url "could" be on a completely separate domain
          // ex: https://www.some-domain.com/index.html
          let url = "dialog.html"; // The URL of the external page to open
          // open dialg and assign API to local variable for 2-way communication
          const instanceApi = editor.windowManager.openUrl({
            // Create URL dialog and assign instance API
            title: "URL Dialog", // Title of modal dialog
            url: url, // The URL to open
            width: 500, // width of modal dialog
            height: 550, // height of modal dialog
            // called when url dialog posts back a message
            onMessage: function (instance, data) {
              // Update the parent <ul> for logging purposes
              updateList(
                parentEventListId, // id of parent <ul>
                `Received Message: ${data.message.action}` // <li> message to add
              );
              // Determine what action was received from dialog
              switch (data.message.action) {
                // Return content from TinyMCE
                case "GetContent":
                  // Send the TinyMCE content to the dialog
                  instanceApi.sendMessage({
                    type: "tinymce",
                    message: editor.getContent({ format: "text" }),
                  });
                  break;
                // Set content of TinyMCE with content from dialog
                case "SetContent":
                  editor.setContent(data.message.content);
                  break;
              }
            },
          });
        },
      });
    },
  });
};

initializeDialog = () => {
  // Initialize the dialog page

  // Event Listener added for messages received from parent
  window.addEventListener("message", function (event) {
    // Make sure event originated from trusted origin
    if (!isValidTargetOrigin(event.origin)) {
      alert(
        `Invalid origin '${event.origin}'. Expecting origin '${targetOrigin}'`
      );
      return;
    }

    var data = event.data; // Contains message from parent
    // Make sure data is not empty and is for TinyMCE
    if (data && data.type && data.type === "tinymce") {
      // Update the dialog <ul>
      updateList(dialogEventListId, "Received Message");
      // Set the dialog textarea with the TinyMCE content from parent
      setTextArea(dialogTextAreaId, data.message);
    }
  });
};

isValidTargetOrigin = (origin) => {
  // origin must match (const targetOrigin) or
  // (const allowDebugOrigin === true) AND origin matches localhost/127.0.0.1 regex
  if (origin === targetOrigin || (allowDebugOrigin && origin.match(regex)))
    return true;

  // origin not valid
  return false;
};

function getTargetOrigin() {
  // return wilcard(*) if debug on and testing locally
  if (allowDebugOrigin && window.location.origin.match(regex)) return "*";

  // since we're not testing locally, return required origin
  return targetOrigin;
}

setTextArea = (id, val) => {
  // Set the value of specified textarea
  document.getElementById(id).value = val;
};

getTextArea = (id) => {
  // Get the value of specified textarea
  return document.getElementById(id).value;
};

sendMessage = (action) => {
  // Send a message to the parent

  // During 'SetContent' action, content will be updated otherwise it will be blank
  const content = action === "SetContent" ? getTextArea(dialogTextAreaId) : "";

  // Post message to parent
  // fails silently if domain orgins do not match
  window.parent.postMessage(
    {
      mceAction: "customAction",
      message: { action: action, content: content },
    },
    getTargetOrigin()
  );
};

updateList = (id, message) => {
  // Update specified <ul> when new <li>
  const list = document.getElementById(id); // Get <ul> element
  const node = document.createElement("li"); // Create new <li> element
  const textNode = document.createTextNode(message); // Create text element for <li>
  node.appendChild(textNode); // Append text element to <li>
  list.appendChild(node); // Append <li> to <ul>
};
