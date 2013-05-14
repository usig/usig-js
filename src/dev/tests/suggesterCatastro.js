YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("SuggesterIndiceCatastral.test");
    
    Y.SuggesterIndiceCatastral.test.IntegracionTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de Integracion",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
    		this.sic = new usig.SuggesterCatastro({ debug: true });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.sic;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
        "test lista de secciones" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('0', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 9);
	        			Y.Assert.areEqual(suggestions[0].toString(), "01");
	        			Y.Assert.areEqual(suggestions[1].toString(), "02");
	        			Y.Assert.areEqual(suggestions[2].toString(), "03");
	        			Y.Assert.areEqual(suggestions[3].toString(), "04");
	        			Y.Assert.areEqual(suggestions[4].toString(), "05");
	        			Y.Assert.areEqual(suggestions[5].toString(), "06");
	        			Y.Assert.areEqual(suggestions[6].toString(), "07");
	        			Y.Assert.areEqual(suggestions[7].toString(), "08");
	        			Y.Assert.areEqual(suggestions[8].toString(), "09");
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test lista de manzanas" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('02-014', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 2);
	        			Y.Assert.areEqual(suggestions[0].toString(), "02-014A");
	        			Y.Assert.areEqual(suggestions[1].toString(), "02-014B");
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test lista de parcelas" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('02-014B', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 3);
	        			Y.Assert.areEqual(suggestions[0].toString(), "02-014B-011I");
	        			Y.Assert.areEqual(suggestions[1].toString(), "02-014B-020C");
	        			Y.Assert.areEqual(suggestions[2].toString(), "02-014B-025A");
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test lista vacia" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('02-014Z', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 0);
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },

        "Asking for geocoding with an object of the wrong type should return a proper error" : function() {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('02-014', function(suggestions) {
        			test.sic.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Suggester.GeoCodingTypeError, pt);
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },

        "Asking for geocoding with a valid object should return an instance of usig.Punto" : function() {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('02-014B-02', function(suggestions) {
        			test.sic.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Punto, pt);
			        		Y.Assert.areEqual("107972.023845531", pt.getX());
			        		Y.Assert.areEqual("101860.0785", pt.getY());
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },

        "Asking for readyness should return True at this test": function() {
        	var ready = this.sic.ready();
        	Y.Assert.isTrue(ready);
        },

        "After calling the geocoder it should fire afterServerRequest" : function () {
        	var test = this;
        	this.sic.setOptions({
        		afterServerRequest: function() {
        			test.resume();
        		}
        	});
        	try {
	        	this.sic.getSuggestions('02-014B-020C', function(suggestions) {});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "After receiving the geocoder answer it should fire afterServerResponse" : function () {
        	var test = this;
        	this.sic.setOptions({
        		afterServerResponse: function() {
        			test.resume();
        		}
        	});
        	try {
	        	this.sic.getSuggestions('02-014B-025A', function(suggestions) {});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },        
        "test cambio de parcela 89-092-017X -> 89-092-017LL (Ahora tiene que aceptar codigo de parcela de 5 chars)" : function() {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('89-092-017LL', function(suggestions) {
        			test.sic.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Punto, pt);
			        		Y.Assert.areEqual("95136.4508432633", pt.getX());
			        		Y.Assert.areEqual("102329.321", pt.getY());
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test limite de sugerencias a 5" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions	('02-010', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 5);
	        			Y.Assert.areEqual(suggestions[0].toString(), "02-010-001B");
	        			Y.Assert.areEqual(suggestions[1].toString(), "02-010-004");
	        			Y.Assert.areEqual(suggestions[2].toString(), "02-010-005");
	        			Y.Assert.areEqual(suggestions[3].toString(), "02-010-006A");
	        			Y.Assert.areEqual(suggestions[4].toString(), "02-010-006B");
	        		});
	        	}, 5);
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test consulta de una parcela dada su partida matriz 01" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('124696', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 1);
	        			Y.Assert.areEqual(suggestions[0].toString(), "124696");
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test geocodificacion de una parcela dada su partida matriz 01" : function() {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('223834', function(suggestions) {
        			test.sic.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Punto, pt);
			        		Y.Assert.areEqual("107641.298002425", pt.getX());
			        		Y.Assert.areEqual("102608.264", pt.getY());
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test partida matriz inexistente" : function () {
        	var test = this;
        	try {
	        	this.sic.getSuggestions('999999', function(suggestions) {
	        		test.resume(function() {
	        			Y.Assert.isArray(suggestions);
	        			Y.Assert.isTrue(suggestions.length == 0);
	        		});
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        }
    });
      
    Y.SuggesterIndiceCatastral.test.SuggesterIndiceCatastralSuite = new Y.Test.Suite("SuggesterIndiceCatastral");
    Y.SuggesterIndiceCatastral.test.SuggesterIndiceCatastralSuite.add(Y.SuggesterIndiceCatastral.test.IntegracionTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.SuggesterIndiceCatastral.test.SuggesterIndiceCatastralSuite);
    Y.Test.Runner.run();
});