// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterEmbajadas
 * Implementa un suggester personalizado de embajadas y consulados.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, usig.Inventario<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.SuggesterEmbajadas = (function($) { // Soporte jQuery noConflict
return usig.Suggester.extend({
	
	init: function(options){
		var opts = $.extend({}, usig.SuggesterEmbajadas.defaults, options);
		this._super('Embajadas', opts);
		if (opts.onReady && typeof(opts.onReady) == "function") {
			opts.onReady();
		}
	},
	
	/**
	 * Dado un string, realiza una busqueda y llama al callback con las
	 * opciones encontradas.
	 * @param {String} text Texto de input
	 * @param {Function} callback Funcion que es llamada con la lista de sugerencias
	 * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
	 */
	getSuggestions: function(text, callback, maxSuggestions) {
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions;
		this.buscar(text, callback, function (){}, {limit: maxSug });
	},
	
	buscar: function (text, callback, error, options){
			
		var listEmbajadas= new Array(
			{nombre:'Bangladesh',dir:'RUGGIERI, SILVIO L. 2944',toString: function(){return 'Consulado de Bangladesh'}},
			{nombre:'España',dir:'CASTILLA, RAMON, MARISCAL 2720',toString: function(){return 'Embajada de España'}},
			{nombre:'España',dir:'GUIDO 1770',toString: function(){return 'Consulado de España'}},
			{nombre:'Marruecos',dir:'CASTEX 3461',toString: function(){return 'Embajada de Marruecos'}},
			{nombre:'Indonesia',dir:'CASTILLA, RAMON, MARISCAL 2901',toString: function(){return 'Consulado de Indonesia'}},
			{nombre:'Republica de Corea',dir:'DEL LIBERTADOR AV. 2395',toString: function(){return 'Embajada de Republica de Corea'}},
			{nombre:'Republica de Corea',dir:'SAN MARTIN DE TOURS 2857',toString: function(){return 'Consulado de Corea del Sur'}},
			{nombre:'Italia',dir:'BILLINGHURST 2577',toString: function(){return 'Embajada de Italia'}},
			{nombre:'Italia',dir:'ALVEAR, MARCELO T. De 1149',toString: function(){return 'Consulado de Italia'}},
			{nombre:'Gran Bretaña',dir:'AGOTE, LUIS Dr. 2412',toString: function(){return 'Consulado de Gran Bretaña'}},
			{nombre:'Gran Bretaña',dir:'AGOTE, LUIS Dr. 2412',toString: function(){return 'Embajada de Gran Bretaña'}},
			{nombre:'Estados Unidos',dir:'FRAY JUSTO SANTAMARIA DE ORO 3021',toString: function(){return 'Consulado de Estados Unidos'}},
			{nombre:'Estados Unidos',dir:'FRAY JUSTO SANTAMARIA DE ORO 3021',toString: function(){return 'Embajada de Estados Unidos'}},
			{nombre:'Mexico',dir:'ARCOS 1650',toString: function(){return 'Consulado de Mexico'}},
			{nombre:'Mexico',dir:'ARCOS 1650',toString: function(){return 'Embajada de Mexico'}},
			{nombre:'Chile',dir:'TAGLE 2762',toString: function(){return 'Embajada de Chile'}},
			{nombre:'Alemania',dir:'VILLANUEVA 1055',toString: function(){return 'Embajada de Alemania'}},
			{nombre:'Uruguay',dir:'LAS HERAS GENERAL AV. 1907',toString: function(){return 'Consulado de Uruguay'}},
			{nombre:'Uruguay',dir:'LAS HERAS GENERAL AV. 1907',toString: function(){return 'Embajada de Uruguay'}},
			{nombre:'Francia',dir:'CERRITO 1399',toString: function(){return 'Embajada de Francia'}});
			
		var listResult = new Array();
		$.each(listEmbajadas, function(i,elem){
			var index = elem.toString().toLowerCase().search(text.toLowerCase());
			if (index != -1) listResult.push(elem);
		});	
			
		if (typeof(callback) == "function") {
			if (listResult.length>0){ 
				callback(listResult,text);
			}else {
				callback({
					getErrorMessage: function(){
						return 'No se encontro ningun pais coincidente con el texto ingresado'
					}
				},text);
			}
		}
	},
	
	/**
	 * Indica si el componente esta listo para realizar sugerencias
	 * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
	 */
	ready: function() {
		return true;
	},
	
	/**
	 * Actualiza la configuracion del componente a partir de un objeto con overrides para las
	 * opciones disponibles
	 * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
	 */
	setOptions: function(options) {
		this._super(options);
	}
});
//Fin jQuery noConflict support
})(jQuery);

usig.SuggesterEmbajadas.defaults = {
	serverTimeout: 30000,
	maxRetries: 1,
	maxSuggestions: 10
};

usig.registerSuggester('Embajadas', usig.SuggesterEmbajadas);