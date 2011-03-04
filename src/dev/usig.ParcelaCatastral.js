// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class ParcelaCatastral
 * Esta clase representa una parcela como un par (smp, ubicacion)
 * @namespace usig
 * @constructor
 * @param {Object} parcela Parcela a representar {punto, smp}
*/
usig.ParcelaCatastral = function(parcela) {
	this.smp = parcela.smp;
	this.pm = parcela.pm;
	this.punto = usig.Punto.fromWkt(parcela.centroide);

	if (this.pm != ''){
        this.descripcion = 'Código Partida-Matriz';
	}else{
        this.descripcion = 'Código Sección-Manzana-Parcela';
	}
	
	/**
	 * Devuelve la ubicacion de la parcela
     * @return {usig.Punto} Ubicacion de la parcela
    **/		
	this.getPunto = function(){
		return this.punto;
	}

	/**
	 * Devuelve el SMP de la parcela 
     * @return {String} SMP de la parcela
    **/
	this.toString = function() {
        if (this.pm != ''){
           return this.pm;
        }else{
           return this.smp;
        }
	}
}