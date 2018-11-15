d3.select('h3').style('color', 'red');
d3.select('h3').style('font-size', '30px');



var mystuff = ["chair", "blanket", "tree", "$\\forall b \\rightarrow \\leftarrow$"]

d3.select('ul').classed("testrm", false)
	.selectAll('li')
	.data(mystuff)
	.enter()
	.append('li')
	.append('div').classed('test', true)
	.text(d => d)
	.append('div')
	.text(d => d[0]);


// ------------------------------ Trees ------------------------------

// d3.layout.tree();

function makeNode(name, children = [])
{
	return {
		name: name,
		children: children
	}
}

// ---------- Data for tree:

var data = makeNode("A", [
	makeNode("B"),
	makeNode("C"),
	makeNode("D")
]);

// ---------- Data in d3 heirarchy object

var root = d3.hierarchy(data);


// ---------- Create tree

var mytree = d3.tree().size([100, 100]);


// ---------- Initialize tree? Position elements

mytree(root);


// ---------- Set up DOM content

var svgheight = 600;
var svgwidth = 600;

var svg_ex1 = d3.select('body')
                .append('svg').style('background', 'grey')
                .classed('ex1-svg', true)
                .attr('width', svgwidth)
                .attr('height', svgheight)
                .append('g').classed('nodes', true)
                .attr('transform', 'translate(0, -10)'); // shift down so that root is fully visible


// ---------- create svg objects to represent data and position them

d3.select('svg g.nodes')
  .selectAll('circle.node')
  .data(root.descendants())
  .enter()
  .append('circle')
  .classed('node', true)
  .attr('cx', d => d.x)
  .attr('cy', d => svgheight - d.y)
  .attr('r', 4);





// -------------------- Collapsible tree example --------------------

var treeData =
  {
    "name": "Top Level",
    "children": [
      { 
        "name": "Level 2: A",
        "children": [
		 	{
			  "name": "Son of A",
				"children" :
				[
					{ "name" : "grandchild 1 of A" },
					{ "name" : "grandchild 2 of A" },
					{ "name" : "grandchild 3 of A" },
					{ "name" : "grandchild 4 of A" },
					{ "name" : "grandchild 5 of A" },
					{ "name" : "grandchild 6 of A" },
					{ "name" : "grandchild 7 of A" },
					{ "name" : "grandchild 8 of A" }
				]
			},
        	{
				"name": "Daughter of A",
				"children" :
				[
					{ "name" : "$\\exists x$" }
				]
			}
        ]
      },
      { "name": "Level 2: B" }
    ]
  };


// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg").classed("main-svg", true)
    .style("background", "lavender")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;


// declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;


// Collapse after the second level
//root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

// Pretty much everything happens here...
function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
	  .attr("class", "node-txt")
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      }) // change location of text
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);


  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }


  setTimeout(() => {
		
	// MathJax.Hub.Config({
	// 	tex2jax: {
	// 	inlineMath: [ ['$','$'], ["\\(","\\)"] ],
  //   processEscapes: true,
  //   delayStartupUntil: onload
	// 	}
  // });
	
	MathJax.Hub.Register.StartupHook("End", function() {
		setTimeout(() => {
			svg.selectAll('.node').each(function(){
        var self = d3.select(this),
            g = self.select('text>span>svg');
        if (g.node())
        {
          g.remove();
          self.append(function(){
            return g.node();
          });
        }
			});
		}, 1);
		});
	
	// MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
	MathJax.Hub.Queue(["Typeset", MathJax.Hub, svg.node()]);
	
	}, 3000);
}