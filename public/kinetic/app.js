App = function() {}
App.init = function() {
	this.ui = new UI();
	setInterval(this.ui.graph.adjust, 500);
};
App.log = function(data) {
	if (typeof(console) !== 'undefined')
		console.log(data);
};


jQuery.extend({
	random: function(X) {
	    return Math.floor(X * (Math.random() % 1));
	},
	randomBetween: function(MinV, MaxV) {
	  return MinV + jQuery.random(MaxV - MinV + 1);
	}
});