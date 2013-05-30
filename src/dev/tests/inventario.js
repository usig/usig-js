YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("Inventario.test");
    
    Y.Inventario.test.InventarioTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de la interfaz con el Inventario",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.normalizador = usig.NormalizadorDirecciones.init();
        	this.inv = new usig.Inventario({ debug: true });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.inv;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "Searching for something non-existing should return no results" : function () {
        	var test = this;
        	this.inv.buscar('asdfp', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
                      
        "Searching for something very common should not return more than limit results" : function () {
        	var test = this;
        	this.inv.buscar('san martin', function(result) {
        		test.resume(function() {
        			Y.assert(result.total >= 3);
        			Y.Assert.areEqual(3, result.instancias.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	}, { limit: 3, returnRawData: true });
        	this.wait();
        },
                      
        "Searching should return a list of inventario objects" : function () {
        	var test = this;
        	this.inv.buscar('san martin', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(5, result.length);
        			Y.Assert.isInstanceOf(usig.inventario.Objeto, result[0]);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	}, { limit: 5 });
        	this.wait();
        },
                      
        "Calling getObjeto with a result should return a full object" : function () {
        	var test = this;
        	this.inv.buscar('hospital gutierrez', function(result) {
        		test.inv.getObjeto(result[0], function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.inventario.Objeto, obj);
	        			Y.Assert.isInstanceOf(usig.Direccion, obj.direccionAsociada);
	        			Y.Assert.isInstanceOf(usig.Punto, obj.direccionAsociada.getCoordenadas());
	        		});
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	}, { limit: 5 });
        	this.wait();
        }
        
        /*,
                      
        "Filtering by class should only return results from that class" : function () {
        	var test = this;
        	this.inv.buscar('gutierrez', function(result) {
        		test.resume(function() {
        			Y.assert(result.total == 1);
        			Y.Assert.areEqual(1, result.instancias.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	}, { 
        		clase: ['Salud -> Hospitales de Niños', 'Salud -> Hospitales Especializados']
        	});
        	this.wait();
        }
		*/
    });
    
    Y.Inventario.test.InventarioSuite = new Y.Test.Suite("Inventario");
    Y.Inventario.test.InventarioSuite.add(Y.Inventario.test.InventarioTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.Inventario.test.InventarioSuite);
    Y.Test.Runner.run();
});