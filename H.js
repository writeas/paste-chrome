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
	createPost: function(id, editToken, content, created) {
		var summaryLen = 200;
		var titleLen = 80;
		var getPostMeta = function(content) {
			var eol = content.indexOf("\n");
			if (content.indexOf("# ") === 0) {
				// Title is in the format:
				//
				//   # Some title
				var summary = content.substring(eol).trim();
				if (summary.length > summaryLen) {
					summary = summary.substring(0, summaryLen) + "...";
				}
				return {
					title: content.substring("# ".length, eol),
					summary: summary,
				};
			}

			var blankLine = content.indexOf("\n\n");
			if (blankLine !== -1 && blankLine <= eol && blankLine <= titleLen) {
				// Title is in the format:
				//
				//   Some title
				//
				//   The body starts after that blank line above it.
				var summary = content.substring(blankLine).trim();
				if (summary.length > summaryLen) {
					summary = summary.substring(0, summaryLen) + "...";
				}
				return {
					title: content.substring(0, blankLine),
					summary: summary,
				};
			}

			var title = content.trim();
			var summary = "";
			if (title.length > titleLen) {
				// Content can't fit in the title, so figure out the summary
				summary = title;
				title = "";
				if (summary.length > summaryLen) {
					summary = summary.substring(0, summaryLen) + "...";
				}
			} else if (eol > 0) {
				title = title.substring(0, eol);
			}
			return {
				title: title,
				summary: summary
			};
		};
		
		var post = getPostMeta(content);
		post.id = id;
		post.token = editToken;
		post.created = created ? new Date(created) : new Date();
		post.client = "Chrome";
		
		return post;
	},
	getTitleStrict: function(content) {
		var eol = content.indexOf("\n");
		var title = "";
		var newContent = content;
		if (content.indexOf("# ") === 0) {
			// Title is in the format:
			// # Some title
			if (eol !== -1) {
				// First line should start with # and end with \n
				newContent = content.substring(eol).leftTrim();
				title = content.substring("# ".length, eol);
			}
		}
		return {
			title: title,
			content: newContent
		};
	},
};
