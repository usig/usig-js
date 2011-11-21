// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class MapaInteractivo
 * Esta clase implementa un mapa interactivo de Buenos Aires embebible en cualquier pagina web.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 2.1+, usig.util 2.1+, OpenLayers
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.MapaInteractivo.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;servicios.usig.buenosaires.gov.ar/usig-js/2.1/usig.MapaInteractivo.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.MapaInteractivo('id-div-mapa', {
 *              onReady: function() {
 *              	...
 *              }
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/demos/mapaInteractivo.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/demo/mapaInteractivo.html</a><br/>
 * Ejemplos: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/ejemplos/">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/ejemplos/</a><br/>
 * Descargar ejemplos: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/ejemplos.rar">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/ejemplos.rar</a><br/>
 * Documentaci&oacute;n: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/doc/">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/doc/</a><br/>
 * @namespace usig
 * @cfg {Boolean} includeToolbar Incluir el toolbar en el mapa (por default es True)  
 * @cfg {Boolean} includePanZoomBar Incluir el pan-zoom-bar en el mapa (por default es True)  
 * @cfg {Function} onReady Callback que es llamada cuando el componente finalizo de cargar
 * @cfg {Function} onMapClick Callback que es llamada cuando se hace click sobre el mapa  
 * @constructor 
  * @param {String} idDiv Identificador del div en el que construir el mapa
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.MapaInteractivo = function(idDiv, options) {
	var opts = $.extend({}, usig.MapaInteractivo.defaults, options),
		$div = $('#'+idDiv),
		mapWidth = parseInt($div.css('width')),
		mapHeight = parseInt($div.css('height')),
		markersMap = {},
		paraNormalizar = {},
		paraGeocodificar = {},		
		geoCoder = null,
		cargandoNormalizador = false,
		cargandoGeoCoder = false,
		myself = this,
		$indicatorImage = null,
		preloadedImages = [],
		$divIndicator = $('<div class="indicator" style="-moz-border-radius-topleft: 10px; -webkit-border-top-left-radius: 10px; -moz-border-radius-topright: 10px; -webkit-border-top-right-radius: 10px; -moz-border-radius-bottomleft: 10px; -webkit-border-bottom-left-radius: 10px; -moz-border-radius-bottomright: 10px; -webkit-border-bottom-right-radius: 10px;"></div>'),
		map = navBar = panZoomBar = scalebar = overviewMap = statusBar = markersShadows = myMarkers = null;

	function init() {
		$divIndicator.remove();
		opts.OpenLayersOptions.maxExtent = new OpenLayers.Bounds(opts.bounds[0], opts.bounds[1], opts.bounds[2], opts.bounds[3]);
		opts.OpenLayersOptions.initBounds = new OpenLayers.Bounds(opts.initBounds[0], opts.initBounds[1], opts.initBounds[2], opts.initBounds[3]);
	    map = new OpenLayers.Map(idDiv, opts.OpenLayersOptions);
	    /**
	     * API de OpenLayers para manipular el mapa. Ver documentacion disponible en http://docs.openlayers.org/
	     */
	    this.api = map;

	    this.api.zoomToMaxExtent = function(options) {
	    	this.zoomToExtent(opts.OpenLayersOptions.initBounds);
	    }
	    
    	opts.baseLayer = opts.initLocation?'mapabsas_'+opts.initLocation.map:opts.baseLayer;
		this.setBaseLayer(opts.baseLayer);
		
		map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		if (opts.initLocation) {
			map.moveTo(new OpenLayers.LonLat(opts.initLocation.lon,opts.initLocation.lat), opts.initLocation.zl);
		} else {
			map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		}
		
		//Control de escala
		scalebar = new OpenLayers.Control.ScaleBar({
	            // div: document.getElementById("scalebar"),
	            minWidth: 141,
	            maxWidth: 142
	           });
	    map.addControl(scalebar);
	 	
	    if (opts.includePanZoomBar) {
			panZoomBar = new OpenLayers.Control.PanZoomBar({
			      panner: true, 
			      zoomWorldIcon:true, 
			      textAcercar: opts.texts.panZoomBar.textAcercar,
			      textAlejar: opts.texts.panZoomBar.textAlejar,
			      verMapaCompleto: opts.texts.panZoomBar.verMapaCompleto
			  });
			  
			map.addControl(panZoomBar);
	    
		    overviewMap = new OpenLayers.Control.OverviewMap({
			    layers: [new OpenLayers.Layer.WMS("Referencia",getLayerURLs('referencia'), {layers: opts.overviewOptions.layer})],			
			    size: new OpenLayers.Size(opts.overviewOptions.size[0], opts.overviewOptions.size[1]),
			    minRatio: 12, 
			    maxRatio: 24,
		       	mapOptions: {
	        		projection: opts.OpenLayersOptions.projection, 
	        		units: opts.OpenLayersOptions.units, 
	        		maxExtent: opts.OpenLayersOptions.maxExtent, 
		       		resolutions: opts.overviewOptions.resolutions
		       	}});
		       	
		    map.addControl(overviewMap);	
	    }
		
	    if (opts.includeToolbar) {
		    navBar = new OpenLayers.Control.NavToolbar($.extend({}, opts.texts.navBar, {
		    	mapList: opts.mapList,
		    	activeMap: opts.baseLayer,
		    	mapSelectorText: opts.texts.mapSelectorDefault,
		    	mapSelectorTrigger: (function(map) {
		    		if (map != 'none') {
		    			this.setBaseLayer(map);
		    		} else {
		    			this.setBaseLayer(opts.baseLayer);
		    		}
		    	}).createDelegate(this),
		    	clickHandler: opts.onMapClick,
		    	handleRightClicks: true,
		    	rightClickHandler: opts.onMapClick
		    }));
		    
		    map.addControl(navBar); // Si ponemos el navBar no hace falta el Navigation
	    } else {
		 	map.addControl(new OpenLayers.Control.Navigation()); 	    	
	    }
	    
	    statusBar = new OpenLayers.Control.StatusBar();
	    map.addControl(statusBar);
	    
		//Direcciones
        markersShadows = new OpenLayers.Layer.Vector(
                "MarkersShadows", 
                {
                    styleMap: new OpenLayers.StyleMap({
                        // Set the external graphic and background graphic images.
                        externalGraphic: opts.rootUrl+"images/blank.gif", // marcador.png",
                        backgroundGraphic: opts.rootUrl+"images/pincho_inclinado_shadow.png",
                        
                        // Makes sure the background graphic is placed correctly relative
                        // to the external graphic.
                        graphicWidth: 33,
                        graphicHeight: 10,
                        graphicXOffset: -2,
                        graphicYOffset: -29,
                        backgroundXOffset: 1,
                        backgroundYOffset: -11,
                        
                        // Set the z-indexes of both graphics to make sure the background
                        // graphics stay in the background (shadows on top of markers looks
                        // odd; let's not do that).
                        graphicZIndex: opts.MARKER_Z_INDEX,
                        backgroundGraphicZIndex: opts.SHADOW_Z_INDEX,
                        
                        pointRadius: 10
                    }),
                    rendererOptions: {yOrdering: true}
                }
        );
        
		myMarkers = new OpenLayers.Layer.Markers("MyMarkers");

		map.addLayer(markersShadows);
		map.addLayer(myMarkers);
	    
		if (typeof(opts.onReady) == "function") {
			opts.onReady(this);
		}
	};
	
	function preloadImages() {
		var urlPrefix = usig.MapaInteractivo.defaults.OpenLayersJS.replace('OpenLayers.js', '');
		$.each(opts.preloadImages, function(i, url) {
			preloadedImages.push($('<img src="'+urlPrefix+url+'"/>'));
		});
	}
	
	function getLayerURLs(layerName) {
		var urls = new Array();
		$.each(opts.servers,function(i,server) {
			urls.push(server + layerName);
		});

		return urls;
	}
	
	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
	}
	
	this.updateSize = function(){
		map.updateSize.defer(200, map);
	}
	
	this.getMarkers =function(){
		return myMarkers;
	}
	
	this.setBaseLayer = function(layerName) {
		var currentLayer = map.baseLayer;
		if(currentLayer == undefined) {
			var layerUrls = getLayerURLs(layerName) ;
			map.addLayer(new OpenLayers.Layer.WMS(layerName, layerUrls , {layers: layerName, format: 'image/png'}, {transitionEffect: "resize", buffer: 0}));
		} else {
			if(currentLayer.name != layerName) {
				var layerUrls = getLayerURLs(layerName) ;
				try {
					map.removeLayer(currentLayer);
				} catch(e) {}
				map.addLayer(new OpenLayers.Layer.WMS(layerName, layerUrls, {layers: layerName, format: 'image/png'}, {transitionEffect: "resize", buffer: 0}));					
				//zoomToInitialBounds();
			}
		}
		if (navBar)
			navBar.selectMap(layerName);
	}
	
	function getMarkerFromPlace(place) {
		if (place instanceof OpenLayers.Marker) {
			return place;

		}
		
		var size = new OpenLayers.Size(20, 36),
			offset = new OpenLayers.Pixel(-5, -size.h),
			icon = new OpenLayers.Icon(opts.rootUrl+'images/pincho_inclinado.png', size, offset),
			pt = null;
		
		if (place.options) {
			size = new OpenLayers.Size(place.options.iconWidth, place.options.iconHeight);
			//offset = new OpenLayers.Pixel(-5, -size.h),
			icon = new OpenLayers.Icon(place.options.iconUrl, size);
			//pt = new OpenLayers.LonLat(place.getCoordenadas().x, place.getCoordenadas().y);
		}
		
		if (place.x != undefined && place.y != undefined) {
			pt = new OpenLayers.LonLat(place.x,place.y);
		}
		
		if (usig.Direccion && place instanceof usig.Direccion) {
			pt = new OpenLayers.LonLat(place.getCoordenadas().x, place.getCoordenadas().y);
		}
		
		if (usig.inventario && usig.inventario.Objeto && place instanceof usig.inventario.Objeto) {
			pt = new OpenLayers.LonLat(place.ubicacion.getCentroide().x, place.ubicacion.getCentroide().y);			
		}
		// le agregamos una clase Marker para cambiar el puntero del mouse en el over
		icon.imageDiv.className = 'Marker';  
		return new OpenLayers.Marker(pt, icon);
	}
	
	function cargarNormalizadorDirecciones() {
		if (usig.NormalizadorDirecciones) {
			if (opts.debug) usig.debug('Normalizador de direcciones cargado.');
			cargandoNormalizador = false;
			if (usig.NormalizadorDirecciones.listo()) {
				if (opts.debug) usig.debug('Normalizador listo.');
				procesarColaNormalizacion();
			} else {
				if (opts.debug) usig.debug('Inicializando Normalizador...');
				usig.NormalizadorDirecciones.init({onReady: cargarNormalizadorDirecciones.createDelegate(this), loadFullDatabase: true });
			}
		} else if (!cargandoNormalizador) {
			cargandoNormalizador = true;
			if (opts.debug) usig.debug('Cargando normalizador de direcciones...');
			usig.loadJs(opts.NormalizadorDireccionesJS, cargarNormalizadorDirecciones.createDelegate(this));			
		}		
	}
	
	function procesarColaNormalizacion() {
		var numPendientes = 0;
		if (usig.NormalizadorDirecciones && usig.NormalizadorDirecciones.listo()) {
			if (opts.debug) usig.debug('Procesando cola paraNormalizar...');
			$.each(paraNormalizar, function(id, params) {
				try {
					var mStrDir = params.place;
					
					var res = usig.NormalizadorDirecciones.normalizar(mStrDir, 10);
					
					if (res.length > 0) {
						params.place = res[0];						
						paraGeocodificar[id] = { place: params.place, goTo: params.goTo, onClick: params.onClick, options: params.options };
						numPendientes++;
					}
				} catch(e) {
					if (opts.debug) usig.debug(e);
				}
				delete paraNormalizar[id];
			});
			if (numPendientes > 0)
				procesarColaGeocodificacion();
		} else {
			cargarNormalizadorDirecciones();
		}
	}
	
	function procesarColaGeocodificacion() {
		if (geoCoder) {
			if (opts.debug) usig.debug('Procesando cola paraGeocodificar...');
			$.each(paraGeocodificar, function(id, params) {
				var mStrDir = params.place;
				
				geoCoder.geoCodificarDireccion(mStrDir, function(pt) { 
					params.place.setCoordenadas(pt); 
					_addMarker(params.place, id, params.goTo, params.onClick, params.options); 
				});
				delete paraGeocodificar[id];
			});
		} else {
			cargarGeoCoder();
		}
	}
	
	function cargarGeoCoder() {
		if (usig.GeoCoder) {
			if (opts.debug) usig.debug('GeoCoder cargado.');
			cargandoGeoCoder = false;
			geoCoder = new usig.GeoCoder();
			procesarColaGeocodificacion();
		} else if (!cargandoGeoCoder){
			cargandoGeoCoder = true;
			if (opts.debug) usig.debug('Cargando geocoder...');
			usig.loadJs(opts.GeoCoderJS, cargarGeoCoder.createDelegate(this));			
		}		
	}
	
	function _goTo(point, zoomIn) {
		if (zoomIn) {
			if (map.getZoom() == opts.goToZoomLevel) {
				map.panTo(new OpenLayers.LonLat(point.lon,point.lat));
			} else {
				map.moveTo(new OpenLayers.LonLat(point.lon,point.lat), opts.goToZoomLevel);
			}
		} else {
			map.panTo(new OpenLayers.LonLat(point.lon,point.lat));				
		}		
	}
	
	function _addMarker(place, id, goTo, onClick, options) {
		var defaults = {
				iconUrl: opts.rootUrl+'images/pincho_inclinado.png',
				iconWidth: 20,
				iconHeight: 36,
				offsetX: -5,
				offsetY: -36
		}
		// fijarse si el marker ya existe...
		statusBar.activate(opts.texts.processing, true);
		
		if (options) {
			place.options = $.extend({}, defaults, options);
		} else {
			if (typeof(onClick) == "object") {
				place.options = $.extend({}, defaults, onClick);
			}
		}
		
		var marker = getMarkerFromPlace(place);
		// muestra el place por default
		var contentHTML = place;
		
		if (onClick && typeof(onClick) != "function"  && typeof(onClick) != "object") {
			contentHTML = onClick;
		}	
		
		marker.place = place;
		markersMap[''+id] = marker;
		myMarkers.addMarker(marker);
		
		if (!(place instanceof OpenLayers.Marker) && (typeof(options) != "object") && typeof(onClick) != "object") {
	    	var markerShadow = new OpenLayers.Feature.Vector(
	            new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat)	            
	        );
			marker.shadow = markerShadow;
			markersShadows.addFeatures(markerShadow);
		}
		
		marker.events.registerPriority('click', marker, function(ev) {
			OpenLayers.Event.stop(ev, false);
			var framedCloud = new OpenLayers.Popup.FramedCloud(
					id,
					marker.lonlat,
	                new OpenLayers.Size(10, 10),
	                contentHTML,
	                marker.icon,
					true,
					null);
			
			marker.popup = framedCloud;
			framedCloud.hide();
			map.addPopup(framedCloud, true);	
			
			if (typeof(onClick) == "function") {
				onClick(ev, place, framedCloud);
			} else {
				framedCloud.show();
			}
		});
		
		statusBar.deactivate();
		
		if(goTo) {
			_goTo(marker.lonlat, true);
		}
		return id;
	}
	
	function generarGMLTripPlan(recorrido) {
		var trip_plan = recorrido.getPlan();
		var gml = new usig.GMLPlan('trip_plan_' + recorrido.getId());
 		
		for(i=0;i<trip_plan.plan.length;i++) {
		
			var item = trip_plan.plan[i];
			
			if(item.type != undefined){
				
				if(item.type == 'StartWalking' || item.type == 'FinishWalking'){
					gml.addMarker(item.gml);					
				} else if(item.type == 'Board') {
				
					if (item.service_type == '1'){
						switch (item.service){
							case 'Línea A': item.gml = item.gml.replace('subway','subwayA');break;
							case 'Línea B': item.gml = item.gml.replace('subway','subwayB');break;
							case 'Línea C': item.gml = item.gml.replace('subway','subwayC');break;
							case 'Línea D': item.gml = item.gml.replace('subway','subwayD');break;
							case 'Línea E': item.gml = item.gml.replace('subway','subwayE');break;
							case 'Línea H': item.gml = item.gml.replace('subway','subwayH');break;
						}
					}
					gml.addMarker(item.gml);
					
				} else if (item.type == 'Bus' || item.type == 'SubWay' || item.type == 'Street') {
					gml.addEdges([item.gml]);
				} else if(item.type == 'SubWayConnection') {
					
					switch (item.service_to){
							case 'Línea A': item.gml[1] = item.gml[1].replace('connection','subwayA');break;
							case 'Línea B': item.gml[1] = item.gml[1].replace('connection','subwayB');break;
							case 'Línea C': item.gml[1] = item.gml[1].replace('connection','subwayC');break;
							case 'Línea D': item.gml[1] = item.gml[1].replace('connection','subwayD');break;
							case 'Línea E': item.gml[1] = item.gml[1].replace('connection','subwayE');break;
							case 'Línea H': item.gml[1] = item.gml[1].replace('connection','subwayH');break;
						}
					gml.addMarker(item.gml[1]); // en el caso de SubWayConnection el gml es un array de 3 elementos: punto inicial, punto final, linea que los une. Nos quedamos con el punto final
					gml.addEdges(item.gml);
										
				}
				
			}
		}
		
		recorrido.gmlLayer = gml;
		
		return gml;		
	}
	
	function _mostrarRecorrido(recorrido) {
		var layers = map.getLayersByName(recorrido.gmlLayer.name);
		
		if(layers.length > 0) {
			for(l = 0; l < layers.length; l++) {
				layers[l].setVisibility(true);
			}
		} else {
			var layer = recorrido.gmlLayer;
			map.addLayer(layer);
		}

		map.zoomToExtent(recorrido.gmlLayer.getDataExtent());
	}
	
	/**
	 * Agrega un marcador en el mapa y agrega un tooltip con un contenido en html opcional. 
	 * 
	 * Ejemplos:
	 * <pre><code>
...
	var markerId = mapa.addMarker(new usig.Punto(102224.9040681,103284.11371559), true, "Texto de prueba");
	
	o 
	
	var markerId = mapa.addMarker('peru 1234', true, "Texto de prueba");

...
	</code></pre>
	 * Tambi&eacute;n es posible personalizar el &iacute;cono del marcador.
	 * Existen dos formas de agregar un contenido al popup. 
	 * La primera consiste en pasar un string como par&aacute;metro en lugar del onClick.
	 * Ejemplo (va adentro de la funci&oacute;n onReady):
	 * <pre><code>
...
	var iconUrl = 'http://servicios.usig.buenosaires.gov.ar/symbols/mapabsas/bancos.png',
		iconSize = new OpenLayers.Size(41, 41),
		customMarker = new OpenLayers.Marker(new OpenLayers.LonLat(102224.9040681,103284.11371559),new OpenLayers.Icon(iconUrl, iconSize));
	
	var contentHTML = "Contenido de ejemplo en html";
	var markerId = mapa.addMarker(customMarker, true, contentHTML);
...
	</code></pre>
	 * 
	 * La segunda consiste en generar el contenido html dentro de la funci&oacute;n onClick y luego mostrar el tooltip.
	 * Segundo ejemplo:
	 * <pre><code>
...
	var iconUrl = 'http://servicios.usig.buenosaires.gov.ar/symbols/mapabsas/bancos.png',
		iconSize = new OpenLayers.Size(41, 41),
		customMarker = new OpenLayers.Marker(new OpenLayers.LonLat(102224.9040681,103284.11371559),new OpenLayers.Icon(iconUrl, iconSize));
	
	var markerId = mapa.addMarker(customMarker, true, function(ev, place, popup) {
		popup.setContentHTML("Ac&aacute; va el contenido html");
		popup.show();
	});
...
	</code></pre>
	 *
	 * Esta funci&oacute;n permite adem&aacute;s pasar una direcci&oacute;n v&aacute;lida en el primer par&aacute;metro y, al mismo tiempo, personalizar el &iacute;cono:
	 * 
	 * <pre><code>
...
	 var markerId = miMapa.addMarker(
		'peru 652', 
		true, 
		'Texto popup',
		{
		  iconUrl: 'http://servicios.usig.buenosaires.gov.ar/symbols/mapabsas/bancos.png',
		  iconWidth: 41,
		  iconHeight: 41,
		  offsetX: 5,
		  offsetY: 5
		}
	);
...
	</code></pre>
	 *
	 * @param {OpenLayers.Marker/usig.Direccion/usig.inventario.Objeto/usig.DireccionMapabsas/usig.Punto/String} place Lugar que se desea marcar. Es posible indicar un string conteniendo una direccion valida
	 * @param {Boolean} goTo Indica si se desea hacer zoom sobre el lugar agregado
	 * @param {Function/String} onClick (optional) Callback que se llama cuando el usuario hace click sobre el marcador o bien acepta un contenido html para el tooltip
	 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles (iconUrl, iconWidth, iconHeight, offsetX, offsetY)
	 * @return {Integer} Id del marcador agregado
	 */
	this.addMarker = function(place, goTo, onClick, options) {
		var random = Math.floor(Math.random()*100001);
		var id = new Date()*1 +random;
		
		if (typeof(place) == "string") {
			if (opts.debug) usig.debug('Encolando direccion: '+place+' ...');
			paraNormalizar[id] = { place: place, goTo: goTo, onClick: onClick, options: options } ;
			procesarColaNormalizacion();			
			return id;
		}
		return _addMarker(place, id, goTo, onClick, options);

	}
	
	

	/**
	 * Borra un marcador del mapa
	 * @param {Integer} id Id del marcador que se desea eliminar obtenido mediante addMarker
	 */
	this.removeMarker = function(id)	{
		marker = markersMap[''+id];
		if (marker.popup) {
			map.removePopup(marker.popup);
			marker.popup.destroy();
		}
		myMarkers.removeMarker(marker);
		if (marker.shadow)
			markersShadows.removeFeatures(marker.shadow);
		marker.destroy();
		marker = undefined;
		markersMap[id] = undefined;
	}
	
	/**
	 * Permite prender/apagar un marcador sobre el mapa
	 * @param {Integer} id Id del marcador
	 * @param {Boolean} display True para prender el marcador y False para apagarlo
	 */
	this.toggleMarker = function(id, display) {
		markersMap[''+id].display(display);
		if (markersMap[''+id].shadow) {
			if (!display)
				markersShadows.removeFeatures(markersMap[''+id].shadow);
			else
				markersShadows.addFeatures(markersMap[''+id].shadow);
		}
	}
	
	/**
	 * Permite moverse/hacer zoom sobre un punto determinado del mapa
	 * @param {OpenLayers.LonLat/usig.Punto} point Coordenadas de la posicion sobre la que 
	 * se desea centrar el mapa
	 * @param {Boolean} zoomIn Indica si se desea hacer zoom sobre la coordenada elegida
	 */
	this.goTo = function(point, zoomIn) {
		_goTo(point, zoomIn);
	}

	this.showStatus = function(text, showIndicator) {
		statusBar.activate(text, showIndicator);
	}
		
	this.hideStatus = function() {
		statusBar.deactivate();
	}
	
	this.raiseMarkers =function(index){
		map.raiseLayer(myMarkers, index);
	}
	
	this.getMarkersIndex =function(){
		return map.getLayerIndex(myMarkers);
	}
	this.getMarkersZIndex =function(){
		return myMarkers.getZIndex();
	}
	
	/**
	 * Muestra un recorrido en el mapa
	 * @param {usig.Recorrido} recorrido Recorrido a motrar
	 */
	this.mostrarRecorrido = function(recorrido) {
		if (!recorrido.gmlLayer) {
			recorrido.getPlan(function() {
				
				generarGMLTripPlan(recorrido);
				_mostrarRecorrido(recorrido);
			});
		} else {		
			_mostrarRecorrido(recorrido);
		}
	}
		
		
	if (typeof(OpenLayers) == "undefined") {
		$indicatorImage = $('<img src="'+opts.rootUrl+'images/animated_indicator_medium.gif" alt="'+opts.texts.loading+'"/>');
		$indicatorImage.css('padding', '10px');
		$divIndicator.css('background-color', '#fff')
			.css('width', '52px')
			.css('height', '52px')
			.css('border', '1px solid #ddd')
			.css('position', 'relative')
			.css('left', (mapWidth/2-26)+'px')
			.css('top', (mapHeight/2-26)+'px')
			.append($indicatorImage);
			
		$div.css('background-color', '#eee')
			.append($divIndicator);
		
		usig.loadCss(opts.OpenLayersCSS);
		usig.loadJs(opts.OpenLayersJS, init.createDelegate(this));
		(function() {
			if (typeof(OpenLayers) == "undefined")
				preloadImages();
		}).defer(500, this);
	} else {
		init.defer(200,this);
	}
	
};

usig.MapaInteractivo.defaults = {
	debug: false,
	includePanZoomBar: true,
	includeToolbar: true,
	bounds: [54340,54090,172855,140146],
	initBounds: [93500,96750,112000,106750],
	OpenLayersOptions: {
		controls: [],
		resolutions: [90,50,30,15,7.5,4,2,1,0.5,0.2],
		projection: "EPSG:221951",
		units: 'm'
	},
	
	baseLayer:'mapabsas_default',
	rootUrl: 'http://servicios.usig.buenosaires.gov.ar/usig-js/dev/',	
	OpenLayersCSS: 'http://servicios.usig.buenosaires.gov.ar/OpenLayers/2.9.1-4/theme/default/style.css',
	OpenLayersJS: 'http://servicios.usig.buenosaires.gov.ar/OpenLayers/2.9.1-4/OpenLayers.js',
	NormalizadorDireccionesJS: 'http://servicios.usig.buenosaires.gob.ar/nd-js/1.1/normalizadorDirecciones.min.js',
	GeoCoderJS: 'http://servicios.usig.buenosaires.gob.ar/usig-js/2.1/usig.GeoCoder.min.js',
	GMLPlanJS: 'usig.GMLPlan.js',
	preloadImages: ['img/panZoomBar/arriba.png', 'img/panZoomBar/izquierda.png', 'img/panZoomBar/abajo.png', 'img/panZoomBar/derecha.png', 'img/panZoomBar/centro.png', 'img/panZoomBar/bt_zoomin.gif', 'img/panZoomBar/bt_zoomout.gif', 'img/panZoomBar/bt_zoomworld.gif', 'img/panZoomBar/marcador_azul.gif', 'img/panZoomBar/zoomBar.png'],
	overviewOptions: {
		layer:'referencia',
		resolutions: [130,70,30,15,7.5,4],
		size: [195, 130]
	},
	mapList: [
       	   {
	       	name:'mapabsas_imagen_satelital_2009',
	       	display:'Vista Satelital 2009',
	       	desc: 'Mapa que incluye imagen satelital QuickBird, año de toma 2009. El mapa presenta la imagen satelital de alta resolución de la Ciudad de Buenos Aires con calles y alturas.'
	       },
	       {
	       	name:'mapabsas_imagen_satelital_2004',
	       	display:'Vista Satelital 2004',
	       	desc: 'Mapa que incluye imagen satelital QuickBird, año de toma 2004. El mapa presenta la imagen satelital de alta resolución de la Ciudad de Buenos Aires con calles y alturas.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1978',
	       	display:'Vista Aérea 1978',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotografías aéreas tomadas en el año 1978. El mapa presenta también la información de calles y alturas actuales como referencia.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1965',
	       	display:'Vista Aérea 1965',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotografías aéreas tomadas en el año 1965. El mapa presenta también la información de calles y alturas actuales como referencia.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1940',
	       	display:'Vista Aérea 1940',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotografías aéreas tomadas en el año 1940. El mapa presenta también la información de calles y alturas actuales como referencia.'
	       }
		],
	texts: {
		processing: 'Procesando...',
		loading: 'Cargando...',
		tituloMailing: 'Enviar vista actual por e-mail',
		mapSelectorDefault: 'Mapa',
		panZoomBar:{
	      textAcercar: 'Acercar',
	      textAlejar: 'Alejar',
	      verMapaCompleto: 'Ver el mapa completo'
		},
		overviewMap:{
		    textMapaReferencia: 'Mapa de referencia interactivo',
		    textCerrar: 'Cerrar'	
		},
		navBar: {
			navigationText: 'Mover', 
			zoomBoxText: 'Acercar', 
			measureToolTexts: {
		    	buttonLabel: 'Medir',
		    	measure: 'Medida',
		    	measureDistance: 'Medir Distancia',
		    	measureArea: 'Medir Área'
		    }
		}
	},
	goToZoomLevel: 7,
    SHADOW_Z_INDEX: 10,
    MARKER_Z_INDEX: 11,
	servers: ["http://tiles1.mapa.buenosaires.gob.ar/tilecache/", "http://tiles2.mapa.buenosaires.gob.ar/tilecache/", "http://tiles3.mapa.buenosaires.gob.ar/tilecache/", "http://tiles4.mapa.buenosaires.gob.ar/tilecache/", "http://tiles5.mapa.buenosaires.gob.ar/tilecache/", "http://tiles6.mapa.buenosaires.gob.ar/tilecache/", "http://tiles7.mapa.buenosaires.gob.ar/tilecache/"]
};
