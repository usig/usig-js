usig.Recorrido.texts['en'] = {
		descWalk: 'Walking directions',
		descCar: 'Driving directions',
		descBike: 'Bicycle directions',
		hayRamales:'Beware that not all routes go to destination',
		planTransporte: {
				'walking': {'startDir':{texto: 'Walk from <span class="plan-calle">$desde $calle</span>'},
							'startCruce':{texto: 'Walk from intersection of <span class="plan-calle">$calle1 and $calle2</span>'},
							'finish':{texto: ' until reach your destination.'}},
				'board':{'walking':{texto: ' up to intersection of <span class="plan-calle">$calle1 and $calle2</span>'},
						'walkingestacion':{texto: ' up to the <span class="plan-estacion">$estacion station</span> at intersection of <span class="plan-calle">$calle1 and $calle2</span>'},
						'subte':{texto: 'Take the <span class="transport">$subte Subway Line (heading $sentido)</span>'},
						'estacion':{texto: ' at <span class="plan-estacion">$estacion station</span>'},
						'esquina': {texto: ' at intersection of <span class="plan-calle">$calle1 and $calle2</span>'},
						'ramales': {texto: '(Ramales: $ramal)'},
						'colectivo':{texto: 'Take the <span class="transport">Bus $colectivo $ramal</span>'},
						'tren':{texto: 'Take the <span class="transport">$tren $ramal Train </span>'}},
				'alight':{'subtetren':{texto: ' and exit at <span class="plan-estacion">$estacion station</span>'},
						'cole':{texto: ' get off at <span class="plan-calle">$calle1 and $calle2</span>'},
						'metrobus':{texto: ' get off at <span class="plan-estacion">$estacion station</span> at <span class="plan-calle">$calle1 and $calle2</span>'}},
		        'subwayconnection':{texto: 'Get off at <span class="plan-estacion">$estacionorigen station</span> and transfer to the <span class="transport">$subte  Subway Line  (heading $sentido)</span> at <span class="plan-estacion">$estaciondestino</span> station'},
		},
		planAuto: {
 		 	'seguir': {texto:'Continue forward onto <span class="plan-calle">$calle</span>'},
			'doblarIzq': {texto:'Turn left onto <span class="plan-calle">$calle</span>'},
			'doblarDer': {texto:'Turn right onto <span class="plan-calle">$calle</span>'},
			'irDesde': {texto:'Start out on <span class="plan-calle">$calle</span>'},
			'hasta': {texto:' up to <span class="plan-calle">$hasta $calle</span>'}
		},
		planBici: {
			'inicio': {'walking':{texto: 'Walk $metros from <span class="plan-calle">$calle</span>'},
						'biking':{texto: 'Start out riding $metros on <span class="plan-calle">$calle</span>$via'}}, 
			'walking':[{texto: 'Walk $metros from <span class="plan-calle">$calle</span>', turn_indication: 'seguir'},
                      {texto: 'Turn left onto <span class="plan-calle">$calle</span> and walk $metros', turn_indication: 'izquierda'},
                      {texto: 'Turn right onto <span class="plan-calle">$calle</span> and walk $metros', turn_indication: 'derecha'}],
            'biking':[{texto: 'Continue $metros through <span class="plan-calle">$calle</span>$via', turn_indication: 'seguir'},
	                  {texto: 'Turn left onto <span class="plan-calle">$calle</span>$via and continue $metros', turn_indication: 'izquierda'},
	                  {texto: 'Turn right onto <span class="plan-calle">$calle</span>$via and continue $metros', turn_indication: 'derecha'}],
	        'hasta':{texto: ' up to <span class="plan-calle">$hasta $calle</span>'},
	        'ciclovia':{texto:' bike lane '},
	        'carril':{texto:' bike lane '}
	                
		}
	};