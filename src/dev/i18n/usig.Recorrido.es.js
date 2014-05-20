usig.Recorrido.texts['es'] = {
		descWalk: 'Recorrido a pie',
		descCar: 'Recorrido en auto',
		descBike: 'Recorrido en bici',
		hayRamales:'No todos los ramales conducen a destino',
		planTransporte: {
			'walking': {'startDir':{texto: 'Caminar desde <span class="plan-calle">$calle $desde</span>'},
						'startCruce':{texto: 'Caminar desde <span class="plan-calle">$calle1 y $calle2</span>'},
						'finish':{texto: ' hasta destino.'}},
            'board':{'walking':{texto: ' hasta <span class="plan-calle">$calle1 y $calle2</span>'},
            			'walkingestacion':{texto: ' hasta la estación <span class="plan-estacion">$estacion</span> en <span class="plan-calle">$calle1 y $calle2</span>'},
            			'subte':{texto: 'Tomar el <span class="transport">SUBTE LÍNEA $subte (en dirección a $sentido)</span>'},
            			'estacion':{texto: ' en la estación <span class="plan-estacion">$estacion</span>'},
            			'esquina': {texto: ' en <span class="plan-calle">$calle1 y $calle2</span>'},
            			'ramales': {texto: '(Ramales: $ramal)'},
            			'colectivo':{texto: 'Tomar el <span class="transport">COLECTIVO $colectivo $ramal</span>'},
            			'tren':{texto: 'Tomar el <span class="transport">TREN $tren $ramal</span>'}},
            'alight':{'subtetren':{texto: ' y bajar en la estación <span class="plan-estacion">$estacion</span>'},
	 		        	'cole':{texto: ' y bajar en <span class="plan-calle">$calle1 y $calle2</span>'},
	 		        	'metrobus':{texto: ' y bajar en la estación <span class="plan-estacion">$estacion</span> en <span class="plan-calle">$calle1 y $calle2</span>'}},
            'subwayconnection':{texto: 'Bajarse en la estación <span class="plan-estacion">$estacionorigen</span> y combinar con el <span class="transport">SUBTE LÍNEA $subte (en dirección a $sentido)</span> en estación <span class="plan-estacion">$estaciondestino</span>'},
		},
		planAuto: {
	 		 	'seguir': {texto:'Seguir por <span class="plan-calle">$calle</span>'},
				'doblarIzq': {texto:'Doblar a la izquierda en <span class="plan-calle">$calle</span>'},
				'doblarDer': {texto:'Doblar a la derecha en <span class="plan-calle">$calle</span>'},
				'irDesde': {texto:'Ir desde <span class="plan-calle">$calle</span>'},
				'hasta': {texto:' hasta el <span class="plan-calle">$hasta</span>'}
		},
		planBici: {
				'inicio': {'walking':{texto: 'Caminar $metros desde <span class="plan-calle">$calle</span>'},
							'biking':{texto: 'Pedalear $metros desde $via<span class="plan-calle">$calle</span>'}},
				'walking':[{texto: 'Caminar $metros por <span class="plan-calle">$calle</span>', turn_indication: 'seguir'},
                            {texto: 'Doblar a la izquierda en <span class="plan-calle">$calle</span> y caminar $metros', turn_indication: 'izquierda'},
                            {texto: 'Doblar a la derecha en <span class="plan-calle">$calle</span> y caminar $metros', turn_indication: 'derecha'}],
                'biking':[{texto: 'Seguir $metros por $via<span class="plan-calle">$calle</span>', turn_indication: 'seguir'},
		                    {texto: 'Doblar a la izquierda en $via<span class="plan-calle">$calle</span> y seguir $metros', turn_indication: 'izquierda'},
		                    {texto: 'Doblar a la derecha en $via<span class="plan-calle">$calle</span> y seguir $metros', turn_indication: 'derecha'}],
		        'hasta':{texto: ' hasta el <span class="plan-calle">$hasta</span>'},
		        'ciclovia':{texto:' ciclovia '},
		        'carril':{texto:' carril preferencial '}
		}
	};