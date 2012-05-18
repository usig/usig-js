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
		datosJson,
		precargado,
		descripcion="Sin datos",
		descripcionHtml="Sin datos",
		detalle=[],
		traveled_distance=0,
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
		if (tipo=="transporte_publico"){
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
			
		}else if (tipo=="walk"){
			descripcion = opts.texts.descWalk;
			$.each(resumen,function(i,action) { 
				if(action.type != undefined && action.type == 'StartWalking') {
					descripcionHtml += '<img src="' + opts.icons['recorrido_pie'] + '" width="20" height="20">';
				}
			});
		}else if (tipo=="car"){
			descripcion = opts.texts.descCar;
			$.each(resumen,function(i,action) { 
				if(action.type != undefined && action.type == 'StartDriving') {
						descripcionHtml += '<img src="' + opts.icons['recorrido_auto'] + '" width="20" height="20">';
				}
			});
		}
	}	
	
	function procesarPlan() {
		if (tipo =="transporte_publico"){
			var current_action = null;
	 		var walking = false;
	 		var changes = 0;
	 		var ramal = null; 	
	 		var type_action = null;	
	 		
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
						type_action = 'pie';
					}else if(item.type == 'FinishWalking') { 
						if (current_action) {
	    					current_action += ' hasta destino.';
	    					//detalle.push(current_action);
	    					detalle.push({text: current_action, type:type_action});
	    					current_action = null;
	    					type_action = null;
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
							//detalle.push(current_action);
							detalle.push({text: current_action, type:type_action});
							walking = false;
							current_action = null;
							type_action = null;
						}
	
						if(item.service_type == '1') { //subte
							current_action = 'Tomar el <span class="transport">SUBTE ' + item.service.toUpperCase() + '</span> ';
							if(changes > 0) 
								current_action += ' en la estación ' + item.stop_name;
								type_action = 'subte';
						
						} else if(item.service_type == '3') { //colectivo
	
							if (item.trip_description != "" && !item.any_trip){ //hay ramales y no son todos los que te llevan
								ramal = ' (Ramales: '+item.trip_description.replace('$',', ')+')'; 
							}else{
								ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
							}
							
							current_action = 'Tomar el <span class="transport">COLECTIVO ' + item.service +ramal+' </span> ';
							type_action = 'colectivo';
						} else if(item.service_type == '2') { //tren
							if (item.trip_description != "" && !item.any_trip){ //hay ramales y no son todos los que te llevan
								ramal = ' ('+item.trip_description.replace('$',' y ')+')'; 
							}else{
								ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
							}
							current_action = 'Tomar el <span class="transport">TREN ' + item.service.toUpperCase() +ramal+'</span> ';
							type_action = 'tren';
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
						
						//detalle.push(current_action);
						detalle.push({text: current_action, type:type_action});
						current_action = null;
						type_action = null;
					
					} else if (item.type == 'Bus') {
					} else if (item.type == 'SubWay') {
					} else if(item.type == 'SubWayConnection') {					
						//detalle.push(current_action);
						detalle.push({text: current_action, type:type_action});
						current_action =   'Combinar con el <span class="transport">SUBTE ' +  item.service_to.toUpperCase() + '</span> en estación ' + item.stop;
						type_action = 'subte';	
					} else if(item.type == 'Street') { 
					}
					
				}
			}
		}else if(tipo=="walk"){
			
	 		var actions = new Array();
	 		var index = 0;
	 		
			for(i=0;i<plan.length;i++) {
			
				var item = plan[i];
				if(item.type != undefined){
					
					var text = null;
					
					if(item.type == 'Street' ) { 
						index++;
						text = item.name  + ' ' ;
						
						if(typeof(item.from)!='undefined')
							text += item.from;
							
						if(typeof(item.to)!='undefined')
								text += ' - ' + item.to;
						actions.push({type:'walk',text:text, distance: item.distance, index:index, id:item.id});
					}
					
				}
			}
			//return {gml:gml, detail:actions};
			detalle = actions;
		}else if(tipo=="car"){
	 		actions = new Array();
	 		index = 0;
	 		var text;
			for(i=0;i<plan.length;i++) {
			
				var item = plan[i];
				if(item.type != undefined){

					var iconito;
					if(item.type == 'Street' ) { 
						index++;
						if (item.indicacion_giro!='0' && item.indicacion_giro!='1' && item.indicacion_giro!='2'){ //hago esta comparacion porque no me toma bien el ==''
							text = 'Ir desde ';
							iconito = 'seguir';
						}else if (item.indicacion_giro=='0'){
							text = 'Seguir por ';
							iconito = 'seguir';
						}else if(item.indicacion_giro=='1'){
							text = 'Doblar a la izquierda en ';
							iconito = 'izquierda';
						}else if(item.indicacion_giro=='2'){
							text = 'Doblar a la derecha en ';
							iconito = 'derecha';
						}
							
						text += item.name  + ' ' ;
						if(item.from)
							text += item.from;
						if(item.to)
							text += ' hasta el ' + item.to;
							actions.push({text:text, iconito:iconito, index:index, distance:item.distance,type:'car', id:item.id});
					}
				}
			}
			//return {gml:gml, detail:actions};
			detalle = actions;
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
			traveled_distance=datos.traveled_distance;
			datosJson=$.extend({}, datos);
			datosJson.options = opts;
			procesarResumen();
			cargarPlan(datos);
		} catch(e) {
			usig.debug('usig.Recorrido: Error cargando datos.');
		}
	}
	
	function cargarPlan(data, callback) {
		if (!plan) {
			plan = data.plan;
			console.log(data);
			datosJson = $.extend({}, datosJson, data);
			console.log(datosJson);
			procesarPlan();
		}

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
	
	//this.loadPlan = function(data, callback) {
	//	cargarPlan(data, callback);
	//}
	/**
	 * Devuelve la descripcion corta del recorrido (el listado ordenado de los
	 * transportes incluidos). 
	 * @return {String} Descripcion corta del recorrido
	 */	
	this.toString = function() {
		return descripcion;
	};
	
	/**
	 * Devuelve la descripcion corta del recorrido (el listado ordenado de los
	 * transportes incluidos) en formato HTML listo para mostrar e incluyendo los 
	 * iconos correspondientes para los diferentes tipos de transportes. 
	 * @return {String} Descripcion corta del recorrido en formato HTML
	 */	
	this.toHtmlString = function() {
		return descripcionHtml;
	};
	
	/**
	 * Devuelve el tiempo estimado del recorrido
	 * @return {Float} Tiempo estimado del recorrido en minutos
	 */
	this.getTime = function() {
		return tiempo;
	};
	
	this.getTraveledDistance = function() {
		return traveled_distance;
	};
	
	this.time_string = function() {
		time = '';
		//Mas de 60 mins
		if(tiempo > 60) {
			hs = Math.round(tiempo / 60);
			mins = tiempo % 60;
			time += hs + (hs >1 ? 'hs ' : 'h ') + mins + ' \''; 
		} else {
			time += tiempo + ' \'';
		}
		return time;
	};

	/**
	 * Permite obtener el trip_plan del recorrido
	 * @param {Function} success Una funcion que es llamada cuando se obtiene el detalle del recorrido. 
	 * Recibe de parametro un Array(String) con una lista de strings con la descripcion de cada uno de 
	 * los pasos del recorrido y un Object conteniendo el trip_plan obtenido del servidor
	 * @param {Function} error Una funcion que es llamada en caso de error al intentar cargar el detalle 
	 * del recorrido
	 * @returns {Object} trip_plan obtenido del servidor o undefined en caso de que aun no se encuentre cargado
	 */
	this.getPlan = function(success, error, opciones) {
		if (!plan) {
			usig.Recorridos.cargarPlanRecorrido(id, cargarPlan.createDelegate(this, [success], 1), error, opciones);
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
	this.getDetalle = function(success, error, opciones) {
		if (!plan) {
			if (data.plan) {
				cargarPlan(data, success);
			}else{
				usig.Recorridos.cargarPlanRecorrido(id, cargarPlan.createDelegate(this, [success], 1), error, opciones);
			}
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
	
	this.getTemplate = function() {
		return opts.template;
	}
	
	/**
	 * Devuelve el color asociado a este recorrido en formato HTML
	 * @returns {String} Color en formato HTML hexadecimal
	 */
	this.getColor = function() {
		return opts.template.color;
	}
	
	this.getTipo = function() {
		return tipo;
	};
	
	/**
	 * Permite setear un color a este recorrido
	 * @param {String} color Color especificado en formato hexa HTML incluyendo el #, por ej.: '#4A5076'
	 */
	this.setColor = function(color) {
		opts.template.color = color;
	};
	
	/**
	 * Devuelve el origen del recorrido
	 * @return {String} Origen del recorrido
	 */
	this.getOrigen = function() {
		return origen;
	};
	
	/**
	 * Devuelve el destino del recorrido
	 * @return {String} Destino del recorrido
	 */
	this.getDestino = function() {
		return destino;
	}
	
	/**
	 * Devuelve una version JSON-serializable del objeto
	 * @return {Object} Objeto conteniendo los datos necesarios para representar el recorrido
	 */
	this.toJson = function() {
		return datosJson;
	}
	
	if (data) loadData(data);
};

/**
 * Permite obtener una instancia de usig.Recorrido a partir de un objeto con datos
 * @param {Object} data Objeto conteniendo los datos necesarios para un recorrido. Por ej. obtenido
 * mediante toJson()
 * @return {usig.Recorrido} Instancia de usig.Recorrido construida a partir de los datos.
 */
usig.Recorrido.fromObj = function(data) {
	return new usig.Recorrido(data, data.options);
};

usig.Recorrido.defaults = {
	icons: {
		recorrido_pie: 'http://mapa.buenosaires.gob.ar/images/recorrido_pie20x20.png', 	
		recorrido_subte: 'http://mapa.buenosaires.gob.ar/images/recorrido_subte20x20.png', 	
		recorrido_tren: 'http://mapa.buenosaires.gob.ar/images/recorrido_tren20x20.png', 	
		recorrido_colectivo: 'http://mapa.buenosaires.gob.ar/images/recorrido_colectivo20x20.png', 	
		recorrido_auto: 'http://mapa.buenosaires.gob.ar/images/recorrido_auto20x20.png'
	},
	template: new usig.TripTemplate(1,'#8F58C7'),
	texts: {
		descWalk: 'Recorrido a pie',
		descCar: 'Recorrido en auto',
		hayRamales:'No todos los ramales conducen a destino'		
	}
};

}

