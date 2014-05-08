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
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.MapaInteractivo.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;servicios.usig.buenosaires.gov.ar/usig-js/3.0/usig.MapaInteractivo.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.MapaInteractivo('id-div-mapa', {
 *              onReady: function() {
 *              	...
 *              }
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/demos/mapaInteractivo.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/demo/mapaInteractivo.html</a><br/>
 * Ejemplos: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/ejemplos/">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/ejemplos/</a><br/>
 * Descargar ejemplos: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/ejemplos.rar">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/ejemplos.rar</a><br/>
 * Documentaci&oacute;n: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/doc/">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/doc/</a><br/>
 * @namespace usig
 * @cfg {Boolean} includeToolbar Incluir el toolbar en el mapa (por default es True)  
 * @cfg {Boolean} includePanZoomBar Incluir el pan-zoom-bar en el mapa (por default es True)  
 * @cfg {Function} onReady Callback que es llamada cuando el componente finalizo de cargar
 * @cfg {Function} onMapClick Callback que es llamada cuando se hace click sobre el mapa  
 * @constructor 
 * @param {String} idDiv Identificador del div en el que construir el mapa
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.MapaInteractivo = (function($) { // Soporte jQuery noConflict
return function(idDiv, options) {
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
		vectorLayers = [],
		wmsLayers = [],
		$divIndicator = $('<div class="indicator" style="-moz-border-radius: 10px; -webkit-border-radius: 10px; border-radius: 10px;"></div>'),
		map = null, navBar = null, panZoomBar = null, 
		scalebar = null, overviewMap = null, statusBar = null, 
		myMarkers = null, selectControl = null, highlightControl = null, Popup = null;

	function init() {
		$divIndicator.remove();
		opts.OpenLayersOptions.maxExtent = new OpenLayers.Bounds(opts.bounds[0], opts.bounds[1], opts.bounds[2], opts.bounds[3]);
		opts.OpenLayersOptions.initBounds = new OpenLayers.Bounds(opts.initBounds[0], opts.initBounds[1], opts.initBounds[2], opts.initBounds[3]);
	    map = new OpenLayers.Map(idDiv, opts.OpenLayersOptions);
	    
	    $('div.olMapViewport', $div).append($divIndicator);
	    
	    /**
	     * API de OpenLayers para manipular el mapa. Ver documentacion disponible en http://docs.openlayers.org/
	     */
	    this.api = map;

	    this.api.zoomToMaxExtent = function(options) {
	    	this.zoomToExtent(opts.OpenLayersOptions.initBounds);
	    }
	    
    	//opts.baseLayer = opts.initLocation?'mapabsas_'+opts.initLocation.map:opts.baseLayer;
	    //this.setBaseLayer(opts.baseLayer);
		
		//Control de escala
		scalebar = new OpenLayers.Control.ScaleBar({
	            minWidth: 141,
	            maxWidth: 142
	           });
	    map.addControl(scalebar);
	 	
	    if (opts.includePanZoomBar) {
			panZoomBar = new OpenLayers.Control.PanZoomBarUSIG({ zoomBar: opts.zoomBar });
			  
			map.addControl(panZoomBar);	    
	    }
		
	    if (opts.includeToolbar) {
	    	var optsNavBar = $.extend({}, opts.texts.navBar, {
		    	clickHandler: opts.onMapClick
		    });
		    if (!opts.zoomBar) {
		    	optsNavBar.top = 90;
		    }
		    navBar = new OpenLayers.Control.NavToolbarUSIG(optsNavBar);
		    
		    map.addControl(navBar); // Si ponemos el navBar no hace falta el Navigation
		    this.toolbar = navBar;
	    } else {
		 	map.addControl(new OpenLayers.Control.Navigation()); 	    	
	    }
	    
	    if (opts.includeMapSwitcher) {
	    	var optsMapSwitcher = $.extend({}, opts.MapSwitcherOptions, {
				onOptionToggle: (function(optionId, toggle) {
		    		if (optionId == 'markers-toggle' && myMarkers) {
		    			this.toggleLayer(myMarkers);
		    		}
				}).createDelegate(this),
				onMapSelection: (function(mapId) {
					this.setBaseLayer(mapId);
				}).createDelegate(this)	    		
	    	}, opts.mapSwitcher);
	    	this.mapSwitcher = new OpenLayers.Control.MapSelector(optsMapSwitcher);
			map.addControl(this.mapSwitcher);	    	
	    }
	    
	    
	    statusBar = new OpenLayers.Control.StatusBar();
	    map.addControl(statusBar);
	     
	    
	    map.addControl(new OpenLayers.Control.MousePosition({formatOutput: function(lonLat) { return ''; }}));
	    
		//Direcciones
        myMarkers = new OpenLayers.Layer.Vector(
                "MyMarkers", 
                {
                    styleMap: new OpenLayers.StyleMap({
                    	'default' : {
	                        // Set the external graphic and background graphic images.
	                        externalGraphic: opts.rootUrl+"images/marker-3.0.png", // marcador.png",
	                        // backgroundGraphic: opts.rootUrl+"images/pincho_inclinado_shadow.png",
	                        
	                        // Makes sure the background graphic is placed correctly relative
	                        // to the external graphic.
	                        graphicWidth: 32,
	                        graphicHeight: 42,
	                        graphicXOffset: -16,
	                        graphicYOffset: -36,

	                        // Set the z-indexes of both graphics to make sure the background
	                        // graphics stay in the background (shadows on top of markers looks
	                        // odd; let's not do that).
	                        graphicZIndex: opts.MARKER_Z_INDEX,
	                        // backgroundGraphicZIndex: opts.SHADOW_Z_INDEX,
	                        
	                        // pointRadius: 7,
	                        cursor: 'pointer'
                    	},
                    	'select': {
	                        graphicWidth: 38,
	                        graphicHeight: 50,
	                        graphicXOffset: -19,
	                        graphicYOffset: -43
                    	}
                    }),
                    rendererOptions: {yOrdering: true}
                }
        );
        
		// myMarkers = new OpenLayers.Layer.Markers("MyMarkers");

		// map.addLayer(markersShadows);
		map.addLayer(myMarkers);
	    
		highlightControl = new OpenLayers.Control.SelectFeature(
            [myMarkers],
            {
				hover: true,
                highlightOnly: true
            }
        );
		
		selectControl = new OpenLayers.Control.SelectFeature(
            [myMarkers],
            {
                clickout: true, toggle: false,
                multiple: false, hover: false,
                toggleKey: "ctrlKey", // ctrl key removes from selection
                multipleKey: "shiftKey" // shift key adds to selection
            }
        );
		
		Popup = OpenLayers.Class(OpenLayers.Popover.Anchored, {
            autoSize: true,
            panMapIfOutOfView: true,
            minSize: new OpenLayers.Size(100, 70),
            maxSize: new OpenLayers.Size(340, 550),
            displayClass: 'popover'
		});
		
        myMarkers.events.on({
            "featureselected": function(e) {
                if (opts.debug) usig.debug("selected feature "+e.feature.id+" on Markers Layer");
        		var marker = markersMap[e.feature.attributes['fid']];
            	var feature=marker.feature;
        		var popup = null;
        		if (marker.place.options.popup) {
        			if (opts.debug) usig.debug("Creating popup for feature "+e.feature.id);
	    			popup = new Popup(
						e.feature.id,
						new OpenLayers.LonLat(e.feature.geometry.x, e.feature.geometry.y),
		                null, //new OpenLayers.Size(10, 10),
		                marker.popupContent,
		                null,
						false,
						function() {
		                	selectControl.unselect(feature);
		                }
	    	        );
	    			e.feature.popup = popup;
	    			popup.hide();
	    			map.addPopup(popup, true);
        		}
    			if (typeof(marker.onClick) == "function") {
    				marker.onClick(e, marker.place, popup, selectControl);
    			} else if (popup) {
                    popup.show();
                    popup.updateSize();
    			}
    			if (!popup)    				
    				selectControl.unselect(feature);
            },
            "featureunselected": function(e) {
                if (opts.debug) usig.debug("unselected feature "+e.feature.id+" on Markers Layer");
                if (e.feature && e.feature.popup) {
	                map.removePopup(e.feature.popup);
	                e.feature.popup.destroy();
	                e.feature.popup = null;
                }
            }
        });
		
	            
        map.addControl(highlightControl);
        map.addControl(selectControl);
        highlightControl.activate();
        selectControl.activate();

	    if (opts.initLocation){
	    	this.loadMap(opts.initLocation.mapConfig);
	    }else{
	    	this.setBaseLayer(opts.baseLayer);
	    }
		
		map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		if (opts.initLocation) {
			map.moveTo(new OpenLayers.LonLat(opts.initLocation.lon,opts.initLocation.lat), opts.initLocation.zl);
		} else {
			map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		}
        
        if (typeof(opts.onReady) == "function") {
			opts.onReady(this);
		}
		
		if (opts.trackVisits) {
			var trackVisits = function(idSite) {
				try {
					var piwikTracker = Piwik.getTracker(opts.piwikBaseUrl + "piwik.php", idSite);
					piwikTracker.trackPageView();
					piwikTracker.enableLinkTracking();
				} catch( err ) {}
			};			
			if (typeof(Piwik) == "undefined") {	
				usig.loadJs(opts.piwikBaseUrl+'piwik.js', trackVisits.createDelegate(this,[opts.piwikSiteId]));
			} else {
				trackVisits(opts.piwikSiteId);
			}
		}
		$divIndicator.hide();
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

	function isOldIE() {
	    var rv = -1; // Return value assumes failure.
	    if (navigator.appName == 'Microsoft Internet Explorer') {
	        var ua = navigator.userAgent;
	        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	        if (re.exec(ua) != null)
	            rv = parseFloat(RegExp.$1);
	    }
	    return rv <= 8.0;
	}

	
	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
	}
	
	this.updateSize = function(){
		(function() {
			map.updateSize();
			$divIndicator.css('left', (parseInt($div.css('width'))/2-26)+'px');
			$divIndicator.css('top', (parseInt($div.css('height'))/2-26)+'px');			
		}).defer(200, this);
	}
	
	this.getMarkers =function(){
		// return myMarkers;
		return markersMap;
	}
	
	this.unselectFeature = function(feature) {
		selectControl.unselect(feature);		
	}
	
	this.selectFeature = function(feature) {
		selectControl.select(feature);		
	}
	
	this.setBaseLayer = function(layerName) {
		var currentLayer = map.baseLayer;
		if(currentLayer == undefined) {
			this.addWMSLayer(layerName, {isBaseLayer: true});
		} else {
			if(currentLayer.name != layerName) {
				try {
					map.removeLayer(currentLayer);
				} catch(e) {}
				this.addWMSLayer(layerName, {isBaseLayer: true});
			}
		}
	}
	
	function getMarkerFromPlace(place) {
		var marker = { style: null, lonlat: null };
		if (place instanceof OpenLayers.Marker) {
			marker = {
				style: {
					externalGraphic: place.icon.url,
                    backgroundGraphic: opts.rootUrl+"images/blank.gif",
                    graphicWidth: place.icon.size.w,
                    graphicHeight: place.icon.size.h,
                    graphicXOffset: place.icon.offset.x,
                    graphicYOffset: place.icon.offset.y					
				},
				lonlat: place.lonlat.clone()
			};
			place.destroy();
			return marker;
		}
		if (place.options && place.options.iconUrl) {
			// size = new OpenLayers.Size(place.options.iconWidth, place.options.iconHeight);
			// icon = new OpenLayers.Icon(place.options.iconUrl, size);
			marker = {
				style: {
					externalGraphic: place.options.iconUrl,
                    backgroundGraphic: place.options.backgroundGraphic || opts.rootUrl+"images/blank.gif",
                    graphicWidth: place.options.iconWidth,
                    graphicHeight: place.options.iconHeight,
                    backgroundWidth: place.options.iconWidth,
                    backgroundHeight: place.options.iconHeight,
                    graphicXOffset: place.options.offsetX,
                    graphicYOffset: place.options.offsetY					
				}					
			};
		}
		
		if (place.x != undefined && place.y != undefined) {
			marker.lonlat = new OpenLayers.LonLat(place.x,place.y);
		}
		
		if (usig.Direccion && place instanceof usig.Direccion) {
			marker.lonlat = new OpenLayers.LonLat(place.getCoordenadas().x, place.getCoordenadas().y);
		}
		
		if (usig.inventario && usig.inventario.Objeto && place instanceof usig.inventario.Objeto) {
			marker.lonlat = new OpenLayers.LonLat(place.ubicacion.getCentroide().x, place.ubicacion.getCentroide().y);
		}
		// le agregamos una clase Marker para cambiar el puntero del mouse en el over
		// icon.imageDiv.className = 'Marker';  
		// return new OpenLayers.Marker(pt, icon);
		return marker;
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
					
					if (res.length > 0 && res[0] instanceof usig.Direccion) {
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
 			instantPopup: false,
 			popup: true
		}
		// fijarse si el marker ya existe...
		statusBar.activate(opts.texts.processing, true);
		
		place.options = $.extend({}, defaults, options);
		if (typeof(onClick) == "object") {
			// Se omitio el parametro onClick y por lo tanto "onClick" es "options"
			place.options = $.extend({}, defaults, onClick);
		}
		
		var marker = getMarkerFromPlace(place);
		if (opts.debug) usig.debug(marker);
		
		// muestra el place por default
		var contentHTML = (place.toString()!="[object Object]" || typeof(place) == "string")?place:'Lon: '+marker.lonlat.lon+', Lat: '+marker.lonlat.lat;
		
		if (onClick && typeof(onClick) != "function"  && typeof(onClick) != "object") {
			contentHTML = onClick;
		}	
		
		marker.place = place;
		marker.feature = new OpenLayers.Feature.Vector(
	            new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat),
	            { fid: id }
	    );
		/*
        marker.feature.closeBox = false;
        marker.feature.popupClass = OpenLayers.Class(OpenLayers.Popup.Anchored, {
            'autoSize': true
        });
        marker.feature.data.popupContentHTML = contentHTML;
        marker.feature.data.overflow = "hidden";
        */
		marker.feature.style = marker.style;
		marker.popupContent = contentHTML;
		marker.onClick = typeof(onClick)=="function"?onClick:null;

		if (opts.debug) usig.debug('addMarker '+id);
		markersMap[''+id] = marker;
		// myMarkers.addMarker(marker);
		myMarkers.addFeatures(marker.feature);
		
		if(goTo) {
			_goTo(marker.lonlat, true);
		}
			
		// Si esta seteada la opcion de instantPopup
		if (place.options && place.options.instantPopup){
			selectControl.select(marker.feature);
		}
		
		statusBar.deactivate();
		
		return id;
	}
	
	function generarGMLTripPlan(recorrido) {
		var trip_plan = recorrido.getPlan();
		if (trip_plan instanceof Array) {
			var gml = usig.GMLPlan.create('trip_plan_' + recorrido.getId(), {template:recorrido.getTemplate(), baseUrl: opts.rootUrl, tipoRecorrido: recorrido.getTipo()});
	 		
			for(i=0;i<trip_plan.length;i++) {
			
				var item = trip_plan[i];
				
				if(item.type != undefined){
					
					if(item.type == 'StartWalking' || item.type == 'FinishWalking'){
						if(i==0){
							gml.addMarker(item.gml.replace('walk','beginwalk'));
						}else{
							gml.addMarker(item.gml);
						}
					} else if(item.type == 'Board') {
					
						if(i==0){
							gml.addMarker(item.gml.replace(/(bus|subway|train)/g,'begin$1'));
						}else{
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
						}
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
											
					} else if(item.type == 'StartDriving' || item.type == 'FinishDriving') { 
						gml.addMarker(item.gml);
					} else if(item.type == 'StartBiking' || item.type == 'FinishBiking') { 
						if(i==0){
							gml.addMarker(item.gml.replace('bike','beginbike'));
						}else{
							gml.addMarker(item.gml);
						}
					}
					
				}
			}
			recorrido.gmlLayer = gml;
			return gml;		
		}		
		return false;
	}
	
	function _mostrarRecorrido(recorrido, zoom) {
		var layers = map.getLayersByName(recorrido.gmlLayer.name);
		
		if(layers.length > 0) {
			for(l = 0; l < layers.length; l++) {
				layers[l].setVisibility(true);
			}
		} else {
			var layer = recorrido.gmlLayer;
			layer.setVisibility(true);
			map.addLayer(layer);
			map.setLayerZIndex(layer, 80); // seteamos un zIndex alto para asegurar que los recorridos queden arriba
		}

		if (zoom) {
			map.zoomToExtent(recorrido.gmlLayer.getDataExtent());
		}
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
	 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles (iconUrl, iconWidth, iconHeight, offsetX, offsetY, popup, instantPopup)
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
		var marker = markersMap[''+id];
		if (marker) {
			try {
				selectControl.unselect(marker.feature);
			} catch(e) {};
			myMarkers.removeFeatures(marker.feature);
		}
		// marker.destroy();
		marker = undefined;
		markersMap[id] = undefined;
		delete markersMap[id];
	}
	
	/**
	 * Permite prender/apagar un marcador sobre el mapa
	 * @param {Integer} id Id del marcador
	 * @param {Boolean} display True para prender el marcador y False para apagarlo
	 */
	this.toggleMarker = function(id, display) {
		var marker = markersMap[''+id];
		if (display) {
			myMarkers.getFeatureById(marker.feature.id).style = marker.style;
		} else {
			myMarkers.getFeatureById(marker.feature.id).style = $.extend({}, marker.style, { display: 'none'});			
		}
		if (opts.debug) usig.debug(myMarkers.getFeatureById(marker.feature.id).style);
		myMarkers.redraw();
	}
	
	/**
	 * Permite moverse/hacer zoom a un marcador sobre el mapa
	 * @param {Integer} id Id del marcador
	 * @param {Boolean} zoomIn Indica si se desea hacer zoom sobre el marcador
	 */
	this.goToMarker = function(id, zoomIn) {
		var marker = markersMap[''+id];
		_goTo(marker.lonlat, zoomIn);
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
	
	/**
	 * Permite mostrar un mensaje de status y un opcionalmente un indicador de carga
	 * @param {String} text Mensaje de status
	 * @param {Boolean} showIndicator Indica si se desea mostrar el indicador de carga
	 */
	this.showStatus = function(text, showIndicator) {
		statusBar.activate(text, showIndicator);
	}
		
	/**
	 * Oculta la barra de status
	 */
	this.hideStatus = function() {
		statusBar.deactivate();
	}
	
	/**
	 * Muestra un indicador de carga general
	 */
	this.showIndicator = function() {
		$divIndicator.show();
	}
	
	/**
	 * Oculta el indicador de carga general
	 */
	this.hideIndicator = function() {
		$divIndicator.hide();
	}
	
	this.raiseMarkers =function(index){
		if(myMarkers) map.raiseLayer(myMarkers, index);
	}
	
	this.getMarkersIndex =function(){
		return map.getLayerIndex(myMarkers);
	}
	
	this.getMarkersZIndex =function(){
		return myMarkers.getZIndex();
	}

	this.getMarker = function(id) {
		return markersMap[''+id];
	}

	/**
	 * Permite obtener una referencia a la capa de marcadores
	 * @return {OpenLayers.Layer.Vector} Capa de marcadores
	 */
	this.getMarkersLayer = function() {
		return myMarkers;
	}

	/**
	 * Permite hacer zoom ajustado a los elementos de la capa de marcadores. (Requiere que haya más de 1 marcador agregado)
	 */
	this.zoomToMarkers = function() {
		if (myMarkers.features.length > 1) {
			map.zoomToExtent(myMarkers.getDataExtent());		
		}
	}
	
	/**
	 * Muestra un recorrido en el mapa
	 * @param {usig.Recorrido} recorrido Recorrido a motrar
	 * @param {Boolean} zoom Hacer zoom al extent del recorrido (por default True)
	 */
	this.mostrarRecorrido = function(recorrido, zoom) {
		var zoomear = (typeof(zoom) == "undefined")?true:zoom; 
		if (!recorrido.gmlLayer) {
			recorrido.getDetalle(function() {				
				if (generarGMLTripPlan(recorrido)) {
					_mostrarRecorrido(recorrido, zoomear);
				}
			});
		} else {		
			_mostrarRecorrido(recorrido, zoomear);
		}
	}
	
	/**
	 * Oculta un recorrido en el mapa
	 * @param {usig.Recorrido} recorrido Recorrido a ocultar
	 */
	this.ocultarRecorrido = function(recorrido) {
		if (recorrido.gmlLayer) {
			recorrido.gmlLayer.setVisibility(false);
		}
	}
	
	this.existeLayer = function (recorrido) {
		if (recorrido.gmlLayer){
			var layers = map.getLayersByName(recorrido.gmlLayer.name);
			return (layers.length > 0);
		}
		return false;
	}

	/**
	 * Borra un recorridio del mapa
	 * @param {usig.Recorrido} recorrido Recorrido a borrar
	 */
	this.borrarRecorrido = function(recorrido) {
		if (recorrido.gmlLayer) {
			map.removeLayer(recorrido.gmlLayer);
		}
	}
	
	/*
	 * Esta funcion construye un OpenLayers.StyleMap a partir de un conjunto de opciones obtenido del merge
	 * de las opciones default para un vector layer y los parametros indicados por el usuario en la llamada
	 * a addVectorLayer. 
	 */
	function buildVectorStyleMap(opts) {
		opts.defaultStyle = $.extend({}, opts.defaultStyle, opts.symbolizer);
		if (!opts.selectStyle) {
			opts.selectStyle = $.extend({}, opts.defaultStyle);
			// El estilo de seleccion por defecto solo escala el icono
			opts.selectStyle.externalGraphic = undefined;
			opts.selectStyle.backgroundGraphic = undefined;
			opts.selectStyle.fillColor = undefined;
			opts.selectStyle.strokeColor = undefined; 
		}
		var sm = new OpenLayers.StyleMap({
			'default': opts.defaultStyle,
			'select': opts.selectStyle
		});
		var rules = new Array();
		$.each(opts.escalas, function(i, escala) {
			if (opts.symbolizer.graphicWidth && opts.symbolizer.graphicHeight) {
				escala.symbolizer.graphicWidth = parseInt(Math.round(opts.symbolizer.graphicWidth * escala.symbolizer.size));
				escala.symbolizer.graphicHeight = parseInt(Math.round(opts.symbolizer.graphicHeight * escala.symbolizer.size));
				if (opts.symbolizer.backgroundWidth && opts.symbolizer.backgroundHeight) {
					escala.symbolizer.backgroundWidth = parseInt(Math.round(opts.symbolizer.backgroundWidth * escala.symbolizer.size));
					escala.symbolizer.backgroundHeight = parseInt(Math.round(opts.symbolizer.backgroundHeight * escala.symbolizer.size));					
				}
			} else {
				escala.symbolizer.pointRadius = Math.max(parseInt(Math.round(opts.selectStyle.pointRadius * escala.symbolizer.size)), opts.minPointRadius);
				escala.symbolizer.strokeWidth = Math.max(parseInt(Math.round(opts.selectStyle.strokeWidth * escala.symbolizer.size)), opts.minPointRadius);
				escala.symbolizer.fontSize = Math.max(parseInt(Math.round(parseInt(opts.selectStyle.fontSize) * escala.symbolizer.size)), parseInt(opts.minFontSize))+'px';
			}
			if (opts.symbolizer.graphicXOffset && opts.symbolizer.graphicYOffset) {
				escala.symbolizer.graphicXOffset = parseInt(Math.round(opts.symbolizer.graphicXOffset * escala.symbolizer.size));
				escala.symbolizer.graphicYOffset = parseInt(Math.round(opts.symbolizer.graphicYOffset * escala.symbolizer.size));				
			}
			if (opts.symbolizer.backgroundXOffset && opts.symbolizer.backgroundYOffset) {
				escala.symbolizer.backgroundXOffset = parseInt(Math.round(opts.symbolizer.backgroundXOffset * escala.symbolizer.size));
				escala.symbolizer.backgroundYOffset = parseInt(Math.round(opts.symbolizer.backgroundYOffset * escala.symbolizer.size));				
			}
			$.each(opts.clases, function(j, clase) {
				if (!(clase.filter instanceof OpenLayers.Filter)) {
					clase.filter = new OpenLayers.Filter.Comparison(clase.filter);
				}
				var s = $.extend({}, clase.symbolizer, escala.symbolizer);
				if (!clase.symbolizer) {
					s.fillColor = opts.colors[j];
				}
				rules.push(new OpenLayers.Rule(
					$.extend({}, clase, escala, {symbolizer: s})
				));
			});
			rules.push(new OpenLayers.Rule($.extend({}, escala, {elseFilter: true})));
		});
		sm.styles['default'].addRules(rules);
		return sm;
	}
	
	/**
	 * Permite agregar al mapa un nuevo layer vectorial y cargar su contenido a partir de una url externa
	 * que devuelva GML o bien manualmente. Las opciones disponibles son:
	 * <div class="mdetail-params">
	 * <strong>Options:</strong>
	 * <ul>
	 * <li>
	 * 		<code>url</code>: String
	 * 		<div class="sub-desc">Url de donde obtener los features para esta capa</div>
	 * </li>
	 * <li>
	 * 		<code>format</code>: String
	 * 		<div class="sub-desc">Indica el formato de los datos (GML o GeoJSON) (Por defecto: GML)</div>
	 * </li>
	 * <li>
	 * 		<code>highlightable</code>: Boolean
	 * 		<div class="sub-desc">Indica si la capa debe ser sensible al evento highlight</div>
	 * </li>
	 * <li>
	 * 		<code>popup</code>: Boolean
	 * 		<div class="sub-desc">Indica si al clickear sobre un feature se debe crear un popup default para pasarle al	handler del onClick</div>
	 * </li>
	 * <li>
	 * 		<code>visible</code>: Boolean
	 * 		<div class="sub-desc">Indica si la capa debe ser visible</div>
	 * </li>
	 * <li>
	 * 		<code>onClick</code>: Function
	 * 		<div class="sub-desc">Funcion a llamar ante el evento click</div>
	 * </li>
	 * <li>
	 * 		<code>onLoad</code>: Function
	 * 		<div class="sub-desc">Funcion a llamar ante una vez que se han cargado los datos de la capa</div>
	 * </li>
	 * <li>
	 * 		<code>symbolizer</code>: Object
	 * 		<div class="sub-desc">Un objeto conteniendo seteos de simbologia definidos de acuerdo a <a href="http://dev.openlayers.org/releases/OpenLayers-2.8/doc/apidocs/files/OpenLayers/Feature/Vector-js.html#OpenLayers.Feature.Vector.OpenLayers.Feature.Vector.style">OpenLayers.Feature.Vector.style</a></div>
	 * </li>
	 * <li>
	 * 		<code>minPointRadius</code>: Integer
	 * 		<div class="sub-desc">Cuando el symbolizer define ancho y alto a traves de la propiedad pointRadius (por defecto) es posible indicar un minimo valor para evitar que el escalado automatico reduzca excesivamente los simbolos.</div>
	 * </li>
	 * <li>
	 * 		<code>clases</code>: Array
	 * 		<div class="sub-desc">Un array de objetos con la siguiente estructura:<br/><pre><code>
	 * 		clases: [
	 * 			{ filter: {property: 'Atributo', type: '==', value: 'Valor'}, symbolizer: { ... } }
     *        	...
	 * 		]
	 * </code></pre><br/>Con el atributo filter que define cada clase se crea automaticamente una instancia de <a href="http://dev.openlayers.org/docs/files/OpenLayers/Filter/Comparison-js.html">OpenLayers.Filter.Comparison</a> o bien puede especificarse directamente el filter creando un OpenLayers.Filter del tipo que se desee y pasarlo de parametro para conseguir filtros mas complejos. La especificacion del symbolizer para cada clase es opcional.</div>
	 * </li>
	 * </ul>
	 * </div>
	 * <br/>
	 * Puede encontrar un ejemplo completo de uso de este metodo <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.3/ejemplos/gml/capas-gml.html">aqui</a>.<br/>
	 * 
	 * @param {String} layerName Nombre del nuevo layer (no debe coincidir con otra capa preexistente)
	 * @param {Object} options (optional) Objeto conteniendo overrides para las opciones disponibles
	 * @return {OpenLayers.Layer.Vector} Capa creada 
	 */
	this.addVectorLayer = function(layerName, options) {
		var opts = $.extend(true, {}, usig.MapaInteractivo.defaults.vectorLayer, options);
		if (opts.onClick && !opts.symbolizer.cursor) {
			opts.symbolizer.cursor = 'pointer';
		}
		// var isIE8 = $.browser.msie && +$.browser.version === 8;
		var layer = new OpenLayers.Layer.Vector(layerName, { 
			styleMap: buildVectorStyleMap(opts),
			visibility: opts.visible,
			minScale: opts.minScale, maxScale: opts.maxScale,
            rendererOptions: {yOrdering: false, zIndexing: true }
		});
		map.addLayer(layer);
		this.raiseMarkers(map.layers.length);
		map.setLayerZIndex(layer, opts.zIndex);
		if (opts.url && opts.url != "") {
			this.showIndicator();
			var dt = opts.format.toUpperCase() == 'GML'?'xml':'json';
			$.ajax({
				url: opts.url,
				dataType: (window.location.host == usig.parseUri(opts.url).authority) || (usig.parseUri(opts.url).authority == opts.url)?dt:'jsonp',
				success: (function(data) {
					if (opts.format.toUpperCase() == 'GML') {
						var gml = new OpenLayers.Format.GML();
						layer.addFeatures(gml.read(data));
					} else if (opts.format.toUpperCase() == 'GEOJSON') {
						var geojson = new OpenLayers.Format.GeoJSON();
						layer.addFeatures(geojson.read(data));
					}
					if (typeof(opts.onLoad) == "function") {
						opts.onLoad();
					}
					this.hideIndicator();
				}).createDelegate(this),
				error: function(e) {
					if (opts.debug) usig.debug(e);
				}
			});
		}
		if (opts.onClick && !opts.disableClick) {
			if (opts.highlightable) {
				var layers = highlightControl.layers;
				layers.push(layer);
				highlightControl.setLayer(layers);
			}
			var layers = selectControl.layers;
			layers.push(layer);
			selectControl.setLayer(layers);
			layer.events.on({
	            "featureselected": function(e) {
	                if (opts.debug) usig.debug("selected feature "+e.feature.id+" on Layer "+layerName);
	            	var feature=e.feature;
	            	e.layerName = layerName;
	        		if (opts.popup) {
	        			if (opts.debug) usig.debug("Creating popup for feature "+e.feature.id);
		    			var popup = new Popup(
							e.feature.id,
							map.getLonLatFromPixel(map.getControlsByClass("OpenLayers.Control.MousePosition")[0].lastXy), // new OpenLayers.LonLat(e.feature.geometry.x, e.feature.geometry.y),
			                null,
			                '<div id="contenido_'+e.feature.id+'"></div>',
			                null,
							false,
							function(ev) {
			                	selectControl.unselect(feature);
			            		ev.cancelBubble = true;
			            		return false;
			                }
		    	        );
		    			e.feature.popup = popup;
		    			popup.hide();
		    			map.addPopup(popup, true);
	        		}
	    			if (typeof(opts.onClick) == "function") {
	    				opts.onClick(e, popup);
	    			} else if (popup) {
	    				popup.show();
	    			}
	    			if (!popup)    				
	    				selectControl.unselect(feature);
	            },
	            "featureunselected": function(e) {
	                if (opts.debug) usig.debug("unselected feature "+e.feature.id+" on Layer "+layerName);
	                if (e.feature.popup) {
		                map.removePopup(e.feature.popup);
		                e.feature.popup.destroy();
		                e.feature.popup = null;
	                }
	            }
	        });			
		}
		return layer;
	}
	
	/**
	 * Permite agregar al mapa un nuevo layer wms. Las opciones disponibles son:
	 * <div class="mdetail-params">
	 * <strong>Options:</strong>
	 * <ul>
	 * <li>
	 * 		<code>layerUrls</code>: String
	 * 		<div class="sub-desc">Urls del servicio WMS para esta capa</div>
	 * </li>
	 * <li>
	 * 		<code>layers</code>: String
	 * 		<div class="sub-desc">Parametro 'layers' del servicio WMS. Por defecto es igual a layerName.</div>
	 * </li>
	 * <li>
	 * 		<code>format</code>: String
	 * 		<div class="sub-desc">Formato de las imagenes. Por defecto 'image/png'.</div>
	 * </li>
	 * <li>
	 * 		<code>transitionEffect</code>: String
	 * 		<div class="sub-desc">Efecto para aplicar al hacer zoom. Por defecto 'resize'.</div>
	 * </li>
	 * <li>
	 * 		<code>maxScale</code>: Integer
	 * 		<div class="sub-desc">Maxima escala para mostrar la capa.</div>
	 * </li>
	 * <li>
	 * 		<code>minScale</code>: Integer
	 * 		<div class="sub-desc">Minima escala para mostrar la capa.</div>
	 * </li>
	 * </ul>
	 * </div>
	 * <br/>
	 * Puede encontrar un ejemplo completo de uso de este metodo <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.4/ejemplos/gml/capas-gml.html">aqui</a>.<br/>
	 * 
	 * @param {String} layerName Nombre del nuevo layer (no debe coincidir con otra capa preexistente)
	 * @param {Object} options (optional) Objeto conteniendo overrides para las opciones disponibles
	 * @return {OpenLayers.Layer.WMS} Capa creada 
	 */
	this.addWMSLayer = function(layerName, options) {
		var opts = $.extend({}, usig.MapaInteractivo.defaults.wmsLayer, options);
		if (!opts.layerUrls) {
			opts.layerUrls = getLayerURLs(layerName);
		}
		if (!opts.layers) {
			opts.layers = layerName;
		}
		// var isIE8 = $.browser.msie && +$.browser.version === 8;
		var layer = new OpenLayers.Layer.WMS(layerName, opts.layerUrls, {layers: opts.layers, format: opts.format, transparent: opts.transparent}, {transitionEffect: opts.transitionEffect, buffer: opts.buffer, opacity: isOldIE()?1:opts.opacity, singleTile: opts.singleTile, isBaseLayer: opts.isBaseLayer, minScale: opts.minScale, maxScale: opts.maxScale});
		map.addLayer(layer);
		return layer;
	}
	
	/**
	 * Agrega una capa vectorial al control de seleccion del mapa para permitir que sea clickeable
	 * @param {OpenLayers.Layer.Vector} layer Capa a agregar
	 */
	this.addLayerToSelectControl = function(layer) {
		var layers = selectControl.layers;
		if (layers.indexOf(layer) < 0) {
			layers.push(layer);
			selectControl.setLayer(layers);
		}
	}
	
	/**
	 * Elimina un layer del mapa y destruye el layer. 
	 * @param {OpenLayers.Layer} layer Capa a eliminar
	 */
	this.removeLayer = function(layer) {
		try {
			map.removeLayer(layer);
			
			var layers = highlightControl.layers;
			layers.removeObject(layer);
			highlightControl.setLayer(layers);
			layers = selectControl.layers;
			layers.removeObject(layer);
			selectControl.setLayer(layers);
			
			layer.destroy();
		} catch(e) {
			usig.debug(e);
			return e;
		};
		return true;
	}
	
	/**
	 * Cambia la visibilidad de la capa
	 * @param {OpenLayers.Layer} layer Capa cuya visibilidad se desea cambiar
	 * @param {Boolean} visibility Indica expresamente si se desea prender/apagar la capa
	 */
	this.toggleLayer = function(layer, visibility) {
		if (typeof(visibility) == 'undefined') {
			layer.setVisibility(!layer.visibility);
		} else {
			layer.setVisibility(visibility);
		}
	};

	/**
	 * Cambia la visibilidad de la capa de markers
	 */
	this.toggleMarkers = function() {
		this.toggleLayer(myMarkers);
	};
	
	/**
	 * Permite cambiar la capa de base y cargar automaticamente una serie de capas vectoriales definidas
	 * en la configuracion que se pasa como parametro
	 * @param {Object} mapConfig Objeto conteniendo la definicion del mapa de acuerdo con la siguiente sintaxis:
	 */
	this.loadMap = function(mapConfig) {
		this.removeVectorLayers();
		this.removeWMSLayers();
		if (mapConfig.baseLayer) {
			this.setBaseLayer(mapConfig.baseLayer);
		}
		if (mapConfig.layers) {
			var myself = this;
			$.each(mapConfig.layers, function(i, layerConfig) {
				if (layerConfig.options.format.toUpperCase() == 'WMS') {
					wmsLayers.push(myself.addWMSLayer(layerConfig.name, layerConfig.options));
				} else {
					if (layerConfig.options.popup==undefined) {
						layerConfig.options.popup = mapConfig.popup;
					}
					if (layerConfig.options.onClick==undefined) {
						layerConfig.options.onClick = mapConfig.onClick;
					}
					vectorLayers.push(myself.addVectorLayer(layerConfig.name, layerConfig.options));
				}
			});
		}
	};
	
	/**
	 * Elimina todas las capas vectoriales del mapa
	 */
	this.removeVectorLayers = function() {
		for (var i=0,l=vectorLayers.length;i<l;i++) {
			this.removeLayer(vectorLayers[i]);
		}
		vectorLayers = [];		
	};
	
	/**
	 * Elimina todas las capas wms del mapa
	 */
	this.removeWMSLayers = function() {
		for (var i=0,l=wmsLayers.length;i<l;i++) {
			this.removeLayer(wmsLayers[i]);
		}
		wmsLayers = [];		
	};

	/*
	 * INICIALIZACION
	 */
	if (typeof(OpenLayers) == "undefined") {
		$indicatorImage = $('<img src="'+opts.rootUrl+'images/animated_indicator_medium.gif" alt="'+opts.texts.loading+'"/>');
		$indicatorImage.css('padding', '10px');
		$divIndicator.css('background-color', '#fff')
			.css('width', '52px')
			.css('height', '52px')
			.css('border', '1px solid #ddd')
			.css('position', 'relative')
			.css('zIndex', '1000')
			.css('opacity', '0.85')
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
//Fin jQuery noConflict support
})(jQuery);

usig.MapaInteractivo.defaults = {
	debug: false,
	trackVisits: true,
	includePanZoomBar: true,
	zoomBar: true,
	includeToolbar: true,
	includeMapSwitcher: false,
	bounds: [54340,54090,172855,140146],
	initBounds: [93500,96750,112000,106750],
	OpenLayersOptions: {
		controls: [],
		resolutions: [90,50,30,15,7.5,4,2,1,0.5,0.2],
		projection: "EPSG:221951",
		units: 'm'
	},
	MapSwitcherOptions: {
		layers: [
		    {name: 'satellite', title: 'vista satelital 2009', id: 'mapabsas_imagen_satelital_2009' }, 
		    {name: 'default', title: 'vista del mapa', id: 'mapabsas_default3'}
		],
		opcionales: [
			{id: 'markers-toggle', name: 'Mostrar Mis Marcadores', checked: true}
		], 
		mapas: []		
	},
	baseLayer:'mapabsas_informacion_basica',
	rootUrl: '//servicios.usig.buenosaires.gov.ar/usig-js/dev/',	
	OpenLayersCSS: '//servicios.usig.buenosaires.gov.ar/OpenLayers/2.13-dev1-1/theme/default/style.css',
	// OpenLayersCSS: 'http://10.75.0.125/wk/OpenLayers/theme/default/style.css',
	// OpenLayersJS: 'http://10.75.0.125/wk/OpenLayers/OpenLayers.js',
	OpenLayersJS: '//servicios.usig.buenosaires.gov.ar/OpenLayers/2.13-dev1-1/OpenLayers.js',
	NormalizadorDireccionesJS: '//servicios.usig.buenosaires.gob.ar/nd-js/1.4/normalizadorDirecciones.min.js',
	GeoCoderJS: '//servicios.usig.buenosaires.gob.ar/usig-js/3.0/usig.GeoCoder.min.js',
	piwikBaseUrl: '//usig.buenosaires.gov.ar/piwik/',
	piwikSiteId: 3, 
	preloadImages: [],
	texts: {
		processing: 'Procesando...',
		loading: 'Cargando...',
		tituloMailing: 'Enviar vista actual por e-mail',
		mapSelectorDefault: 'Vista del Plano',
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
	vectorLayer: {
		format: 'GML',
		highlightable: true,
		popup: false,
		visible: true,
		escalas: [
			{ 
				minScaleDenominator: 80000,
				symbolizer: {size: 0.4}
			},
			{
				minScaleDenominator: 20000,
				maxScaleDenominator: 80000,
				symbolizer: {size: 0.5}
			},
			{
				maxScaleDenominator: 20000,
				symbolizer: {size: 0.7}
			}
		],
		clases: [],
		minPointRadius: 3,
		minFontSize: "10px",
		symbolizer: {
			fillColor: '#0000ee',
			strokeColor: "#666666", 
			strokeWidth: 1,
			pointRadius: 7,
			cursor: "pointer"
		},
		zIndex: 0,
		colors: ['#8F58C7','#E34900','#C3E401','#F9B528','#D71440','#007baf','#495a78','#b56c7d','#669966','#ff3300']	
	},
	wmsLayer: {
		format: 'image/png',
		transitionEffect: "resize", 
		buffer: 0,
		opacity: 1,
		singleTile: false,
		transparent: true,
		isBaseLayer: false,
		minScale: 100000,
		maxScale: 0
	},
	goToZoomLevel: 7,
    SHADOW_Z_INDEX: 10,
    MARKER_Z_INDEX: 11,
	servers: ["//tiles1.mapa.buenosaires.gob.ar/tilecache/", "//tiles2.mapa.buenosaires.gob.ar/tilecache/", "//tiles3.mapa.buenosaires.gob.ar/tilecache/", "//tiles4.mapa.buenosaires.gob.ar/tilecache/", "//tiles5.mapa.buenosaires.gob.ar/tilecache/", "//tiles6.mapa.buenosaires.gob.ar/tilecache/", "//tiles7.mapa.buenosaires.gob.ar/tilecache/"]
};
