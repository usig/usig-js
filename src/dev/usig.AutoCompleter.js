// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleter
 * Esta clase implementa un autocompleter de lugares y direcciones para inputs de texto.<br/>
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
 * @param {Object} viewCtrl (optional) Controlador de la vista para mostrar las sugerencias del autocompleter
*/	
usig.AutoCompleter = function(idField, options, viewCtrl) {
	var field = document.getElementById(idField);
	var view = viewCtrl;
	var opts = $.extend({}, usig.AutoCompleter.defaults, options);
	var ic = null;
	var inputTimer = null;
	var serverTimeout = null;
	var numRetries = 0;
		
	/**
	 * Elimina los manejadores de eventos del control 
    */		
	this.unbind = function() {
		if (inputTimer)
			clearTimeout(inputTimer);
		if (serverTimeout)
			clearTimeout(serverTimeout);
		view.remove();
		ic.unbind();
	}
	
	/**
	 * Setea los manejadores de eventos sobre el control 
    */		
	this.bind = function() {
		ic.bind();
	}
	
	
	/**
	 * Setea el control de visualizacion de sugerencias
	 * @param {Object} viewCtrl Controlador de la vista para mostrar las sugerencias del autocompleter
    */	
	this.setViewControl = function(viewCtrl) {
		view = viewCtrl;
		view.onSelection(selectionHandler.createDelegate(this));
	}
	
	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
	}
	
	function normalizar(str) {
		try {
			if (opts.debug) if (opts.debug) usig.debug('normalizar("'+str+'")');
			var res = opts.normalizadorDirecciones.normalizar(str);
			if (opts.debug) usig.debug('view.show');
			view.show(res);
			if (typeof(opts.afterSuggest) == "function") {
				if (opts.debug) usig.debug('afterSuggest');
				opts.afterSuggest();
			}
		} catch(error) {
			if (opts.debug) usig.debug(error);
			// if (opts.debug) usig.debug('view.showError');
			// view.showError(error);
		}		
		if (opts.debug) usig.debug('inventario.buscar');
		opts.inventario.buscar(str, mostrarLugares.createDelegate(this, [str], 1), function(){}, { returnObjects: true });
		serverTimeout = retry.defer(opts.serverTimeout, this, [str]);
		if (typeof(opts.afterServerRequest) == "function") {
			if (opts.debug) usig.debug('afterServerRequest');
			opts.afterServerRequest();
		}
	}
	
	function retry(str) {
		opts.inventario.buscar(str);
		numRetries++;
		if (numRetries < opts.maxRetries) { 
			serverTimeout = retry.defer(opts.serverTimeout, this, [str]);
		} else {
			if (opts.debug) usig.debug('maxRetries reached. stopping.');
			numRetries = 0;
		}
		if (typeof(opts.afterRetry) == "function") {
			if (opts.debug) usig.debug('afterRetry');
			opts.afterRetry();
		}		
	}
	
	function mostrarLugares(lugares, inputStr) {
		clearTimeout(serverTimeout);
		if (lugares instanceof Array && lugares.length > 0) {
			if (opts.debug) usig.debug('view.show');
			view.show(lugares);			
			if (typeof(opts.afterSuggest) == "function") {
				if (opts.debug) usig.debug('afterSuggest');
				opts.afterSuggest();
			}
		}
		if (typeof(opts.afterServerResponse) == "function") {
			if (opts.debug) usig.debug('afterServerResponse');
			opts.afterServerResponse();
		}
	}
	
	function abortIfNecessary() {
		if (serverTimeout) {
			clearTimeout(serverTimeout);
			if (opts.debug) usig.debug('inventario.abort');					
			opts.inventario.abort();
			if (typeof(opts.afterAbort) == "function") {
				if (opts.debug) usig.debug('afterAbort');
				opts.afterAbort();
			}
		}		
	}
	
	function selectionHandler(option) {
		if (opts.debug) usig.debug('usig.AutoCompleter: selection');
		abortIfNecessary();
		var newValue = option.toString()+((option instanceof usig.Calle)?' ':'');
		ic.setValue(newValue);
		if (typeof(opts.afterSelection) == "function") {
			if (opts.debug) usig.debug('usig.AutoCompleter: calling afterSelection');
			opts.afterSelection(option);
		}
		if (typeof(opts.afterGeoCoding) == "function") {
			if (option instanceof usig.Direccion) {
				if (opts.debug) usig.debug('usig.AutoCompleter: geoCoding usig.Direccion');	
				try {
					opts.geoCoder.geoCodificarDireccion(option, opts.afterGeoCoding, (function(error) {
						if (opts.debug) usig.debug(error);
					}).createDelegate(this));
				} catch(error) {
					if (opts.debug) usig.debug(error);
				}
			}
		}
	}
	
	// Inicializacion
	try {
		ic = new usig.InputController(idField, {
			onKeyUp: function(keyCode, newValue) {
				if (opts.debug) usig.debug('view.keyUp');
				view.keyUp(keyCode);
			},
			onChange: function(newValue) {
				try {
					if (opts.debug) usig.debug('view.update: '+newValue);
					abortIfNecessary();
					view.update(newValue);
				} catch(error) {
					throw(error);
				}
				if (inputTimer) {
					clearTimeout(inputTimer);
				}
				if (newValue.length > opts.minTextLength) {
					inputTimer = normalizar.defer(opts.inputPause, this, [newValue]);
				}
			}
		});
	} catch(error) {
		throw(error);
	}
	
	if (!opts.normalizadorDirecciones) {
		opts.normalizadorDirecciones = new usig.NormalizadorDirecciones();
	}
	
	if (!opts.inventario) {
		opts.inventario = new usig.Inventario({ debug: opts.debug });
	}
	
	if (!opts.geoCoder) {
		opts.geoCoder = new usig.GeoCoder({ debug: opts.debug });
	}
	
	if (!view) {
		view = new usig.AutoCompleterView(idField, { rootUrl: opts.rootUrl, debug: opts.debug });
	}
	
	view.onSelection(selectionHandler.createDelegate(this));
}

usig.AutoCompleter.defaults = {
	minTextLength: 3,
	inputPause: 1000,
	serverTimeout: 5000,
	maxRetries: 10,
	maxOptions: 10,
	rootUrl: '',
	debug: false
}