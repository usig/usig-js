YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("GeoCoder.test");
    
    Y.GeoCoder.test.GeoCoderTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de la interfaz con el GeoCoder",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.gc = new usig.GeoCoder({ debug: true });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.gc;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "An invalid altura type should trigger an exception on geoCodificarCalleAltura" : function () {
        	try {
                var r = this.gc.geoCodificarCalleAltura("Ciudad de la paz", "asdf", function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "An invalid altura type should trigger an exception on geoCodificarCodigoDeCalleAltura" : function () {
        	try {
                var r = this.gc.geoCodificarCodigoDeCalleAltura("Ciudad de la paz", "asdf", function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "An invalid codCalle should trigger an exception on geoCodificarCodigoDeCalleAltura" : function () {
        	try {
                var r = this.gc.geoCodificarCodigoDeCalleAltura("Ciudad de la paz", "2849", function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "An invalid codCalle1 should trigger an exception on geoCodificar2CodigosDeCalle" : function () {
        	try {
                var r = this.gc.geoCodificar2CodigosDeCalle("Ciudad de la paz", 1374, function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "An invalid codCalle2 should trigger an exception on geoCodificar2CodigosDeCalle" : function () {
        	try {
                var r = this.gc.geoCodificar2CodigosDeCalle(1374, "ciudad de la paz", function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "An invalid altura should return an error on geoCodificarCodigoDeCalleAltura" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCodigoDeCalleAltura(1374, "99999", function(res) {
                	test.resume(function() {
	                	if (res instanceof usig.Punto) {
	                		Y.Assert.fail('Deberia retornar un mensaje de error');
	                	} else {
	                		usig.debug(res);
	                	}
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "An invalid altura should return an error on geoCodificarCalleAltura" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCalleAltura("ciudad de la paz", "99999", function(res) {
                	test.resume(function() {
	                	if (res instanceof usig.Punto) {
	                		Y.Assert.fail('Deberia retornar un mensaje de error');
	                	} else {
	                		usig.debug(res);
	                	}
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "Two non-intersecting streets should return an error on geoCodificarCalleYCalle" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCalleYCalle("ciudad de la paz", "moldes", function(res) {
                	test.resume(function() {
	                	if (res instanceof usig.Punto) {
	                		Y.Assert.fail('Deberia retornar un mensaje de error');
	                	} else {
	                		usig.debug(res);
	                	}
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "Two non-intersecting streets should return an error on geoCodificar2CodigosDeCalle" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificar2CodigosDeCalle(3174, 20074, function(res) {
                	test.resume(function() {
	                	if (res instanceof usig.Punto) {
	                		Y.Assert.fail('Deberia retornar un mensaje de error');
	                	} else {
	                		usig.debug(res);
	                	}
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "An invalid dir type should trigger an exception on geoCodificarDireccion" : function () {
        	try {
                var r = this.gc.geoCodificarDireccion("Ciudad de la paz 2849", function() {}, function() {});
                Y.Assert.fail("Si llega aca es que no tiro la excepcion");
        	} catch (error) {
        		if (typeof(error) == "string") {
	        		usig.debug(error);    			
        		} else {
        			throw(error);
        		}
        	}
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificarCodigoDeCalleAltura with metodo default" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCodigoDeCalleAltura(3174, 1234, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificarCalleAltura with metodo default" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCalleAltura("corrientes av.", 1234, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificarCodigoDeCalleAltura with metodo interpolacion" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCodigoDeCalleAltura(3174, 1234, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {}, 'interpolacion');
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificarCalleAltura with metodo interpolacion" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCalleAltura("corrientes av.", 1234, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {}, 'interpolacion');
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificarCalleYCalle" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificarCalleYCalle("sarmiento", "pasteur", function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {}, 'interpolacion');
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid input should return an instance of usig.Punto on geoCodificar2CodigosDeCalle" : function () {
        	var test = this;
        	try {
                var r = this.gc.geoCodificar2CodigosDeCalle(20074, 17031, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {}, 'interpolacion');
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid direccion calle-altura should return an instance of usig.Punto on geoCodificarDireccion with metodo default" : function () {
        	var test = this;
        	var dir = new usig.Direccion(new usig.Calle(3174, 'CORRIENTES AV.'), 1234);
        	try {
                var r = this.gc.geoCodificarDireccion(dir, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid direccion calle-altura should return an instance of usig.Punto on geoCodificarDireccion with metodo interpolacion" : function () {
        	var test = this;
        	var dir = new usig.Direccion(new usig.Calle(3174, 'CORRIENTES AV.'), 1234);
        	try {
                var r = this.gc.geoCodificarDireccion(dir, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {}, 'interpolacion');
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        },
        
        "A valid direccion calle-calle should return an instance of usig.Punto on geoCodificarDireccion" : function () {
        	var test = this;
        	var dir = new usig.Direccion(new usig.Calle(20074, 'SARMIENTO'), new usig.Calle(17031, 'PASTEUR'));
        	try {
                var r = this.gc.geoCodificarDireccion(dir, function(res) {
                	test.resume(function() {
                		Y.Assert.isInstanceOf(usig.Punto, res, 'Deberia retornar un punto');
                	});
                }, function() {});
        	} catch (error) {
        		usig.debug(error);
        		Y.Assert.fail('No deberia fallar');
        	}
        	this.wait();
        }
    });
    
    Y.GeoCoder.test.GeoCoderSuite = new Y.Test.Suite("GeoCoder");
    Y.GeoCoder.test.GeoCoderSuite.add(Y.GeoCoder.test.GeoCoderTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.GeoCoder.test.GeoCoderSuite);
    Y.Test.Runner.run();
});