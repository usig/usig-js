// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof(usig.Recorrido) == "undefined") {	
	
/**
 * @class Recorrido
 * @namespace usig 
 * @constructor 
 * @param {Object} datos Objeto conteniendo los datos del recorrido obtenidos del servicio de Recorridos
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/
usig.Recorrido = (function($) { // Soporte jQuery noConflict
return function(datos, options) {
	var id=0,
		tiempo=0,
		origen,
		destino,
		tipo,
		resumen,
		plan,
		data,
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
	    if ( type == 4 ) src = 'recorrido_bici';
	    //FIXME armar una array
	    
	    return '<img src="' + opts.icons[src] + '" width="20" height="20">';
	}
	
	function procesarResumen() { //V3
		var desc=[];
		descripcionHtml="";
		if (tipo=="transporte_publico"){
			estadoAnterior = null;	
			$.each(resumen,function(i,action) {
				if(action.type == 'Board') {
					if (estadoAnterior =='Alight'){
						descripcionHtml += '<span class="icons-sprite icon-combinacion"></span>';
					}
					if (action.service_type==3){ //colectivo
						descripcionHtml += '<div class="pill colectivo'+action.service+'"><div class="primero"><span class="segundo"></span></div> <span class="linea">'+ action.service+'</span></div>';
						desc.push(action.service); 
					}else if(action.service_type==1){//subte
						lineas = action.service.split("-");
						$.each(lineas,function(i,linea) {
							descripcionHtml += '<div class="circlePill subte'+linea+'"><span class="linea">'+ linea.replace('Premetro','P')+'</span></div>';
						});
						desc.push(action.service); 
					}else if(action.service_type==2){	//tren
						var titleName = action.long_name?action.long_name:action.service;
						descripcionHtml += '<div class="pill trenpill"><div class="primero"><span class="segundo"></span></div> <span class="linea" title="'+titleName+'">'+  action.service.replace(/\./g, '')+'</span></div>';
						desc.push(action.service); 
					}
				}
				estadoAnterior = action.type;
			});
			descripcion=desc.join(', ');
			
		}else if (tipo=="walk"){
			descripcion = opts.texts.descWalk;
			$.each(resumen,function(i,action) { 
				if(action.type != undefined && action.type == 'StartWalking') {
					descripcionHtml += '<img src="' + opts.icons['recorrido_pie'] + '" width="20" height="20"> '+ descripcion;
				}
			});
		}else if (tipo=="car"){
			descripcion = opts.texts.descCar;
			$.each(resumen,function(i,action) { 
				if(action.type != undefined && action.type == 'StartDriving') {
					descripcionHtml += '<img src="' + opts.icons['recorrido_auto'] + '" width="20" height="20"> '+ descripcion;
				}
			});
		}else if (tipo=="bike"){
			descripcion = opts.texts.descBike;
			$.each(resumen,function(i,action) { 
				if(action.type != undefined && action.type == 'StartBiking') {
					descripcionHtml += '<img src="' + opts.icons['recorrido_bici'] + '" width="20" height="20"> '+ descripcion;
					return false;
				}
			});
			if (descripcionHtml==""){
				descripcionHtml += '<img src="' + opts.icons['recorrido_pie'] + '" width="20" height="20"> ';
			}
		}
	}
	function procesarPlan() {
		if (tipo =="transporte_publico"){
			var current_action = null;
	 		var walking = false;
	 		var changes = 0;
	 		var ramal = null; 	
	 		var type_action = null;	
	 		var features = new Array();
	 		var detail = new Array();
	 		var currentAction = usig.Recorrido.defaults.texts.planTransporte;
			
			for(i=0;i<plan.length;i++) {
				var item = plan[i];
				if(item.type != undefined){
					
					if(item.type == 'StartWalking'){
						walking = true;
						if(i==0){
							//Comienzo
							current_action = currentAction['walking']['startDir'].texto.replace('$calle', plan[i+1].name);
							current_action = current_action.replace('$desde',plan[i+1].from);
						} else {
							//Venimos de un Aligh
							current_action = currentAction['walking']['startCruce'].texto.replace('$calle1', plan[i-1].calle1);
							current_action = current_action.replace('$calle2', plan[i-1].calle2);
						}
						type_action = 'pie';
					}else if(item.type == 'FinishWalking') { 
						if (current_action) {
							current_action += currentAction['walking']['finish'].texto;
	    					detalle.push({text: current_action, type:type_action, features: features});
	    					current_action = null;
	    					type_action = null;
	    					features = [];
						}
						walking = false;
					}else if(item.type == 'Board') {
						var walking_state = walking;
						if(walking) {
							if(item.service_type == '3'){ //colectivo
								current_action += currentAction ['board']['walking'].texto;//.replace('$esquina',item.stop_description);
							}else{
								current_action += currentAction ['board']['walkingestacion'].texto.replace('$estacion',item.stop_name);							
							}
							//current_action = current_action.replace('$esquina',item.stop_description);
							current_action = current_action.replace('$calle1',item.calle1);
							current_action = current_action.replace('$calle2',item.calle2);
							//Ponemos un punto al final
							if(!(current_action.charAt(current_action.length -1) == '.'))
								current_action += '.';
							//features.push(item.gml);
							detalle.push({text: current_action, type:type_action, features:features});
							walking = false;
							current_action = null;
							type_action = null;
							features = [];
						}
	
						if(item.service_type == '1') { //subte
							current_action = currentAction ['board']['subte'].texto;//.replace('$subte',item.service.toUpperCase());
							if(changes > 0){ 
								current_action += currentAction ['board']['estacion'].texto;//.replace('$estacion',item.stop_name);
							}
							type_action = 'subte';
						} else if(item.service_type == '3') { //colectivo
							if (item.trip_description != "" && !item.any_trip){ //hay ramales y no son todos los que te llevan
								ramal = currentAction ['board']['ramales'].texto.replace('$ramal',item.trip_description.replace(/\$/g,", "));
							}else{
								ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
							}
							current_action = currentAction ['board']['colectivo'].texto;//.replace('$colectivo',item.service);
						
							if (item.metrobus){ //Es METROBUS ? cuando se sube
								current_action += currentAction ['board']['estacion'].texto;//.replace('$estacion',item.stop_name);
							}
							type_action = 'colectivo';
						} else if(item.service_type == '2') { //tren
							if (item.trip_description != ""){ //hay ramales 
								ramal = ' ('+item.trip_description.replace('$',' y ')+')'; 
							}else{
								ramal = (!item.any_trip)? ' ('+opts.texts.hayRamales+')':'';
							}
							current_action = currentAction ['board']['tren'].texto;//.replace('$tren',item.service.toUpperCase());
							type_action = 'tren';
							if(changes > 0){ 
								current_action += currentAction ['board']['estacion'].texto;//.replace('$estacion',item.stop_name);
							}
						}
								                    
						if(!walking_state) {
							current_action += currentAction ['board']['esquina'].texto; //.replace('$esquina',item.stop_description);
						}
						changes +=1;
						//current_action = current_action.replace('$esquina',item.stop_description);
						current_action = current_action.replace('$calle1',item.calle1);
						current_action = current_action.replace('$calle2',item.calle2);
						current_action = current_action.replace('$estacion',item.stop_name);
						current_action = current_action.replace('$colectivo',item.service);
						current_action = current_action.replace('$tren',item.service.toUpperCase());
						current_action = current_action.replace('$subte',item.service.toUpperCase().replace('LÍNEA',''));
						current_action = current_action.replace('$ramal',ramal);
						current_action = current_action.replace('$sentido',item.trip_description);
						
					} else if(item.type == 'Alight') {
						if(item.service_type != undefined && (item.service_type == '2' || item.service_type == '1')){  
							current_action += currentAction['alight']['subtetren'].texto;//.replace('$estacion',item.stop_name);
						}else if (item.metrobus){ //item.service_type == '3' // colectivo 
							current_action += currentAction['alight']['metrobus'].texto;//.replace('$estacion',item.stop_name);
						}else{
							current_action += currentAction['alight']['cole'].texto;
						}
						//current_action = current_action.replace('$esquina',item.stop_description);
						current_action = current_action.replace('$calle1', item.calle1);
						current_action = current_action.replace('$calle2', item.calle2);
						current_action = current_action.replace('$estacion',item.stop_name);

						//Ponemos un punto al final
						if(!(current_action.charAt(current_action.length -1) == '.')){
							current_action += '.';
						}
						detalle.push({text: current_action, type:type_action, features: features});
						current_action = null;
						type_action = null;
						features = [];
					} else if (item.type == 'Bus' && item.gml) {
						features.push(item.gml);
					} else if (item.type == 'SubWay' && item.gml) {
						if (features.length == 0){
							features.push(item.gml);
						}else {
							var anterior = features[features.length-1];
							if (anterior.search("gml:LineString") >= 0 && anterior.search("subway")>= 0){
								var nextFeature = item.gml; 
							}
							else {
								features.push(item.gml);
								}
						}
					} else if(item.type == 'SubWayConnection') {
						detalle.push({text: current_action, type:type_action, features: features});
						//current_action =   'Bajarse en la estación <span class="plan-estacion">'+item.stop_from+'</span> y combinar con el <span class="transport">SUBTE ' +  item.service_to.toUpperCase() + ' (en dirección '+item.trip_description+')</span> en estación <span class="plan-estacion">' + item.stop+'</span>';
						current_action = currentAction ['subwayconnection'].texto;
						current_action = current_action.replace('$estacionorigen',item.stop_from);
						current_action = current_action.replace('$estaciondestino',item.stop);
						current_action = current_action.replace('$subte',item.service_to.toUpperCase().replace('LÍNEA',''));
						current_action = current_action.replace('$sentido',item.trip_description);
						
						type_action = 'subte';	
						features = [];
						features.push(nextFeature); 
					} else if(item.type == 'Street' && item.gml) { 
						features.push(item.gml);
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
	 		var indicaciones = usig.Recorrido.defaults.texts.planAuto;

	 		for(i=0;i<plan.length;i++) {
				var item = plan[i];
				if(item.type != undefined){

					var turn_indication;
					if(item.type == 'Street' ) { 
						index++;
						if (item.indicacion_giro!='0' && item.indicacion_giro!='1' && item.indicacion_giro!='2'){
							text = indicaciones['irDesde'].texto;
							turn_indication = 'seguir';
						}else if (item.indicacion_giro=='0'){
							text = indicaciones['seguir'].texto;
							turn_indication = 'seguir';
						}else if(item.indicacion_giro=='1'){
							text = indicaciones['doblarIzq'].texto;
							turn_indication = 'izquierda';
						}else if(item.indicacion_giro=='2'){
							text = indicaciones['doblarDer'].texto;
							turn_indication = 'derecha';
						}
							
						//text=text.replace('$calle', item.name);
						if(item.from){
							text=text.replace('$desde',item.from);
						} else {
							text=text.replace('$desde','');							
						}
						if(item.to){
							text+= indicaciones['hasta'].texto.replace('$hasta', item.to);
						} 
						text=text.replace(/\$calle/g, item.name);
						
						actions.push({text:text, turn_indication:turn_indication, index:index, distance:item.distance,type:'car', id:item.id});
					}
				}
			}
			//return {gml:gml, detail:actions};
			detalle = actions;
		}else if (tipo=="bike"){
	 		var walking = false;
	 		actions = new Array();
	 		var index = 0;
	 		var text;
	 		var indicaciones_giro = usig.Recorrido.defaults.texts.planBici;

	 		for(i=0;i<plan.length;i++) {
				var item = plan[i];
				if(item.type != undefined){
					if(item.type == 'StartWalking'){
						walking = true;
					}else if(item.type == 'FinishWalking') { 
						walking = false;
					}else if(item.type == 'Street') {
						if (item.indicacion_giro!='0' && item.indicacion_giro!='1' && item.indicacion_giro!='2'){ 
							if (walking){
								text = indicaciones_giro['inicio']['walking'].texto;
							}else{
								text = indicaciones_giro['inicio']['biking'].texto;
							}
							turn_indication = 'seguir';
						}else {
							text = indicaciones_giro[walking?'walking':'biking'][item.indicacion_giro].texto;								
							turn_indication = indicaciones_giro[walking?'walking':'biking'][item.indicacion_giro].turn_indication;							
						}
						if (item.tipo=='Ciclovía'){
							text=text.replace('$via',indicaciones_giro['ciclovia'].texto);
						}else if (item.tipo == 'Carril preferencial'){
							text=text.replace('$via',indicaciones_giro['carril'].texto);
						}else{
							text=text.replace('$via','');
						}
						if(item.to==0 || item.from ==0|| item.to==null || item.from ==null){
							text=text.replace('$metros', item.distance +' m ');
						} else {
							text=text.replace('$metros', '');
						}
						//text=text.replace('$calle', item.name);
						if(item.from){
							text=text.replace('$desde',item.from);
						} else {
							text=text.replace('$desde','');							
						}
						if(item.to){
							text+= indicaciones_giro['hasta'].texto.replace('$hasta', item.to);
						}
						text=text.replace(/\$calle/g, item.name);
						modo=walking?'walk':'bike';
						
						actions.push({text:text, turn_indication:turn_indication, modo: modo, index:index, distance:item.distance,type:'bike', id:item.id});
						
					// end Street	
					}  
					
				}
			}
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
			data=$.extend({}, datos);
			data.options = opts;
			procesarResumen();
			cargarPlan(datos);
		} catch(e) {
			usig.debug(e);
		}
	}
	
	function cargarPlan(datos, callback) {
		if (!plan && datos.plan) {
			plan = datos.plan;
			data.plan = datos.plan;
			// data = $.extend({}, data, datos);
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
		return descripcionHtml; //v3
	};
	
	/**
	 * Devuelve el tiempo estimado del recorrido
	 * @return {Float} Tiempo estimado del recorrido en minutos
	 */
	this.getTime = function() {
		return tiempo;
	};
	
	/**
	 * Devuelve la distancia total del recorrido.
	 * @return {Float} Distancia total del recorrido en metros.
	 */
	this.getTraveledDistance = function() {
		return traveled_distance;
	};
	
	/**
	 * Devuelve el tiempo total del recorrido formateado como cadena
	 * @return {String} Tiempo total del recorrido formateado
	 */
	this.getTimeString = function() {
		time = '';
		//Mas de 60 mins
		if(tiempo > 60) {
			hs = Math.floor(tiempo / 60);
			mins = tiempo % 60;
			time += hs + (hs >1 ? 'hs ' : 'h ') + mins + ' \''; 
		} else {
			time += tiempo + ' \'';
		}
		return time;
	};
	
	/**
	 * Devuelve la distancia total del recorrido formateada como cadena
	 * @return {String} Distancia total del recorrido formateada
	 */
	this.getDistanceString = function() {
		distance = '';
		//1 Km
		if(traveled_distance > 999) {
			distance += ((traveled_distance/1000).toFixed(2) + ' Km').replace('.',','); 
		} else {
			distance += traveled_distance + ' m' ;
		}
		return distance;
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
	 * Devuelve la coordenada origen del recorrido
	 * @return {String} Origen del recorrido
	 */
	this.getCoordenadaOrigen = function() {
		return origen;
	};
	
	/**
	 * Devuelve la coordenada destino del recorrido
	 * @return {String} Destino del recorrido
	 */
	this.getCoordenadaDestino = function() {
		return destino;
	}
	
	/**
	 * Devuelve una version JSON-serializable del objeto
	 * @return {Object} Objeto conteniendo los datos necesarios para representar el recorrido
	 */
	this.toJson = function() {
		return data;
	}
	
	/**
	 * Permite comparar este recorrido con otro para determinar si son el mismo
	 * @param {usig.Recorrido} r Recorrido a comparar
	 * @return {Boolean} Verdadero si el recorrido especificado es igual a este
	 */
	this.isEqual = function(r) {
		return tipo == r.getTipo() && descripcion == r.toString() &&
				origen == r.getCoordenadaOrigen() && destino == r.getCoordenadaDestino();
	}
	
	this.setLanguage = function(lang) {
		usig.Recorrido.defaults.texts = usig.Recorrido.texts[lang];
	}
	
	this.setLanguage(opts.lang||'es');
	
	if (datos) loadData(datos);
};
//Fin jQuery noConflict support
})(jQuery);

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
		recorrido_auto: 'http://mapa.buenosaires.gob.ar/images/recorrido_auto20x20.png',
		recorrido_bici: 'http://servicios.usig.buenosaires.gob.ar/usig-js/dev/images/recorrido_bici20x20.png' 	
	},
	template: new usig.TripTemplate(1,'#8F58C7'),
};

}