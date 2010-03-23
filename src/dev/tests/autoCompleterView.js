YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("AutoCompleterView.test");
    
    Y.AutoCompleterView.test.EventsTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de eventos",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	this.acv = new usig.AutoCompleterView('inputText', {
        		debug: true
        	});
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.acv;
        },
        
        simulateType : function(id, str, callback) {
        	for (var i=0; i<str.length; i++) {
        		document.getElementById(id).value = document.getElementById(id).value + str.charAt(i); 
        		Y.one('#'+id).simulate("keyup", { keyCode: str.charCodeAt(i) });
        	}
        	if (typeof(callback) == "function") {
        		callback();
        	}
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "Long-enough text should at least try to update view" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update', args: [['c'], ['ci'], ['ciu'], ['ciud'], ['ciuda'], ['ciudad']], callCount: 6 });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscarLugar', callCount: 1 });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: {
        			normalizar: function(str) {
        				return [];
        			}
        		},
        		inventario: mockInv,
        		afterSuggest: function() {
	        		test.resume(function() {
	        			mockView.verify();
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();
        }

    });
    
    Y.AutoCompleterView.test.AutoCompleterViewSuite = new Y.Test.Suite("AutoCompleterView");
    Y.AutoCompleterView.test.AutoCompleterViewSuite.add(Y.AutoCompleterView.test.EventsTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.AutoCompleterView.test.AutoCompleterSuite);
    Y.Test.Runner.run();
});