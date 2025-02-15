/**
Populates the menu bar on the top.
@module */
import {MODIFIED} from "./about.js";
import * as log from "./log.js";
import * as download from "./download.js";
import {invert} from "./graph.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";

/** Notifies the user of the program version so that errors can be properly reported. */
function about() {window.alert("SNIK Graph version "+MODIFIED);}

/**
Creates and returns the menus for the top menu bar.
The format is an array of menu elements.
Each menu element is an object with a "label", unique "id" and an "entries" array.
entries is an array of arrays of size two.
entries[i][0] is either a link as a string (will be opened on another tab) or a function that will be executed.
entries[i][1] is a label as a string.
 * @return {Object} the array of menu elements.
 */
function menuData()
{
  return [
    {
      "label": "File",
      "id": "file",
      "entries":
      [
        [loadGraphFromSparql,"Load from SPARQL Endpoint"],
        [download.downloadGraph,"Save Full Graph with Layout as Cytoscape File"],
        [download.downloadVisibleGraph,"Save Visible Graph with Layout as Cytoscape File"],
        [download.downloadLayout,"Save Layout only"],
        [()=>download.downloadPng(false,false),"Save Image of Current View "],
        [()=>download.downloadPng(true,false),"Save Image of Whole Graph"],
        [()=>download.downloadPng(false,true),"Save Image of Current View (high res)"],
        [()=>download.downloadPng(true,true),"Save Image of Whole Graph (high res)"],
      ],
    },
    {
      "label": "Filter",
      "id": "filter",
      "entries": [], // filled by addFilterEntries() from filter.js
    },
    {
      "label": "Options",
      "id": "options",
      "entries": [], // filled by addOptions()
    },
    {
      "label": "Services",
      "id":"services",
      "entries":
          [
            ["http://www.snik.eu/sparql","SPARQL Endpoint"],
            ["http://lodview.it/lodview/?sparql=http%3A%2F%2Fwww.snik.eu%2Fsparql&prefix=http%3A%2F%2Fwww.snik.eu%2Fontology%2F&IRI=http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta%2FTop","RDF Browser"],
            ["http://snik.eu/evaluation","Data Quality Evaluation"],
          ],
    },
    {
      "label": "Help",
      "id": "help",
      "entries":
      [
        ["manual.html","Manual"],
        ["troubleshooting.html","Troubleshooting"],
        ["contribute.html","Contribute"],
        ["http://www.snik.eu/","Project Homepage"],
        //        ["https://github.com/IMISE/snik-ontology/releases/download/0.3.0/snik-0.3-nociox.cys","Download Cytoscape Graph"],
        [about,"About SNIK Graph"],
        ["https://github.com/IMISE/snik-ontology/issues","Submit Feedback about the Ontology"],
        ["https://github.com/IMISE/snik-cytoscape.js/issues","Submit Feedback about the Visualization"],
      ],
    },
  ];
}

/** Add the menu entries of the options menu. Cannot be done with an entries array because they need an event listener so they have its own function.*/
function addOptions()
{
  document.getElementById("options").innerHTML =
  `<span class="dropdown-entry"><input type="checkbox" autocomplete="off" id="cumulativesearch"/>cumulative search</span>
  <span  class="dropdown-entry"><input type="checkbox"  autocomplete="off" id="daymode"/>day mode</span> `;
  const daymode = document.getElementById("daymode");
  daymode.addEventListener("change",()=>invert(daymode.checked));
}


/** Adds the menu to the DOM element with the "top" id and sets up the event listeners. */
function addMenu()
{
  //const frag = new DocumentFragment();
  const ul = document.createElement("ul");
  ul.classList.add("dropdown-bar");
  for(const menuDatum of menuData())
  {
    const li = document.createElement("li");
    ul.appendChild(li);

    const span = document.createElement("span");
    li.appendChild(span);
    span.classList.add("dropdown-menu");
    span.innerText=menuDatum.label;

    const div = document.createElement("div");
    li.appendChild(div);
    div.classList.add("dropdown-content");
    div.id=menuDatum.id;

    span.addEventListener("click",()=>
    {
      for(const otherDiv of document.getElementsByClassName("dropdown-content"))
      {
        if(div!==otherDiv) {otherDiv.classList.remove("show");}
      }
      div.classList.toggle("show");
    });

    //li.addEventListener("click",()=>div.style.display=(div.style.display==="block"?"none":"block"));

    for(const entry of menuDatum.entries)
    {
      const a = document.createElement("a");
      a.classList.add("dropdown-entry");
      div.appendChild(a);
      a.innerHTML=entry[1];
      switch(typeof entry[0])
      {
      case 'string':
      {
        a.href=entry[0];
        a.target="_blank";
        break;
      }
      case 'function':
      {
        a.addEventListener("click",entry[0]);
        break;
      }
      default: log.error("unknown menu entry action type: "+typeof entry[0]);
      }
      //
    }
  }
  document.getElementById("top").prepend(ul);
  addOptions();
}

// Close the dropdown if the user clicks outside of the menu
window.onclick = function(e)
{
  if (e&&e.target&&e.target.matches&&!e.target.matches('.dropdown-entry')&&!e.target.matches('.dropdown-menu')
  &&!e.target.matches('input#customfilter')) // don't close while user edits the text field of the custom filter
  {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++)
    {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show'))
      {
        //openDropdown.classList.remove('show');
      }
    }
  }
};

export default addMenu;
