# Automatizacion de actualizacion de USIG-JS
HOST=10.20.1.164
HOST_DIR=/d/usig/www/servicios/Usig-JS

HOSTS=10.20.1.43 10.20.1.46 10.20.1.91 10.20.1.96
APPDIR=/usr/local/usig/servicios/Usig-JS

VERSION=2.1
USER=usig
SRC=src/dev
REL=src/release
APPD=/d/usig/www/servicios/Usig-JS

INVENTARIO_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js

AUTOCOMPLETER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/jquery.class.js \
      $(SRC)/json.js \
      $(SRC)/usig.InputController.js \
      $(SRC)/usig.AutoCompleter.js \
      $(SRC)/usig.AutoCompleterView.js \
      $(SRC)/usig.Suggester.js
      
AUTOCOMPLETER_STANDARD_FILES=\
	  $(AUTOCOMPLETER_FILES) \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js \
      $(SRC)/usig.SuggesterLugares.js \
      $(SRC)/usig.SuggesterDirecciones.js

AUTOCOMPLETER_DIRECCIONES_FILES=\
	  $(AUTOCOMPLETER_FILES) \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.SuggesterDirecciones.js	  
	  
GEOCODER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js

SUGGESTER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Suggester.js

INPUTCONTROLLER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.InputController.js

SUGGESTER_DIRECCIONES_FILES=\
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.SuggesterDirecciones.js
      
SUGGESTER_LUGARES_FILES=\
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js \
      $(SRC)/usig.SuggesterLugares.js	

SUGGESTER_CATASTRO_FILES=\
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.SeccionCatastral.js \
      $(SRC)/usig.ManzanaCatastral.js \
      $(SRC)/usig.ParcelaCatastral.js \
      $(SRC)/usig.IndiceCatastral.js \
      $(SRC)/usig.SuggesterCatastro.js

INDICE_CATASTRAL_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.SeccionCatastral.js \
      $(SRC)/usig.ManzanaCatastral.js \
      $(SRC)/usig.ParcelaCatastral.js \
      $(SRC)/usig.IndiceCatastral.js

all: prepare

debug:$(FILES)
	cat $(INVENTARIO_FILES) > $(SRC)/usig.Inventario-debug.js
	cat $(AUTOCOMPLETER_FILES) > $(SRC)/usig.AutoCompleter-debug.js
	cat $(AUTOCOMPLETER_STANDARD_FILES) > $(SRC)/usig.AutoCompleterStandard-debug.js
	cat $(AUTOCOMPLETER_DIRECCIONES_FILES) > $(SRC)/usig.AutoCompleterDirecciones-debug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleter-debug.js > $(SRC)/usig.AutoCompleter-nodebug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleterStandard-debug.js > $(SRC)/usig.AutoCompleterStandard-nodebug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleterDirecciones-debug.js > $(SRC)/usig.AutoCompleterDirecciones-nodebug.js
	cat $(GEOCODER_FILES) > $(SRC)/usig.GeoCoder-debug.js
	cat $(SUGGESTER_FILES) > $(SRC)/usig.Suggester-debug.js
	cat $(INPUTCONTROLLER_FILES) > $(SRC)/usig.InputController-debug.js
	cat $(SUGGESTER_DIRECCIONES_FILES) > $(SRC)/usig.SuggesterDirecciones-debug.js
	cat $(SUGGESTER_LUGARES_FILES) > $(SRC)/usig.SuggesterLugares-debug.js
	cat $(SUGGESTER_CATASTRO_FILES) > $(SRC)/usig.SuggesterCatastro-debug.js
	cat $(INDICE_CATASTRAL_FILES) > $(SRC)/usig.IndiceCatastral-debug.js
	wget -O $(SRC)/normalizadorDirecciones.min.js http://servicios.usig.buenosaires.gov.ar/nd-js/1.0/normalizadorDirecciones.min.js
	
clean:
	rm -f $(SRC)/*-debug.js
	rm -f $(SRC)/*-nodebug.js
	#rm -f $(SRC)/usig.Inventario-debug.js
	#rm -f $(SRC)/usig.AutoCompleter-debug.js
	#rm -f $(SRC)/usig.AutoCompleter-nodebug.js
	#rm -f $(SRC)/usig.GeoCoder-debug.js
	#rm -f $(SRC)/usig.InputController-debug.js
	rm -f $(SRC)/normalizadorDirecciones.min.js

prepare: docs debug
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.core.js -o $(REL)/usig.core.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.util.js -o $(REL)/usig.util.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.ajax.js -o $(REL)/usig.ajax.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/jquery.class.js -o $(REL)/jquery.class.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.DataManager.js -o $(REL)/usig.DataManager.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaReferencia.js -o $(REL)/usig.MapaReferencia.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaEstatico.js -o $(REL)/usig.MapaEstatico.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.FotosParcela.js -o $(REL)/usig.FotosParcela.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.tabla.js -o $(REL)/usig.tabla.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.tabla.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Mock.js -o $(REL)/usig.Mock.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Calle.js -o $(REL)/usig.Calle.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Punto.js -o $(REL)/usig.Punto.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Direccion.js -o $(REL)/usig.Direccion.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Suggester-debug.js -o $(REL)/usig.Suggester.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.AjaxComponent.js -o $(REL)/usig.AjaxComponent.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.AutoCompleterView.js -o $(REL)/usig.AutoCompleterView.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.InputController-debug.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.GeoCoder-debug.js -o $(REL)/usig.GeoCoder.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Inventario-debug.js -o $(REL)/usig.Inventario.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.SuggesterDirecciones-debug.js -o $(REL)/usig.SuggesterDirecciones.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.SuggesterLugares-debug.js -o $(REL)/usig.SuggesterLugares.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.SuggesterCatastro-debug.js -o $(REL)/usig.SuggesterCatastro.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.IndiceCatastral-debug.js -o $(REL)/usig.IndiceCatastral.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleter-nodebug.js -o $(REL)/usig.AutoCompleter.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleterStandard-nodebug.js -o $(REL)/usig.AutoCompleterStandard.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleterStandard-nodebug.js -o $(REL)/usig.AutoCompleterFull.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleterDirecciones-nodebug.js -o $(REL)/usig.AutoCompleterDirecciones.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleterDirecciones-nodebug.js -o $(REL)/usig.AutoCompleterDireccionesFull.min.js
	cat $(SRC)/normalizadorDirecciones.min.js >> $(REL)/usig.AutoCompleterFull.min.js
	cat $(SRC)/normalizadorDirecciones.min.js >> $(REL)/usig.AutoCompleterDireccionesFull.min.js
	rsync -avz --exclude '.svn' $(SRC)/demos/css $(REL)/demos/
	rsync -avz --exclude '.svn' $(SRC)/css $(REL)/
	rsync -avz --exclude '.svn' $(SRC)/tests/*.js $(REL)/tests/
	$(MAKE) clean
	
docs:
	java -jar ext-doc/ext-doc.jar -p ext-doc.xml -o doc/www -t ext-doc/template/ext/template.xml -verbose
	cp doc/index.html doc/www/
	
install:
	# rsync -e ssh -avzc --delete src/release/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)
	# rsync -e ssh -avzc --delete doc/www/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)/doc
	for host in $(HOSTS); do \
		rsync -e ssh -avzc --delete src/release/* $(USER)@$$host:$(APPDIR)/$(VERSION); \
		rsync -e ssh -avzc --delete doc/www/* $(USER)@$$host:$(APPDIR)/$(VERSION)/doc; \
	done

