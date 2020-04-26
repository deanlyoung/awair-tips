var refreshTime;
var authToken;
var devType;
var devId;
var lang;
var env;
var cardHtml = [];

var loadMoreCard = '<div id="to-be-replaced" class="card-buffer"><div class="cards load-more-card"><div class="load-more-card-body"><a id="go-to-top" href="javascript:myScroll.scrollToElement(document.querySelector(\'#scroller .card-buffer:nth-child(1)\'), 100, 0, 0, IScroll.utils.ease.elastic)">Go to Top</a><a id="load-more" href="" onclick="load_more(); return false;">Load More</a></div></div></div>';

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	//name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

setInterval(getParameterByName, 1000);

authToken = getParameterByName('authToken');
devType = getParameterByName('devType');
devId =  getParameterByName('devId');
lang = getParameterByName('lang') || 'eng';
env = getParameterByName('env');
if (env == 'stg') {
	env = 'stg-'
} else if (env == 'prd') {
	env = ''
} else {
	env = 'stg-'
}

if (refreshTime !== null && refreshTime !== undefined) {
	refreshTime = refreshTime * 1000;
} else {
	refreshTime = 1000;
}

function classToggle(href) {
	var className = href.getAttribute("class");
	if (className == "heart") {
		href.className = "hearted";
	} else {
		href.className = "heart";
	}
	console.log('hearted <3');
};

function request_tips() {
	$.ajax({
		url: 'https://' + env + 'tips.awair.is/v1/users/self/devices/' + devType + '/' + devId + '/tips?lang=' + lang,
		type: 'GET',
		dataType: 'json',
		success: function(json) {
			console.log('success! ' + json.data);
			var data = json.data;
			console.log(data);
			var arrayLength = data.length;
			for (var i = 0; i < arrayLength; i++) {
				var renderFormat = data[i].renderFormat;
				var type = data[i].type;
				var title;
				var link;
				var bg;
				var fontColor;
				var body;
				var cardContent;
				var imageLink;
				var iconUrl;
				var titleColor;
				var iconTitle;
				switch (renderFormat) {
					case 'color-message':
						bg = data[i].bgColor;
						fontColor = data[i].fontColor;
						body = data[i].body;
						cardContent = '<div class="color-message-body">' + body + '</div>';
						break;
					case 'advertisement':
						iconUrl = data[i].iconUrl;
						bgIcon = 'url(\'' + iconUrl + '\') no-repeat left top / 30px 30px';
						iconTitle = data[i].iconTitle;
						titleColor = '#ffffff';
						imageLink = data[i].imageLink;
						bg = 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(\'' + imageLink + '\') no-repeat center / cover';
						title = data[i].title;
						link = data[i].link;
						body = data[i].body;
						cardContent = '<div class="card-header"><span class="sensor-icon" style="background: ' + bgIcon + '"></span><h1 style="color: ' + titleColor + ';">' + iconTitle + '</h1></div><div class="card-ad-header"><a href="' + link + '"><h1 style="color: ' + titleColor + ';">' + title + '</h1></a></div><div class="card-body"><div class="advertisement-body"><div class="text-wrapper">' + body + '</div></div></div><div class="card-cta"><a href="' + link + '">Learn More</a></div>';
						break;
					case 'per-sensor-content':
						bg = '#ffffff';
						fontColor = '#000000';
						iconUrl = data[i].iconUrl;
						bgIcon = 'url(\'' + iconUrl + '\') no-repeat left top / 30px 30px';
						titleColor = data[i].iconTitleColor;
						title = data[i].iconTitle;
						body = data[i].body;
						cardContent = '<div class="card-header"><span class="sensor-icon" style="background: ' + bgIcon + '"></span><h1 style="color: ' + titleColor + ';">' + title + '</h1></div><div class="card-body"><div class="per-sensor-content-body" style="color: ' + fontColor + ';">' + body + '</div></div><div class="interaction"><a class="heart" href="" onclick="classToggle(this); return false;"></a><a class="share" href="" data-clipboard-text="' + body + '"></a></div>';
						break;
					case 'redirectable-content':
						iconUrl = data[i].iconUrl;
						bgIcon = 'url(\'' + iconUrl + '\') no-repeat left top / 30px 30px';
						titleColor = '#ffffff';
						imageLink = data[i].imageLink;
						bg = 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(\'' + imageLink + '\') no-repeat center / cover';
						title = data[i].title;
						link = data[i].link;
						body = data[i].body;
						cardContent = '<div class="card-header"><span class="redirectable-icon" style="background: ' + bgIcon + '"></span></div><div class="card-redirectable-header"><a href="' + link + '"><h1 style="color: ' + titleColor + ';">' + title + '</h1></a></div><div class="card-body"><div class="redirectable-body"><div class="text-wrapper">' + body + '</div></div></div><div class="card-cta"><a href="' + link + '">Learn More</a></div>';
						break;
					default:
						cardContent = 'error: ' + renderFormat;
						break;
				}
				var cardData = '<div class="card-buffer"><div class="cards ' + type + ' ' + renderFormat + '" style="color: ' + fontColor + '; background: ' + bg + ';">' + cardContent + '</div></div>';
				cardHtml.push(cardData);
			}
			
			cardHtml.push(loadMoreCard);
			
			cardHtml.join("");
			$("#card-stream").html(cardHtml);
			
			loaded();
			
			onCompletion();
		},
		error: function(a, b, c) {
			console.log(arguments);
		},
		beforeSend: setHeader
	});
	
	function setHeader(xhr) {
		xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
	}
}

function load_more() {
	var newCardHtml = [];
	$.ajax({
		url: 'https://stg-tips.awair.is/v1/users/self/devices/' + devType + '/' + devId + '/tips?lang=eng',
		type: 'GET',
		dataType: 'json',
		success: function(json) {
			cardHtml.splice(cardHtml.indexOf(loadMoreCard), 1);
			
			console.log('success! ' + json.data);
			var data = json.data;
			console.log(data);
			var arrayLength = data.length;
			for (var i = 0; i < arrayLength; i++) {
				var renderFormat = data[i].renderFormat;
				var type = data[i].type;
				var title;
				var link;
				var bg;
				var fontColor;
				var body;
				var cardContent;
				var imageLink;
				var iconUrl;
				var titleColor;
				var iconTitle;
				switch (renderFormat) {
					case 'color-message':
						bg = data[i].bgColor;
						fontColor = data[i].fontColor;
						body = data[i].body;
						cardContent = '<div class="color-message-body">' + body + '</div>';
						break;
					case 'advertisement':
						iconUrl = data[i].iconUrl;
						bgIcon = 'url(\'' + iconUrl + '\') no-repeat left top / 30px 30px';
						iconTitle = data[i].iconTitle;
						titleColor = '#ffffff';
						imageLink = data[i].imageLink;
						bg = 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(\'' + imageLink + '\') no-repeat center / cover';
						title = data[i].title;
						link = data[i].link;
						body = data[i].body;
						cardContent = '<div class="card-header"><span class="sensor-icon" style="background: ' + bgIcon + '"></span><h1 style="color: ' + titleColor + ';">' + iconTitle + '</h1></div><div class="card-ad-header"><a href="' + link + '"><h1 style="color: ' + titleColor + ';">' + title + '</h1></a></div><div class="card-body"><div class="advertisement-body">' + body + '</div></div><div class="card-cta"><a href="' + link + '">Learn More</a></div>';
						break;
					case 'per-sensor-content':
						bg = '#ffffff';
						fontColor = '#000000';
						iconUrl = data[i].iconUrl;
						bgIcon = 'url(\'' + iconUrl + '\') no-repeat left top / 30px 30px';
						titleColor = data[i].iconTitleColor;
						title = data[i].iconTitle;
						body = data[i].body;
						cardContent = '<div class="card-header"><span class="sensor-icon" style="background: ' + bgIcon + '"></span><h1 style="color: ' + titleColor + ';">' + title + '</h1></div><div class="card-body"><div class="per-sensor-content-body" style="color: ' + fontColor + ';">' + body + '</div></div><div class="interaction"><a class="heart" href="" onclick="classToggle(this); return false;"></a><a class="share" href="" data-clipboard-text="' + body + '"></a></div>';
						break;
					default:
						cardContent = 'error';
				}
				
				if (renderFormat == "color-message") {
					//do nothing
				} else {
					var cardData = '<div class="card-buffer"><div class="cards ' + type + ' ' + renderFormat + '" style="color: ' + fontColor + '; background: ' + bg + ';">' + cardContent + '</div></div>';
					newCardHtml.push(cardData);
				}
			}
			
			newCardHtml.push(loadMoreCard);
			cardHtml.push(newCardHtml);
			
			newCardHtml.join("");
			
			$("#to-be-replaced").replaceWith(newCardHtml);
			
			loaded();
			
			onCompletion();
		},
		error: function(a, b, c) {
			console.log(arguments);
		},
		beforeSend: setHeader
	});
	
	function setHeader(xhr) {
		xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
	}
}