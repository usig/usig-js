// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class InputController
 * Esta clase implementa un controlador de inputs de texto que simplifica el manejo dinamico de los cambios sobre el control.<br/>
 * Tests de Unidad: <a href="http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/tests/inputController.html">http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/tests/inputController.html</a>
 * @namespace usig
 * @cfg {Function} onKeyUp Funcion callback que se dispara al presionar cualquier tecla sobre el control. Recibe dos parametros: keyCode y newValue.
 * @cfg {Function} onChange Funcion callback que se dispara cuando el valor de texto del control se modifica. Recibe como parametro el nuevo valor.
 * @cfg {Function} onBlur Funcion callback que se dispara cuando el control pierde foco.
 * @cfg {Function} onFocus Funcion callback que se dispara cuando el control gana foco.
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
		if (ev.type != "blur" && ev.type != "focus" && typeof(opts.onKeyUp) == "function") {
			opts.onKeyUp(key, field.value);
		}
		if (ev.type != "blur" && ev.type != "focus" && field.value != previousValue && typeof(opts.onChange) == "function") {
			previousValue = field.value;
			opts.onChange(field.value);			
		}
		if (ev.type == "blur" && typeof(opts.onBlur) == "function") {
			if (opts.debug) usig.debug('usig.InputController: blur');
			opts.onBlur();
		}
		if (ev.type == "focus" && typeof(opts.onFocus) == "function") {
			if (opts.debug) usig.debug('usig.InputController: focus');
			opts.onFocus();
		}
	}
	
	var eventHandler = onEvent.createDelegate(this);
	
	/**
	 * Elimina los manejadores de eventos del control 
    */		
	this.unbind = function() {
		if (opts.debug) usig.debug('usig.InputController: unbind');
		$(field).unbind(opts.events, eventHandler);
	}
	
	/**
	 * Setea los manejadores de eventos sobre el control 
    */		
	this.bind = function() {
		if (opts.debug) usig.debug('usig.InputController: bind');
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
		
	/**
	 * Setea un nuevo valor en el control
     * @param {String} newValue Nuevo valor para setear en el control 
    */	
	this.setValue = function(newValue) {
		field.value = newValue;
		previousValue = newValue;
	}
	
	if (!field) {
		throw "InvalidField";
		return;
	} else {
		this.bind();
	}
}

usig.InputController.defaults = {
	events: 'blur keyup input focus'
}