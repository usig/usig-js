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
        		debug: true, suggesters: []
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
        		Y.one('#'+id).simulate("keydown", { keyCode: str.charCodeAt(i) });
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
        	mockView.expect({ method: 'hide' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	
         	var mockSugDir = usig.Mock(Y);
        	mockSugDir.name = 'mockSugDir';
        	mockSugDir.expect({ method: 'getSuggestions' });
        	mockSugDir.expect({ method: 'abort' });
        	mockSugDir.expect({ method: 'setOptions' });
        	
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.ac.addSuggester(mockSugDir);
        	
            this.simulateType('inputText', 'ciudad', function() {
                test.resume.defer(500, this, [(function() {
                    mockView.verify();
                })]);
            });
        	this.wait();
        },
        
        "Too short text should not try to find suggestions" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update', args: [['c'], ['ci']], callCount: 2 });
        	mockView.expect({ method: 'show', callCount: 0 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'hide' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });

         	var mockSugDir = usig.Mock(Y);
        	mockSugDir.name = 'mockSugDir';
        	mockSugDir.expect({ method: 'getSuggestions', callCount: 0 });
        	mockSugDir.expect({ method: 'abort' });
        	mockSugDir.expect({ method: 'setOptions' });
        	var mockSugLug = usig.Mock(Y);
        	mockSugLug.name = 'mockSugLug';
        	mockSugLug.expect({ method: 'getSuggestions', callCount: 0 });
        	mockSugLug.expect({ method: 'abort' });
        	mockSugLug.expect({ method: 'setOptions' });
        	var mockSugCat = usig.Mock(Y);
        	mockSugCat.name = 'mockSugCat';
        	mockSugCat.expect({ method: 'getSuggestions', callCount: 0 });
        	mockSugCat.expect({ method: 'abort' });
        	mockSugCat.expect({ method: 'setOptions' });
        	
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.ac.addSuggester(mockSugDir, {minTextLength: 3});
        	this.ac.addSuggester(mockSugLug, {minTextLength: 3});
        	this.ac.addSuggester(mockSugCat, {minTextLength: 3});
        	
        	this.simulateType('inputText', 'ci', function() {
        		test.resume.defer(500, this, [(function() {
        			mockView.verify();
        			mockSugDir.verify();
        			mockSugLug.verify();
        			mockSugCat.verify();
        		})]);
        	});
        	this.wait();
        },

        "A suggester's minTextLength should override the default" : function () {
            var test = this;
            var mockView = usig.Mock(Y);
            mockView.expect({ method: 'update', args: [['c'], ['ci']], callCount: 2 });
            mockView.expect({ method: 'show', callCount: 0 });
            mockView.expect({ method: 'onSelection' });
            mockView.expect({ method: 'keyUp' });
            mockView.expect({ method: 'hide' });
            mockView.expect({ method: 'remove' });
            mockView.expect({ method: 'setOptions' });

            var mockSugDir = usig.Mock(Y);
            mockSugDir.name = 'mockSugDir';
            mockSugDir.expect({ method: 'getSuggestions', callCount: 0 });
            mockSugDir.expect({ method: 'abort' });
            mockSugDir.expect({ method: 'setOptions' });
            var mockSugLug = usig.Mock(Y);
            mockSugLug.name = 'mockSugLug';
            mockSugLug.expect({ method: 'getSuggestions', callCount: 0 });
            mockSugLug.expect({ method: 'abort' });
            mockSugLug.expect({ method: 'setOptions' });
            var mockSugCat = usig.Mock(Y);
            mockSugCat.name = 'mockSugCat';
            mockSugCat.expect({ method: 'getSuggestions', callCount: 1 });
            mockSugCat.expect({ method: 'abort' });
            mockSugCat.expect({ method: 'setOptions' });
            
            this.ac.setViewControl(mockView);
            this.ac.setOptions({
                inputPause: 200,
                minTextLength: 3
            });
            this.ac.addSuggester(mockSugDir, {minTextLength: 3});
            this.ac.addSuggester(mockSugLug, {minTextLength: 3});
            this.ac.addSuggester(mockSugCat, {minTextLength: 1});
            
            this.simulateType('inputText', 'ci', function() {
                test.resume.defer(500, this, [(function() {
                    mockView.verify();
                    mockSugDir.verify();
                    mockSugLug.verify();
                    mockSugCat.verify();
                })]);
            });
            this.wait();
        },
        
        "Long-enough text should try to get suggestions" : function () {
        	var test = this;
        	var mockSugDir = usig.Mock(Y);
        	mockSugDir.name = 'mockSugDir';
        	mockSugDir.expect({ method: 'getSuggestions', callCount: 1});
        	mockSugDir.expect({ method: 'abort' });
        	mockSugDir.expect({ method: 'setOptions' });
        	
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show' });
//            mockView.expect({ method: 'show', callCount: 1 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'hide' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	
        	this.ac.setViewControl(mockView);

        	this.ac.addSuggester(mockSugDir);
        	
        	this.simulateType('inputText', 'ciudad', function() {
        		test.resume.defer(500, this, [(function() {
        			mockSugDir.verify();
        			mockView.verify();
        		})]);
        	});
        	this.wait();
        },

        "An suggester's inputPause override should be honored" : function () {
        	var test = this;

            var mockView = usig.Mock(Y);
            mockView.expect({ method: 'update' });
            mockView.expect({ method: 'show' });
            mockView.expect({ method: 'onSelection' });
            mockView.expect({ method: 'keyUp' });
            mockView.expect({ method: 'hide' });
            mockView.expect({ method: 'remove' });
            mockView.expect({ method: 'setOptions' });

            var mockSugDir = usig.Mock(Y);
            mockSugDir.name = 'mockSugDir';
            mockSugDir.expect({ method: 'getSuggestions', callCount: 1 });
            mockSugDir.expect({ method: 'abort' });
            mockSugDir.expect({ method: 'setOptions' });
            var mockSugLug = usig.Mock(Y);
            mockSugLug.name = 'mockSugLug';
            mockSugLug.expect({ method: 'getSuggestions', callCount: 0 });
            mockSugLug.expect({ method: 'abort' });
            mockSugLug.expect({ method: 'setOptions' });
        	
        	this.ac.setViewControl(mockView);
        	this.ac.setOptions({
        		inputPause: 200
        	});
            this.ac.addSuggester(mockSugDir);
            this.ac.addSuggester(mockSugLug, { inputPause: 1000 });
            // this.ac.addSuggester(mockSugCat);
        	
            this.simulateType('inputText', 'ciudad');
        	this.wait(function() {
                mockSugDir.verify();
                mockSugLug.verify();        		
        	}, 400);        	
        },
        
//        "After a timeout on inventario it should retry" : function () {
//        	var test = this;
//        	var mockND = usig.Mock(Y);
//        	mockND.expect({ method: 'normalizar', args: [['ciudad']], callCount: 1});
//        	mockND.expect({ method: 'setOptions' });
//        	var mockView = usig.Mock(Y);
//        	mockView.expect({ method: 'update' });
//        	mockView.expect({ method: 'show' });
//        	mockView.expect({ method: 'onSelection' });
//        	mockView.expect({ method: 'hide' });
//        	mockView.expect({ method: 'keyUp' });
//        	mockView.expect({ method: 'remove' });
//        	mockView.expect({ method: 'setOptions' });
//        	var mockInv = usig.Mock(Y);
//        	mockInv.expect({ method: 'buscar', callCount: 2 });
//        	mockInv.expect({ method: 'abort', callCount: 1 });
//        	mockInv.expect({ method: 'setOptions' });
//        	this.ac.setViewControl(mockView);
//        	this.ac.setOptions({
//        		normalizadorDirecciones: mockND,
//        		inventario: mockInv,
//        		afterRetry: function() {
//	        		test.resume(function() {
//	        			mockND.verify();
//	        			mockInv.verify();
//	        		});
//        		},
//				inputPauseBeforeServerSearch: 200,
//        		inputPause: 200,
//        		serverTimeout: 200
//        	});
//        	this.simulateType('inputText', 'ciudad');
//        	this.wait();
//        },        
        
        "Running search should be aborted on input change" : function () {
        	var test = this;
            var mockView = usig.Mock(Y);
            mockView.expect({ method: 'update' });
            mockView.expect({ method: 'show' });
            mockView.expect({ method: 'onSelection' });
            mockView.expect({ method: 'keyUp' });
            mockView.expect({ method: 'hide' });
            mockView.expect({ method: 'remove' });
            mockView.expect({ method: 'setOptions' });
        	
            var mockSugDir = usig.Mock(Y);
            mockSugDir.name = 'mockSugDir';
            mockSugDir.expect({ method: 'getSuggestions', callCount: 6 });
            // Se esperan 6 aborts porque es responsabilidad de los suggesters
            // determinar si es realmente necesario hacer un abort en un momento
            // determinado y por lo tanto el autocompleter hace un abort por cada
            // cambio en el input
            mockSugDir.expect({ method: 'abort', callCount: 6 });           
            mockSugDir.expect({ method: 'setOptions'});           

        	this.ac.setViewControl(mockView);
            this.ac.addSuggester(mockSugDir, { minTextLength: 1, inputPause: 0 });

            this.simulateType('inputText', 'ciudad', function() {
                test.resume.defer(500, this, [(function() {
                    mockSugDir.verify();
                })]);
            });
        	this.wait();
        },
        
        "Search should be aborted on user selection" : function () {
        	var test = this;

            var mockSugDir = usig.Mock(Y);
            mockSugDir.name = 'mockSugDir';
            mockSugDir.expect({ method: 'getSuggestions', callCount: 1 });
            mockSugDir.expect({ method: 'abort', callCount: 7 });
            mockSugDir.expect({ method: 'setOptions'});
            this.ac.addSuggester(mockSugDir);
            
            this.ac.setViewControl({
        		update: function() {},
        		show: function() {},
        		hide: function() {},
        		keyUp: function() {},
        		onSelection: function(callback) {
        			callback.defer(400, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
        		},
        		remove: function() {},
        		setOptions: function() {}
        	});
        	
        	this.simulateType('inputText', 'ciudad');
            Y.one('#inputText').simulate("keydown", { keyCode: 40 });
            Y.one('#inputText').simulate("keydown", { keyCode: 13 });
            test.resume.defer(500, this, [(function() {
                    mockSugDir.verify();
                })]);
        	this.wait();
        },
        
        "Succesful search should update suggestions" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update' });
        	mockView.expect({ method: 'show', callCount: 2 });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'keyUp' });
        	mockView.expect({ method: 'hide' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });

            var mockSugDir = {
            	name: 'mockSugDir',
            	getSuggestions: function (str, callbackSugerir, maxSuggestions) {
            		callbackSugerir(['Ciudad de la paz']);
            	},
            	abort: function () {},
            	setOptions: function() {}
            }

            var mockSugLug = {
            	name: 'mockSugLug', 
                getSuggestions: function (str, callbackSugerir, maxSuggestions) {
                    callbackSugerir(['Ciudad Universitaria']);
                },
                abort: function () {},
            	setOptions: function() {}
            }

            this.ac.addSuggester(mockSugDir);
            this.ac.addSuggester(mockSugLug);
        	this.ac.setViewControl(mockView);

            this.simulateType('inputText', 'ciudad', function() {
                test.resume.defer(500, this, [(function() {
                    mockView.verify();
                })]);
            });
        	this.wait();
        },
        
        "Unsuccesful search should not re-update suggestions" : function () {
            var test = this;
            var mockView = usig.Mock(Y);
            mockView.expect({ method: 'update' });
            mockView.expect({ method: 'show', callCount: 1 });
            mockView.expect({ method: 'onSelection' });
            mockView.expect({ method: 'keyUp' });
            mockView.expect({ method: 'hide' });
            mockView.expect({ method: 'remove' });
            mockView.expect({ method: 'setOptions' });

            var mockSugDir = {
                name: 'mockSugDir',
                getSuggestions: function (str, callbackSugerir, maxSuggestions) {
                    callbackSugerir(['Ciudad de la paz']);
                },
                abort: function () {},
            	setOptions: function() {}
            }

            var mockSugLug = {
                name: 'mockSugLug', 
                getSuggestions: function (str, callbackSugerir, maxSuggestions) {
                    callbackSugerir([]);
                },
                abort: function () {},
            	setOptions: function() {}
            }

            this.ac.addSuggester(mockSugDir);
            this.ac.addSuggester(mockSugLug);
            this.ac.setViewControl(mockView);

            this.simulateType('inputText', 'ciudad', function() {
                test.resume.defer(500, this, [(function() {
                    mockView.verify();
                })]);
            });
            this.wait();
        },
        
        "Every keystroke should be passed to the view control" : function () {
        	var test = this;
        	var mockView = usig.Mock(Y);
        	mockView.expect({ method: 'update', callCount: 6 });
        	mockView.expect({ method: 'show' });
        	mockView.expect({ method: 'keyUp', callCount: 8 });
        	mockView.expect({ method: 'hide' });
        	mockView.expect({ method: 'onSelection' });
        	mockView.expect({ method: 'remove' });
        	mockView.expect({ method: 'setOptions' });
        	this.ac.setViewControl(mockView);
        	this.simulateType('inputText', 'ciudad');
  			Y.one('#inputText').simulate("keydown", { keyCode: 38 });
  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
			mockView.verify();
    	},
        
//        "User selection should trigger callback" : function () {
//        	usig.debug("User selection should trigger callback");
//        	var test = this;
//        	var mockND = usig.Mock(Y);
//        	mockND.expect({ method: 'normalizar', callCount: 1 });
//        	mockND.expect({ method: 'setOptions'});
//        	var mockInv = usig.Mock(Y);
//        	mockInv.expect({ method: 'buscar', callCount: 1 });
//        	mockInv.expect({ method: 'abort'});
//        	mockInv.expect({ method: 'setOptions'});
//        	this.ac.setViewControl({
//        		update: function() {},
//        		show: function() {},
//        		hide: function() {},
//        		keyUp: function() {},
//        		onSelection: function(callback) {
//        			callback.defer(600, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
//        		},
//        		remove: function() {},
//        		setOptions: function() {}
//        	});
//        	this.ac.setOptions({
//        		normalizadorDirecciones: mockND,
//        		inventario: mockInv,
//        		afterSelection: function() {
//	        		test.resume(function() {
//	        			mockND.verify();
//	        			mockInv.verify();
//	        		});
//        		},
//				inputPauseBeforeServerSearch: 200,
//        		inputPause: 200
//        	});
//        	this.simulateType('inputText', 'ciudad');
//        	this.wait();
//        },
          
//        "User selection should trigger callback with the real NormalizadorDirecciones" : function () {
//        	var test = this;
//        	var mockInv = usig.Mock(Y);
//        	mockInv.expect({ method: 'buscar', callCount: 1 });
//        	mockInv.expect({ method: 'abort'});
//        	mockInv.expect({ method: 'setOptions'});
//        	this.ac.setViewControl({
//        		update: function() {},
//        		show: function() {},
//        		keyUp: function() {},
//        		hide: function() {},
//        		onSelection: function(callback) {
//        			callback.defer(600, this, [new usig.Calle(3174, 'CORRIENTES AV.')]);
//        		},
//        		remove: function() {},
//        		setOptions: function() {}
//        	});
//        	this.ac.setOptions({
//        		normalizadorDirecciones: new usig.NormalizadorDirecciones(),
//        		inventario: mockInv,
//        		afterSelection: function() {
//	        		test.resume(function() {
//	        			mockInv.verify();
//	        		});
//        		},
//				inputPauseBeforeServerSearch: 200,
//        		inputPause: 200
//        	});
//        	this.simulateType('inputText', 'ciudad');
//        	this.wait();
//        },
        
        "If afterGeoCoding is set, user selection of an address should try to geocode it" : function () {
        	var test = this;

            var mockSugDir = usig.Mock(Y);
            mockSugDir.name = 'mockSugDir';
            mockSugDir.getSuggestions = function (str, callbackSugerir, maxSuggestions) {
                callbackSugerir(['CORRIENTES AV. 3174']);
            };
            mockSugDir.expect({ method: 'getGeoCoding', callCount: 1 });
            mockSugDir.expect({ method: 'abort' });
            mockSugDir.expect({ method: 'setOptions' });
            this.ac.addSuggester(mockSugDir);

            var mockView = usig.Mock(Y);
            mockView.expect({ method: 'update' });
            mockView.expect({ method: 'show', callCount: 1 });
            mockView.onSelection = function(callback) {
                var opt = new usig.Calle(3174, 'CORRIENTES AV.');
                opt.suggesterName = 'mockSugDir';
                callback.defer(600, this, [opt]);
            };
            mockView.expect({ method: 'keyUp' });
            mockView.expect({ method: 'hide' });
            mockView.expect({ method: 'remove' });
            mockView.expect({ method: 'setOptions' });
            this.ac.setViewControl(mockView);
            
        	this.ac.setOptions({
        		afterGeoCoding: function(res) {},
        		inputPause: 200
        	});
        	this.simulateType('inputText', 'corrientes 3174');
            Y.one('#inputText').simulate("keydown", { keyCode: 40 });
            Y.one('#inputText').simulate("keydown", { keyCode: 13 });
            test.resume.defer(1000, this, [(function() {
                    mockSugDir.verify();
                })]);
        	this.wait();
        }/**/
    });
    
/*************************************************************************/
/*************************************************************************/
    Y.AutoCompleter.test.IntegracionTestCaseDirecciones = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de integracion Direcciones",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	var sgDir = new usig.SuggesterDirecciones({ debug: true });
        	this.ac = new usig.AutoCompleter('inputText', {
        		debug: true, suggesters: [],
        		rootUrl: '../',
        		skin: 'usig'
//        		suggesters: [{ suggester: sgDir }],
        	});
        	this.ac.addSuggester(sgDir);
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
        		Y.one('#'+id).simulate("keydown", { keyCode: str.charCodeAt(i) });
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
	        		test.resume.defer(500, this, [(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        			Y.Assert.areEqual(3, $('ul.options').children().length);
//	        			Y.Assert.areEqual('CIUDAD DE LA PAZ', $('ul.options').children().children()[0]);
//	        			Y.Assert.areEqual('CIUDAD DE SABADELL', $('ul.options').children().children()[1].textContent);
//	        			Y.Assert.areEqual('CIUDADELA', $('ul.options').children().children()[2].textContent);
	        		})]);        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();
        },
        
        "Selecting a street should put its name as value of the control" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Calle, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ', $('#inputText').val());
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad');
        	this.wait();
        },

        "Selecting an address should put its name as value of the control" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Direccion, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ 2849', $('#inputText').val());
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad 2849');
        	this.wait();
        },
        
        "Non-existing name should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        			Y.Assert.isNotUndefined($('div.message')[0]);
	        			Y.Assert.areEqual("No pudo hallarse ninguna calle existente que coincidiera con su búsqueda. Por favor, revise el nombre ingresado y vuelva a intentarlo.", $('div.message')[0].innerHTML);
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
	        			Y.Assert.isNotUndefined($('div.message')[0]);
	        			usig.debug($('div.message')[0].textContent);
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
	        			Y.Assert.isNotUndefined($('div.message')[0]);
	        			usig.debug($('div.message')[0].textContent);
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
	        			Y.Assert.isNotUndefined($('div.message')[0]);
	        			usig.debug($('div.message')[0].textContent);
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
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });
        		},
        		afterGeoCoding: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, obj);
	        			Y.Assert.areEqual('CIUDAD DE LA PAZ 2849', $('#inputText').val());
	        			Y.Assert.areEqual('100028.56071', obj.getX());
	        			Y.Assert.areEqual('108089.39333', obj.getY());
	        			usig.debug($('#inputText').val());
	        			usig.debug(obj);
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'ciudad 2849');
        	this.wait();        	
        }/**/
    });

/*************************************************************************/
/*************************************************************************/
    Y.AutoCompleter.test.IntegracionTestCaseLugares = new Y.Test.Case({
        
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de integracion Lugares",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	var sgLug = new usig.SuggesterLugares({ debug: true });
        	this.ac = new usig.AutoCompleter('inputText', {
        		debug: true, suggesters: [],
        		rootUrl: '../',
        		skin: 'usig',
        		suggesters: [ { suggester: sgLug, options: {inputPause: 200} } ]
        	});
//        	this.ac.addSuggester(sgLug);
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
        		Y.one('#'+id).simulate("keydown", { keyCode: str.charCodeAt(i) });
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
	        			Y.Assert.areEqual(2, $('ul.options').children().length);
	        			usig.debug($('ul.options').children().children());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'malba');
        	this.wait();
        },

        "Selecting a place should put its name as value of the control 1" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.inventario.Objeto, obj);
	        			Y.Assert.areEqual('Libreria del MALBA', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'malba');
        	this.wait();        	
        },
		
        "Selecting a place should put its name as value of the control 2" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.inventario.Objeto, obj);
	        			Y.Assert.areEqual('Museo de Arte Latinoamericano de Buenos Aires (MALBA)', $('#inputText').val());
	        			usig.debug($('#inputText').val());
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
	        			Y.Assert.isNotUndefined($('div.message')[0]);
//	        			Y.Assert.areEqual("No se hallaron resultados coincidentes con su búsqueda.", $('div.message')[0].textContent);
	        			usig.debug($('div.message')[0].textContent);
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'qwerty');
        	this.wait();
        },
        
        "If a valid place is selected and afterGeoCoding is set it should be called" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},

        		afterGeoCoding: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, obj);
	        			Y.Assert.areEqual('Libreria del MALBA', $('#inputText').val());
	        			Y.Assert.areEqual('105462.5745440000027884', obj.getX());
	        			Y.Assert.areEqual('105769.7618450000009034', obj.getY());
	        			usig.debug($('#inputText').val());
	        			usig.debug(obj);
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'malba');
        	this.wait();
        }
    });

/*************************************************************************/
/*************************************************************************/
    Y.AutoCompleter.test.IntegracionTestCaseCatastro = new Y.Test.Case({
        
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de integracion Lugares",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	var sgCat = new usig.SuggesterCatastro({ debug: true });
        	this.ac = new usig.AutoCompleter('inputText', {
        		debug: true, suggesters: [],
        		rootUrl: '../',
        		skin: 'usig',
        		suggesters: []
        	});
        	this.ac.addSuggester(sgCat, {inputPause: 100});
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
        		Y.one('#'+id).simulate("keydown", { keyCode: str.charCodeAt(i) });
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
	        			Y.Assert.areEqual(2, $('ul.options').children().length);
	        			Y.Assert.areEqual(2, $('ul.options').children().length);
//	        			Y.Assert.areEqual('05-022-019B', $('ul.options').children().children()[1].textContent);
	        			usig.debug($('ul.options').children().children());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', '05-022-019');
        	this.wait();
        },
        
        "Selecting a place should put its name as value of the control 1" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, obj);
	        			Y.Assert.areEqual('05-022-019A', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', '05-022-019');
        	this.wait();        	
        },
        
        "Selecting a place should put its name as value of the control 2" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},
        		afterSelection: function(obj) {
	        		test.resume(function() {
	        			usig.debug($('#inputText').val());
	        			Y.Assert.isInstanceOf(usig.ParcelaCatastral, obj);
	        			Y.Assert.areEqual('05-022-010', $('#inputText').val());
	        		});        			
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', '05-022-01');
        	this.wait();        	
        },
        
        "Non-existing name should show an explanatory message" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
	        		test.resume(function() {
	        			Y.Assert.areEqual(1, $('div.usig_acv').length);
	        			Y.Assert.isNotUndefined($('div.message')[0]);
//	        			Y.Assert.areEqual("Los parametros ingresados son incorrectos.", $('div.message')[0].textContent);
	        			usig.debug($('div.message')[0].textContent);
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', 'qwerty');
        	this.wait();
        },
        
        "If a valid place is selected and afterGeoCoding is set it should be called" : function () {
        	var test = this;
        	this.ac.setOptions({
        		afterSuggest: function() {
		  			Y.one('#inputText').simulate("keydown", { keyCode: 40 });
		  			Y.one('#inputText').simulate("keydown", { keyCode: 13 });        			
        		},

        		afterGeoCoding: function(obj) {
	        		test.resume(function() {
	        			Y.Assert.isInstanceOf(usig.Punto, obj);
	        			Y.Assert.areEqual('05-022-019A', $('#inputText').val());
	        			Y.Assert.areEqual('106820.707651072', obj.getX());
	        			Y.Assert.areEqual('102679.4015', obj.getY());
	        			usig.debug($('#inputText').val());
	        			usig.debug(obj);
	        		});
        		},
        		inputPause: 200,
        		minTextLength: 3
        	});
        	this.simulateType('inputText', '05-022-019A');
        	this.wait();
        }
    });

    Y.AutoCompleter.test.AutoCompleterSuite = new Y.Test.Suite("AutoCompleter");
    Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.EventsTestCase);
    Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.IntegracionTestCaseDirecciones);
    Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.IntegracionTestCaseLugares);
    Y.AutoCompleter.test.AutoCompleterSuite.add(Y.AutoCompleter.test.IntegracionTestCaseCatastro);
    
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