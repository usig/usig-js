// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleter
 * Esta clase implementa un autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 1.0+, Normalizador de Direcciones 1.0+, usig.Inventario 2.0+, usig.GeoCoder 2.0+
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.AutoCompleterFull.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;servicios.usig.buenosaires.gov.ar/usig-js/2.0/usig.AutoCompleterFull.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.AutoCompleter('inputField', {
 *              afterSelection: function(option) {
 * 					...
 *              }
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/demos/autoCompleter.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/demo/autoCompleter.html</a><br/>
 * Documentaci&oacute;n: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/doc/">http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/doc/</a><br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/autoCompleter.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/autoCompleter.html</a>
 * @namespace usig
 * Opciones para los suggesters
 * @cfg {Integer} inputPause Minima pausa (en milisegundos) que debe realizar el usuario al tipear para que se actualicen las sugerencias. Por defecto: 1000.
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a buscar. Por defecto: 10
 * @cfg {Integer} serverTimeout Tiempo de maximo de espera antes de reintentar un pedido al servidor. Por defecto: 5000.
 * @cfg {Integer} minTextLength Longitud minima que debe tener el texto de entrada antes de buscar sugerencias. Por defecto: 3.
 * @cfg {Integer} maxRetries Maximo numero de reintentos al servidor ante una falla. Por defecto: 10.
 * @cfg {Boolean} showError Mostrar mensajes de error. Por defecto: true
 * Opciones para el AutoCompleterView
 * @cfg {Integer} maxOptions Maximo numero de opciones a mostrar como sugerencia. Por defecto: 10.
 * @cfg {Integer} offsetY Desplazamiento vertical (en pixels) del control respecto del campo de entrada de texto. Por defecto: -5.
 * @cfg {Integer} zIndex Valor del atributo css z-index a utilizar para las sugerencias. Por defecto: 10000.
 * @cfg {Integer} autoHideTimeout Tiempo de espera (en ms) antes de ocultar las sugerencias si el usuario no realizar ninguna accion sobre el control. Por defecto: 5000.
 * @cfg {String} rootUrl Url del servidor donde reside el control.
 * @cfg {String} skin Nombre del skin a utilizar para el control. Opciones disponibles: 'usig', 'dark' y 'mapabsas'. Por defecto: 'usig'.
 * @cfg {Boolean} autoSelect Seleccionar automaticamente la sugerencia ofrecida en caso de que sea unica. Por defecto: true.
 * Opciones del AutoCompleter
 * @cfg {Function} afterSuggest Callback que es llamada cada vez que se actualizan las sugerencias.
 * @cfg {Function} afterSelection Callback que es llamada cada vez que el usuario selecciona una opcion de la lista de 
 *  sugerencias. El objeto que recibe como parametro puede ser una instancia de usig.Calle, usig.Direccion o bien usig.inventario.Objeto
 * @cfg {Function} beforeGeoCoding Callback que es llamada antes de realizar la geocodificacion de la direccion o el lugar 
 * @cfg {Function} afterGeoCoding Callback que es llamada al finalizar la geocodificacion de la direccion o el lugar 
 * seleccionado. El objeto que recibe como parametro es una instancia de usig.Punto
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
 * @param {Object} viewCtrl (optional) Controlador de la vista para mostrar las sugerencias del autocompleter
*/	
usig.AutoCompleter = function(idField, options, viewCtrl) {
	var field = document.getElementById(idField), 
		view = viewCtrl,
		suggesters = [],
		opts = $.extend({}, usig.AutoCompleter.defaults, options),
		ic = null,
		focused = true,
		cleanList = [],
		appendResults = false;
		
	field.setAttribute("autocomplete","off");
		
	/**
	 * Elimina los manejadores de eventos del control 
    */		
	this.unbind = function() {
		ic.unbind();
		abort()
		view.hide();
	}
	
	/**
	 * Setea los manejadores de eventos sobre el control 
     */		
	this.bind = function() {
		ic.bind();
	}

	/**
	 * Elimina los bindings y destruye los componentes creados.
	 * NOTA: Todo objeto creado dentro de la clase, debe ser agregado al cleanList para su remocion
	 */
	this.destroy = function() {
		this.unbind();
		view.remove();
		delete ic;
		while (suggesters.length > 0) {
			suggesters.pop();
		}
		for (var i=0; i<cleanList.length; i++)
			delete cleanList[i];
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
		view.setOptions(options);
	}
	
	/**
	 * Agrega un nuevo suggester al autocompleter. Las options son opcionales.
	 * @param {usig.Suggester} suggester Instancia de usig.Suggester
	 * @param {Object} options Opciones del suggester para el autocompleter
	 */
	this.addSuggester = function(suggester, options){
//		if (!(suggester instanceof usig.Suggester)) {
//			if (opts.debug) usig.debug('El objeto no es instancia de usig.Suggester');
//			return;
//		}
		if (opts.debug) usig.debug('addSuggester('+ suggester.name+')');
		var noEsta = true;
		for (var i=0; i<suggesters.length; i++){
			noEsta = noEsta && (suggesters[i].suggester.name != suggester.name); 
		}
		if (noEsta){
			opt = {
					inputPause: opts.inputPause,
					maxSuggestions: opts.maxSuggestions,
					serverTimeout: opts.serverTimeout,
					minTextLength: opts.minTextLength,
					maxRetries: opts.maxRetries,
					showError: opts.showError
			};
			
 			opt = $.extend(opt, options);
			suggesters.push({suggester: suggester, options: opt, inputTimer: null});
		}else{
			if (opts.debug) usig.debug('Se intento agregar dos suggesters con el mismo nombre.');
		}
	}
	
	/**
	 * Cambia el skin actual del control
	 * @param {String} newSkin Nombre del skin a aplicar (las opciones son 'usig', 'mapabsas' o 'dark')
	 */
	this.changeSkin = function(newSkin) {
		view.changeSkin(newSkin);
	}
	
	/**
	 * Devuelve las opciones vigentes en el componente
     * @return {Object} Objeto conteniendo las opciones vigentes en el componente  
    */	
	this.getOptions = function() {
		return opts;
	}
	
	/**
	 * Fuerza la seleccion de la opcion indicada
	 * @param {Integer} num Numero de opcion a seleccionar (entre 0 y el numero de opciones visibles)
	 * @return {Boolean} Devuelve <code>true</code> en caso de exito y <code>false</code> en caso de que no haya opciones disponibles 
	 */
	this.selectOption = function(num) {
		return view.selectOption(num);
	}
	
	/**
	 * Indica si algun suggester esta listo para responder.
	 * @return {Boolean} Retorna True en caso de que algun suggester esta listo para responder.
	 */	
	this.ready = function() {
		var retval = false;
		for (i=0; i<suggesters.length; i++){
			retval = retval || suggesters[i].suggester.ready();
		}
		return retval;
	}
	
	/**
	 * Ejecuta el metodo getSuggestion de sugObj.suggester
     * @param {Object} sugObj Objeto con el suggester y las opciones.
     * @param {Strin} str Texto a buscar
    */	
	function sugerir(sugObj, str) {
		var suggester = sugObj.suggester;
		var sugOpts = sugObj.options;
		
		callbackSugerir = function callbackSugerir(results){
			if (opts.debug) usig.debug(results);
//			if (opts.debug) usig.debug('sugOpts.showError: '+sugOpts.showError);
			if(results.getErrorMessage!=undefined){
				try {
					if (!appendResults && sugOpts.showError) view.showMessage(results.getErrorMessage());
				} catch(e) {
					if (!appendResults && sugOpts.showError) view.showMessage(opts.texts.nothingFound);
				}
			}else{
				if (results.length == 0){
					if (!appendResults && sugOpts.showError) view.showMessage(opts.texts.nothingFound);
				} else {
					if (opts.debug) usig.debug('usig.Autocompleter.sugerir.callback(results)');
					// Le pongo el nombre del suggester para saber de cual de ellos es el resultado.
					results = results.map(function(x){ x.suggesterName = suggester.name; return x });
					if (opts.debug) usig.debug(results);
					view.show(results, appendResults);
					appendResults = true;
					if (!focused)
						view.hide();
				}
			}
			if (typeof(opts.afterSuggest) == "function") {
				if (opts.debug) usig.debug('afterSuggest');
				opts.afterSuggest();
			}
		}
		
		if (opts.debug) usig.debug('sugerir('+ suggester.name+', "'+str+'")');
		suggester.getSuggestions(str, callbackSugerir, sugOpts.maxSuggestions);
	}
	
	/**
	 * Aborta las llamadas asincronicas a servidores realizadas por los suggesters 
	 * y las llamadas pendientes
	 */
	function abort() {
		if (opts.debug) usig.debug('suggester.abort');

        for (var i=0; i<suggesters.length; i++){
            if (suggesters[i].inputTimer) {
                clearTimeout(suggesters[i].inputTimer);
            }
			suggesters[i].suggester.abort();
		}
		if (typeof(opts.afterAbort) == "function") {
			if (opts.debug) usig.debug('afterAbort');
			opts.afterAbort();
		}
	}
	
	/**
	 * Funcion que se ejecuta en el onSelection. Intenta geocodificar la opcion seleccionada
	 * @param {Object} option Objeto de la opcion seleccionada.
	 */
	function selectionHandler(option) {
		if (opts.debug) usig.debug('usig.AutoCompleter.selectionHandler('+option+')');
		if (opts.debug) usig.debug(option);

		abort();
		var newValue = option.toString();
		if (opts.debug) usig.debug('usig.AutoCompleter: setting new value '+newValue);
		ic.setValue(newValue);
		if (typeof(opts.afterSelection) == "function") {
			if (opts.debug) usig.debug('usig.AutoCompleter: calling afterSelection');
			opts.afterSelection(option);
		}
		if (typeof(opts.afterGeoCoding) == "function") {
			for (var i=0; i<suggesters.length; i++){
				if (suggesters[i].suggester.name == option.suggesterName){
					if (typeof(opts.beforeGeoCoding) == "function") {
						if (opts.debug) usig.debug('usig.AutoCompleter: calling beforeGeoCoding');
						opts.beforeGeoCoding();
					}
					if (opts.debug) usig.debug('usig.AutoCompleter: geoCoding '+option.suggesterName);
					suggesters[i].suggester.getGeoCoding(option, opts.afterGeoCoding);
				}
			}
		}
		ic.setFocus();
	}
	
	/**
	 * Formatea el texto de la sugerencia seleccionada
	 * @param {Object} item Objeto de la sugerencia seleccionada
	 * @param {String} linkName
	 * @param {function} wordMarker
	 */
	function optionsFormatter(item, linkName, wordMarker) {
		/*if (item.clase!=undefined && typeof(item.clase.getNombre) == "function") {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a><span class="clase">('+item.clase.getNombre()+')</span></li>';
		} else */
		if (item.descripcion!=undefined && item.descripcion!='') {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a><span class="clase">('+item.descripcion+')</span></li>';
		} else {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a></li>';
		}
	}
	
	/**
	 * Callback del evento onChange del usig.InputController.
	 * @param {String} newValue nuevo valor ingresado a buscar.
	 */
	function onInputChange(newValue) {
		try {
			abort();
			if (opts.debug) usig.debug('view.update: '+newValue);
			view.update(newValue);
		} catch(error) {
			throw(error);
		}
		appendResults = false;
		
		for (var i=0; i<suggesters.length; i++){
			if (newValue.length >= suggesters[i].options.minTextLength) {
				suggesters[i].inputTimer = sugerir.defer(suggesters[i].options.inputPause , this, [suggesters[i], newValue]);
			}
		}
	}
	
	/**
	 * Callback del evento onKeyUp del usig.InputController.
	 * @param {String} keyCode codigo de tecla presionada
	 */
	function onInputKeyUp(keyCode) {
		if (opts.debug) usig.debug('view.keyUp');
		view.keyUp(keyCode);
	}
	
	/**
	 * Callback del evento onBlur del usig.InputController.
	 */
	function onInputBlur() {
		focused = false;
		view.hide.defer(300); // Esto es increible pero hay que diferirlo porque parece que el blur se dispara primero que el click		
	}
	
	/**
	 * Callback del evento onFocus del usig.InputController.
	 */
	function onInputFocus() {
		focused = true;
	}
	
	// Inicializacion
	try {
		ic = new usig.InputController(idField, {
			onKeyUp: onInputKeyUp.createDelegate(this),
			onChange: onInputChange.createDelegate(this),
			onBlur: onInputBlur.createDelegate(this),
			onFocus: onInputFocus.createDelegate(this),
			debug: opts.debug
		});
	} catch(error) {
		throw(error);
	}
	
	for (var i=0; i<opts.suggesters.length; i++){
		this.addSuggester(opts.suggesters[i].suggester, opts.suggesters[i].options);
	}
	
	if (!view) {
		view = new usig.AutoCompleterView(idField, { maxOptions: opts.maxOptions, rootUrl: opts.rootUrl, debug: opts.debug, skin: opts.skin, autoSelect: opts.autoSelect, autoHideTimeout: opts.autoHideTimeout, optionsFormatter: optionsFormatter });
		cleanList.push(view);
	}
	view.onSelection(selectionHandler.createDelegate(this));
}

usig.AutoCompleter.defaults = {
/* Opciones para los suggesters */
	inputPause: 200,
	maxSuggestions: 10,
	serverTimeout: 5000,
	minTextLength: 3,
	maxRetries: 5,
	showError: true,
/* Opciones para el AutoCompleterView */
	maxOptions: 10,
	offsetY: -5,
	zIndex: 10000,
	autoHideTimeout: 5000,
	autoSelect: true,
	rootUrl: 'http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/',
	skin: 'usig',
/* Opciones generales */
	suggesters: [],
	debug: false,
	texts: {
		nothingFound: 'No se hallaron resultados coincidentes con su b&uacute;squeda.'
	}
}