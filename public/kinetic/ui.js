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
        UI.stage.draw();
    });
    this.content = Content.load();
    this.stage = new Kinetic.Stage({
        container: this.canvas[0],
        width: $(window).width(),
        height: $(window).height()
    });
    // this.groupLayer = new Kinetic.Layer();
    // this.linesLayer = new Kinetic.Layer();
	this.graph = new Graph(this.stage, this.content);
}