YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("IndiceCatastral.test");
    
    Y.IndiceCatastral.test.IndiceCatastralTestCaseSMP = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de la interfaz con el Indice Catastral usando codigo Seccion Manzana Parcela",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.ic = new usig.IndiceCatastral({ debug: true, maxSuggestions: 500, buscarPM: false });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.ic;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------

        "test Secciones valida 01" : function () {
        	var test = this;
        	this.ic.buscar('', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.SeccionCatastral, result[0]);
        			Y.Assert.areEqual(94, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Secciones valida 02" : function () {
        	var test = this;
        	this.ic.buscar('0', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.SeccionCatastral, result[0]);
        			Y.Assert.areEqual(9, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Secciones valida 03" : function () {
        	var test = this;
        	this.ic.buscar('02', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			Y.Assert.areEqual(100, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion valida 01" : function () {
        	var test = this;
        	this.ic.buscar('02-', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			Y.Assert.areEqual(100, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion valida 02" : function () {
        	var test = this;
        	this.ic.buscar('02-0', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			Y.Assert.areEqual(100, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion valida 03" : function () {
        	var test = this;
        	this.ic.buscar('02-02', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			Y.Assert.areEqual(12, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion valida 04" : function () {
        	var test = this;
        	this.ic.buscar('02-024', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			Y.Assert.areEqual(2, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion valida 05" : function () {
        	var test = this;
        	this.ic.buscar('02-024A', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(16, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test SeccionManzana valida 01" : function () {
        	var test = this;
        	this.ic.buscar('02-024A-', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(16, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test SeccionManzana valida 02" : function () {
        	var test = this;
        	this.ic.buscar('02-024A-0', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(16, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test SeccionManzana valida 03" : function () {
        	var test = this;
        	this.ic.buscar('02-024A-00', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(12, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test SeccionManzana valida 04" : function () {
        	var test = this;
        	this.ic.buscar('02-024A-002', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(5, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test SeccionManzana valida 05" : function () {
        	var test = this;
        	this.ic.buscar('02-024A-002C', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(1, result.length);
        		});        		
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Seccion no encontrada 01" : function () {
         	var test = this;
        	this.ic.buscar('86', function(result) {
        		test.resume(function() {
       				Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Seccion no encontrada 02" : function () {
         	var test = this;
        	this.ic.buscar('94', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Seccion no encontrada 03" : function () {
         	var test = this;
        	this.ic.buscar('00', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Manzana no encontrada 01" : function () {
         	var test = this;
        	this.ic.buscar('02-024Z', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Manzana no encontrada 02" : function () {
         	var test = this;
        	this.ic.buscar('02-924', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Manzana no encontrada 03" : function () {
         	var test = this;
        	this.ic.buscar('02-014C', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Parcela no encontrada 01" : function () {
         	var test = this;
        	this.ic.buscar('02-024A-1', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Parcela no encontrada 02" : function () {
         	var test = this;
        	this.ic.buscar('02-024A-002A', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Parcela no encontrada 03" : function () {
         	var test = this;
        	this.ic.buscar('02-078X-002', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test Seccion mal formada 01" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("SA",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Seccion mal formada 02" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("100",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Manzana mal formada 01" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-S",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Manzana mal formada 02" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-0256",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Manzana mal formada 03" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-0256D",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Parcela mal formada 01" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-024A-456A2",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test SMP mal formado 01" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-024A-002D-42",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test SMP mal formado 02" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("02-02?A-002D-42",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        },
        "test Limite de sugerencias = 15" : function () {
        	var test = this;
        	this.ic.buscar('', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.SeccionCatastral, result[0]);
        			Y.Assert.areEqual(15, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	}, 15);
        	this.wait();
        }
    });

    Y.IndiceCatastral.test.IndiceCatastralTestCasePM = new Y.Test.Case({

        //name of the test case - if not provided, one is auto-generated
        name : "Tests de la interfaz con el Indice Catastral usando codigo Partida Matriz",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.ic = new usig.IndiceCatastral({ debug: true, maxSuggestions: 500, buscarSMP: false });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.ic;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "test consulta de una parcela dada su partida matriz 01" : function () {
        	var test = this;
        	this.ic.buscar('124696', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(1, result.length);
                    Y.Assert.areEqual("124696", result.toString());
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test consulta de una parcela dada su partida matriz 02" : function () {
        	var test = this;
        	this.ic.buscar('237763', function(result) {
        		test.resume(function() {
        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			Y.Assert.areEqual(1, result.length);
        			Y.Assert.areEqual("237763", result.toString());
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test Parcela no encontrada 01" : function () {
         	var test = this;
        	this.ic.buscar('999999', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(0, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail("Fallooooooooooooooooooo!!!!");
        		});
        	});
        	this.wait();
        },
        "test PM mal formado 01" : function () {
        	var test = this;
        	try {
                var r = this.ic.buscar("020244532",function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		Y.Assert.isInstanceOf(usig.IndiceCatastral.WrongParameters, error);
        	}
        }
    });
    
    Y.IndiceCatastral.test.IndiceCatastralTestCaseSMPyPM = new Y.Test.Case({

        //name of the test case - if not provided, one is auto-generated
        name : "Tests de la interfaz con el Indice Catastral usando codigo Partida Matriz y/o SMP",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.ic = new usig.IndiceCatastral({ debug: true, maxSuggestions: 500 });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.ic;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "test de SMP solamente (empieza con cero)" : function () {
        	var test = this;
        	this.ic.buscar('04', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(62, result.length);
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test de PM solamente (3 cifras)" : function () {
        	var test = this;
        	this.ic.buscar('435', function(result) {
        		test.resume(function() {
        			Y.Assert.areEqual(1, result.length);
        			Y.Assert.areEqual("77-143-024", result[0].smp);
                    Y.Assert.areEqual("435", result[0].toString());
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        },
        "test de PM y SMP" : function () {
        	var test = this;
        	this.ic.buscar('15', function(result) {
        		test.resume(function() {
        			if (result.length == 205){ // Responde SMP 
        				Y.Assert.isInstanceOf(usig.ManzanaCatastral, result[0]);
        			}else if (result.length == 1){ // Responde PM
        				Y.Assert.isInstanceOf(usig.ParcelaCatastral, result[0]);
        			}else{
        				Y.fail();
        			}
        		});
        	}, function() {
        		test.resume(function(msg) {
        			Y.fail();
        		});
        	});
        	this.wait();
        }
    });
       
    Y.IndiceCatastral.test.IndiceCatastralSuite = new Y.Test.Suite("IndiceCatastral");
    Y.IndiceCatastral.test.IndiceCatastralSuite.add(Y.IndiceCatastral.test.IndiceCatastralTestCaseSMP);
    Y.IndiceCatastral.test.IndiceCatastralSuite.add(Y.IndiceCatastral.test.IndiceCatastralTestCasePM);
    Y.IndiceCatastral.test.IndiceCatastralSuite.add(Y.IndiceCatastral.test.IndiceCatastralTestCaseSMPyPM);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.IndiceCatastral.test.IndiceCatastralSuite);
    Y.Test.Runner.run();
});