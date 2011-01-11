YUI({combine: true, timeout: 10000}).use("node", "console", "test", "event", "node-event-simulate", function (Y) {

    Y.namespace("jQueryClass.test");
    
    Y.jQueryClass.test.jQueryClassTestCase = new Y.Test.Case({
    
        //name of the test case - if not provided, one is auto-generated
        name : "Tests de jQueryClass",
        
        //---------------------------------------------------------------------
        // setUp and tearDown methods - optional
        //---------------------------------------------------------------------
        
        /*
         * Sets up data that is needed by each test.
         */
        setUp : function () {
        	this.Person = jQuery.Class.create({
			  init: function(name){
			    this.name = name;
			  },
			  sayName: function(){
			    return this.name;
			  }
			});
			
			this.ClassyDude = this.Person.extend({
			  sipWine: function(){
			    return "Has a beautiful bouquet.";
			  }
			});
			
			this.Ninja = this.Person.extend({
			  sayName: function(){
			    // Call the inherited version of sayName()
			    return this._super();
			  },
			  swingSword: function(){
			    return true;
			  }
			});
        },
        
        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function () {
        	delete this.Person;
        	delete this.ClassyDude;
        	delete this.Ninja;
        },
        
        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------
                      
        "A person should know it's name" : function () {
        	var p = new this.Person('Paul');
        	Y.Assert.areEqual('Paul', p.sayName());
        },
        
        "A Ninja should swing sword and know it's name" : function () {
        	var n = new this.Ninja('Joe');
        	Y.Assert.areEqual('Joe', n.sayName());
        	Y.Assert.isTrue(n.swingSword());
        },
        
        "A classy dude should sip wine" : function () {
        	var c = new this.ClassyDude('Peter');
        	Y.Assert.areEqual('Peter', c.sayName());
        	Y.Assert.areEqual('Has a beautiful bouquet.', c.sipWine());
        },
        
        "A person should be an instance of Person and Class" : function () {
        	var p = new this.Person('Paul');
        	Y.Assert.isInstanceOf(this.Person, p);	
        	Y.Assert.isInstanceOf(jQuery.Class, p);	
        },
        
        "A ninja should be an instance of Ninja, Person and Class" : function () {
        	var n = new this.Ninja('Joe');
        	Y.Assert.isInstanceOf(this.Ninja, n);	
        	Y.Assert.isInstanceOf(this.Person, n);	
        	Y.Assert.isInstanceOf(jQuery.Class, n);	
        }

    });
    
    Y.jQueryClass.test.jQueryClassSuite = new Y.Test.Suite("jQueryClass");
    Y.jQueryClass.test.jQueryClassSuite.add(Y.jQueryClass.test.jQueryClassTestCase);
    
    //create the console
    var r = new Y.Console({
        newestOnTop : false,
        style: 'block', // to anchor in the example content
        width: '100%',
        height: '500px'
    });
    
    r.render('#testLogger');
    
    Y.Test.Runner.add(Y.jQueryClass.test.jQueryClassSuite);
    Y.Test.Runner.run();
});