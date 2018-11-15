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

var svg = d3.select('svg');

svg.append('rect')
	.attr('x', 50)
	.attr('y', 50)
	.attr('width', 200)
	.attr('height', 100)
	.attr('fill', 'green');

d3.select('svg').style('background', 'blue');


// ------------------------------ Trees ------------------------------

// d3.layout.tree();

function makeNode(name, children = [])
{
	return {
		name: name,
		children: children
	}
}

var root = makeNode("A", [
	makeNode("B"),
	makeNode("C"),
	makeNode("D")
]);

var mytree = d3.tree();

//var newRoot = mytree(root);






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
var svg = d3.select("body").append("svg").style("background", "lavender")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;


// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

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

  // ****************** links section ***************************

  // Update the links...
  // var link = svg.selectAll('path.link')
  //     .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  // var linkEnter = link.enter().insert('path', "g")
  //     .attr("class", "link")
  //     .attr('d', function(d){
  //       var o = {x: source.x0, y: source.y0}
  //       return diagonal(o, o)
  //     });

  // UPDATE
  //var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  // linkUpdate.transition()
  //     .duration(duration)
  //     .attr('d', function(d){ return diagonal(d, d.parent) });

  // // Remove any exiting links
  // var linkExit = link.exit().transition()
  //     .duration(duration)
  //     .attr('d', function(d) {
  //       var o = {x: source.x, y: source.y}
  //       return diagonal(o, o)
  //     })
  //     .remove();

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
