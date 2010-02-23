// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.debug) == "undefined") {
	usig.debug = function(object) {	
		if (window.console && window.console.log)
				window.console.log(object);
	}	
}





usig.Event = function(type, data) {
	
	this.type = type;
	
	this.data = data;
	
	this.raise = function() {
		usig.events.trigger(this);		
	}
	
}


usig.EventListener = function(handler) {
	
	this.handler = handler;	
	
	this.handle = function(event) {
		this.handler(event);	
	}
	
}

usig.AppEvents = function() {
	
	this.listeners = new Array();
	
	this.trigger = function(event) {
		var list = this.listeners[event.type];
		if(list != undefined) {
			$.each(list,function(i,listener) {
				listener.handle(event);
			});
		}
	}
	
	this.register = function(type, listener) {
		var list = this.listeners[type];
		if(list == undefined) {
			list = new Array();
			this.listeners[type] = list;	
		}			

		list.push(listener);
	}
	
}

if (typeof (usig.events) == "undefined")
	usig.events = new usig.AppEvents();
	