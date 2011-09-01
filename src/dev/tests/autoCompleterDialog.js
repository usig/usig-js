YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("AutoCompleterDialog.test");
    
    Y.AutoCompleterDialog.test.AutoCompleterDialogTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests del AutoCompleterDialog",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	document.getElementById('inputText').value = '';
        	$('#inputText').focus();
        	this.acv = new usig.AutoCompleterDialog('inputText', {
        		debug: true,
        		rootUrl: '../',
        		skin: 'usig'
        	});
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	this.acv.remove();
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
                      
        "Showing a message should display a floating dialog below the control" : function () {
        	var msg = 'Un mensaje es una cadena de texto plano.';
        	this.acv.showMessage('Un mensaje es una cadena de texto plano.');
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content div.message').length);
        	Y.Assert.areEqual(msg, $('div.usig_acv div.content div.message').text());
        },
        
        "Showing a short list of objects should display them all" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        },
        
        "Calling show in append mode should add items to the current list" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}}        	
        	]);
        	this.acv.show([
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}}
        	], true);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(5, $('div.usig_acv div.content ul.options li').length);
        },
        
        "Calling show with an offset should add items to the current list after that offset" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},
        	"Buscando lugares..."
        	]);
        	this.acv.show([
        	"Se hallaron los siguientes lugares:",
        	{toString: function() { return 'Lugar 1'}}
        	], 3);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(5, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	Y.Assert.areEqual("Se hallaron los siguientes lugares:", $('div.usig_acv div.content ul.options li.message').text());
        },
        
        "A long list of items should be trimmed to the maximum number allowed" : function() {
        	this.acv.setOptions({ maxOptions: 10 });
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}},
        	{toString: function() { return 'Option 6'}},
        	{toString: function() { return 'Option 7'}},
        	{toString: function() { return 'Option 8'}},
        	{toString: function() { return 'Option 9'}},
        	{toString: function() { return 'Option 10'}},
        	{toString: function() { return 'Option 11'}},
        	{toString: function() { return 'Option 12'}}
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(10, $('div.usig_acv div.content ul.options li').length);
        },
        
        "Appending to a too-long list should do nothing" : function() {
        	this.acv.setOptions({ maxOptions: 10 });
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}},
        	{toString: function() { return 'Option 6'}},
        	{toString: function() { return 'Option 7'}},
        	{toString: function() { return 'Option 8'}},
        	{toString: function() { return 'Option 9'}},
        	{toString: function() { return 'Option 10'}},
        	{toString: function() { return 'Option 11'}},
        	{toString: function() { return 'Option 12'}}
        	]);
        	this.acv.show([
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}}
        	], true);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(10, $('div.usig_acv div.content ul.options li').length);
        },
        
        "Appending to a too-long list from an offset in limit should override last items" : function() {
        	this.acv.setOptions({ maxOptions: 10 });
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}},
        	{toString: function() { return 'Option 6'}},
        	{toString: function() { return 'Option 7'}},
        	{toString: function() { return 'Option 8'}},
        	{toString: function() { return 'Option 9'}},
        	{toString: function() { return 'Option 10'}},
        	{toString: function() { return 'Option 11'}},
        	{toString: function() { return 'Option 12'}}
        	]);
        	this.acv.show([
        	{toString: function() { return 'Option 3'}},
        	{toString: function() { return 'Option 4'}},
        	{toString: function() { return 'Option 5'}}
        	], 8);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(10, $('div.usig_acv div.content ul.options li').length);
        },
        
        "Pressing arrow-down while showing a list should highlight the first item" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	Y.Assert.areEqual(0, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        },
        
        "Pressing arrow-down twice while showing a list should highlight the 2nd item" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	Y.Assert.areEqual(0, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        	Y.assert($('div.usig_acv div.content ul.options li').slice(1, 2).hasClass('highlight'));
        },
        
        "Pressing arrow-down beyond the last item should leave the last item highlighted" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	Y.Assert.areEqual(0, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(40);
        	this.acv.keyUp(40);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        	Y.assert($('div.usig_acv div.content ul.options li').slice(2, 3).hasClass('highlight'));
        },
        
        "Pressing arrow-up while showing a new list should highlight the first item" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	Y.Assert.areEqual(0, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(38);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        },
        
        "Pressing arrow-down followed by arrow-up should not modify the highlighted item" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	this.acv.keyUp(40);
        	Y.assert($('div.usig_acv div.content ul.options li:first').hasClass('highlight'));
        	this.acv.keyUp(40);
        	Y.assert(!$('div.usig_acv div.content ul.options li:first').hasClass('highlight'));
        	this.acv.keyUp(38);
        	Y.assert($('div.usig_acv div.content ul.options li:first').hasClass('highlight'));
        },
        
        "Mouse-over on a selectable item should highlight it" : function() {
        	this.acv.show([
        	{toString: function() { return 'Option 1'}},
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
  			Y.one('div.usig_acv ul.options li a').simulate("mouseover");
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        },
        
        "Mouse-click on a selectable item should trigger callback" : function() {
        	var obj1 = {toString: function() { return 'Option 1'}, selected: false }; 
        	this.acv.show([
        	obj1,
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	this.acv.setOptions({
        		onSelection: function(selected) {
        			selected.selected = true;
        			Y.Assert.areEqual(obj1, selected);
        		}
        	});
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
  			Y.one('div.usig_acv ul.options li a').simulate("mouseover");
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
  			Y.one('div.usig_acv ul.options li a span').simulate("click");
        	Y.assert(obj1.selected);
        },
        
        "Pressing ENTER on a selected item should trigger callback" : function() {
        	var obj1 = {toString: function() { return 'Option 1'}, selected: false };
        	this.acv.show([
        	obj1,
        	{toString: function() { return 'Option 2'}},
        	{toString: function() { return 'Option 3'}},        	
        	"Buscando lugares..."        	
        	]);
        	this.acv.setOptions({
        		onSelection: function(selected) {
        			selected.selected = true;
        			Y.Assert.areEqual(obj1, selected);
        		}
        	});
        	Y.Assert.areEqual(1, $('div.usig_acv').length);
        	Y.Assert.areEqual(4, $('div.usig_acv div.content ul.options li').length);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.message').length);
        	this.acv.keyUp(40);
        	Y.Assert.areEqual(1, $('div.usig_acv div.content ul.options li.highlight').length);
        	this.acv.keyUp(13);
        	Y.assert(obj1.selected);
        }

    });
    
    Y.AutoCompleterDialog.test.AutoCompleterDialogSuite = new Y.Test.Suite("AutoCompleterDialog");
    Y.AutoCompleterDialog.test.AutoCompleterDialogSuite.add(Y.AutoCompleterDialog.test.AutoCompleterDialogTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.AutoCompleterDialog.test.AutoCompleterDialogSuite);
    Y.Test.Runner.run();
});