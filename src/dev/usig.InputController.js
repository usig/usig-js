// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class InputController
 * Esta clase implementa un controlador de inputs de texto que simplifica el manejo dinamico de los cambios sobre el control.
 * @namespace usig
 * @cfg {Function} onKeyUp Funcion callback que se dispara al presionar cualquier tecla sobre el control. Recibe dos parametros: keyCode y newValue.
 * @cfg {Function} onChange Funcion callback que se dispara cuando el valor de texto del control se modifica. Recibe como parametro el nuevo valor.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.InputController = function(idField, options) {
	var field = document.getElementById(idField);
	var previousValue = '';

	var opts = $.extend({}, usig.InputController.defaults, options);
	
	var onEvent = function(ev) {
		var key = (window.event) ? window.event.keyCode : ev.keyCode;
		if (typeof(opts.onKeyUp) == "function") {
			opts.onKeyUp(key, field.value);
		}
		if (field.value != previousValue && typeof(opts.onChange) == "function") {
			previousValue = field.value;
			opts.onChange(field.value);			
		}
	}
	
	var eventHandler = onEvent.createDelegate(this);
	
	/**
	 * Elimina los manejadores de eventos del control 
    */		
	this.unbind = function() {
		$(field).unbind(opts.events, eventHandler);
	}
	
	/**
	 * Setea los manejadores de eventos sobre el control 
    */		
	this.bind = function() {
		$(field).bind(opts.events, eventHandler);
		previousValue = $(field).val();		
	}
	
	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
	}
	
	if (!field) {
		throw "InvalidField";
		return;
	} else {
		this.bind();
	}
}

usig.InputController.defaults = {
	events: 'blur keyup input'
}