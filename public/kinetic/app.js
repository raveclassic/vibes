function appInit() {
	app = new function() {
		ui = new UI();
		setInterval(function() {
			Graph.redraw(UI.groupLayer.children);
			//UI.stage.draw();
		}, 25);
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