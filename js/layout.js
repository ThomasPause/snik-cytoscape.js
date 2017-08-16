import * as log from "./log.js";
import timer from "./timer.js";
import * as rdfGraph from "./rdfGraph.js";

var activeLayout = undefined;

function storageName(layoutName,subs) {return "layout-"+layoutName+[...subs].sort();}

export function positions(nodes)
{
  const pos=[];
  for(let i=0;i<nodes.size();i++)
  {
    const node = nodes[i];
    pos.push([node.data().id,node.position()]);
  }
  return pos;
}

/** subs are optional and are used to cache the layout. */
export function run(cy,config,subs)
{
  if(cy.nodes().size()===0)
  {
    log.warn("layout.js#run: Graph empty. Nothing to layout.");
    return false;
  }
  const layoutTimer = timer("layout");
  if(activeLayout) {activeLayout.stop();}
  activeLayout = cy.elements(":visible").layout(config);
  activeLayout.run();
  layoutTimer.stop();
  if(subs)
  {
    if(typeof(localStorage)=== "undefined")
    {
      log.error("web storage not available, could not write to cache.");
      return;
    }

    const pos=positions(cy.nodes());
    const name = storageName(config.name,subs);
    localStorage.setItem(name,JSON.stringify(positions));
  }
  return true;
}

export function presetLayout(cy,positions)
{
  const map = new Map(positions);
  const config =
  {
    name: 'preset',
    fit:false,
    positions: node=>
    {
      let position;
      if((position= map.get(node._private.data.id))) {return position;}
      return {x:0,y:0};
    },
  };
  return run(cy,config);
}


export function runCached(cy,config,subs)
{
  if(typeof(localStorage)=== "undefined")
  {
    log.error("web storage not available, could not access cache.");
    run(config);
    return;
  }
  const name = storageName(config.name,subs);
  // localStorage.removeItem(storageName); // clear cache for testing
  const pos=JSON.parse(localStorage.getItem(name));
  if(positions) // cache hit
  {
    log.info("loading layout from cache");
    return presetLayout(cy,pos);
  }
  else // cache miss
  {
    log.warn("layout not in cache, please wait");
    return run(cy,config,subs);
  }
}


export var breadthfirst = {name: "breadthfirst"};
export var grid = {name: "grid"};

export var euler =
{
  /*eslint no-unused-vars: "off"*/
  name: "euler",
  springLength: edge => 200,
  maxSimulationTime: 2000,
  randomize: true,
  fit:false,
  mass: node => 40,
};

export var cose =
  {
    name: "cose",
    animate: true,
    animationThreshold: 250,
    refresh: 5,
    numIter: 30,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: function(){ return 400000; },
    idealEdgeLength: function(){ return 200; },
    nodeOverlap: 100,
    gravity: 80,
    fit: false,
    randomize: true,
    initialTemp: 200,
    //weaver: Weaver,
    weaver: false,
  };

export var coseBilkent =
  {
    name:"cose-bilkent",
    animate: true,
    animationThreshold: 250,
    numIter: 5000,
    nodeDimensionsIncludeLabels: false,
    //nodeRepulsion: function(node){ return 400; },
    //initialTemp: 2000,
  };

export var colaInf =
  {
    name:"cola",
    infinite: true,
    fit: false,
    nodeSpacing: function() {return 40;},
  };

export var cola =
  {
    name:"cola",
    maxSimulationTime: 4000,
    nodeSpacing: function() {return 40;},
    fit:false,
  };
