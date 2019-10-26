import config from "./config";
import {API, makeErrorMsg} from "./util";
import setupRater from "./setup";

var autoStart = function autoStart() {
	if ( window.rater_autostartNamespaces == null || config.mw.wgIsMainPage ) {
		return $.Deferred().reject();
	}
	
	var autostartNamespaces = ( $.isArray(window.rater_autostartNamespaces) ) ? window.rater_autostartNamespaces : [window.rater_autostartNamespaces];
	
	if ( -1 === autostartNamespaces.indexOf(config.mw.wgNamespaceNumber) ) {
		return $.Deferred().reject();
	}
	
	if ( /(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href) ) {
		return $.Deferred().reject();
	}
	
	// Check if talk page exists
	if ( $("#ca-talk.new").length ) {
		return setupRater();
	}
	
	var thisPage = mw.Title.newFromText(config.mw.wgPageName);
	var talkPage = thisPage && thisPage.getTalkPage();
	if (!talkPage) {
		return $.Deferred().reject();
	}

	/* Check templates present on talk page. Fetches indirectly transcluded templates, so will find
		Template:WPBannerMeta (and its subtemplates). But some banners such as MILHIST don't use that
		meta template, so we also have to check for template titles containg 'WikiProject'
	*/
	return API.get({
		action: "query",
		format: "json",
		prop: "templates",
		titles: talkPage.getPrefixedText(),
		tlnamespace: "10",
		tllimit: "500",
		indexpageids: 1
	})
		.then(function(result) {
			var id = result.query.pageids;
			var templates = result.query.pages[id].templates;
		
			if ( !templates ) {
				return setupRater();
			}
		
			var hasWikiproject = templates.some(template => /(WikiProject|WPBanner)/.test(template.title));
		
			if ( !hasWikiproject ) {
				return setupRater();
			}
		
		},
		function(code, jqxhr) {
		// Silently ignore failures (just log to console)
			console.warn(
				"[Rater] Error while checking whether to autostart." +
			( code == null ) ? "" : " " + makeErrorMsg(code, jqxhr)
			);
			return $.Deferred().reject();
		});

};

export default autoStart;