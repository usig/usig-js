// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof(usig.Event) == "undefined") {	
	usig.Event = function(type, data) {		
		this.type = type;
		this.data = data;		
	};
}
	
/**
 * @class Publisher
 * Esta es una clase abstracta de la que deben heredar aquellos componentes que quieran funcionar como
 * publicadores de eventos. 
 * Requiere: jQuery-1.3.2+, jquery.class<br/>
 * @namespace usig
*/	
usig.Publisher = jQuery.Class.create({
	
	init: function(){
		this.eventListeners = new Array();
	},
	
	/**
	 * Dado un usig.Event llama a todos los suscriptores registrados y lo pasa como parametro
	 * @param {usig.Event} event Evento a disparar 
	 */
	trigger: function(event) {
		var list = this.eventListeners[event.type];
		if(list != undefined) {
			$.each(list,function(i,listener) {
				listener(event);
			});
		}
	},
	
	/**
	 * Permite registrar un suscriptor para un evento dado
	 * @param {String} eventType Evento al que se desea suscribir
	 * @param {Function} listener Funcion que manejara el evento cuando se dispare 
	 */
	on: function(eventType, listener) {
		if(this.eventListeners[eventType] == undefined) {
			var list = new Array();
			this.eventListeners[eventType] = list;	
		} else {
			var list = this.eventListeners[eventType];			
		}			
		list.push(listener);
	}
});

