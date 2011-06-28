// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class HoldingDiv
 * Esta clase implementa un div flotante 
 * Requiere: jQuery-1.3.2+, usig.core 1.0+<br/>
 * @namespace usig
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {String} content Contenido html
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles
*/	
usig.HoldingDiv = function(idField, content, options) {
	var field = document.getElementById(idField);
	var opts = $.extend({}, usig.HoldingDiv.defaults, options),
		
		id = 'usig_holdingDiv_'+idField,
		hideTimeout = null,
		highlighted = -1,
		
		$div = null
		killTimeout();
		$('#'+id).remove();

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
		pos.left += opts.offsetX;
		$div.css({
			position: 'absolute',
			left: pos.left+'px', 
			top: (pos.top+field.offsetHeight+parseInt(opts.offsetY))+'px', 
			//width: field.offsetWidth, 
			width: opts.width,
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
		//hideTimeout = hideSuggestions.defer(opts.autoHideTimeout, this);		
		//killTimeout.createDelegate(this));

	this.esconderHD = function(){
		clearTimeout(hideTimeout);
		hideTimeout = hideSuggestions.defer(opts.autoHideTimeout, this);
	}
		
	function killTimeout() {
		clearTimeout(hideTimeout);	
	};
	
	function resetTimeout() {
		killTimeout();
		hideTimeout = hideSuggestions.defer(opts.autoHideTimeout, this);
	};
	
	function hideSuggestions() {
 		$div.fadeOut('slow');
	};

}
usig.HoldingDiv.defaults = {
	zIndex: 10000,
	offsetY: -5,
	offsetX: 20,
	autoHideTimeout: 2000,
	width: '150px'
	//skin: 'usig'
};
