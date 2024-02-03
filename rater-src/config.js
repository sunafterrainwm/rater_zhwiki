// <nowiki>
const packagejson = require("../package.json");
var version = packagejson.version;

// A global object that stores all the page and user configuration and settings
var config = {
	// Script info
	script: {
		// Advert to append to edit summaries
		advert:  ` ([[WP:RATER#${version}|Rater]])`,
		version: version
	},
	// Default preferences, if user subpage raterPrefs.json does not exist
	defaultPrefs: {
		"autostart": false,
		"autostartRedirects": false,
		"autostartNamespaces": [0],
		"minForShell": 1,
		"bypassRedirects": true,
		"autofillClassFromOthers": true,
		"autofillClassFromOres": true,
		"autofillImportance": true,
		"collapseParamsLowerLimit": 6,
		"watchlist": "preferences"
	},
	// MediaWiki configuration values
	mw: mw.config.get( [
		"skin",
		"wgPageName",
		"wgNamespaceNumber",
		"wgUserName",
		"wgFormattedNamespaces",
		"wgMonthNames",
		"wgRevisionId",
		"wgScriptPath",
		"wgServer",
		"wgCategories",
		"wgIsMainPage"
	] ),
	bannerDefaults: {
		classes: [
			"FA",
			"FL",
			"A",
			"GA",
			"B",
			"C",
			"Start",
			"Stub",
			"List"
		],
		importances: [
			"Top",
			"High",
			"Mid",
			"Low"
		],
		extendedClasses: [
			"Category",
			"Draft",
			"File",
			"FM",
			"Portal",
			"Project",
			"Template",
			"Bplus",
			"Future",
			"Current",
			"Disambig",
			"NA",
			"Redirect",
			"Book"
		],
		extendedImportances: [
			"Top",
			"High",
			"Mid",
			"Low",
			"Bottom",
			"NA"
		]
	},
	bannerDefaultsLabel: { // i18n. this must be synchronized with the wiki and the above definition
		classes: [
			"FA - �䷶��Ŀ",
			"FL - ��ɫ�б�",
			"A - ��",
			"GA - ����",
			"B - ��",
			"C - ��",
			"Start - ��",
			"Stub - С��Ʒ",
			"List - �б�"
		],
		importances: [
			"Top - ����",
			"High - ��",
			"Mid - ��",
			"Low - ��"
		],
		extendedClasses: [
			"Category - ����",
			"Draft - �ݸ�",
			"File - �ļ�",
			"FM",
			"Portal - ����",
			"Project - ��Ŀ",
			"Template - ģ��",
			"Bplus",
			"Future - δ��",
			"Current",
			"Disambig - ������",
			"NA - ��",
			"Redirect - �ض���",
			"Book"
		],
		extendedImportances: [
			"Top - ����",
			"High - ��",
			"Mid - ��",
			"Low - ��",
			"Bottom - ����",
			"NA - ��"
		]
	},
	customBanners: {
		"WikiProject Military history": {
			classes: [
				"FA",
				"FL",
				"A",
				"GA",
				"B",
				"C",
				"Start",
				"Stub",
				"List",
				"AL",
				"BL",
				"CL",
				"Category",
				"Draft",
				"File",
				"Portal",
				"Project",
				"Template",
				"Disambig",
				"Redirect",
				"Book"			
			],
			importances: []
		},
		"WikiProject Portals": {
			classes: [
				"FPo",
				"Complete",
				"Substantial",
				"Basic",
				"Incomplete",
				"Meta",
				"List",
				"Category",
				"Draft",
				"File",
				"Project",
				"Template",
				"Disambig",
				"NA",
				"Redirect"
			],
			importances: [
				"Top",
				"High",
				"Mid",
				"Low",
				"Bottom",
				"NA"
			]
		}
		"WikiProject Video games": {
			classes: [
				"FA","FL","FM","GA","B","C","Start","Stub","List","Category","Draft","File","Portal","Project","Template","Disambig","Redirect"
			],
			importances: [
				"Top","High","Mid","Low","NA"
			]
		}
	},
	shellTemplates: [ // TODO: check it
		"WikiProject banner shell",
		"WikiProjectBanners",
		"WikiProject Banners",
		"WPB",
		"WPBS",
		"Wikiprojectbannershell",
		"WikiProject Banner Shell",
		"Wpb",
		"WPBannerShell",
		"Wpbs",
		"Wikiprojectbanners",
		"WP Banner Shell",
		"WP banner shell",
		"Bannershell",
		"Wikiproject banner shell",
		"WikiProject Banners Shell",
		"WikiProjectBanner Shell",
		"WikiProjectBannerShell",
		"WikiProject BannerShell",
		"WikiprojectBannerShell",
		"WikiProject banner shell/redirect",
		"WikiProject Shell",
		"Banner shell",
		"Scope shell",
		"Project shell",
		"WikiProject banner"
	],
	defaultParameterData: {
		"auto": {
			"label": {
				"en": "Auto-rated",
				"zh": "�Զ�����"
			},
			"description": {
				"en": "Automatically rated by a bot. Allowed values: ['yes'].",
				"zh": "��������ɵ��Զ������������ֵ��['yes']��"
			},
			"autovalue": "yes"
		},
		"listas": {
			"label": {
				"en": "List as",
				"zh": "��������"
			},
			"description": {
				"en": "Sortkey for talk page",
				"zh": "����ҳ����������"
			}
		},
		"small": {
			"label": {
				"en": "Small?",
				"zh": "С�ͣ�"
			},
			"description": {
				"en": "Display a small version. Allowed values: ['yes'].",
				"zh": "��ʾС�Ͱ汾�������ֵ��['yes']��"
			},
			"autovalue": "yes"
		},
		"attention": {
			"label": {
				"en": "Attention required?",
				"zh": "��Ҫ��ע��"
			},
			"description": {
				"en": "Immediate attention required. Allowed values: ['yes'].",
				"zh": "��Ҫ������ע�������ֵ��['yes']��"
			},
			"autovalue": "yes"
		},
		"needs-image": {
			"label": {
				"en": "Needs image?",
				"zh": "��Ҫͼ��"
			},
			"description": {
				"en": "Request that an image or photograph of the subject be added to the article. Allowed values: ['yes'].",
				"zh": "��Ŀ��Ҫ�������ͼ�����Ƭ�������ֵ��['yes']��"
			},
			"aliases": [
				"needs-photo"
			],
			"autovalue": "yes",
			"suggested": true
		},
		"needs-infobox": {
			"label": {
				"en": "Needs infobox?",
				"zh": "��Ҫ��Ϣ��"
			},
			"description": {
				"en": "Request that an infobox be added to the article. Allowed values: ['yes'].",
				"zh": "��Ŀ��Ҫһ����Ϣ�������ֵ��['yes']��"
			},
			"aliases": [
				"needs-photo" // TODO: why?
			],
			"autovalue": "yes",
			"suggested": true
		}
	}
};

export default config;
// </nowiki>