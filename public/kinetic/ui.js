function UI() {
    UI.init();
}

UI.init = function() {
    this.canvas = $("#mainCanvas");
    this.canvas.width($(window).width());
    this.canvas.height($(window).height());
    $(window).resize(function(evt) {
        UI.canvas.width($(window).width());
        UI.canvas.height($(window).height());
        UI.stage.setSize($(window).width(), $(window).height());
		UI.stage.centerX = UI.stage.getWidth()/2;
		UI.stage.centerY = UI.stage.getHeight()/2;
        UI.stage.draw();
    });
    this.content = Content.load();
    this.stage = new Kinetic.Stage({
        container: this.canvas[0],
        width: $(window).width(),
        height: $(window).height()
    });
	this.stage.centerX = this.stage.getWidth()/2;
	this.stage.centerY = this.stage.getHeight()/2;

	//set background gradient
	var backgroundLayer = new Kinetic.Layer();
	backgroundLayer.add(
		new Kinetic.Rect({
			width: this.stage.getWidth(),
			height: this.stage.getHeight(),
			fill: {
				start: {
				  x: this.stage.centerX,
				  y: this.stage.centerY,
				  radius: 0
				},
				end: {
				  x: this.stage.centerX,
				  y: this.stage.centerY,
				  radius: this.stage.centerY>this.stage.centerX?this.stage.centerY:this.stage.centerX
				},
				colorStops: [0, '#a9e4f7', 1, '#0fb4e7']
			}
		})
	);
	this.stage.add(backgroundLayer);
	this.graph = new Graph(this.stage, this.content);
}