// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


usig.Tracker = function(type, data) {
	
	var lastPageUrl = '';

	this.trackAction = function(target, data, category, label) {
        // usig.debug(category+' track: '+target+' label: '+label);
		try {
			if (piwikTracker) {
				piwikTracker.trackLink( target, 'link', data );
			}
		} catch(e) {};
		try {
			if (_gaq) {
				// usig.debug(category+', '+target+','+label);
				_gaq.push(['_trackEvent', category, target, label]);
			}
		} catch(e) {};
	}

	this.trackPageView = function(url, title) {
		if (ga && lastPageUrl!=url) {
			lastPageUrl = url; // No queremos duplicados seguidos.
			// console.log('pageview', url, title);
			ga('set', {
			  page: url,
			  title: title
			});
			ga('send', 'pageview');
		}
	}

	this.trackEvent = function(category, action, label, value) {
		try {
			if (ga) {
				// usig.debug(category+', '+target+','+label);
				// console.log('event', category, action, label, value);
				ga('send', 'event', category, action, label, value);
			}
		} catch(e) {};		
	}
	
}

if (typeof (usig.tracker) == "undefined")
	usig.tracker = new usig.Tracker();