// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleterView
 * Esta clase implementa un cuadro de dialogo flotante que permite seleccionar las opciones
 * provistas por el autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 1.0+
 * @namespace usig
 * @cfg {Integer} minTextLength Longitud minima que debe tener el texto de entrada antes de buscar sugerencias. Por defecto: 3.
 * @cfg {Integer} inputPause Minima pausa (en milisegundos) que debe realizar el usuario al tipear para que se actualicen las sugerencias. Por defecto: 1000.
 * @cfg {Integer} serverTimeout Tiempo de maximo de espera antes de reintentar un pedido al servidor. Por defecto: 5000.
 * @cfg {Integer} maxRetries Maximo numero de reintentos al servidor ante una falla. Por defecto: 10.
 * @cfg {Integer} maxOptions Maximo numero de opciones a mostrar como sugerencia. Por defecto: 10.
 * @cfg {Function} afterSuggest Callback que es llamada cada vez que se actualizan las sugerencias.
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} afterSelection Callback que es llamada cada vez que el usuario selecciona una opcion de la lista de sugerencias.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.AutoCompleterView = function(idField, options) {
	var field = document.getElementById(idField);
	var opts = $.extend({}, usig.AutoCompleter.defaults, options);

	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
	}

	/**
	 * Actualiza la vista de acuerdo con el nuevo valor del input decidiendo si corresponde
	 * ocultar las opciones actualmente visibles o si las mismas siguen siendo validas.
     * @param {String} newValue El nuevo valor del input text 
    */	
	this.update = function(newValue) {
	}

	/**
	 * Muestra nuevas opciones de sugerencias
     * @param {Array} options Un array conteniendo las nuevas sugerencias a mostrar  
    */	
	this.show = function(options) {
	}

	/**
	 * Este metodo permite indicarle a la vista que el usuario presiono una tecla determinada
     * @param {Integer} keyCode Codigo de la tecla presionada. 
    */	
	this.keyUp = function(keyCode) {
	}
	
	
	// Inicializacion	
}

usig.AutoCompleterView.defaults = {
	maxOptions: 10,
	autoHideTime: 3000,
	debug: false
}