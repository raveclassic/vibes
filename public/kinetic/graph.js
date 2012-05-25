function Graph(stage, content) {
    Graph.init(stage, content);
    //Graph.generate();
};

/* DATA TYPES
Node {
	int id,
	string name,
	Node[] connected, //references
	Shape shape, //shape container
	bool created, //used for recursive creating of shapes, actually used only once
	int[], inputLinesFrom //used for the net visualization
	uint level //radial level staring from initial node (0)
}
Shape : Kinetic.Shape{
	Shape[] connected, //references
	Node data //nested node
}
*/

Graph.init = function(stage, content) {
    this.lambda1 = 0.1;
    this.lambda2 = 0.15;
    this.lu = 150;
    this.k1 = 1;
    this.k2 = 4000;
	this.lineLength = 150;
	this.levels = new Array();
    this.shapesLayer = new Kinetic.Layer();
    this.linesLayer = new Kinetic.Layer();
    this.content = content;
    this.stage = stage;
    //
    this.create(content, 1);
    this.stage.add(this.linesLayer);
    this.stage.add(this.shapesLayer);
};

Graph.create = function(nodes, initialIndex) {    
    if (initialIndex && initialIndex < nodes.length) {
        this.rootNode = nodes[initialIndex];
    } else {
        //take random
        this.rootNode = nodes[jQuery.random(nodes.length - 1)];
    }
    if (this.rootNode) {
        var initialShape = this.createShape(this.rootNode, this.stage.getWidth() / 2, this.stage.getHeight() / 2);
		initialShape.data.level = 0;
        this.shapesLayer.add(initialShape);
        this.createNext(initialShape, 1);		
		$.each(nodes, function() {
			if (typeof(Graph.levels[this.level]) === 'undefined')
				Graph.levels[this.level] = new Array();
			Graph.levels[this.level].push(this);
		});
		this.adjust();
    }
    this.drawNet();
};

//recursive creation with setting levels
Graph.createNext = function(currentShape, level) {
    for (var i = 0; i < currentShape.data.connected.length; i++) {
		var connectedNode = currentShape.data.connected[i];
		if (typeof(connectedNode.dest.level) === 'undefined' || connectedNode.dest.level > level) {
			connectedNode.dest.level = level;
		}
        if (!connectedNode.dest.created) {
            var rx = jQuery.randomBetween(currentShape.getX()-Graph.lineLength*connectedNode.weight, currentShape.getX()+Graph.lineLength*connectedNode.weight);
            var ry = jQuery.randomBetween(currentShape.getY()-Graph.lineLength*connectedNode.weight, currentShape.getY()+Graph.lineLength*connectedNode.weight);
            var nextShape = this.createShape(connectedNode.dest, rx, ry);
            this.shapesLayer.add(nextShape);
            this.createNext(nextShape, level + 1);
        }
    }
};

Graph.countCoulumbForce = function(node) { 
	var minDistance = 90;
	var force = {
		x: 0,
		y: 0
	};
	for (var i=0; i<Graph.content.length; i++) {
		if (Graph.content[i].id == node.id) continue;
		var lx = Graph.content[i].shape.getX() - node.shape.getX();
		var ly = Graph.content[i].shape.getY() - node.shape.getY();
		var length = Math.sqrt(lx * lx + ly * ly);
		console.log("length: ", length);
		force.x -= Graph.k2 * lx / length / length / length;
		force.y -= Graph.k2 * ly / length / length / length;
	}
	return force;
};

Graph.adjust = function() {
	if (Graph.levels && Graph.levels.length > 1) {
		for (var levelIndex = 1; levelIndex < Graph.levels.length; levelIndex++) {
			console.log("processing level", levelIndex, Graph.levels[levelIndex]);
			for (var nodeIndex = 0; nodeIndex < Graph.levels[levelIndex].length; nodeIndex++) {
				var currentNode = Graph.levels[levelIndex][nodeIndex];
				console.log("processing node", nodeIndex, currentNode);
				
				var force = {
					x: 0,
					y: 0
				};
				for (var connectedIndex = 0; connectedIndex < Graph.levels[levelIndex][nodeIndex].connected.length; connectedIndex++) {
					var connected = Graph.levels[levelIndex][nodeIndex].connected[connectedIndex];
					console.log("processing connected node", connectedIndex, connected);
					if (connected.dest.level <= currentNode.level) {
						var lx = currentNode.shape.getX() - connected.dest.shape.getX();
						var ly = currentNode.shape.getY() - connected.dest.shape.getY();
						var length = Math.sqrt(lx * lx + ly * ly);
						console.log("length for: ", nodeIndex, currentNode, " : ", length, " needed: ", Graph.lineLength);
						force.x -= Graph.k1 * (length - Graph.lineLength*connected.weight) * lx / length;
						force.y -= Graph.k1 * (length - Graph.lineLength*connected.weight) * ly / length;						
					}
				}
				console.log("counted force for: ", nodeIndex, currentNode, " : ", force.x, force.y, Math.sqrt(force.x*force.x + force.y*force.y));
				currentNode.moveBy = {
					x: force.x,
					y: force.y
				};
			}
			//move nodes
			$.each(Graph.levels[levelIndex], function() {
				this.shape.move(this.moveBy.x, this.moveBy.y);
				this.moveBy = {
					x: 0,
					y: 0
				};
			});
		}
	
		// //don't start with root node as it should be centered on screen
		// var previousLevel = 0;
		// if (previousLevel + 1< Graph.levels.length) {
			// $.each(Graph.levels[previousLevel], function(currentIndex, currentValue) {
				// var force = {
					// x: 0,
					// y: 0
				// };
				// $.each(this.connected, function(index, value) {
					// if (value.dest.level >= previousLevel) {
						// var lx = currentValue.shape.getX() - value.dest.shape.getX();
						// var ly = currentValue.shape.getY() - value.dest.shape.getY();
						// var length = Math.sqrt(lx * lx + ly * ly);
						// force.x += Graph.k1 * (length - lineLength) * lx / length;
						// force.y += Graph.k1 * (length - lineLength) * ly / length;
					// }
				// });
				// console.log("counted force for", currentValue, ": ", force.x, force.y);
			// });
			// // for (var li = 0 ; li < Graph.levels.length; li++) {
				// // $.each(Graph.levels[i].
			// // }
		// }
	}
	this.stage.draw();
};

Graph.redraw = function() {
    var nodes = this.shapesLayer.children;
    this.totalEnergy = {
        x: 0,
        y: 0
    };
    do {
        this.totalEnergy = {
            x: 0,
            y: 0
        };
        for (var i = 0; i < nodes.length; i++) {
            var force = {
                x: 0,
                y: 0
            }
            for (var j = 0; j < nodes.lenght; j++) {
                if (nodes[j].data.id == nodes[i].data.id) {
                    continue;
                }
                var lx = nodes[i].getX() - nodes[j].getX();
                var ly = nodes[i].getY() - nodes[j].getY();
                var length = Math.sqrt(lx * lx + ly * ly);
                //force.x += this.k2 * lx / length / length / length;
                //force.y += this.k2 * ly / length / length / length;
            }
            for (var j = 0; j < nodes[i].connected.length; j++) {
                var lx = nodes[i].getX() - nodes[i].connected[j].getX();
                var ly = nodes[i].getY() - nodes[i].connected[j].getY();
                var length = Math.sqrt(lx * lx + ly * ly);
                force.x += -this.k1 * (length -
                /*nodes[i].connected[j].inputWeight **/
                100) * lx / length;
                force.y += -this.k1 * (length -
                /*nodes[i].connected[j].inputWeight **/
                100) * ly / length;
                // app.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "=" + length + " needed:" + nodes[i].connected[j].inputWeight * 100);
                //                 app.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "force: " + force.x + " " + force.y);
            }
            if (!nodes[i].velocity) nodes[i].velocity = {
                x: 0,
                y: 0
            };
            nodes[i].velocity.x = (nodes[i].velocity.x + 0.1 * force.x) * 0.5;
            nodes[i].velocity.y = (nodes[i].velocity.y + 0.1 * force.y) * 0.5;
            this.totalEnergy.x += nodes[i].velocity.x * nodes[i].velocity.x;
            this.totalEnergy.y += nodes[i].velocity.y * nodes[i].velocity.y;
            // app.log("force", force.x, force.y);
        }
        $.each(nodes,
        function() {
            this.move(this.velocity.x * 0.1, this.velocity.y * 0.1);
        });
        UI.stage.draw();
        // App.log("total energy", this.totalEnergy.x, this.totalEnergy.y);
    }
    while (Math.abs(this.totalEnergy.x) >= 5 || Math.abs(this.totalEnergy.y) >= 5);

};

Graph.drawNet = function() {
    if (this.content.length > 0) {
        var netShape = new Kinetic.Shape({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                Graph.drawNextLine(Graph.rootNode, context, 0);
		        //clear
		        $.each(Graph.content, function() {
		            this.inputLinesFrom = new Array();
		        });
                context.closePath();
                this.applyStyles();
            },
            stroke: "#292659",
            strokeWidth: 2
        });
        this.linesLayer.add(netShape);
    }
};
//recursive drawing
Graph.drawNextLine = function(currentNode, context, level) {	
	for (var i=0; i<currentNode.connected.length; i++) {
		context.moveTo(currentNode.shape.getX(), currentNode.shape.getY());
		if (jQuery.inArray(currentNode.id, currentNode.connected[i].dest.inputLinesFrom) == -1 && jQuery.inArray(currentNode.connected[i].dest.id, currentNode.inputLinesFrom) == -1) {
			context.lineTo(currentNode.connected[i].dest.shape.getX(), currentNode.connected[i].dest.shape.getY());
            currentNode.inputLinesFrom.push(currentNode.connected[i].dest.id);
            currentNode.connected[i].dest.inputLinesFrom.push(currentNode.id);
            this.drawNextLine(currentNode.connected[i].dest, context);
		}
	}
};

Graph.createShape = function(node, x, y) {
    // App.log("creating", x, y);
    var shape = new Kinetic.Group({
        x: x,
        y: y,
        draggable: true
    });
    shape.add(new Kinetic.Circle({
        radius: 30,
        fill: "#A9E4F7",
        stroke: "#292659",
        strokeWidth: 3
    }));
    shape.add(new Kinetic.Text({
        text: node.name,
        textSize: 16,
        padding: 15,
        fontFamily: "Verdana",
        textFill: "black",
        align: "center",
        verticalAlign: "middle"
    }));
    shape.on("mouseover",
    function() {
	    this.moveToTop();
        document.body.style.cursor = "pointer";
		this.children[0].transitionTo({
			scale: {
				x: 2,
				y: 2
			},
			duration: 0.5,
			easing: 'ease-out'
		});
    });
    shape.on("mouseout",
    function() {
        document.body.style.cursor = "default";
		this.children[0].transitionTo({
			scale: {
				x: 1,
				y: 1
			},
			duration: 0.5,
			easing: 'ease-out'
		});
    });
    shape.on("mousedown",
    function() {
		App.log(this.data.level);
        //Graph.redraw(layer.children);
        //UI.stage.draw();
    });
    shape.on("dragmove",
    function() {
		Graph.linesLayer.draw();
		var f = Graph.countCoulumbForce(this.data);
		console.log(f.x, f.y, Math.sqrt(f.x*f.x + f.y*f.y));
        // Graph.stage.draw();
    });
    shape.data = node;
    node.inputLinesFrom = new Array();
    shape.data.created = true;
	node.shape = shape;
    return shape;
};