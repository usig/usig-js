# Automatizacion de actualizacion de USIG-JS
HOST=10.20.1.164
HOST_DIR=/d/usig/www/servicios/Usig-JS
VERSION=1.0
USER=usig
SRC=src/dev
REL=src/release
APPD=/d/usig/www/servicios/Usig-JS

all: prepare

prepare: 
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.core.js -o $(REL)/usig.core.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.ajax.js -o $(REL)/usig.ajax.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.DataManager.js -o $(REL)/usig.DataManager.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaReferencia.js -o $(REL)/usig.MapaReferencia.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaEstatico.js -o $(REL)/usig.MapaEstatico.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.FotosParcela.js -o $(REL)/usig.FotosParcela.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.tabla.js -o $(REL)/usig.tabla.min.js
	java -jar ../ext-doc-1.0.131/ext-doc.jar -p ext-doc.xml -o doc/www -t ../ext-doc-1.0.131/template/ext/template.xml -verbose
	cp doc/index.html doc/www/
	
install:
	rsync -e ssh -avzc --delete src/release/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)
	rsync -e ssh -avzc --delete doc/www/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)/doc
