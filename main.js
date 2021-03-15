const allowDebugOrigin = true; // allow debugging from localhost or 127.0.01
const targetOrigin = "https://jeffholst.github.ios"; // production URI for event auth

// HTML DOM Ids
const parentTinyMCEId = "parentTinyMCE"; // parent TinyMCE element
const pluginTextAreaId = "pluginTextArea"; // plugin textarea for get/set TinyMCE content
const pluginEventListId = "pluginEventList"; // plugin <ul> updated when messages received
const parentEventListId = "parentEventList"; // parent <ul> updated when messages received

/* match one of the following to be true
  - http(s)://localhost (case insensitive)
  - http(s)://127.0.0.1 (case insensitive) */
const regex = /http[s]?:\/\/(127.0.0.1|localhost)/i
  
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
        text: "Open Plugin", // Name of button displayed on toolbar
        // open URL Dialog when button clicked
        onAction: function () {
          let url = "plugin.html"; // The URL of the external page to open
          const instanceApi = editor.windowManager.openUrl({
            // Create URL dialog and assign instance API
            title: "Plugin", // Title of modal dialog
            url: url, // The URL to open
            width: 500, // width of modal dialog
            height: 550, // height of modal dialog
            // Receive message from plugin
            onMessage: function (instance, data) {
              // Update the parent <ul>
              updateList(
                parentEventListId, // id of parent <ul>
                `Received Message: ${data.message.action}` // <li> message to add
              );
              // Determine what action received from plugin
              switch (data.message.action) {
                // Return content from TinyMCE
                case "GetContent":
                  // Send the TinyMCE content to the plugin
                  instanceApi.sendMessage({
                    type: "tinymce",
                    message: editor.getContent({ format: "text" }),
                  });
                  break;
                // Set content of TinyMCE with content from plugin
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

initializePlugin = () => {
  // Initialize the plugin page

  // Event Listener added for messages received from parent
  window.addEventListener("message", function (event) {
    if (!isValidTargetOrigin(event.origin)) {
      alert(`Invalid origin '${event.origin}'. Expecting origin '${targetOrigin}'`);
      return
    }

    var data = event.data; // Contains message from parent
    // make sure data is not empty and is for TinyMCE
    if (data && data.type && data.type === "tinymce") {
      // Update the plugin <ul>
      updateList(pluginEventListId, "Received Message");
      // Set the plugin textarea with the TinyMCE content from parent
      setTextArea(pluginTextAreaId, data.message);
    }
  });
};

isValidTargetOrigin = (origin) => {
  if (origin === targetOrigin || (allowDebugOrigin && origin.match(regex))) return true

  return false
}

function getTargetOrigin() {
  // return wilcard(*) if debug on and testing locally
  if (allowDebugOrigin && window.location.origin.match(regex)) return "*"

  // since we're not testing locally, return required origin
  return targetOrigin
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
  const content = action === "SetContent" ? getTextArea(pluginTextAreaId) : "";

  // Post messasge to parent
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
