// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

usig.Mock = function(Y) {
	var mock = {};
	mock.__expectations = {};
	
	mock.expect = function (expectation) {
			var name = expectation.method;
			mock.__expectations[name] = expectation;
			expectation.actualCallCount = 0;
			expectation.errors = [];
			mock[name] = function() {
				if (expectation.args) {
					var args = expectation.args[expectation.actualCallCount];
					if (args.length != arguments.length) {
						expectation.errors.push("Method " + name + "() passed incorrect number of arguments.");						
					}
					for (var i=0; i<args.length; i++) {
						if (args[i] != arguments[i]) {
							expectation.errors.push("Argument " + i + " (" + arguments[i] + ") was not what we expected (" + args[i] + ") on call number: "+(expectation.actualCallCount+1));						
						}
					}
				}
				expectation.actualCallCount++;
				if (expectation.returns) {
					return expectation.returns[expectation.actualCallCount - 1]; 
				}
			}
		};
		
	mock.verify = function() {
			if (Y) {
		        try {
		            Y.Object.each(mock.__expectations, function(expectation){
		                if (expectation.method && expectation.callCount) {
		                    Y.Assert.areEqual(expectation.callCount, expectation.actualCallCount, "Method " + expectation.method + "() wasn't called the expected number of times.");
		                    Y.Object.each(expectation.errors, function(error) {
		                    	Y.Assert.fail(error);
		                    });
		                } else if (expectation.property){
		                    Y.Assert.areEqual(expectation.value, mock[expectation.property], "Property " + expectation.property + " wasn't set to the correct value."); 
		                }
		            });
		        } catch (ex){
		            //route through TestRunner for proper handling
		            Y.Test.Runner._handleError(ex);
		        }
			} else {
				var ok = true;
				for (var i in mock.__expectations) {
					ok = ok && (!mock.__expectations[i].callCount || mock.__expectations[i].actualCallCount == mock.__expectations[i].callCount);
				}
				return ok;
			}
		};

	return mock;
}