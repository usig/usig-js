YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("SuggesterLugares.test");
    
    Y.SuggesterLugares.test.IntegracionTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de Integracion",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.sl = new usig.SuggesterLugares({ debug: true });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.sl;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------

        "test Searching for something non-existing should return no results" : function () {
        	var test = this;
        	this.sl.getSuggestions('kokusai dori', function(suggestions) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, suggestions.length);
        		});
        	}, 5);
        	this.wait();
        },        
        "test Searching should return a list of inventario objects" : function () {
        	var test = this;
        	this.sl.getSuggestions('san martin', function(suggestions) {
        		test.resume(function() {
        			Y.Assert.areEqual(10, suggestions.length);
        			Y.Assert.isInstanceOf(usig.inventario.Objeto, suggestions[0]);
        		});
        	});
        	this.wait();
        },
        "test Searching for something very common should not return more than limit results" : function () {
        	var test = this;
        	this.sl.getSuggestions('san martin', function(suggestions) {
        		test.resume(function() {
        			Y.assert(suggestions.length <= 5);
        			Y.Assert.isInstanceOf(usig.inventario.Objeto, suggestions[0]);
        		});
        	}, 5);
        	this.wait();
        },
        "test geocodificacion de la embajada de turquia" : function() {
        	var test = this;
        	try {
	        	this.sl.getSuggestions('Embajada de Turquia', function(suggestions) {
        			test.sl.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Punto, pt);
			        		Y.Assert.areEqual("101645.8237410000001546", pt.getX());
			        		Y.Assert.areEqual("107062.9030090000014752", pt.getY());
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        },
        "test geocodificacion de la embajada de israel" : function() {
        	var test = this;
        	try {
	        	this.sl.getSuggestions('Consulado de Israel', function(suggestions) {
        			test.sl.getGeoCoding(suggestions[0], function(pt) {
			        	test.resume(function() {
			        		Y.Assert.isInstanceOf(usig.Punto, pt);
			        		Y.Assert.areEqual("107968.5457743784936611", pt.getX());
			        		Y.Assert.areEqual("102297.8513221895700553", pt.getY());
			        	});
			        });
	        	});
        	} catch(e) {
	        	Y.Assert.fail(e.toString());
	        }
        	this.wait();
        }
    });
    
    Y.SuggesterLugares.test.SuggesterLugaresSuite = new Y.Test.Suite("SuggesterLugares");
    Y.SuggesterLugares.test.SuggesterLugaresSuite.add(Y.SuggesterLugares.test.IntegracionTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.SuggesterLugares.test.SuggesterLugaresSuite);
    Y.Test.Runner.run();
});