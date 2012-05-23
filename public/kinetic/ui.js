function UI() {
    UI.init();
    UI.generate();
}

UI.init = function() {
    this.canvas = $("#mainCanvas");
    this.canvas.width($(window).width());
    this.canvas.height($(window).height());
    $(window).resize(function(evt) {
        UI.canvas.width($(window).width());
        UI.canvas.height($(window).height());
        UI.stage.setSize($(window).width(), $(window).height());
        UI.stage.draw();
    });
    this.content = Content.load();
    this.stage = new Kinetic.Stage({
        container: this.canvas[0],
        width: $(window).width(),
        height: $(window).height()
    });
    this.groupLayer = new Kinetic.Layer();
    this.linesLayer = new Kinetic.Layer();
}

UI.generate = function() {
    this.generateGroups(this.groupLayer);
    this.generateNet(this.linesLayer);
	Graph.redraw(this.groupLayer.children);
    this.stage.add(this.linesLayer);
    this.stage.add(this.groupLayer);
    this.stage.draw();
};

UI.generateGroups = function(layer) {
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

UI.generateNet = function(layer) {
    var net = new Kinetic.Shape({
        drawFunc: function() {
            var context = this.getContext();
            context.beginPath();
            for (var i = 0; i < UI.groupLayer.children.length; i++) {
                for (var j = 0; j < UI.groupLayer.children[i].connected.length; j++) {
                    // console.log(UI.groupLayer.children);
                    var connectedTo = $(UI.groupLayer.children).filter(function() {
                        return this.data.id == UI.groupLayer.children[i].data.connected[j].dest.id;
                    })[0];
                    // console.log(connectedTo);
                    context.moveTo(UI.groupLayer.children[i].getX(), UI.groupLayer.children[i].getY());
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