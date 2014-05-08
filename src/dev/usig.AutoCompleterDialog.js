// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleterDialog
 * Esta clase implementa un cuadro de dialogo flotante que permite seleccionar las opciones
 * provistas por el autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 1.0+<br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/autoCompleterDialog.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/autoCompleterDialog.html</a>
 * @namespace usig
 * @cfg {Integer} maxOptions Maximo numero de sugerencias a mostrar por vez. Por defecto: 10.
 * @cfg {Integer} offsetY Desplazamiento vertical (en pixels) del control respecto del campo de entrada de texto. Por defecto: -5.
 * @cfg {Integer} zIndex Valor del atributo css z-index a utilizar para las sugerencias. Por defecto: 10000.
 * @cfg {Integer} autoHideTimeout Tiempo de espera (en ms) antes de ocultar las sugerencias si el usuario no realizar ninguna accion sobre el control. Por defecto: 5000.
 * @cfg {String} rootUrl Url del servidor donde reside el control.
 * @cfg {String} skin Nombre del skin a utilizar para el control. Opciones disponibles: 'usig', 'usig2', 'usig3', 'usig4', 'dark' y 'mapabsas'. Por defecto: 'usig4'.
 * @cfg {Function} onSelection Callback que es llamada cada vez que se selecciona un elemento de la lista.
 * @cfg {Function} onEnterWithoutSelection Callback que es llamada cada vez que el usuario presiona ENTER habiendo sugerencias 
 *  disponibles pero sin haber seleccionado ninguna. La funcion declarada recibira como parametro el texto ingresado por el usuario.
 * @cfg {Boolean} autoSelect Seleccionar automaticamente la sugerencia ofrecida en caso de que sea unica. Por defecto: true.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles
*/	
usig.AutoCompleterDialog = (function($) { // Soporte jQuery noConflict
return function(idField, options) {
	var field = document.getElementById(idField),
		fieldValue = field.value,
		opts = $.extend({}, usig.AutoCompleterDialog.defaults, options),
		id = opts.idDiv || 'usig_acv_'+idField,
		hideTimeout = null,
		highlighted = -1,
		mouseHighlight = false,
		autoSelected = false,
		numOptions = 0,
		$div = null,
		itemsRef = {},
		keyCodes = {
			arrUp: 38,
			arrDn: 40,
			enter: 13,
			esc: 27
		};
		
	function killTimeout() {
		clearTimeout(hideTimeout);	
	};
	
	function resetTimeout() {
		if (opts.debug) usig.debug('AutoCompleterDialog: resetting hideTimeout');
		killTimeout();
		if (opts.autoHideTimeout > 0) {
			hideTimeout = hideSuggestions.defer(opts.autoHideTimeout, this);
		}
	};
	
	function hideSuggestions() {
		if ($div) {
 			$div.fadeOut('slow');
 		}
	};
	
	function createHoldingDiv(content) {		
		// get rid of old list
		// and clear the list removal timeout
		killTimeout();
		if ($div) { 
			//$('#'+id).remove();
			if (opts.debug) usig.debug('AutoCompleterDialog: updating current div...');
			$('#'+id+' div.content').html(content);
			$div.show();
			highlighted = -1;			
		} else {
			if (opts.debug) usig.debug('AutoCompleterDialog: creating new div...');
			// create holding div
			$div = $('<div id="'+id+'" class="usig_acv">\
						<div class="header">\
							<div class="corner"/>\
							<div class="bar"/>\
						</div>\
						<div class="content">'+content+'</div>\
						<div class="footer">\
							<div class="corner"/>\
							<div class="bar"/>\
						</div>\
					</div>');
			
			// get position of target textfield
			// position holding div below it
			// set width of holding div to width of field
			var pos = $(field).offset();
			
			$div.css({
				position: 'absolute',
				left: pos.left+'px', 
				top: (pos.top+field.offsetHeight+parseInt(opts.offsetY))+'px', 
				width: field.offsetWidth, 
				zIndex: opts.zIndex 
			});
		
			// add DIV to document
			$('body').append($div);	
			
			// set mouseover functions for div
			// when mouse pointer leaves div, set a timeout to remove the list after an interval
			// when mouse enters div, kill the timeout so the list won't be removed
			$div.mouseover(killTimeout.createDelegate(this));
			$div.mouseout(resetTimeout.createDelegate(this));
			
			// currently no item is highlighted
			highlighted = -1;			
			$div.show();
		}
		
		// hide dialog after an interval
		hideTimeout = hideSuggestions.defer(opts.autoHideTimeout, this);		
	}
	
	function clearHighlight() {
		if ($div) {
			highlighted = -1;
			$('ul.options li.highlight', $div).removeClass('highlight');
		}
	}
	
	function highlight(n) {
		if ($div) {
			highlighted = n;
			$('ul.options li.highlight', $div).removeClass('highlight');
			if (typeof(n) == "string") {
				$('ul.options li:has(a[name="'+n+'"])', $div).addClass('highlight');
				highlighted = parseInt(n.replace(id, ''));				
			} else {
				$('ul.options li:has(a)', $div).slice(n, n+1).addClass('highlight');
			}
			if (opts.debug) usig.debug('AutoCompleterDialog. highlighted: '+highlighted);
		}
	}
	
	function markWords(sug) {		
		// format output with the input enclosed in a EM element
		// (as HTML, not DOM)
		var val = new sug.constructor(sug);
		val.marked = Array();
		var words = fieldValue.split(" ");
		for (var k=0; k<words.length; k++) {
			var st = val.toLowerCase().indexOf( words[k].toLowerCase() );
			if (st < 0) {
				var st = val.toLowerCase().indexOf( words[k].translate('áéíóúüÁÉÍÓÚÜàèìòùÀÈÌÒÙ', 'aeiouuAEIOUUaeiouAEIOU').toLowerCase() );
			}
			if (st >= 0) {
				for (var j=0; j<words[k].length; j++) {
					val.marked[st+j] = true;
				}
			}
		}
		var output = '';
		var openEm = false;
		for (var k=0; k<val.length; k++) {
			if (val.marked[k] && !openEm) {
				output = output + '<em>' + val.substring(k, k+1);
				openEm = true;
			} else {
				if ((val.marked[k] && openEm) || (!val.marked[k] && !openEm)) {
					output = output + val.substring(k, k+1);
				} else {
					output = output + '</em>' + val.substring(k, k+1);
					openEm = false;
				}
			}
		}
		if (openEm) {
			output = output + '</em>';
		}
		return output;
	}
	
	function selectionHandler(item) {
		if (typeof(opts.onSelection) == "function") {
			killTimeout();
			hideSuggestions();
			opts.onSelection(item);
		}
	}
	
	function reset() {
		if (opts.debug) usig.debug('usig.AutoCompleterDialog: reset');
		killTimeout();
		/*
		if ($div) {
			if (opts.debug) usig.debug('AutoCompleterDialog: destroying current list...');
			$div.remove();
		}
		*/
		highlighted = -1;
		numOptions = 0;
		// $div = null;
		itemsRef = {};
	}

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
		if (newValue == '' && $div) {
			$div.hide();
		}
		fieldValue = newValue;
		reset();
	}
	
	/**
	 * Devuelve las opciones vigentes en el componente
     * @return {Object} Objeto conteniendo las opciones vigentes en el componente  
    */	
	this.getOptions = function() {
		return opts;
	}

	/**
	 * Muestra nuevas opciones de sugerencias
     * @param {Array} options Un array conteniendo las nuevas sugerencias a mostrar  
     * @param {Boolean-Integer} append (optional) Si es TRUE agrega las nuevas opciones al final de la lista.
     * Si es un entero (entre 0 y el nro de elementos de la lista) reemplaza el contenido de la lista a partir
     * de ese numero en adelante.   
    */	
	this.show = function(options, append) {
		var htmlList = '';
		var offset = isNaN(parseInt(append))?0:parseInt(append);
		if (append!=undefined) {
			if (offset > 0) {
				$('ul.options li', $div).slice(offset).remove();
				numOptions = $('ul.options li a', $div).length;
			}
		} else {
			numOptions = 0;
			itemsRef = {};
		}
		var ptrMarkWords = markWords;
		$.each(options, function(index, item) {
			if (numOptions >= opts.maxOptions) 
				return false;
			if (typeof(item) == "string") {
				htmlList+='<li class="acv_op message">'+item+'</li>';
			} else if (typeof(opts.optionsFormatter) == "function") { 
				htmlList+=opts.optionsFormatter(item, id+numOptions, ptrMarkWords);
				itemsRef[id+numOptions] = item;
				numOptions++;
			} else if (typeof(item.toString) == "function") {
				htmlList+='<li class="acv_op"><a href="#" class="acv_op" name="'+id+numOptions+'"><span class="tl"/><span class="tr"/><span>'+ptrMarkWords(item.toString())+'</span></a></li>';
				itemsRef[id+numOptions] = item;
				numOptions++;
			}
		});
		if (opts.debug) usig.debug('AutoCompleterDialog: showing '+numOptions+' options: ['+options+']');
		if ((append === true || !isNaN(parseInt(append))) && $div && $('ul.options li a', $div).length > 0) {
			if (opts.debug) usig.debug('AutoCompleterDialog: appending to the end of existing list...');
			if (numOptions > 1 && autoSelected) {
				autoSelected = false;
				clearHighlight();
			}
			$('ul.options', $div).append(htmlList);
		} else {
			if (opts.idDiv) {
				if (opts.debug) usig.debug('AutoCompleterDialog: recreating suggestions list...');
				$div.html('<div class="content"><ul class="options">'+htmlList+'</ul></div>')
				$div.show();
			} else {
				if (opts.debug) usig.debug('AutoCompleterDialog: creating suggestions list...');
				createHoldingDiv('<ul class="options">'+htmlList+'</ul>');				
			}
		}
		$('ul.options li.acv_op', $div).mouseover((function(ev, highlight) {
			if (ev.target.name) {
				highlight(ev.target.name);
			} else {
				highlight($(ev.target).parents('a').attr('name'));
			}
			mouseHighlight = true;
		}).createDelegate(this, [highlight], 1));
		$('ul.options li.acv_op', $div).mouseout((function(ev) {
			if (mouseHighlight) {
				mouseHighlight = false;
				clearHighlight();
			}
		}).createDelegate(this));
		$('ul.options li.acv_op', $div).click((function(ev) { 
			if (opts.debug) usig.debug('AutoCompleterDialog: click');
			ev.preventDefault();
			var target = ev.target?ev.target:ev.srcElement;
			var name = $(target).parents('a.acv_op').attr('name') || $('a.acv_op', $(target)).attr('name') || $(target).attr('name');
			selectionHandler(itemsRef[name]); 
		}).createDelegate(this));
		if (opts.autoSelect && numOptions == 1) {
			highlighted = 0;
			autoSelected = true;
			highlight(highlighted);
		}
	}
	
	/**
	 * Muestra un mensaje de texto plano no-seleccionable.
     * @param {String} message Un string de texto plano para mostrar  
    */	
	this.showMessage = function(message) {
		if (opts.idDiv) {
			$div.html('<div class="content"><div class="message">'+message+'</div></div>')			
			$div.show();
		} else {
			createHoldingDiv('<div class="message">'+message+'</div>');			
		}
	}

	/**
	 * Este metodo permite indicarle a la vista que el usuario presiono una tecla determinada
     * @param {Integer} keyCode Codigo de la tecla presionada. 
    */	
	this.keyUp = function(keyCode) {
		if (highlighted == undefined) {
			highlighted = -1;
		}		
		if ((keyCode == keyCodes.arrDn || keyCode == keyCodes.arrUp) && numOptions > 0) {
			if ($div.css('display') != 'block') {
				$div.show();
			} else {
				resetTimeout();
				highlighted = keyCode == keyCodes.arrDn?(highlighted+1).constrain(0, numOptions-1):(highlighted-1).constrain(0, numOptions-1);
				if (opts.debug) usig.debug('AutoCompleterDialog: highlighting '+highlighted+'...');
				highlight(highlighted);
			}
		}
		if (keyCodes.enter == keyCode) { 
			if ($div && $div.css('display') != 'block') {
				if (typeof(opts.onEnterWithoutSelection) == "function") {
					opts.onEnterWithoutSelection(fieldValue);					
				}
				$div.show();
			} else {
				if (highlighted >= 0 || numOptions == 1) {
					if (highlighted >= 0) {
						selectionHandler(itemsRef[id+highlighted]);
					} else {
						selectionHandler(itemsRef[id+'0']);
					}
				} else if (numOptions > 0 && typeof(opts.onEnterWithoutSelection) == "function") {
					if (opts.debug) usig.debug('AutoCompleterDialog: ENTER without selection...');
					opts.onEnterWithoutSelection(fieldValue);
				}
			}
		}
		if (keyCodes.esc == keyCode) {
			killTimeout();
			hideSuggestions();
		}
	}
	
	/**
	 * Quita el control de la pagina 
    */	
	this.remove = function() {
		killTimeout();
		if ($div)
			$div.remove();
	}
	
	/**
	 * Permite setear un manejador para el evento de seleccion de un elemento en la lista de sugerencias
     * @param {Function} callback Funcion callback para asociar al evento de seleccion. 
    */	
	this.onSelection = function(callback) {
		if (typeof(callback) == "function") {
			opts.onSelection = callback;
		}
	}
	
	/**
	 * Selecciona la opcion indicada
	 * @param {Integer} num Numero de opcion a seleccionar (entre 0 y el numero de opciones visibles)
	 * @return {Boolean} Devuelve <code>true</code> en caso de exito y <code>false</code> en caso de que 
	 * no haya opciones disponibles o el numero de opcion indicada sea invalido
	 */
	this.selectOption = function(num) {
		if (numOptions > num) {
			if ($div.css('display') != 'block') {
				$div.show();
			}
			highlight(num);
			selectionHandler(itemsRef[id+highlighted]);
			return true;
		}
		return false;
	}

	/**
	 * Devuelve el número de sugerencias disponibles
	 * @return {Integer} Numero de sugerencias disponibles
	 */
	this.getNumSuggestions = function() {
		return numOptions;
	}

	/**
	 * Devuelve la sugerencia indicada
	 * @param {Integer} num Numero de sugerencia (entre 0 y el numero de sugerencias visibles)
	 * @return {Boolean} Devuelve la opcion indicada en caso de exito y <code>false</code> en caso de que 
	 * no haya opciones disponibles o el numero de opcion indicada sea invalido
	 */
	this.getSuggestion = function(num) {
		var n = num || 0;
		if (numOptions > n) {
			return itemsRef[id+n];
		}
		return false;
	}

	/**
	 * Cambia el skin actual del control
	 * @param {String} newSkin Nombre del skin a aplicar (las opciones son 'usig', 'usig2', 'usig3', 'usig4', 'mapabsas', 'bootstrap' o 'dark')
	 */
	this.changeSkin = function(newSkin) {
		usig.removeCss(opts.rootUrl+'css/usig.AutoCompleterDialog.'+opts.skin+'.css');
		opts.skin = newSkin;
		usig.loadCss(opts.rootUrl+'css/usig.AutoCompleterDialog.'+opts.skin+'.css');
	}
	
	/**
	 * Oculta el control
	 */
	this.hide = function() {
		if (opts.debug) usig.debug('AutoCompleterDialog: hide');
		killTimeout();
		if ($div)
			$div.hide();
	}
	
	// Inicializacion
	if (opts.skin!='custom') {
		usig.loadCss(opts.rootUrl+'css/usig.AutoCompleterDialog.'+opts.skin+'.css');
	}
	if (opts.idDiv) {
		$div = $('#'+opts.idDiv);
		$div.addClass('usig_acv');
	}
};
//Fin jQuery noConflict support
})(jQuery);

usig.AutoCompleterDialog.defaults = {
	maxOptions: 10,
	debug: false,
	offsetY: -5,
	zIndex: 10000,
	autoHideTimeout: 5000,
	autoSelect: true,
	rootUrl: '//servicios.usig.buenosaires.gov.ar/usig-js/3.0/',
	skin: 'usig4'
}