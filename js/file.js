/** Module for loading files both locally from the server and via upload from the client.
@module */
import * as graph from "./graph.js";
import * as layout from "./layout.js";
import timer from "./timer.js";

/** Loads a local text file.
When developing on Google Chrome, you may need to start the browser with "--allow-file-access-from-files".
See also https://bugs.chromium.org/p/chromium/issues/detail?id=47416.*/
export function readTextFile(fileName)
{
  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'}; // credentials in case of htaccess
  const loadTimer = timer("read text file "+fileName);
  return fetch(fileName,init)
    .then(response=>
    {
      loadTimer.stop;
      return response.text();
    });
}

/**
Uploads a JSON file from the user.
@param {Event} event a file input change event
@param {function} callback the code to execute, receives a JSON object
*/
function uploadJson(event,callback)
{
  const file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = ()=>callback(JSON.parse(reader.result));
  reader.readAsText(file);
}

/**
Load a layouted graph from the JSON file specified by the given file input change event.
@param {Event} event a file input change event
*/
export function loadGraph(event)
{
  uploadJson(event,json=>
  {
    graph.cy.elements().remove();
    graph.cy.add(json);
  });
}

/**
Load a layout from the JSON file specified by the given file input change event.
@param {Event} event a file input change event
*/
export function loadLayout(event)
{
  uploadJson(event,json=>{layout.presetLayout(graph.cy,json);});
}

/**
Add an upload entry to the file menu.
@param {Element} parent the parent element of the menu
@param {string} id id root for the generated elements, must be unique
@param {string} description the text of the menu item
@param {function} func the function to be executed when the user clicks on the menu entry
*/
function addLoadEntry(parent,id,description,func)
{
  const label = document.createElement("label");
  label.classList.add("dropdown-entry");
  label.for=id+"button";
  label.innerText=description;
  parent.prepend(label);
  const input = document.createElement("input");
  input.type="file";
  input.id=id+"button";
  input.style.display="none";
  label.appendChild(input);
  input.addEventListener("change",func);
}


/**
Add upload entries to the file menu.
Cannot use the simpler default menu creation method because file upload only works with an input.
@param {Element} parent the parent element of the menu
*/
export function addFileLoadEntries(parent)
{
  addLoadEntry(parent,"loadlayout","Load Layout",loadLayout);
  addLoadEntry(parent,"loadgraph","Load Graph File with Layout",loadGraph);
}
