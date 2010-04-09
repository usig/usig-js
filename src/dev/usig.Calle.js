// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Calle
 * @namespace usig 
 * @constructor 
 * @param {Integer} cod Codigo de calle
 * @param {String} nom Nombre oficial de la calle
 * @param {Array} alturas (optional) Array conteniendo los rangos de altura validos para esta calle
 * @param {Array} cruces (optional) Array conteniendo los id de las calles que se cruzan con esta
*/
usig.Calle = function(cod, nom, alturas, cruces) {
	/**
	  * @property
	  * @type Integer
	  */ 
	this.codigo = cod;
	/**
	  * @property
	  * @type String
	  */ 
	this.nombre = nom;
	
	/**
	 * Verifica si la altura es valida para esta calle. En caso de tratarse de una calle sin alturas oficiales
	 * asiganadas se lanza la excepcion <code>ErrorCalleSinAlturas</code>. 
     * @param {Integer} alt Altura a validar
     * @return {Boolean} True si la altura es valida para esta calle
    */	
	this.alturaValida = function(alt) {
		if (alturas instanceof Array) {
			if (alturas.length == 0) {
				throw(new usig.ErrorCalleSinAlturas(this.nombre));
				return false;
			}
            var valid = false;
			for(a in alturas) {
				valid = valid || ((parseInt(alturas[a][0]) <= parseInt(alt)) && (parseInt(alturas[a][1]) >= parseInt(alt)));
			}
			return valid;
		}
	}
	
	/**
	 * Devuelve un string con el nombre de la calle 
     * @return {String} Nombre de la calle
    */	
	this.toString = function() {
		return this.nombre;
	}
	
	/**
	 * Verifica si la calle (instancia de la clase usig.Calle) recibida como parametro
	 * se cruza con esta 
     * @param {usig.Calle} calle Calle a verificar si se intersecta con esta
     * @return {Boolean} True en caso de que exista el cruce correspondiente
    */	
	this.seCruzaCon = function(calle) {
		if (cruces) {
			return cruces.indexOf(calle.codigo) >= 0;
		}
	}
}