var H = {
	save: function($el, key) {
		this.set(key, $el.value);
	},
	load: function($el, key) {
		$el.value = this.get(key, "");
	},
	set: function(key, value) {
		localStorage.setItem(key, value);
	},
	get: function(key, defaultValue) {
		var val = localStorage.getItem(key);
		if (val == null) {
			val = defaultValue;
		}
		return val;
	},
};
