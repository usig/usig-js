// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof(usig.Recorrido) == "undefined") {	
	
/**
 * @class Recorrido
 * @namespace usig 
 * @constructor 
 * @param {Object} data Objeto conteniendo los datos del recorrido obtenidos del servicio de Recorridos
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/
usig.Recorrido = function(data, options) {
	var id=0,
		tiempo=0,
		origen,
		destino,
		tipo,
		resumen,
		plan,
		descripcion="Sin datos",
		descripcionHtml="Sin datos",
		detalle=[],
		opts = $.extend({}, usig.Recorrido.defaults, options);

	
	getServiceIcon = function(type) {
		var src = '';
		if ( type == 0 ) src = 'recorrido_pie';
	    if ( type == 1 ) src = 'recorrido_subte';
	    if ( type == 2 ) src = 'recorrido_tren';
	    if ( type == 3 ) src = 'recorrido_colectivo';
	    //FIXME armar una array
	    
	    return '<img src="' + opts.icons[src] + '" width="20" height="20">';
	}
	
	function procesarResumen() {
		var desc=[];
		descripcionHtml="";
		$.each(resumen,function(i,action) { 
			if(action.type == 'Board') { 
				if (!action.any_trip && action.service_type!=1){
					if (action.trip_description != ""){	//mostrar las descripciones en el asterisco
						var ramales = 'Ramales: ' + action.trip_description.replace('$',', ');
						descripcionHtml += getServiceIcon(action.service_type) + ' ' + action.service + '  <span class="ramales" title="'+ramales+'">(*)</span>';
						desc.push(action.service+' ('+ramales+')');
					}else{ // mostrar cartel de que hay mas ramales en el asterisco
						descripcionHtml += getServiceIcon(action.service_type) + ' ' + action.service + ' <span class="ramales" title="'+opts.texts.hayRamales+'">(*)  </span>';
						desc.push(action.service+' ('+opts.texts.hayRamales+')');
					}
				} else {
					descripcionHtml += getServiceIcon(action.service_type) + ' ' + action.service + '  ';
					desc.push(action.service); 
				}
			}
		});
		descripcion=desc.join(', ');
	}
	
	// ATENCION: Esto solo funciona para transporte publico, habria que cambiarlo para el resto
	function procesarPlan() {
 		var current_action = null;
 		var walking = false;
 		var changes = 0;
 		var ramal = null; 		
 		
		for(i=0;i<plan.length;i++) {
		
			var item = plan[i];
		
			if(item.type != undefined){
				
				if(item.type == 'StartWalking'){
					walking = true;
					if(i==0){
						//Comienzo
						current_action = 'Caminar desde ' + plan[i+1].name + ' ' + plan[i+1].from;
					} else {
						//Venimos de un Aligh
						current_action = 'Caminar desde ' + plan[i-1].stop_description;	
					}
					
				}else if(item.type == 'FinishWalking') { 
					if (current_action) {
    					current_action += ' hasta destino.';
    					detalle.push(current_action);
    					current_action = null;
					}
					walking = false;
				}else if(item.type == 'Board') {
					var walking_state = walking;
					
					if(walking) {
						if(item.service_type == '3') 
							current_action += ' hasta ' + item.stop_description;
						else
							current_action += ' hasta la estación ' + item.stop_name + ' en ' + item.stop_description; //FIXME falta poner donde está la estacion
						//Ponemos un punto al final
						if(!(current_action.charAt(current_action.length -1) == '.'))
							current_action += '.';
						//features.push(item.gml);
						detalle.push(current_action);
						walking = false;
						current_action = null;
					}

					if(item.service_type == '1') { //subte
						current_action = 'Tomar el <span class="transport">SUBTE ' + item.service.toUpperCase() + '</span> ';
						if(changes > 0) 
							current_action += ' en la estación ' + item.stop_name;
					
					} else if(item.service_type == '3') { //colectivo

						if (item.trip_description != "" && !item.any_trip){ //hay ramales y no son todos los que te llevan
							ramal = ' (Ramales: '+item.trip_description.replace('$',', ')+')'; 
						}else{
							ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
						}
						
						current_action = 'Tomar el <span class="transport">COLECTIVO ' + item.service +ramal+' </span> ';
					} else if(item.service_type == '2') { //tren
						if (item.trip_description != "" && !item.any_trip){ //hay ramales y no son todos los que te llevan
							ramal = ' ('+item.trip_description.replace('$',' y ')+')'; 
						}else{
							ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
						}
						current_action = 'Tomar el <span class="transport">TREN ' + item.service.toUpperCase() +ramal+'</span> ';
						if(changes > 0) 
							current_action += ' en la estación ' + item.stop_name;
					}
					
					if(!walking_state) {
						current_action += ' en ' + item.stop_description;
					}
					changes +=1;
					
				} else if(item.type == 'Alight') {
					if(item.service_type != undefined && (item.service_type == '2' || item.service_type == '1'))  
						current_action += ' y bajar en la estación ' + item.stop_name;
					else {
						current_action += ' y bajar en ' + item.stop_description;
					}

					//Ponemos un punto al final
					if(!(current_action.charAt(current_action.length -1) == '.'))
						current_action += '.';
					
					detalle.push(current_action);
					current_action = null;
				
				} else if (item.type == 'Bus') {
				} else if (item.type == 'SubWay') {
				} else if(item.type == 'SubWayConnection') {					
					detalle.push(current_action);
					current_action =   'Combinar con el <span class="transport">SUBTE ' +  item.service_to.toUpperCase() + '</span> en estación ' + item.stop;					
				} else if(item.type == 'Street') { 
				}
				
			}
		}
	}
		
	function loadData(datos) {		
		try {
			id=datos.id;
			tiempo=datos.tiempo;
			origen=datos.origen;
			destino=datos.destino;
			tipo=datos.type;
			resumen=datos.summary;
			procesarResumen();
		} catch(e) {
			usig.debug('usig.Recorrido: Error cargando datos.');
		}
	}
	
	function cargarPlan(data, callback) {
		plan = data.plan;
		procesarPlan();
		if (typeof(callback) == "function")
			callback(detalle, plan);		
	}
	
	/**
	 * Permite cargar datos de un recorrido obtenidos del servicio de recorridos de USIG
	 * @param {Object} datos Datos del recorrido
	 */
	this.load = function(datos) {
		loadData(datos);
	}
	
	/**
	 * Devuelve la descripcion corta del recorrido (el listado ordenado de los
	 * transportes incluidos). 
	 * @return {String} Descripcion corta del recorrido
	 */	
	this.toString = function() {
		return descripcion;
	}
	
	/**
	 * Devuelve la descripcion corta del recorrido (el listado ordenado de los
	 * transportes incluidos) en formato HTML listo para mostrar e incluyendo los 
	 * iconos correspondientes para los diferentes tipos de transportes. 
	 * @return {String} Descripcion corta del recorrido en formato HTML
	 */	
	this.toHtmlString = function() {
		return descripcionHtml;
	}
	
	/**
	 * Devuelve el tiempo estimado del recorrido
	 * @return {Float} Tiempo estimado del recorrido en minutos
	 */
	this.getTime = function() {
		return tiempo;
	}

	/**
	 * Permite obtener el trip_plan del recorrido
	 * @param {Function} success Una funcion que es llamada cuando se obtiene el detalle del recorrido. 
	 * Recibe de parametro un Array(String) con una lista de strings con la descripcion de cada uno de 
	 * los pasos del recorrido y un Object conteniendo el trip_plan obtenido del servidor
	 * @param {Function} error Una funcion que es llamada en caso de error al intentar cargar el detalle 
	 * del recorrido
	 * @returns {Object} trip_plan obtenido del servidor o undefined en caso de que aun no se encuentre cargado
	 */
	this.getPlan = function(success, error) {
		if (!plan) {
			usig.Recorridos.cargarPlanRecorrido(id, cargarPlan.createDelegate(this, [success], 1), error);
		} else {
			if (typeof(success) == "function")
				success(plan);
		}
		return plan;
	}
	
	/**
	 * Permite obtener la descripcion detallada de cada uno de los pasos que componen el recorrido
	 * @param {Function} success Una funcion que es llamada cuando se obtiene el detalle del recorrido. 
	 * Recibe de parametro un Array(String) con una lista de strings con la descripcion de cada uno de 
	 * los pasos del recorrido y un Object conteniendo el trip_plan obtenido del servidor
	 * @param {Function} error Una funcion que es llamada en caso de error al intentar cargar el detalle 
	 * del recorrido
	 */
	this.getDetalle = function(success, error) {
		if (!plan) {
			usig.Recorridos.cargarPlanRecorrido(id, cargarPlan.createDelegate(this, [success], 1), error);
		} else {
			if (typeof(success) == "function")
				success(detalle);
		}
	}
	
	/**
	 * Devuelve el id del recorrido
	 * @return {Integer} Id del recorrido
	 */
	this.getId = function() {
		return id;
	}
	
	if (data) loadData(data);
};

usig.Recorrido.defaults = {
	icons: {
		recorrido_pie: 'http://mapa.buenosaires.gob.ar/images/recorrido_pie20x20.png', 	
		recorrido_subte: 'http://mapa.buenosaires.gob.ar/images/recorrido_subte20x20.png', 	
		recorrido_tren: 'http://mapa.buenosaires.gob.ar/images/recorrido_tren20x20.png', 	
		recorrido_colectivo: 'http://mapa.buenosaires.gob.ar/images/recorrido_colectivo20x20.png' 	
	},
	texts: {
		hayRamales:'No todos los ramales conducen a destino'		
	}
}

}

