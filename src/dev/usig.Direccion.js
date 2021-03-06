// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof(usig.Direccion) == "undefined") {	
/**
 * @class Direccion
 * @namespace usig
 * @constructor 
 * @param {usig.Calle} calle1 Instancia de la clase usig.Calle
 * @param {usig.Calle-Integer} calle2OAltura Instancia de usig.Calle que se cruza con calle1 o altura correspondiente de calle1
*/
usig.Direccion = (function($) { // Soporte jQuery noConflict
return function(calle1, calle2OAltura) {
	var calle = null;
	var calleCruce = null;
	var altura = 0;
	var tipo = null;
	var smp = '';
	var coordenadas = null; 
	
	if (calle1 instanceof usig.Calle) {
		calle = calle1;
	} else {
		return null;
	}
	
	if (calle2OAltura instanceof usig.Calle) {
		calleCruce = calle2OAltura;
		tipo = usig.Direccion.CALLE_Y_CALLE;
	} else {
		if (!isNaN(parseInt(calle2OAltura))) {
			tipo = usig.Direccion.CALLE_ALTURA;
			altura = parseInt(calle2OAltura);
		} else {
			return null;
		}
	}
	
	/**
	 * Devuelve la instancia de usig.Calle correspondiente 
     * @return {usig.Calle} Calle
    */		
	this.getCalle = function() {
		return calle;
	};
	
	/**
	 * Devuelve la instancia de usig.Calle correspondiente a la interseccion 
     * @return {usig.Calle} Calle
    */		
	this.getCalleCruce = function() {
		if (tipo == usig.Direccion.CALLE_Y_CALLE) { 
			return calleCruce;
		} else {
			return null;
		}
	};
	
	/**
	 * Devuelve la altura correspondiente 
     * @return {Integer} Altura
    */		
	this.getAltura = function() {
		return altura;
	};
    
    /**
     * Devuelve el tipo de direccion correspondiente 
     * @return {Integer} Tipo
    */      
    this.getTipo = function() {
        return tipo;
    };
	
	/**
	 * Devuelve un string con la direccion escrita correctamente para mostrar 
     * @return {String} Direccion como texto
    */		
	this.toString = function() {
		if (tipo == usig.Direccion.CALLE_ALTURA) {
			res = calle.toString()+' '+(altura>0?altura:'S/N');
		} else {
			var nombreCruce = calleCruce.nombre;
			var separador = nombreCruce.match(/^(I|Hi|HI).*/)?' e ':' y ';
			res = calle.nombre+separador+calleCruce.nombre;				
		}
		if (calle.partido != undefined){
			res = res+', '+calle.localidad;
		}
		return res;
	};
	
	/**
	 * Setea las coordenadas de la geocodificacion de esta direccion
	 * @param {usig.Punto} pt Instancia de usig.Punto que contiene las coordenadas
	 */
	this.setCoordenadas = function(pt) {
		coordenadas = usig.Punto.fromPunto(pt);
	};
	
	/**
	 * Setea el codigo de seccion-manzana-parcela correspondiente a esta direccion
	 * si existiera
	 * @param {String} SMP Codigo de seccion-manzana-parcela
	 */
	this.setSmp = function(SMP) {
		smp = SMP;
	};
	
	/**
	 * Devuelve las coordenadas asociadas a esta direccion en caso de estar disponibles
	 * o null en caso contrario
	 * @return {usig.Punto} Instancia de usig.Punto con las coordenadas correspondientes
	 */
	this.getCoordenadas = function() {
		return coordenadas;
	};
	
	/**
	 * Devuelve el codigo de seccion-manzana-parcela asociado a esta direccion en caso de estar
	 * disponible o '' en caso contrario
	 * @return {String} Codigo de seccion-manzana-parcela
	 */
	this.getSmp = function() {
		return smp;
	};
	
	/**
	 * Devuelve un clon de si mismo
	 * @returns {usig.Direccion} Clon del objeto
	 */
	this.clone = function() {
		var dir = new usig.Direccion(calle, calle2OAltura);
		return $.extend(true, dir, this);
	};
	
	/**
	 * Devuelve un objeto serializable a JSON
	 * @returns {Object} Un objeto serializable a JSON 
	 */
	this.toJson = function() {
		return {
				tipo: tipo, 
				calle: calle.toJson(), 
				altura: altura, 
				calle_cruce: calleCruce?calleCruce.toJson():null, 
				smp: smp, 
				coordenadas: coordenadas
			};
	};
	
	/**
	 * Compara esta direccion con otra y determina si se refieren a la misma
	 * posicion geografica, i.e.: 'callao y corrientes' es lo mismo que 
	 * 'corrientes y callao'
	 * @param {usig.Direccion} Direccion a comparar
	 * @return {Boolean} Verdadero si hacen referencia al mismo lugar
	 */
	this.isEqual = function(dir) {
		var equal = (dir instanceof usig.Direccion && (tipo == dir.getTipo()) && 
				((tipo==usig.Direccion.CALLE_ALTURA && 
						calle.isEqual(dir.getCalle()) &&
						altura == dir.getAltura()) || 
						(tipo==usig.Direccion.CALLE_Y_CALLE && 
							((calle.isEqual(dir.getCalle()) && calleCruce.isEqual(dir.getCalleCruce())) ||
							(calle.isEqual(dir.getCalleCruce()) && calleCruce.isEqual(dir.getCalle())))
							)
					)
				);
		return equal;
	};
	
};
//Fin jQuery noConflict support
})(jQuery);

usig.Direccion.CALLE_ALTURA 	= 0;
usig.Direccion.CALLE_Y_CALLE 	= 1;

/**
 * Devuelve una nueva direccion creada a partir de un diccionario
 * @param {Object} obj Diccionario conteniendo los datos de la direccion
 * @return {usig.Direccion} Direccion creada
 */
usig.Direccion.fromObj = function(obj) {
	var dir = null;
	if (obj.tipo != undefined && obj.calle && obj.calle.codigo) {
		dir = new usig.Direccion(usig.Calle.fromObj(obj.calle), 
				(obj.tipo==usig.Direccion.CALLE_ALTURA)?obj.altura:usig.Calle.fromObj(obj.calle_cruce));
	} else {
		var calle = usig.Calle.fromObj(obj);
		if (obj.cod_calle2 || obj.cod_calle_cruce) {
			// Direccion Calle y Calle
			var calle_cruce = new usig.Calle(obj.cod_calle2 || obj.cod_calle_cruce, obj.calle2 || obj.nombre_calle_cruce);
			calle_cruce.setPartido(obj.nombre_partido);
			calle_cruce.setLocalidad(obj.nombre_localidad);			
			dir = new usig.Direccion(calle, calle_cruce);
		} else {
			// Direccion Calle Altura
			dir = new usig.Direccion(calle, obj.altura);
		}
		if (obj.nombre_partido)	{
			dir.descripcion = obj.nombre_localidad + ', ' +obj.nombre_partido
		}
	}
	if (obj.smp != undefined && obj.smp != null) {
		dir.setSmp(obj.smp);
	}
	if (obj.coordenadas != undefined && obj.coordenadas != null) {
		if (typeof(obj.coordenadas) == 'string') {
			dir.setCoordenadas(usig.Punto.fromWkt(obj.coordenadas));
		} else {
			dir.setCoordenadas(usig.Punto.fromObj(obj.coordenadas));			
		}
	}
	return dir;
}

}