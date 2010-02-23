// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


usig.Tracker = function(type, data) {
	
	
	this.trackAction = function(target, data) {

		if(piwikTracker != undefined)
			piwikTracker.trackLink( target, 'link', data );
	}
	
}

if (typeof (usig.tracker) == "undefined")
	usig.tracker = new usig.Tracker();