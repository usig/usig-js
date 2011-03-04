// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class ManzanaCatastral
 * Esta clase representa una manzana con su codigo seccion-manzana
 * @namespace usig
 * @constructor 
 * @param {String} manzana Codigo de manzana (seccion-manzana)
*/
usig.ManzanaCatastral = function(manzana) {
	this.codigoManzana = manzana;
	this.descripcion = 'Código Sección-Manzana';

	/**
	 * Devuelve el codigo de la manzana expresado en seccion-manzana 
     * @return {String} codigo de la manzana
    */
	this.toString = function() {
		return this.codigoManzana;
	}
}