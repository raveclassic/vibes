function appInit() {
	app = new function() {
		this.canvas = $("#mainCanvas");
		this.canvas.width($(window).width());
		this.canvas.height($(window).height());
		$(window).resize(function(evt) {
			app.canvas.width($(window).width());
			app.canvas.height($(window).height());
			app.stage.setSize($(window).width(), $(window).height());
			app.stage.draw();
		});
		this.content = Content.generate(5);
		this.stage = new Kinetic.Stage({
			container: this.canvas[0],
			width: $(window).width(),
			height: $(window).height()
		});
		this.textLayer = new Kinetic.Layer();
		this.linesLayer = new Kinetic.Layer();
		var xcenter = this.stage.getWidth() / 2;
		var ycenter = this.stage.getHeight() / 2;
		// this.textLayer.children = new Array();
		for (var i=0; i<this.content.length; i++) {
			var temp = new Kinetic.Text({
				x: jQuery.randomBetween(100, this.stage.getWidth() - 100),
				y: jQuery.randomBetween(100, this.stage.getHeight() - 100),
				text: this.content[i].name,
				textSize: 20,
				stroke: "black",
				strokeWidth: 2,
				padding: 15,
				fontFamily: "Verdana",
				textFill: "green",
				align: "center",
				verticalAlign: "middle",
				draggable: true
			});
			temp.on("mouseover", function() {
				document.body.style.cursor = "pointer";
			});
			temp.on("mouseout", function() {
				document.body.style.cursor = "default";
			});
			// this.textLayer.children.push(temp);
			this.textLayer.add(temp);
		}
		this.stage.add(this.textLayer);
		this.stage.add(this.linesLayer);
		this.stage.draw();
	};
}

jQuery.extend({
	random: function(X) {
	    return Math.floor(X * (Math.random() % 1));
	},
	randomBetween: function(MinV, MaxV) {
	  return MinV + jQuery.random(MaxV - MinV + 1);
	}
});