function Graph(stage, content) {
	Graph.init(stage, content);
	Graph.generate();
};

Graph.init = function(stage, content) {
    this.lambda1 = 0.1;
    this.lambda2 = 0.15;
    this.lu = 150;
    this.k1 = 1;
    this.k2 = 0.01;
	this.groupLayer = new Kinetic.Layer();
	this.linesLayer = new Kinetic.Layer();
	this.content = content;
	this.stage = stage;
};

Graph.redraw = function() {
	var nodes = this.groupLayer.children;
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
                force.x += -this.k1 * (length - /*nodes[i].connected[j].inputWeight **/ 100) * lx / length;
                force.y += -this.k1 * (length - /*nodes[i].connected[j].inputWeight **/ 100) * ly / length;
                // console.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "=" + length + " needed:" + nodes[i].connected[j].inputWeight * 100);
                //                 console.log(nodes[i].data.id + "-" + nodes[i].connected[j].data.id + "force: " + force.x + " " + force.y);
            }
            if (!nodes[i].velocity) nodes[i].velocity = {
                x: 0,
                y: 0
            };
            nodes[i].velocity.x = (nodes[i].velocity.x + 0.1 * force.x ) * 0.5;
            nodes[i].velocity.y = (nodes[i].velocity.y + 0.1 * force.y ) * 0.5;
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

// Graph.getForce = function(nodes, node) {
    // var fu = {
        // x: 0,
        // y: 0
    // };
    // var g = {
        // x: 0,
        // y: 0
    // };
    // for (var i = 0; i < node.connected.length; i++) {
        // //TODO: OPTIMIZE!!!!
        // var lx = node.getX() - node.connected[i].getX();
        // var ly = node.getY() - node.connected[i].getY();
        // var length = Math.sqrt(lx * lx + ly * ly);
        // fu.x += this.k1 * (length - node.connected[i].inputWeight * 100) * lx / length;
        // fu.y += this.k1 * (length - node.connected[i].inputWeight * 100) * ly / length;
        // g.x += this.lambda2 / (node.connected.length + node.connected[i].connected.length) * lx / length / length / length;
        // g.y += this.lambda2 / (node.connected.length + node.connected[i].connected.length) * ly / length / length / length;
    // }

    // return {
        // x: fu.x + g.x,
        // y: fu.y + g.y
    // };
// };


Graph.generate = function() {
    this.generateGroups(this.groupLayer);
    this.generateNet(this.linesLayer);
	this.redraw(this.groupLayer.children);
    this.stage.add(this.linesLayer);
    this.stage.add(this.groupLayer);
    this.stage.draw();
};

Graph.generateGroups = function(layer) {
    for (var i = 0; i < this.content.length; i++) {
        var group = new Kinetic.Group({
            x: jQuery.randomBetween(this.stage.getWidth() / 2 - 200, this.stage.getWidth() / 2 + 200),
            y: jQuery.randomBetween(this.stage.getHeight() / 2 - 200, this.stage.getHeight() / 2 + 200),
            draggable: true
        });
        group.add(new Kinetic.Circle({
            radius: 30,
            fill: "green",
            stroke: "black",
            strokeWidth: 3
        }));
        group.add(new Kinetic.Text({
            text: this.content[i].name,
            textSize: 16,
            padding: 15,
            fontFamily: "Verdana",
            textFill: "black",
            align: "center",
            verticalAlign: "middle"
        }));
        group.on("mouseover",
        function() {
            document.body.style.cursor = "pointer";
        });
        group.on("mouseout",
        function() {
            document.body.style.cursor = "default";
        });
        group.on("mousedown",
        function() {
            this.moveToTop();
            Graph.redraw(layer.children);
			//UI.stage.draw();
        });
        group.on("dragmove",
        function() {
            UI.linesLayer.draw();
        });
        group.data = this.content[i];
        group.connected = new Array();
        layer.add(group);
    }
    //connect ui groups
    for (var i = 0; i < layer.children.length; i++) {
        for (var j = 0; j < layer.children[i].data.connected.length; j++) {
            var connectTo = $(layer.children).filter(function() {
                return this.data.id == layer.children[i].data.connected[j].dest.id;
            })[0];
            connectTo.inputWeight = layer.children[i].data.connected[j].weight;
            if (connectTo)
            layer.children[i].connected.push(connectTo);
        }
    }
};

Graph.generateNet = function(layer) {
    var net = new Kinetic.Shape({
        drawFunc: function() {
            var context = this.getContext();
            context.beginPath();
            for (var i = 0; i < Graph.groupLayer.children.length; i++) {
                for (var j = 0; j < Graph.groupLayer.children[i].connected.length; j++) {
                    // console.log(UI.groupLayer.children);
                    var connectedTo = $(Graph.groupLayer.children).filter(function() {
                        return this.data.id == Graph.groupLayer.children[i].data.connected[j].dest.id;
                    })[0];
                    // console.log(connectedTo);
                    context.moveTo(Graph.groupLayer.children[i].getX(), Graph.groupLayer.children[i].getY());
                    context.lineTo(connectedTo.getX(), connectedTo.getY());
                }
            }
            context.closePath();
            this.applyStyles();
        },
        stroke: "black",
        strokeWidth: 3
    });
    layer.add(net);
};