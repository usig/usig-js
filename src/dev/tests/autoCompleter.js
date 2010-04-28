YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("AutoCompleter.test");
    
    Y.AutoCompleter.test.EventsTestCase = new Y.Test.Case({
    
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
        	this.ac = new usig.AutoCompleter('inputText', {
        		normalizadorDirecciones: {},
        		inventario: { setOptions: function() {}},
        		geoCoder: { setOptions: function() {}},
        		debug: true
        	}, {onSelection: function() {}, setOptions: function() {} });
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	this.ac.destroy();
        	delete this.ac;
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
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'setOptions' });
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
        },
        
        "Too short text should not try to find suggestions" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update', args: [['c'], ['ci']], callCount: 2 });
        	mockView.expect({ method: 'show', callCount: 0 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', callCount: 0});
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ci', function() {
        		test.resume.defer(500, this, [(function() {
        			mockView.verify();
        			mockND.verify();
        		})]);        			
        	});
        	this.wait();
        },
        
        "Long-enough text should call NormalizadorDirecciones after a delay" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', args: [['ciudad']], callCount: 1});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show', callCount: 1 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterSuggest: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockView.verify();
	        		});
        		},
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "Long-enough text should call Inventario after calling NormalizadorDirecciones" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', args: [['ciudad']], callCount: 1});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort'});
        	mockInv.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterServerRequest: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockInv.verify();
	        		});
        		},
				inputPauseBeforeServerSearch: 500,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },
            
        "After a timeout on inventario it should retry" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', args: [['ciudad']], callCount: 1});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 2 });
        	mockInv.expect({ method: 'abort', callCount: 1 });
        	mockInv.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterRetry: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockInv.verify();
	        		});        			
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200,
        		serverTimeout: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "Running inventario search should be aborted on input change" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', callCount: 1});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort', callCount: 1 });
        	mockInv.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterAbort: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockInv.verify();
	        		});        			
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
      		(function() { this.simulateType('inputText', ' de'); }).defer(200, this);
        	this.wait();        	
        },        
            
        "Running inventario search should be aborted on user selection" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar'});
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort', callCount: 1 });
        	mockInv.expect({ method: 'setOptions' });
        	this.ac.setViewControl({
        		update: function() {},
        		show: function() {},
        		keyUp: function() {},
        		onSelection: function(callback) {
        			callback.defer(400, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
        		},
        		remove: function() {},
        		setOptions: function() {}
        	});
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterAbort: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockInv.verify();
	        		});        			
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200,
        		serverTimeout: 1000
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "Succesful inventario search should update suggestions" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', args: [['ciudad']], callCount: 1});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show', callCount: 2 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: {
        			buscar: function(str, success, error) {
        				if (typeof(success) == "function") {
        					success(['Ciudad Universitaria']);
        				}
        			},
        			abort: function () {},
        			setOptions: function() {}
        		},
        		afterServerResponse: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockView.verify();
	        		});
        		},
        		setOptions: function() {},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "Unsuccesful inventario search should not re-update suggestions" : function () {
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', args: [['ciudad']]});
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show', callCount: 1 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: {
        			buscar: function(str, success, error) {
        				if (typeof(success) == "function") {
        					success([]);
        				}
        			},
        			abort: function () {},
        			setOptions: function() {}
        		},
        		afterServerResponse: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockView.verify();
	        		});
        		},
        		setOptions: function() {},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },
        
        "Every keystroke should be passed to the view control" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update', callCount: 6 });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'keyUp', callCount: 8 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar'});
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND
        	});
        	this.simulateType('inputText', 'ciudad');
  			Y.one('#inputText').simulate("keyup", { keyCode: 38 });
  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });
			mockView.verify();
    	},        
            
        "User selection should trigger callback" : function () {
        	usig.debug("User selection should trigger callback");
        	var test = this;
        	var mockND = usig.Mock(Y);
        	mockND.expect({ method: 'normalizar', callCount: 1 });
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort'});
        	mockInv.expect({ method: 'setOptions'});
        	this.ac.setViewControl({
        		update: function() {},
        		show: function() {},
        		keyUp: function() {},
        		onSelection: function(callback) {
        			callback.defer(600, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
        		},
        		remove: function() {},
        		setOptions: function() {}
        	});
        	this.ac.setOptions({
        		normalizadorDirecciones: mockND,
        		inventario: mockInv,
        		afterSelection: function() {
	        		test.resume(function() {
	        			mockND.verify();
	        			mockInv.verify();
	        		});        			
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "User selection should trigger callback with the real NormalizadorDirecciones" : function () {
        	var test = this;
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort'});
        	mockInv.expect({ method: 'setOptions'});
        	this.ac.setViewControl({
        		update: function() {},
        		show: function() {},
        		keyUp: function() {},
        		onSelection: function(callback) {
        			callback.defer(600, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
        		},
        		remove: function() {},
        		setOptions: function() {}
        	});
        	this.ac.setOptions({
        		normalizadorDirecciones: new usig.NormalizadorDirecciones(),
        		inventario: mockInv,
        		afterSelection: function() {
	        		test.resume(function() {
	        			mockInv.verify();
	        		});        			
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },        
            
        "If afterGeoCoding is set, user selection of an address should try to geocode it" : function () {
        	var test = this;
        	var mockInv = usig.Mock(Y);
        	mockInv.expect({ method: 'buscar', callCount: 1 });
        	mockInv.expect({ method: 'abort'});
        	mockInv.expect({ method: 'setOptions'});
        	this.ac.setViewControl({
        		update: function() {},
        		show: function() {},
        		keyUp: function() {},
        		onSelection: function(callback) {
        			callback.defer(600, this, [new usig.Direccion(new usig.Calle(3174, 'CORRIENTES AV.'), 1234)]);
        		},
        		remove: function() {},
        		setOptions: function() {}
        	});
        	this.ac.setOptions({
        		normalizadorDirecciones: new usig.NormalizadorDirecciones(),
        		inventario: mockInv,
        		geoCoder: {
        			geoCodificarDireccion: function(dir, success, error, metodo) {
        				success(new usig.Punto(100000, 100000));
        			},
        			setOptions: function() {}
        		},
				inputPauseBeforeServerSearch: 200,
        		inputPause: 200,
        		afterGeoCoding: function(res) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, res);
	        		});        			        			
        		}
        	});
        	this.simulateType('inputText', 'ciudad 2849');
        	this.wait();        	
        }        
		
    });
    
    Y.AutoCompleter.test.IntegracionTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de integracion",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	this.ac = new usig.AutoCompleter('inputText', {
        		debug: true,
        		rootUrl: '../',
        		skin: 'usig'
        	});
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
	      	this.ac.destroy();
    	  	delete this.ac;
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
        
        "Long-enough text should show suggestions" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3,
        		useInventario: false
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();
        },
        
        "Selecting a street should put its name as value of the control" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Calle, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ ', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3,
        		useInventario: false
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();        	
        },
        
        "Selecting an address should put its name as value of the control" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Direccion, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ 2849', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3,
        		useInventario: false
        	});
        	this.simulateType('inputText', 'ciudad 2849');
        	this.wait();        	
        },
        
        "Selecting a place should put its name as value of the control" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.inventario.Objeto, obj);
	        			Y.Assert.areEqual('MALBA', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'malba');
        	this.wait();        	
        },
        
        "Non-existing name should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'asdf');
        	this.wait();
        },
        
        "Non-existing intersection should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'callao y 9 de julio');
        	this.wait();
        },
        
        "Street without official numbering should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'av de los italianos 850');
        	this.wait();
        },
        
        "Invalid street address should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'sarmiento 12000');
        	this.wait();
        },
        
        "If a valid address is selected and afterGeoCoding is set it should be called" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterGeoCoding: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ 2849', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad 2849');
        	this.wait();        	
        },
        
        "If a valid place is selected and afterGeoCoding is set it should be called" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterGeoCoding: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, obj);
	        			Y.Assert.areEqual('MALBA', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'malba');
        	this.wait();        	
        },
        
        "If acceptSN is set it should accept addresses with S/N" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keyup", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keyup", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Direccion, obj);
	        			Y.Assert.areEqual('DE LOS ITALIANOS AV. S/N', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3,
        		useInventario: false,
        		acceptSN: true
        	});
        	this.simulateType('inputText', 'italianos s/n');
        	this.wait();        	
        }
        
    });
    
    Y.AutoCompleter.test.AutoCompleterSuite = new Y.Test.Suite("AutoCompleter");
    // Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.EventsTestCase);
    Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.IntegracionTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.AutoCompleter.test.AutoCompleterSuite);
    Y.Test.Runner.run();
});