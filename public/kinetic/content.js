Content = function() {}
Content.load = function() {
    //replace with real data
    // return this.generateMockUp();
	return this.generateThree();
	// return this.generateTwo();
};

Content.generateThree = function() {
	Content.fullData = [];
    for (var i = 0; i < 3; i++) {
        Content.fullData.push({
            id: i,
            name: i,
            connected: new Array()
        });
    }
    //param1 - source; param2 - array of connection objects {dest, weight})
    Content.connect(0, [{dest:1, weight:2}, {dest:2, weight:1}]);
    Content.connect(1, [{dest:0, weight:2}, {dest:2, weight:1}]);
	Content.connect(2, [{dest:1, weight:1}, {dest:0, weight:1}]);
    return Content.fullData;
};

Content.generateTwo = function() {
	Content.fullData = [];
    for (var i = 0; i < 2; i++) {
        Content.fullData.push({
            id: i,
            name: i,
            connected: new Array()
        });
    }
    //param1 - source; param2 - array of connection objects {dest, weight})
    Content.connect(0, [{dest:1, weight:2}]);
	Content.connect(1, [{dest:0, weight:2}])
    return Content.fullData;
};

Content.generateMockUp = function() {
    Content.fullData = [];
    for (var i = 0; i < 5; i++) {
        Content.fullData.push({
            id: i,
            name: i,
            connected: new Array()
        });
    }
    //param1 - source; param2 - array of connection objects {dest, weight})
    // Content.connect(0, [{dest:1, weight:2}, {dest:3, weight:1}, {dest:4, weight:3}]);
    // Content.connect(1, [{dest:0, weight:2}, {dest:2, weight:3}, {dest:3, weight:4}]);
    // Content.connect(2, [{dest:1, weight:3}, {dest:3, weight:1}]);
    // Content.connect(3, [{dest:0, weight:1}, {dest:1, weight:4}, {dest:2, weight:1}, {dest:4, weight:1}]);
    // Content.connect(4, [{dest:0, weight:3}, {dest:3, weight:1}]);
	Content.connect(0, [{dest:1, weight:1}, {dest:3, weight:1}, {dest:4, weight:1}]);
    Content.connect(1, [{dest:0, weight:1}, {dest:2, weight:1}, {dest:3, weight:1}]);
    Content.connect(2, [{dest:1, weight:1}, {dest:3, weight:1}]);
    Content.connect(3, [{dest:0, weight:1}, {dest:1, weight:1}, {dest:2, weight:1}, {dest:4, weight:1}]);
    Content.connect(4, [{dest:0, weight:1}, {dest:3, weight:1}]);
    return Content.fullData;
};

Content.connect = function(id1, id2) {
    if (id1 < Content.fullData.length) {
        $.each(id2,
        function(index, value) {
            if (value.dest < Content.fullData.length) {
				value.dest = $(Content.fullData).filter(function() {
					return this.id == value.dest;
				})[0];
            	Content.fullData[id1].connected.push(value);
			}
        });
    }
};