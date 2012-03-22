YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("SuggesterDirecciones.test");
    
    Y.SuggesterDirecciones.test.IntegracionTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de Integracion",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.sd = new usig.SuggesterDirecciones({ debug: true });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.sd;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "If the input string is not an address getSuggestions should return an error" : function () {
        	var test = this;
        	try {
	        	this.sd.getSuggestions('asdf', function(suggestions) {
	        			test.resume(function() {
	        				Y.Assert.isInstanceOf(usig.ErrorCalleInexistente, suggestions);
	        			});
	        		});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
                      
        "If there are many options for the input string it should return an array of options" : function () {
        	var test = this;
        	try {
	        	this.sd.getSuggestions('martinez 1500', function(suggestions) {
	        			test.resume(function() {
	        				Y.Assert.isArray(suggestions);
	        				Y.Assert.isTrue(suggestions.length == 4);
	        			});
	        		});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
                      
        "If the input string is a valid address there should be one option only" : function () {
        	var test = this;
        	try {
	        	this.sd.getSuggestions('ciudad 2849', function(suggestions) {
	        			test.resume(function() {
	        				Y.Assert.isArray(suggestions);
	        				Y.Assert.isTrue(suggestions.length == 1);
	        				Y.Assert.isInstanceOf(usig.Direccion, suggestions[0]);
	        			});
	        		});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        
        "Asking for geocoding with an object of the wrong type should return a proper error" : function() {
        	var test = this;
        	this.sd.getGeoCoding('corrientes 1234', function(pt) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.Suggester.GeoCodingTypeError, pt);
        		});
        	})
        	this.wait();
        },
        
        "Asking for geocoding with a valid object should return an instance of usig.Punto" : function() {
        	var test = this;
        	try {
	        	this.sd.getSuggestions('ciudad 2849', function(suggestions) {
	        			test.sd.getGeoCoding(suggestions[0], function(pt) {
				        		test.resume(function() {
				        			Y.Assert.isInstanceOf(usig.Punto, pt);
				        		});
				        	});
	        			});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        
        "Asking for readyness should return True at this test": function() {
        	var ready = this.sd.ready();
        	Y.Assert.isTrue(ready);
        },
                      
        "After calling the geocoder it should fire afterServerRequest" : function () {
        	var test = this;
        	this.sd.setOptions({
        		afterServerRequest: function() {
        			test.resume();
        		}
        	});
        	try {
	        	this.sd.getSuggestions('ciudad 2849', function(suggestions) {
    				test.sd.getGeoCoding(suggestions[0], function() {});
    			});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
                      
        "After receiving the geocoder answer it should fire afterServerResponse" : function () {
        	var test = this;
        	this.sd.setOptions({
        		afterServerResponse: function() {
        			test.resume();
        		}
        	});
        	try {
	        	this.sd.getSuggestions('ciudad 2849', function(suggestions) {
	        				test.sd.getGeoCoding(suggestions[0], function() {});
	        			});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        }        
        
    });
      
    Y.SuggesterDirecciones.test.SuggesterDireccionesSuite = new Y.Test.Suite("SuggesterDirecciones");
    Y.SuggesterDirecciones.test.SuggesterDireccionesSuite.add(Y.SuggesterDirecciones.test.IntegracionTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.SuggesterDirecciones.test.SuggesterDireccionesSuite);
    
    $.ajax({
        type: 'GET',
        cache: true,
        url: usig.defaults.Callejero.server,
        data: { full: 1 },
        dataType: 'jsonp',
        success: function(data) { 
            usig.data.Callejero = data; 
            //run the tests
            Y.Test.Runner.run();
        },
        error: function() {
            alert('Se produjo un error al intentar cargar la información de calles.');
        }
    });  
});