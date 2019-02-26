var Constants = {
	w: 500,
	h: 500,
	x: 200,
	y: 200
};

var contentURL = '';
//used specifically for Retina screen to get the image's correct size
let ratio = window.devicePixelRatio;

function cropData(str, coords, callback) {
	var img = new Image();

	img.onload = function() {
		var canvas = document.createElement('canvas');
		canvas.width = coords.w;
		canvas.height = coords.h;

		var ctx = canvas.getContext('2d');

		ctx.drawImage(img, coords.x*ratio, coords.y*ratio, coords.w*ratio, coords.h*ratio, 0, 0, coords.w, coords.h);

		callback({dataUri: canvas.toDataURL()});
	};

	img.src = str;
}

function capture(coords) {
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(data) {
		cropData(data, coords, function(data) {
			console.log("Done");
			saveFile(data.dataUri);
		});
	});
}
//shortcut-key to activate screenshot capture
chrome.commands.onCommand.addListener( function(command) {
    if(command === "my-command-name"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "start-screenshots" });
        });
    }
});

//browser action to activate screenshot capture

// chrome.browserAction.onClicked.addListener(function(tab) {
//     contentURL = tab.url;
//
// 		sendMessage({type: 'start-screenshots'}, tab);
//
// });


chrome.extension.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
	if (request.type == "coords")
		capture(request.coords);

	sendResponse({});
}

function sendMessage(msg, tab) {
	console.log('sending message');

	chrome.tabs.sendMessage(tab.id, msg, function(response) {});
};

function saveFile(dataURI) {
	download(dataURI, "test.png", "image/plain");
}
