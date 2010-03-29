// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleterView
 * Esta clase implementa un cuadro de dialogo flotante que permite seleccionar las opciones
 * provistas por el autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 1.0+
 * @namespace usig
 * @cfg {Integer} maxOptions Maximo numero de sugerencias a mostrar por vez. Por defecto: 10.
 * @cfg {Integer} offsetY Desplazamiento vertical (en pixels) del control respecto del campo de entrada de texto. Por defecto: -5.
 * @cfg {Integer} zIndex Valor del atributo css z-index a utilizar para las sugerencias. Por defecto: 10000.
 * @cfg {Integer} timeout Tiempo de espera (en ms) antes de ocultar las sugerencias si el usuario no realizar ninguna accion sobre el control. Por defecto: 2500.
 * @cfg {String} rootUrl Url del servidor donde reside el control.
 * @cfg {String} skin Nombre del skin a utilizar para el control. Opciones disponibles: 'usig', 'dark' y 'mapabsas'. Por defecto: 'usig'.
 * @cfg {Function} onSelection Callback que es llamada cada vez que se selecciona un elemento de la lista.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log. Por defecto: false.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles
*/	
usig.AutoCompleterView = function(idField, options) {
	var field = document.getElementById(idField);
	var fieldValue = field.value;
	var opts = $.extend({}, usig.AutoCompleterView.defaults, options);
	var id = 'usig_acv_'+idField;
	var hideTimeout = null;
	var highlighted = -1;
	var numOptions = 0;
	var $div = null;
	var itemsRef = {};
	var keyCodes = {
		arrUp: 38,
		arrDn: 40,
		enter: 13,
		esc: 27
	}
	
	var killTimeout = function() {
		clearTimeout(hideTimeout);	
	};
	
	var resetTimeout = function() {
		killTimeout();
		hideTimeout = hideSuggestions.defer(opts.timeout, this);
	};
	
	var hideSuggestions = function() {
 		$div.fadeOut('slow');
	};
	
	var createHoldingDiv = function(content) {		
		// get rid of old list
		// and clear the list removal timeout
		$('#'+id).remove();
		killTimeout();
		
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
		
		// hide dialog after an interval
		hideTimeout = hideSuggestions.defer(opts.timeout, this);		
	}
	
	var highlight = function(n) {
		if ($div) {
			$('ul.options li.highlight').removeClass('highlight');
			if (typeof(n) == "string") {
				$('ul.options li a[name="'+n+'"]').parent('li').addClass('highlight');				
			} else {
				$('ul.options li a').parent('li').slice(n, n+1).addClass('highlight');
			}
		}
	}
	
	var markWords = function(sug) {		
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
		return output;
	}
	
	var selectionHandler = function(item) {
		if (typeof(opts.onSelection) == "function") {
			opts.onSelection(item);
			killTimeout();
			hideSuggestions();
		}
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
		fieldValue = newValue;
	}

	/**
	 * Muestra nuevas opciones de sugerencias
     * @param {Array} options Un array conteniendo las nuevas sugerencias a mostrar  
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
				htmlList+='<li class="message">'+item+'</li>';
			} else if (typeof(item.toString) == "function") {
				htmlList+='<li><a href="#" name="'+id+numOptions+'"><span class="tl"/><span class="tr"/><span>'+ptrMarkWords(item.toString())+'</span></a></li>';
				itemsRef[id+numOptions] = item;
				numOptions++;
			}
		});
		if (append === true && $div) {
			$('ul.options', $div).append(htmlList);
		} else if (!isNaN(parseInt(append)) && $div) {
			$('ul.options', $div).append(htmlList);
		} else {
			createHoldingDiv('<ul class="options">'+htmlList+'</ul>');
		}
		$('ul.options li a', $div).mouseover((function(ev, highlight) { highlight(ev.target.name); }).createDelegate(this, [highlight], 1));
		$('ul.options li a', $div).click((function(ev) { selectionHandler(itemsRef[ev.target.name]); }).createDelegate(this));
	}
	
	/**
	 * Muestra un mensaje de texto plano no-seleccionable.
     * @param {String} message Un string de texto plano para mostrar  
    */	
	this.showMessage = function(message) {
		createHoldingDiv('<p>'+message+'</p>');
	}

	/**
	 * Este metodo permite indicarle a la vista que el usuario presiono una tecla determinada
     * @param {Integer} keyCode Codigo de la tecla presionada. 
    */	
	this.keyUp = function(keyCode) {
		if (keyCode == keyCodes.arrDn || keyCode == keyCodes.arrUp) {
			resetTimeout();
			highlighted = keyCode == keyCodes.arrDn?(highlighted+1).constrain(0, numOptions-1):(highlighted-1).constrain(0, numOptions-1);
			highlight(highlighted);
		}
		if (keyCodes.enter == keyCode && highlighted >= 0) {
			selectionHandler(itemsRef[id+highlighted]);
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
	
	// Inicializacion
	usig.loadCss(opts.rootUrl+'css/usig.AutoCompleterView.'+opts.skin+'.css');
}

usig.AutoCompleterView.defaults = {
	maxOptions: 10,
	debug: false,
	offsetY: -5,
	zIndex: 10000,
	timeout: 2500,
	rootUrl: '',
	skin: 'usig'
}