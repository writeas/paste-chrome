function publish(content, font) {
	var http = new XMLHttpRequest();
	var url = "https://write.as/api/";
	var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = lang.substring(0, 2);
	var params = "w=" + encodeURIComponent(content) + "&font=" + font + "&lang=" + lang;
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4) {
			if (http.status == 200) {
				data = http.responseText.split("\n");
				// Pull out data parts
				url = data[0];
				id = url.substr(url.lastIndexOf("/")+1);
				editToken = data[1];
				
				// Save the data
				posts = JSON.parse(H.get('posts', '[]'));
				posts.push(H.createPost(id, editToken, content));
				H.set('posts', JSON.stringify(posts));
				
				// Launch post
				chrome.tabs.create({ url: url });
			} else {
				alert("Failed to post. Please try again.");
			}
		}
	}
	http.send(params);
}

function getSelectedText(callback) {
	// Workaround since info.selectionText in context menu click handler doesn't
	// preserve newlines.
	// Source: https://code.google.com/p/chromium/issues/detail?id=116429#c11
	chrome.tabs.executeScript({
		code: "window.getSelection().toString();"
	}, function(selection) {
		callback(selection[0]);
	});
}

chrome.contextMenus.create({"title": "Publish text (sans)", "contexts": ["selection", "editable", "link"], "onclick": function(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "sans");
	});
}
});
chrome.contextMenus.create({"title": "Publish text (serif)", "contexts": ["selection", "editable", "link"], "onclick": function(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "norm");
	});
}
});
chrome.contextMenus.create({"title": "Publish code", "contexts": ["selection", "editable", "link"], "onclick": function(info, tab) {
	getSelectedText(function(sel) {
		publish(sel, "code");
	});
}
});
