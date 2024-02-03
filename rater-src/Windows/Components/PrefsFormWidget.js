import config from "../../config";
// <nowiki>

function PrefsFormWidget( config ) {
	// Configuration initialization
	config = config || {};
	// Call parent constructor
	PrefsFormWidget.super.call( this, config );

	this.$element.addClass("rater-prefsFormWidget");

	this.layout =  new OO.ui.FieldsetLayout( {
		label: "����",
		$element: this.$element
	} );

	this.preferences = {
		"autostart": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "�Զ���Rater"
		},
		"autostartRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "�ض������Զ���"
		},
		"autostartNamespaces": {
			input: new mw.widgets.NamespacesMultiselectWidget(),
			label: "���������ռ����Զ���"
		},
		"bypassRedirects": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "Bypass redirects to banners" // TODO
		},
		"autofillClassFromOthers":  {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "������������Զ���д����"
		},
		"autofillClassFromOres": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "����ORESָ���Զ���д����"
		},
		"autofillImportance": {
			input: new OO.ui.ToggleSwitchWidget(),
			label: "�Զ���д����Ҫ��"
		},
		"collapseParamsLowerLimit": {
			input: new OO.ui.NumberInputWidget( { "min": 1 } ),
			label: "�Զ��۵������������Ĳ���" // review it
		},
		"watchlist": {
			input: new OO.ui.ButtonSelectWidget( {
				items: [
					new OO.ui.ButtonOptionWidget( {
						data: "preferences",
						label: "Ĭ��",
						title: "��ѭ���������á����йء��༭ҳ�桱������"
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "watch",
						label: "ʼ��",
						title: "�� Rater �༭��ҳ��ʼ����ӵ������б�"
					} ),
					new OO.ui.ButtonOptionWidget( {
						data: "nochange",
						label: "�Ӳ�",
						title: "�� Rater �༭��ҳ�治��ӵ������б�"
					} ),
				]
			}).selectItemByData("preferences"),
			label: "��ӱ༭��ҳ�浽�����б�"
		},
		"resetCache": {
			input: new OO.ui.ButtonWidget( {
				label: "���û���",
				title: "���û������ݣ����а���ά��ר���б��ģ�����",
				flags: ["destructive"]
			} )
		}
	};

	for (let prefName in this.preferences ) {
		if (prefName === "autofillClassFromOres") continue; // l10n
		this.layout.addItems([
			new OO.ui.FieldLayout( this.preferences[prefName].input, {
				label: this.preferences[prefName].label,
				align: "right"
			} )
		]);
	}

	this.preferences.resetCache.input.connect(this, {"click": "onResetCacheClick"});
}
OO.inheritClass( PrefsFormWidget, OO.ui.Widget );

PrefsFormWidget.prototype.setPrefValues = function(prefs) {
	for (let prefName in prefs ) {
		let value = prefs[prefName];
		let input = this.preferences[prefName] && this.preferences[prefName].input;
		switch (input && input.constructor.name) {
		case "OoUiButtonSelectWidget":
			input.selectItemByData(value);
			break;
		case "OoUiNumberInputWidget":
		case "OoUiToggleSwitchWidget":
			input.setValue(value);
			break;
		case "MwWidgetsNamespacesMultiselectWidget":
			input.clearItems();
			value.forEach(ns =>
				input.addTag(
					ns.toString(),
					ns === 0
						? "��Ŀ"
						: config.mw.wgFormattedNamespaces[ns]
				)
			);
			break;
		}
	}
};

PrefsFormWidget.prototype.getPrefs = function() {
	var prefs = {};
	for (let prefName in this.preferences ) {
		let input = this.preferences[prefName].input;
		let value;
		switch (input.constructor.name) {
		case "OoUiButtonSelectWidget":
			value = input.findSelectedItem().getData();
			break;
		case "OoUiToggleSwitchWidget":
			value = input.getValue();
			break;
		case "OoUiNumberInputWidget":
			value = Number(input.getValue()); // widget uses strings, not numbers!
			break;
		case "MwWidgetsNamespacesMultiselectWidget":
			value = input.getValue().map(Number); // widget uses strings, not numbers!
			break;
		}
		prefs[prefName] = value;
	}
	return prefs;
};

PrefsFormWidget.prototype.onResetCacheClick = function() {
	OO.ui.confirm("���û����Rater ���򽫹رղ��������ѽ��е�δ����ĸ��Ľ���������")
		.then(confirmed => {
			if (confirmed) { 
				this.emit("resetCache");
			}
		});
};

export default PrefsFormWidget;
// </nowiki>