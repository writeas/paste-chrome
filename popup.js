var $content;
var $publish;
var $url;

function publish(content, font) {
	if (content.trim() == "") {
		return;
	}
	
	$publish.classList.add('disabled');
	$publish.value = "Publishing...";
	$publish.disabled = true;
		
	var http = new XMLHttpRequest();
	var url = "https://write.as/api/";
	var params = "w=" + encodeURIComponent(content) + "&font=" + font;
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (http.readyState == 4) {
			$publish.classList.remove('disabled');
			$publish.value = "Publish";
			$publish.disabled = false;
			
			if (http.status == 200) {
				$publish.style.display = 'none';

				data = http.responseText.split("\n");
				// Pull out data parts
				url = data[0];
				id = url.substr(url.lastIndexOf("/")+1);
				editToken = data[1];

				document.getElementById("publish-holder").style.display = 'none';
				document.getElementById("result-holder").style.display = 'inline';
								
				$url = document.getElementById("url");
				$url.value = url;
				var $urlLink = document.getElementById("url-link");
				$urlLink.href = url;

				// Save the data
				posts = JSON.parse(H.get('posts', '[]'));
				posts.push({id: id, token: editToken});
				H.set('posts', JSON.stringify(posts));
			} else {
				alert("Failed to post. Please try again.");
			}
		}
	}
	http.send(params);
}

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

document.addEventListener('DOMContentLoaded', function() {
	$content = document.getElementById("content");
	$publish = document.getElementById("publish");
	$url = document.getElementById("url");
	var fontRadios = document.postForm.font;
	
	chrome.tabs.executeScript({
	  code: "window.getSelection().toString();"
	}, function(selection) {
	  if (typeof selection !== 'undefined') {
	    $content.value = selection[0];
	  }
	  // load previous draft
	  if ($content.value == "") {
	    H.load($content, 'ext-draft');
	  }
	});
	
	// focus on the paste field
	$content.focus();
	
	// bind publish action
	$publish.addEventListener('click', function(e) {
		e.preventDefault();
		publish($content.value, fontRadios.value);
	});
	$content.addEventListener('keydown', function(e){
		if (e.ctrlKey && e.keyCode == 13) {
			e.preventDefault();
			publish($content.value, fontRadios.value);
		}
	});
	
	// bind URL select-all action
	$url.addEventListener('focus', function(e) {
		e.preventDefault();
		this.select();
	});
	
	// load font setting
	H.load(fontRadios, 'font');
	$content.className = fontRadios.value;
	// bind font changing action
	for(var i = 0; i < fontRadios.length; i++) {
		fontRadios[i].onclick = function() {
		    $content.className = this.value;
		    H.save(fontRadios, 'font');
		};
	}
});
