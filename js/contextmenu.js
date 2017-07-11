import {ONTOLOGY_MODIFIED,ONTOLOGY_ISSUE_WARNING} from "./about.js";
import {roleUse} from "./classuse.js";
import * as graph from "./graph.js";
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";
import * as log from "./log.js";
import * as property from "./property.js";

const defaultsNodes = {
  menuRadius: 150, // the radius of the circular menu in pixels
  selector: 'node[st!="Role"]', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [
    {
      content: 'description',
      //select: node=> {window.open(node._private.data.name);}
      select: node=>
      {
        window.open(node._private.data.name);
      },
    },
    {
      content: 'submit ticket',
      select: node=>
      {
        //var b = confirm("Please only use this ticket tracker for problems with the ontology data, not the javascript visualization web application. Continue?");
        //window.open("https://github.com/IMISE/snik-ontology/issues/new");
        //if(b)
        {
          //window.open("https://bitbucket.org/imise/snik-ontology/issues/new?title="+
          if(confirm(ONTOLOGY_ISSUE_WARNING))
          {
            var url = 'https://github.com/IMISE/snik-ontology/issues/new?title='+
            encodeURIComponent(node._private.data.name)+' v'+ONTOLOGY_MODIFIED+
            '&body='+encodeURIComponent('The class '+node._private.data.name+
            ' has [incorrect/missing attribute values | incorrect/missing relations to other classes, other (please specify and remove not applicable ones).]\n\n**Details**\n');
            window.open(url);
          }
        }
      },
    },
    /*    {
    content: 'set as path target',
    select: node=>
    {
    graph.setTarget(node);
  }
},*/
    {
      content: 'set as path source',
      select: node=>
      {
        graph.setSource(node);
      },
    },
    {
      content: 'LodLive',
      select: node=>
      {
        window.open('http://en.lodlive.it/?'+node._private.data.name);
      },
    },
    {
      content: 'star',
      select: node=>
      {
        graph.showStar(node);
      },
    },
    {
      content: 'shortest path to here',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showPath(graph.getSource(), node);
        }
      },
    },
    {
      content: 'spiderworm to here',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showWorm(graph.getSource(), node);
        }
      },
    },
    {
      content: 'doublestar to here',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showDoubleStar(graph.getSource(), node);
        }
      },
    },
    {
      content: 'starpath to here',
      select: node=>
      {
        if(graph.getSource()&&graph.getSource()!==node)
        {
          graph.showStarPath(graph.getSource(), node);
        }
      },
    },
    {
      content: 'add connection',
      select: target=>
      {
        const source = graph.getSource();
        if(source&&(source!==target))
        {
          /*
          const properties = property.possible(source,target);
          var box = dhtmlx.modalbox({
            title:`Create Connection between the classes ${rdf.short(source.data().name)} and ${rdf.short(target.data().name)}`,
            text:`<select>
            ${properties.map()}
          </select>`,
            width:"250px",
          });
*/
          const p = "http://www.snik.eu/ontology/meta/associatedWith";
          sparql.addTriple(graph.getSource().data().name,p,target.data().name,"http://www.snik.eu/ontology/test");
          graph.cy.add(
            {
              group: "edges",
              data: {
                source: graph.getSource().data().name,
                target: target.data().name,
                pl: "isAssociatedWith",
              },
            });
        }
      },
    },
    {
      content: 'add instance',
      select: node=>
      {
        var box = dhtmlx.modalbox({
          title:"Create Instance of Class "+rdf.short(node.data().name),//+rdf.short(node.data().name)
          text:`<form type="messageform" id='instanceform'>
        <div><label>URI Suffix in CamelCase   <input class='inform' id="suffix" type='text' minlength="3" pattern="([A-Z][a-z0-9]+)+"></label></div>
        <div><label>English Label             <input class='inform' id="le" type='text' minlength="3" pattern="[A-Za-z0-9., ]+"></label></div>
        <div><label>German Label              <input class='inform' id="ld" type='text' minlength="3" pattern="[A-Za-zöäüÖÄÜß0-9., ]+"></label></div>
        <input type='submit' value='Create' style='width:250px;'>
        <input type='button' id="hidebox" value='Cancel' style='width:250px;'>
        </form>`,
          width:"250px",
        });
        document.getElementById("hidebox").addEventListener("click",()=>{dhtmlx.modalbox.hide(box);});
        const form = document.getElementById("instanceform");
        form.addEventListener("submit",event=>
        {
          event.preventDefault();
          const suffix=form.querySelector("#suffix").value;
          const le=form.querySelector("#le").value;
          const ld=form.querySelector("#ld").value;
          const uri= rdf.long(node.data().prefix+":"+suffix);
          if(!uri.startsWith("http://www.snik.eu/ontology/")) {throw "Invalid URI: "+uri;}

          sparql.addTriple(uri,rdf.long("rdf:type"),node.data().name,"http://www.snik.eu/ontology/test");
          sparql.addLabel(uri,ld,"de","http://www.snik.eu/ontology/test");
          sparql.addLabel(uri,le,"en","http://www.snik.eu/ontology/test");

          dhtmlx.modalbox.hide(box);
        }
        );
      },
    },
    /* commented out until denethor pdf links in browser work
{
content: 'book page (in development)',
select: functiocxttn(node)
{
var page = node.data()['Definition_DE_Pages'][0];
if(!page) {page = node.data()['Definition_EN_Pages'][0];}
var source = node.data().Sources;
if(!page || !(source === 'bb' || source === 'ob'))
{
alert("no book page defined");
return;
}
switch(source)
{
case 'bb':
window.open("https://denethor.imise.uni-leipzig.de/remote.php/webdav/Shared/SNIK/bb.pdf#page="+page,"_blank");
break;

case 'ob':
window.open("https://denethor.imise.uni-leipzig.de/remote.php/webdav/Shared/SNIK/ob.pdf#page="+page,"_blank");
break;
}
}
}
*/
  ],
  fillColor: 'rgba(255, 255, 50, 0.35)', // the background colour of the menu
  activeFillColor: 'rgba(255, 255, 80, 0.35)', // the colour used to indicate the selected command
  openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
  itemColor: 'white', // the colour of text in the command's content
  itemTextShadowColor: 'gray', // the text shadow colour of the command's content
  zIndex: 9999, // the z-index of the ui div
};

const defaultsRelations = {
  menuRadius: 100, // the radius of the circular menu in pixels
  selector: 'edge', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [
    {
      content: 'submit ticket',
      select: function(edge)
      {
        //window.open("https://bitbucket.org/imise/snik-ontology/issues/new?title="+
        window.open
        (
          'https://github.com/IMISE/snik-ontology/issues/new?title='+
          encodeURIComponent(edge._private.data.name+' v'+ONTOLOGY_MODIFIED)+
          '&body='+encodeURIComponent('The edge "'+edge._private.data.name+'" is incorrect.\n\n**Details**\n')
        );
      },
    },
  ],
  fillColor: 'rgba(255, 255, 50, 0.35)', // the background colour of the menu
  activeFillColor: 'rgba(255, 255, 80, 0.35)', // the colour used to indicate the selected command
  openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
  itemColor: 'white', // the colour of text in the command's content
  itemTextShadowColor: 'gray', // the text shadow colour of the command's content
  zIndex: 9999, // the z-index of the ui div
};

function registerMenu()
{
  graph.cy.cxtmenu(defaultsNodes);
  defaultsNodes.selector="node[st='Role']";
  defaultsNodes.commands.push(
    {
      content: 'roleUse',
      select: node=>
      {
        roleUse(node.data().name);
      },
    }
  );
  graph.cy.cxtmenu(defaultsNodes);
  graph.cy.cxtmenu(defaultsRelations);
}

export {registerMenu};
