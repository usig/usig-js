// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleter
 * Esta clase implementa un autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 2.1+, usig.Suggester 1.0+
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.AutoCompleterFull.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;servicios.usig.buenosaires.gov.ar/usig-js/3.1/usig.AutoCompleterFull.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.AutoCompleter('inputField', {
 *              afterSelection: function(option) {
 * 					...
 *              }
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/demos/autoCompleter.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/demo/autoCompleter.html</a><br/>
 * Documentaci&oacute;n: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/doc/">http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/doc/</a><br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/tests/autoCompleter.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.1/tests/autoCompleter.html</a>
 * @namespace usig
 * @cfg {Integer} inputPause Minima pausa (en milisegundos) que debe realizar el usuario al tipear para que se actualicen las sugerencias. Por defecto: 1000.
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a buscar. Por defecto: 10
 * @cfg {Integer} serverTimeout Tiempo de maximo de espera antes de reintentar un pedido al servidor. Por defecto: 5000.
 * @cfg {Integer} flushTimeout Tiempo de buffering de las sugerencias para evitar flickering. Por defecto: 0 (no bufferea).
 * @cfg {Integer} minTextLength Longitud minima que debe tener el texto de entrada antes de buscar sugerencias. Por defecto: 3.
 * @cfg {Integer} maxRetries Maximo numero de reintentos al servidor ante una falla. Por defecto: 10.
 * @cfg {Boolean} showError Mostrar mensajes de error. Por defecto: true
 * @cfg {Integer} maxOptions Maximo numero de opciones a mostrar como sugerencia. Por defecto: 10.
 * @cfg {Integer} offsetY Desplazamiento vertical (en pixels) del control respecto del campo de entrada de texto. Por defecto: -5.
 * @cfg {Integer} zIndex Valor del atributo css z-index a utilizar para las sugerencias. Por defecto: 10000.
 * @cfg {Integer} autoHideTimeout Tiempo de espera (en ms) antes de ocultar las sugerencias si el usuario no realizar ninguna accion sobre el control. Por defecto: 5000, 0: deshabilitado.
 * @cfg {Boolean} hideOnBlur Ocultar las sugerencias cuando el input pierde foco. Por defecto: True.
 * @cfg {String} rootUrl Url del servidor donde reside el control.
 * @cfg {String} skin Nombre del skin a utilizar para el control. Opciones disponibles: 'usig', 'usig2', 'usig3', 'usig4', 'dark', 'mapabsas' o 'custom' en caso de no querer que se cargue ningun skin. Por defecto: 'usig4'.
 * @cfg {String} idOptionsDiv Identificador de un div existente donde se desea que se muestren las opciones. Por defecto se creara uno nuevo flotante.
 * @cfg {Boolean} autoSelect Seleccionar automaticamente la sugerencia ofrecida en caso de que sea unica. Por defecto: true.
 * @cfg {Function} afterSuggest Callback que es llamada cada vez que se actualizan las sugerencias.
 * @cfg {Function} afterSelection Callback que es llamada cada vez que el usuario selecciona una opcion de la lista de 
 *  sugerencias. El objeto que recibe como parametro puede ser una instancia de usig.Calle, usig.Direccion o bien usig.inventario.Objeto
 * @cfg {Function} onEnterWithoutSelection Callback que es llamada cada vez que el usuario presiona ENTER habiendo sugerencias 
 *  disponibles pero sin haber seleccionado ninguna. La funcion declarada recibira como parametro el texto ingresado por el usuario.
 * @cfg {Function} beforeGeoCoding Callback que es llamada antes de realizar la geocodificacion de la direccion o el lugar 
 * @cfg {Function} afterGeoCoding Callback que es llamada al finalizar la geocodificacion de la direccion o el lugar 
 * seleccionado. El objeto que recibe como parametro es una instancia de usig.Punto
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo para usar 
 * @cfg {Function} onInputChange Callback que es llamada cuando cambia el valor del campo de input. Recibe como parametro el nuevo valor. 
 * @cfg {Array} suggesters Listado de suggesters con los que se inicializa el componente. Los elementos del array tienen la
 * forma {suggester: usig.Suggester/String, options: object}.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
 * @param {Object} viewCtrl (optional) Controlador de la vista para mostrar las sugerencias del autocompleter
*/	
usig.AutoCompleter = (function($) { // Soporte jQuery noConflict
return function(idField, options, viewCtrl) {
	var field = document.getElementById(idField), 
		view = viewCtrl,
		suggesters = [],
		suggestersByName = {},
		opts = $.extend({}, usig.AutoCompleter.defaults, options),
		ic = null,
		focused = true,
		cleanList = [],
		bufferedResults = [],
		flushTimer = null,
		pendingRequests = {},
		numPendingRequests = 0,
		appendResults = false,
		appendBufferedResults = false;
		
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
	 * Agrega un nuevo suggester al autocompleter.
	 * @param {usig.Suggester/String} suggester Instancia de usig.Suggester o nombre de un suggester registrado
	 * @param {Object} options (optional) Opciones del suggester para el autocompleter
	 */
	this.addSuggester = function(suggester, options){
		var name = typeof(suggester) == 'string'?suggester:suggester.name;
		if (opts.debug) usig.debug('addSuggester('+name+')');
		if (typeof(suggestersByName[name])=="undefined") {
			var sgObj = suggester;
			if (typeof(suggester) == 'string') {
				try {
					if (opts.debug) usig.debug('Creating Suggester: '+ name);
					sgObj = usig.createSuggester(name, { 
						onReady: opts.onReady, 
						debug: opts.debug, 
						maxRetries: opts.maxRetries,
						afterServerRequest: onServerRequest.createDelegate(this, [name], 1), 
						afterServerResponse: onServerResponse.createDelegate(this, [name], 1),
						afterAbort: onAbort.createDelegate(this, [name], 1)
					});
				} catch(e) {
					if (opts.debug) usig.debug('ERROR: Suggester: '+ name+' creation failed.');
					return false;
				}
			} else {
				sgObj.setOptions({
					debug: opts.debug, 
					maxRetries: opts.maxRetries,
					afterServerRequest: onServerRequest.createDelegate(this, [name], 1), 
					afterServerResponse: onServerResponse.createDelegate(this, [name], 1), 
					afterAbort: onAbort.createDelegate(this, [name], 1)
				});
			}
			suggestersByName[name]=sgObj;
			pendingRequests[name]=0;
			var opt = {
					inputPause: opts.inputPause,
					maxSuggestions: opts.maxSuggestions,
					serverTimeout: opts.serverTimeout,
					minTextLength: opts.minTextLength,
					maxRetries: opts.maxRetries,
					showError: opts.showError
			};
			
 			opt = $.extend({}, opt, options);
			suggesters.push({suggester: sgObj, options: opt, inputTimer: null});
		} else {
			if (opts.debug) usig.debug('Se intento agregar dos suggesters con el mismo nombre.');
		}
	}
	
	/**
	 * Elimina un suggester previamente registrado
	 * @param {String} name Nombre del suggester a eliminar
	 */
	this.removeSuggester = function(name) {
		if (typeof(suggestersByName[name])!="undefined") {
			if (opts.debug) usig.debug('removeSuggester("'+name+'")');			
			suggestersByName[name] = undefined;
			for (var i=0; i<suggesters.length; i++) {
				if (suggesters[i].suggester.name == name) {
					if (opts.debug) usig.debug('Quitando suggester "'+name+'".');			
					suggesters.removeObject(suggesters[i]);
					break;
				}
			}
		} else {
			if (opts.debug) usig.debug('Se intento borrar un suggester no registrado previamente.');			
		}
	}
	
	/**
	 * Setea las opciones para el suggester indicado 
	 * @param {String} name Nombre del suggester a configurar
	 * @param {Object} options Objeto conteniendo opciones
	 */
	this.setSuggesterOptions = function(name, options) {
		if (opts.debug) usig.debug('setSuggesterOptions('+name+')');			
		if (typeof(suggestersByName[name])!="undefined") {
			for (var i=0; i<suggesters.length; i++) {
				if (suggesters[i].suggester.name == name) {
					suggesters[i].options = $.extend(suggesters[i].options, options);
					break;
				}
			}
		} else {
			if (opts.debug) usig.debug('Se intento setear opciones para un suggester no registrado previamente.');			
		}		
	}
	
	this.getSuggesters = function() {
		var toReturn = {};
		for (var i=0; i<suggesters.length; i++) {
			toReturn[suggesters[i].suggester.name]= $.extend({}, suggesters[i].options);
		}		
		return toReturn;
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
	 * Devuelve el número de sugerencias disponibles
	 * @return {Integer} Numero de sugerencias disponibles
	 */
	this.getNumSuggestions = function() {
		return view.getNumSuggestions();
	}

	/**
	 * Devuelve la sugerencia indicada
	 * @param {Integer} num Numero de sugerencia (entre 0 y el numero de opciones visibles)
	 * @return {Boolean} Devuelve la opcion indicada en caso de exito y <code>false</code> en caso de que 
	 * no haya opciones disponibles o el numero de opcion indicada sea invalido
	 */
	this.getSuggestion = function(num) {
		return view.getSuggestion(num);
	}
	
	/**
	 * Oculta las sugerencias que se esten mostrando
	 */
	this.hide = function() {
		view.hide();
	}
	
	/**
	 * Indica si algun suggester esta listo para responder.
	 * @param {String} suggesterName (optional) Nombre del suggester que se quiere saber si está listo o no.  
	 * @return {Boolean} Si se especifico un suggester como parametro devuelve True en caso de que el suggester este listo, 
	 * si no se especifico el parametro devuelve True en caso de que algun suggester este listo para responder.
	 */	
	this.ready = function(suggesterName) {
		var retval = false;
		if (suggesterName){
			retval = suggestersByName[suggesterName].ready();
		}else{
			for (i=0; i<suggesters.length; i++){
				retval = retval || suggesters[i].suggester.ready();
			}
		}
		return retval;
	}

	function showResults() {
		if (opts.debug) usig.debug('Flushing buffered results... ('+(appendBufferedResults?'append':'replace')+')');
		if (field.value != "" && bufferedResults.length > 0) {
			view.show(bufferedResults, appendBufferedResults);
		}
		bufferedResults = [];
		flushTimer = null;
	}

	function bufferResults(results, appendResults) {
		if (!appendResults) {
			if (opts.debug) usig.debug('Resetting buffered results...');
			bufferedResults = [];
			appendBufferedResults = false;			
		}
		if (opts.debug) usig.debug('Appending to buffered results...');
		for (var i=0,l=results.length;i<l;i++) {
			bufferedResults.push(results[i]);
		}
		if (!flushTimer) {
			if (opts.debug) usig.debug('Setting flush timer...')
			appendBufferedResults = appendResults;
			flushTimer = showResults.defer(opts.flushTimeout, this);
		}
	}
	
	/*
	 * Ejecuta el metodo getSuggestion de sugObj.suggester
     * @param {Object} sugObj Objeto con el suggester y las opciones.
     * @param {Strin} str Texto a buscar
    */	
	function sugerir(sugObj, str) {
		var suggester = sugObj.suggester;
		var sugOpts = sugObj.options;
		
		callbackSugerir = function callbackSugerir(results, inputStr){
			if (field.value == inputStr) {
				if (opts.debug) {usig.debug("Resultados en autocompleter....");}
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
						// if (opts.debug) usig.debug(results);
						if (opts.flushTimeout > 0) {
							bufferResults(results, appendResults);
						} else {
							view.show(results, appendResults);							
						}
						appendResults = true;
						if (!focused)
							view.hide();
					}
				}
				if (typeof(opts.afterSuggest) == "function") {
					if (opts.debug) usig.debug('afterSuggest');
					opts.afterSuggest();
				}
			} else {
				if (opts.debug) usig.debug('ERROR: Respuesta a destiempo. Llegaron resultados para "'+inputStr+'" pero el valor actual es "'+field.value+'"');				
			}
		}
		
		if (opts.debug) usig.debug('sugerir('+ suggester.name+', "'+str+'")');
		suggester.getSuggestions(str, callbackSugerir.createDelegate(this, [str], 1), sugOpts.maxSuggestions);
	}
	
	/*
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
	
	/*
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
			if (typeof(opts.beforeGeoCoding) == "function") {
				if (opts.debug) usig.debug('usig.AutoCompleter: calling beforeGeoCoding');
				opts.beforeGeoCoding();
			}
			if (opts.debug) usig.debug('usig.AutoCompleter: geoCoding '+option.suggesterName);
			suggestersByName[option.suggesterName].getGeoCoding(option, onAfterGeoCoding);
		}
		ic.setFocus();
	}
	
	/*
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
			return '<li class="acv_op"><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span><span class="clase">('+item.descripcion+')</span></a></li>';
		} else {
			return '<li class="acv_op"><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a></li>';
		}
	}
	
	/*
	 * Callback del evento onChange del usig.InputController.
	 * @param {String} newValue nuevo valor ingresado a buscar.
	 */
	function onInputChange(newValue) {
		try {
			abort();
			if (opts.debug) usig.debug('view.update: '+newValue);
			view.update(newValue);
			if (typeof(opts.onInputChange)=="function") {
				opts.onInputChange(newValue);
			}
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
	
	/*
	 * Callback del evento onKeyUp del usig.InputController.
	 * @param {String} keyCode codigo de tecla presionada
	 */
	function onInputKeyUp(keyCode) {
		if (opts.debug) usig.debug('view.keyUp');
		view.keyUp(keyCode);
	}
	
	/*
	 * Callback del evento onBlur del usig.InputController.
	 */
	function onInputBlur() {
		focused = false;
		if (opts.hideOnBlur)
			view.hide.defer(300); // Esto es increible pero hay que diferirlo porque parece que el blur se dispara primero que el click
	}
	
	/*
	 * Callback del evento onFocus del usig.InputController.
	 */
	function onInputFocus() {
		focused = true;
	}
	
	/*
	 * Callback del evento afterAbort de los suggesters.
	 */
	function onAbort(suggesterName) {
		if (pendingRequests[suggesterName] > 0) {
			pendingRequests[suggesterName]--;
			numPendingRequests--;
		}
		if (opts.debug) usig.debug('usig.AutoCompleter.onAbort. Num Pending Requests: '+numPendingRequests);
		if (opts.debug) usig.debug(pendingRequests);
	}
	
	/*
	 * Callback del evento afterServerRequest de los suggesters.
	 */
	function onServerRequest(suggesterName) {
		pendingRequests[suggesterName]++;
		numPendingRequests++;
		if (opts.debug) usig.debug('usig.AutoCompleter.onServerRequest. Num Pending Requests: '+numPendingRequests);
		if (opts.debug) usig.debug(pendingRequests);
		if (typeof(opts.afterServerRequest) == "function") {
			opts.afterServerRequest();
		}
	}
	
	/*
	 * Callback del evento afterServerResponse de los suggesters.
	 */
	function onServerResponse(suggesterName) {
		if (pendingRequests[suggesterName] > 0) {
			pendingRequests[suggesterName]--;
			numPendingRequests--;
		}
		if (opts.debug) usig.debug('usig.AutoCompleter.onServerResponse. Num Pending Requests: '+numPendingRequests);
		if (opts.debug) usig.debug(pendingRequests);
		if (typeof(opts.afterServerResponse) == "function" && numPendingRequests == 0) {
			opts.afterServerResponse();
		}
	}

	/*
	 * Callback del evento afterGeoCoding de los suggesters.
	 */
	function onAfterGeoCoding(result) {
		if (result instanceof usig.Suggester.GeoCodingTypeError) {
			if (opts.debug) usig.debug('usig.AutoCompleter: adding space...');
			ic.setValue(field.value+' ');
		}
		opts.afterGeoCoding(result);
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
		view = new usig.AutoCompleterDialog(idField, { maxOptions: opts.maxOptions, rootUrl: opts.rootUrl, debug: opts.debug, skin: opts.skin, autoSelect: opts.autoSelect, autoHideTimeout: opts.autoHideTimeout, optionsFormatter: optionsFormatter, onEnterWithoutSelection: opts.onEnterWithoutSelection, idDiv: opts.idOptionsDiv });
		cleanList.push(view);
	}
	view.onSelection(selectionHandler.createDelegate(this));
};
// Fin jQuery noConflict support
})(jQuery);

usig.AutoCompleter.defaults = {
    // Opciones para los suggesters
	inputPause: 200,
	maxSuggestions: 10,
	serverTimeout: 30000,
	minTextLength: 3,
	maxRetries: 1,
	showError: true,
	// Opciones para el AutoCompleterDialog
	maxOptions: 10,
	offsetY: -5,
	zIndex: 10000,
	autoHideTimeout: 10000,
	flushTimeout: 0,
	hideOnBlur: true,
	autoSelect: true,
	rootUrl: '//servicios.usig.buenosaires.gob.ar/usig-js/3.1/',
	skin: 'bootstrap',
	idOptionsDiv: undefined,
	// Opciones generales
	suggesters: [{ 	
					suggester: 'Direcciones', 
					options: { inputPause: 10, minTextLength: 3 } 
				}, 
				{
					suggester: 'Lugares',
					options: { inputPause: 500, minTextLength: 3, showError: false }
				}],
	debug: false,
	texts: {
		nothingFound: 'No se hallaron resultados coincidentes con su b&uacute;squeda.'
	}
}