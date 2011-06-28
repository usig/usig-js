// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SeccionCatastral
 * Esta clase representa una seccion
 * @namespace usig
 * @constructor 
 * @param {String} seccion Codigo de seccion
*/
usig.SeccionCatastral = function(seccion) {
	this.codigoSeccion = seccion;
	this.descripcion = 'Código Sección';

	
	/**
	 * Devuelve el codigo de la seccion 
     * @return {String} codigo de la seccion
    */		
	this.toString = function() {
		return this.codigoSeccion;
	}
};
