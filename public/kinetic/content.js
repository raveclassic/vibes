Content = function() {}
Content.generate = function(amount) {
	Content.data = [];
	for (var i=0; i<amount; i++) {
		Content.data.push({
			id: i,
			name: "test"+i,
			connected: new Array()
		});
	}
	Content.connect(0, [[1,2],[3,1],[4,3]]); //param1 - source; param2 - array of connection objects {dest, weight})
	Content.connect(1, [[0,1],[2,3],[3,4]]);
	Content.connect(2, [[1,2],[3,1]]);
	Content.connect(3, [[0,1],[1,3],[2,2],[4,1]]);
	Content.connect(4, [[0,3],[3,1]]);
	return Content.data;
};
Content.connect = function(id1, id2) {
	if (id1 < Content.data.length) {
		$.each(id2, function(index, value) {
			if (value[0] < Content.data.length)
				Content.data[id1].connected.push(value);
		});
	}
};