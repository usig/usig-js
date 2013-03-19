YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("InputController.test");
    
    Y.InputController.test.InputControllerTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests del InputController",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	this.ic = new usig.InputController('inputText');
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	this.ic.unbind();
        	delete this.ic;
        },
        
        simulateType : function(id, str, callback) {
        	for (var i=0; i<str.length; i++) {
        		document.getElementById(id).value = document.getElementById(id).value + str.charAt(i); 
        		Y.one('#'+id).simulate("keydown", { keyCode: str.charCodeAt(i) });
        	}
        	if (typeof(callback) == "function") {
        		callback();
        	}
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "KeyUp should trigger callback" : function () {
            this.ic.setOptions({ 
            	onKeyUp: function(key, newValue) {
                 	 	Y.Assert.areEqual(key, 97);
                 	 	Y.Assert.areEqual('a', newValue);
            		}
            	});            	
        	this.simulateType('inputText', 'a');
        },
        
        "Change should trigger callback" : function () {
            this.ic.setOptions({ 
            	onChange: function(newValue) {
                 	 	Y.Assert.areEqual('a', newValue);
            		}
            	});            	
        	this.simulateType('inputText', 'a');
        },
        
        "Entering letters should trigger both callbacks" : function() {
        	var numKeyUps = 0;
        	var numChanges = 0;
            this.ic.setOptions({ 
            	onKeyUp: function(newValue) {
            			numKeyUps++;
            		},
            	onChange: function(newValue) {
            			numChanges++;
            		}
            	});            	
        	this.simulateType('inputText', 'san', function() {
         	 	Y.Assert.areEqual(3, numKeyUps);
         	 	Y.Assert.areEqual(3, numChanges);
        	});
        },
        
        "Entering control keys should trigger only KeyUp callbacks" : function() {
        	var numKeyUps = 0;
        	var numChanges = 0;
            this.ic.setOptions({ 
            	onKeyUp: function(newValue) {
            			numKeyUps++;
            		},
            	onChange: function(newValue) {
            			numChanges++;
            		}
            	});
  			Y.one('#inputText').simulate("keydown", { keyCode: 27 });
  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
  			Y.one('#inputText').simulate("keydown", { keyCode: 38 });
  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
     	 	Y.Assert.areEqual(4, numKeyUps);
     	 	Y.Assert.areEqual(0, numChanges);
        },
        
        "Entering a mix of letters and control keys should trigger the right callbacks" : function() {
        	var numKeyUps = 0;
        	var numChanges = 0;
            this.ic.setOptions({ 
            	onKeyUp: function(newValue) {
            			numKeyUps++;
            		},
            	onChange: function(newValue) {
            			numChanges++;
            		}
            	});
            this.simulateType('inputText', 'san');
  			Y.one('#inputText').simulate("keydown", { keyCode: 38 });
  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
     	 	Y.Assert.areEqual(5, numKeyUps);
     	 	Y.Assert.areEqual(3, numChanges);
        },
        
        "After unbind should not trigger callbacks" : function() {
        	var numKeyUps = 0;
        	var numChanges = 0;
            this.ic.setOptions({ 
            	onKeyUp: function(newValue) {
            			numKeyUps++;
            		},
            	onChange: function(newValue) {
            			numChanges++;
            		}
            	});     
            this.ic.unbind();
        	this.simulateType('inputText', 'san', function() {
         	 	Y.Assert.areEqual(0, numKeyUps);
         	 	Y.Assert.areEqual(0, numChanges);
        	});
        },
        
        "Rebinding should reenable callbacks" : function() {
        	var numKeyUps = 0;
        	var numChanges = 0;
            this.ic.setOptions({ 
            	onKeyUp: function(newValue) {
            			numKeyUps++;
            		},
            	onChange: function(newValue) {
            			numChanges++;
            		}
            	});     
            this.ic.unbind();
        	this.simulateType('inputText', 'san');
            this.ic.bind();
        	this.simulateType('inputText', ' pedro', function() {
         	 	Y.Assert.areEqual(6, numKeyUps);
         	 	Y.Assert.areEqual(6, numChanges);
        	});
        }
    });
    
    Y.InputController.test.InputControllerSuite = new Y.Test.Suite("InputController");
    Y.InputController.test.InputControllerSuite.add(Y.InputController.test.InputControllerTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.InputController.test.InputControllerSuite);
    Y.Test.Runner.run();
});