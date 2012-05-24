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
	int[] inputLinesFrom //used for the net visualization
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
    this.k2 = 0.01;
    this.shapesLayer = new Kinetic.Layer();
    this.linesLayer = new Kinetic.Layer();
    this.content = content;
    this.stage = stage;
    //
    this.create(content);
    this.stage.add(this.linesLayer);
    this.stage.add(this.shapesLayer);
};

Graph.create = function(nodes, initialIndex) {
    var initialNode;
    if (initialIndex && initialIndex < nodes.length) {
        initialNode = nodes[initialIndex];
    } else {
        //take random
        initialNode = nodes[jQuery.random(nodes.length - 1)];
    }
    if (initialNode) {
        var initialShape = this.createShape(initialNode, this.stage.getWidth() / 2, this.stage.getHeight() / 2);
        this.shapesLayer.add(initialShape);
        this.createNext(initialShape);
    }
    this.drawNet();
};

//recursive creation
Graph.createNext = function(currentShape) {
    for (var i = 0; i < currentShape.data.connected.length; i++) {
        if (!currentShape.data.connected[i].dest.created) {
            var rx = jQuery.random(this.stage.getWidth());
            var ry = jQuery.random(this.stage.getHeight());
            var nextShape = this.createShape(currentShape.data.connected[i].dest, rx, ry);
            //currentShape.connected.push(nextShape);
            this.shapesLayer.add(nextShape);
            this.createNext(nextShape);
        }
    }
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
                // console.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "=" + length + " needed:" + nodes[i].connected[j].inputWeight * 100);
                //                 console.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "force: " + force.x + " " + force.y);
            }
            if (!nodes[i].velocity) nodes[i].velocity = {
                x: 0,
                y: 0
            };
            nodes[i].velocity.x = (nodes[i].velocity.x + 0.1 * force.x) * 0.5;
            nodes[i].velocity.y = (nodes[i].velocity.y + 0.1 * force.y) * 0.5;
            this.totalEnergy.x += nodes[i].velocity.x * nodes[i].velocity.x;
            this.totalEnergy.y += nodes[i].velocity.y * nodes[i].velocity.y;
            // console.log("force", force.x, force.y);
        }
        $.each(nodes,
        function() {
            this.move(this.velocity.x * 0.1, this.velocity.y * 0.1);
        });
        UI.stage.draw();
        console.log("total energy", this.totalEnergy.x, this.totalEnergy.y);
    }
    while (Math.abs(this.totalEnergy.x) >= 5 || Math.abs(this.totalEnergy.y) >= 5);

};

Graph.drawNet = function() {
    if (this.content.length > 0) {
        var netShape = new Kinetic.Shape({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                Graph.drawNextLine(Graph.content[0], context);
		        //clear
		        $.each(Graph.content,
		        function() {
		            this.inputLinesFrom = new Array();
		        });
                context.closePath();
                this.applyStyles();
            },
            stroke: "black",
            strokeWidth: 2
        });
        this.linesLayer.add(netShape);
    }
};
//recursive drawing
Graph.drawNextLine = function(currentNode, context) {
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
    console.log("creating", x, y);
    var shape = new Kinetic.Group({
        x: x,
        y: y,
        draggable: true
    });
    shape.add(new Kinetic.Circle({
        radius: 30,
        fill: "green",
        stroke: "black",
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
		this.transitionTo({
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
		this.transitionTo({
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
		console.log(this);
        //Graph.redraw(layer.children);
        //UI.stage.draw();
    });
    shape.on("dragmove",
    function() {
		Graph.linesLayer.draw();
        // Graph.stage.draw();
    });
    shape.data = node;
    shape.connected = new Array();
    node.inputLinesFrom = new Array();
    shape.data.created = true;
	node.shape = shape;
    return shape;
};