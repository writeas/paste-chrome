function publish(content, font) {
	if (content.trim() == "") {
		return;
	}

	var post = H.getTitleStrict(content);
	var http = new XMLHttpRequest();
	var url = "https://write.as/api/posts";
	var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = lang.substring(0, 2);
	var params = "body=" + encodeURIComponent(post.content) + "&title=" + encodeURIComponent(post.title) + "&font=" + font + "&lang=" + lang + "&rtl=auto";
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4) {
			if (http.status == 201) {
				data = JSON.parse(http.responseText);
				// Pull out data parts
				id = data.data.id;
				url = "https://write.as/"+id;
				editToken = data.data.token;
				
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
chrome.runtime.onMessageExternal.addListener(function(req, sender, callback) {
	if (req) {
		if (req.msg) {
			if (req.msg == "ping") {
				callback("pong");
			} else if (req.msg == "posts") {
				callback(JSON.parse(H.get('posts', '[]')));
			} else if (req.msg == "deletePosts" && req.data && req.data.length > 0) {
				// Delete all posts listed in req.data, an array of post IDs.
				var posts = JSON.parse(H.get('posts', '[]'));
				var exportedPosts = [];

				for (var i=0; i<req.data.length; i++) {
					for (var j=0; j<posts.length; j++) {
						if (posts[j].id === req.data[i]) {
							console.log("Removing post " + req.data[i]);
							exportedPosts.push(posts.splice(j, 1));
						}
					}
				}

				if (exportedPosts.length > 0) {
					H.set('posts', JSON.stringify(posts));
					H.set('exportedPosts', JSON.stringify(exportedPosts));
				}
			}
		}
	}
	return true;
});
