import config from "./config";
import {API} from "./util";
import { parseTemplates, getWithRedirectTo } from "./Template";
import getBanners from "./getBanners";
import * as cache from "./cache";
import windowManager from "./windowManager";

var setupRater = function(clickEvent) {
	if ( clickEvent ) {
		clickEvent.preventDefault();
	}

	var setupCompletedPromise = $.Deferred();
    
	var currentPage = mw.Title.newFromText(config.mw.wgPageName);
	var talkPage = currentPage && currentPage.getTalkPage();
	var subjectPage = currentPage && currentPage.getSubjectPage();
 
	// Get lists of all banners (task 1)
	var bannersPromise = getBanners();

	// Load talk page (task 2)
	var loadTalkPromise = API.get( {
		action: "query",
		prop: "revisions",
		rvprop: "content",
		rvsection: "0",
		titles: talkPage.getPrefixedText(),
		indexpageids: 1
	} ).then(function (result) {
		var id = result.query.pageids;		
		var wikitext = ( id < 0 ) ? "" : result.query.pages[id].revisions[0]["*"];
		return wikitext;
	});

	// Parse talk page for banners (task 3)
	var parseTalkPromise = loadTalkPromise.then(wikitext => parseTemplates(wikitext, true)) // Get all templates
		.then(templates => getWithRedirectTo(templates)) // Check for redirects
		.then(templates => {
			return bannersPromise.then((allBanners) => { // Get list of all banner templates
				return templates.filter(template => { // Filter out non-banners
					var mainText = template.redirectTo
						? template.redirectTo.getMainText()
						: template.getTitle().getMainText();
					return allBanners.withRatings.includes(mainText) || 
                    allBanners.withoutRatings.includes(mainText) ||
                    allBanners.wrappers.includes(mainText);
				})
					.map(function(template) { // Set wrapper target if needed
						var mainText = template.redirectTo
							? template.redirectTo.getMainText()
							: template.getTitle().getMainText();
						if (allBanners.wrappers.includes(mainText)) {
							template.redirectsTo = mw.Title.newFromText("Template:Subst:" + mainText);
						}
						return template;
					});
			});
		});

	// Retrieve and store TemplateData (task 4)
	var templateDataPromise = parseTalkPromise.then(templates => {
		templates.forEach(template => template.setParamDataAndSuggestions());
		return templates;
	});

	// Check if page is a redirect (task 5) - but don't error out if request fails
	var redirectCheckPromise = API.getRaw(subjectPage.getPrefixedText())
		.then(
			// Success
			function(rawPage) { 
				if ( /^\s*#REDIRECT/i.test(rawPage) ) {
					// get redirection target, or boolean true
					return rawPage.slice(rawPage.indexOf("[[")+2, rawPage.indexOf("]]")) || true;
				}
				return false;
			},
			// Failure (ignored)
			function() { return null; }
		);

	// Retrieve rating from ORES (task 6, only needed for articles)
	var shouldGetOres = ( config.mw.wgNamespaceNumber <= 1 );
	if ( shouldGetOres ) {
		var latestRevIdPromise = currentPage.isTalkPage()
			? $.Deferred().resolve(config.mw.wgRevisionId)
			: 	API.get( {
				action: "query",
				format: "json",
				prop: "revisions",
				titles: subjectPage.getPrefixedText(),
				rvprop: "ids",
				indexpageids: 1
			} ).then(function(result) {
				if (result.query.redirects) {
					return false;
				}
				var id = result.query.pageids;
				var page = result.query.pages[id];
				if (page.missing === "") {
					return false;
				}
				if ( id < 0 ) {
					return $.Deferred().reject();
				}
				return page.revisions[0].revid;
			});
		var oresPromise = latestRevIdPromise.then(function(latestRevId) {
			if (!latestRevId) {
				return false;
			}
			return API.getORES(latestRevId)
				.then(function(result) {
					var data = result.enwiki.scores[latestRevId].wp10;
					if ( data.error ) {
						return $.Deferred().reject(data.error.type, data.error.message);
					}
					return data.score.prediction;
				});
		});
	}

	// Open the load dialog
	var isOpenedPromise = $.Deferred();
	var loadDialogWin = windowManager.openWindow("loadDialog", {
		promises: [
			bannersPromise,
			loadTalkPromise,
			parseTalkPromise,
			templateDataPromise,
			redirectCheckPromise,
			shouldGetOres && oresPromise
		],
		ores: shouldGetOres,
		isOpened: isOpenedPromise
	});

	loadDialogWin.opened.then(isOpenedPromise.resolve);


	$.when(
		loadTalkPromise,
		templateDataPromise,
		redirectCheckPromise,
		shouldGetOres && oresPromise
	).then(
		// All succeded
		function(talkWikitext, banners, redirectTarget, oresPredicition ) {
			var result = {
				success: true,
				talkpage: talkPage,
				talkWikitext: talkWikitext,
				banners: banners
			};
			if (redirectTarget) {
				result.redirectTarget = redirectTarget;
			}
			if (oresPredicition) {
				result.oresPredicition = oresPredicition;
			}
			windowManager.closeWindow("loadDialog", result);
			
		}
	); // Any failures are handled by the loadDialog window itself

	// On window closed, check data, and resolve/reject setupCompletedPromise
	loadDialogWin.closed.then(function(data) {
		if (data && data.success) {
			// Got everything needed: Resolve promise with this data
			setupCompletedPromise.resolve(data);
		} else if (data && data.error) {
			// There was an error: Reject promise with error code/info
			setupCompletedPromise.reject(data.error.code, data.error.info);
		} else {
			// Window closed before completion: resolve promise without any data
			setupCompletedPromise.resolve(null);
		}
		cache.clearInvalidItems();
	});

	// TESTING purposes only: log passed data to console
	setupCompletedPromise.then(
		data => console.log("setup window closed", data),
		(code, info) => console.log("setup window closed with error", {code, info})
	);

	return setupCompletedPromise;
};

export default setupRater;