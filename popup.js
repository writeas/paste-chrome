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
	var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = lang.substring(0, 2);
	var params = "w=" + encodeURIComponent(content) + "&font=" + font + "&lang=" + lang;
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
				posts.push(H.createPost(id, editToken, content));
				H.set('posts', JSON.stringify(posts));
			} else {
				alert("Failed to post. Please try again.");
			}
		}
	}
	http.send(params);
}

document.addEventListener('DOMContentLoaded', function() {
	$content = document.getElementById("content");
	$publish = document.getElementById("publish");
	$url = document.getElementById("url");
	var fontRadios = document.postForm.font;
	var isPopout = window.location.search.substring(1) == "popout";

	if (isPopout) {
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			$content.value = request.msg;
		});
	}
	
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
	
	if (isPopout) {
		document.body.className = 'popout';
	} else {
		document.getElementById('popout').addEventListener('click', function(e) {
			e.preventDefault();
			chrome.windows.create({
				url: "popup.html?popout",
				width: 640,
				height: 400,
				focused: true,
				type: "popup"
			}, function(window) {
				chrome.runtime.sendMessage({msg: $content.value});
			});
		});
	}

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
