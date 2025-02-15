/**
Show the environment of a single node using a special layout.
@module */
import * as sparql from "./sparql.js";
import * as log from "./log.js";
import * as graph from "./graph.js";

/** Centers a class and shows directly and indirectly connected roles, functions and entity types in a concentric layout.
Hides all other nodes. Resetting the view unhides the other nodes but keeps the layout of those shown before.
Recalculate the layout to place those nodes in relation to the whole graph again.
@param {string} The URI of the class.
 */
function classUse(clazz,subTop)
{
  graph.resetStyle();
  graph.setStarMode(true);
  let innerType = "meta:Role";
  let middleType = "meta:Function";
  let outerType = "meta:EntityType";

  switch(subTop)
  {
  case "R":
  {
    innerType = "meta:Role";
    middleType = "meta:Function";
    outerType = "meta:EntityType";
    break;
  }
  case "F":
  {
    // choose arbitrarily between the two possibilities and ask what the SNIK team thinks
    innerType = "meta:Function";
    middleType = "meta:Role";
    outerType = "meta:EntityType";
    break;
  }
  case "E":
  {
    // reverse of role
    innerType = "meta:EntityType";
    middleType = "meta:Function";
    outerType = "meta:Role";
    break;
  }
  default: {log.error("Unknown subtop. Cannot display class use.");}
  }


  const query =
  `select distinct ?inner ?middle ?outer ?outerx
  {
    <${clazz}> (rdfs:subClassOf|skos:closeMatch|^skos:closeMatch)* ?inner.
    ?inner meta:subTopClass ${innerType}.
    OPTIONAL
    {
      ?inner ?p ?middle.
      ?middle meta:subTopClass ${middleType}.`+
//    ?role ?p ?f.
//    ?f meta:subTopClass meta:Function.
//    ?f (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)* ?function.
`
      OPTIONAL
      {`+
//        #?function ?q ?et
//        #?et meta:subTopClass meta:EntityType.
`
        ?middle ?q ?outer.
        ?outer meta:subTopClass ${outerType}.
        OPTIONAL {?outer (skos:closeMatch|^skos:closeMatch|^rdfs:subClassOf)+ ?outerx.}
      }
    }
  }`;
  sparql.sparql(query,"http://www.snik.eu/ontology").then((json)=>
  {
    const inner = new Set();
    const middle = new Set();
    const outer = new Set();
    const outerx = new Set();
    for(let i=0;i<json.length;i++)
    {
      inner.add(json[i].inner.value);
      if(json[i].middle) {middle.add(json[i].middle.value);}
      if(json[i].outer) {outer.add(json[i].outer.value);}
      if(json[i].outerx) {outerx.add(json[i].outerx.value);}
    }
    if(middle.size===0)
    {
      log.warn("Class "+clazz+" is not used.");
      return;
    }
    const classes = new Set([...inner, ...middle,...outer,...outerx]);
    let selectedNodes = graph.cy.collection();
    //let selectedEdges = graph.cy.nodes("node[noth='ing']");
    for(const c of classes)
    {
      const cNodes = graph.cy.nodes(`node[id='${c}']`);
      selectedNodes = selectedNodes.union(cNodes);
      //selectedEdges = selectedEdges.union(cNodes.connectedEdges());
    }
    graph.hide(graph.cy.nodes());
    for (let i = 0; i < selectedNodes.length; i++)	{graph.show(selectedNodes[i]);/*selectedNodes[i].restore();*/}
    /*
    for (let i = 0; i < selectedEdges.length; i++)
    {
      // ignore cytoscape warnings for edges with only one endpointin the active nodes
      disableConsole();
      selectedEdges[i].restore();
      enableConsole();
    }
    */
    selectedNodes.layout(
      {
        name: 'concentric',
        fit: true,
        levelWidth: function() {return 1;},
        minNodeSpacing: 20,
        concentric: function(node)
        {
          const uri = node.data().name;
          if(uri===clazz) {return 10;}
          if(inner.has(uri)) {return 9;}
          if(middle.has(uri)) {return 8;}
          if(outer.has(uri)) {return 7;}
          if(outerx.has(uri)) {return 6;}
          return 10; // temporary workaround for inner without subtop
          /*
          // faster but can't discern expanded entity types from directly connected ones
          switch(node.data().st)
          {
          case "EntityType": return 1;
          case "Function": return 2;
          case "Role": return 3;
          default: return 3; // temporary workaround for inner without subtop
          }
          */
        },
      }
    ).run();

    const centerNode = graph.cy.nodes(`node[id='${clazz}']`);
    graph.cy.center(centerNode);
    graph.cy.fit(selectedNodes);
  }
  );
}

export {classUse};
