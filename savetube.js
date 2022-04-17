// ==UserScript==
// @name            SaveYouTube
// @version         9021.12.16
// @description     Download videos from video sharing web sites.
// @author          sebaro
// @namespace       http://sebaro.pro/savetube
// @downloadURL     https://gitlab.com/sebaro/savetube/raw/master/savetube.user.js
// @updateURL       https://gitlab.com/sebaro/savetube/raw/master/savetube.user.js
// @icon            https://gitlab.com/sebaro/savetube/raw/master/savetube.png
// @include         http://youtube.com*
// @include         http://www.youtube.com*
// @include         https://youtube.com*
// @include         https://www.youtube.com*
// @include         http://m.youtube.com*
// @include         https://m.youtube.com*
// @include         http://dailymotion.com*
// @include         http://www.dailymotion.com*
// @include         https://dailymotion.com*
// @include         https://www.dailymotion.com*
// @include         http://vimeo.com*
// @include         http://www.vimeo.com*
// @include         https://vimeo.com*
// @include         https://www.vimeo.com*
// @include         http://veoh.com*
// @include         http://www.veoh.com*
// @include         https://veoh.com*
// @include         https://www.veoh.com*
// @include         http://imdb.com*
// @include         http://www.imdb.com*
// @include         https://imdb.com*
// @include         https://www.imdb.com*
// @noframes
// @grant           none
// @run-at          document-end
// ==/UserScript==


/*

	Copyright (C) 2010 - 2021 Sebastian Luncan

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Website: http://sebaro.pro/savetube
	Contact: http://sebaro.pro/contact

*/


(function() {


// Don't run on frames or iframes
if (window.top != window.self) return;


// ==========Variables========== //

// Userscript
var userscript = 'SaveTube';
var website = 'http://sebaro.pro/savetube';
var contact = 'http://sebaro.pro/contact';

// Page
var page = {win: window, doc: window.document, body: window.document.body, url: window.location.href, site: window.location.hostname.match(/([^.]+)\.[^.]+$/)[1]};

// Saver
var saver = {};
var panelHeight = 30;

// Features/Options
var feature = {'definition': true, 'container': true, 'openpagelink': true, 'autosave': true, 'savedash': false, 'showsavelink': true};
var option = {'definition': 'High Definition', 'container': 'MP4', 'openpagelink': false, 'autosave': false, 'savedash': false, 'showsavelink': false, 'hidden': false};

// Media
var mediatypes = {'MP4': 'video/mp4', 'WebM': 'video/webm', 'M3U8': 'application/x-mpegURL', 'WebVTT': 'text/vtt'};

// Sources
var sources = {};


// ==========Functions========== //

function createMyElement(type, properties, event, listener) {
	var obj = page.doc.createElement(type);
	for (var propertykey in properties) {
		if (propertykey == 'target') obj.setAttribute('target', properties[propertykey]);
		else obj[propertykey] = properties[propertykey];
	}
	if (event && listener) {
		obj.addEventListener(event, listener, false);
	}
	return obj;
}

function modifyMyElement(obj, properties, event, listener) {
	for (var propertykey in properties) {
		if (propertykey == 'target') obj.setAttribute('target', properties[propertykey]);
		else obj[propertykey] = properties[propertykey];
	}
	if (event && listener) {
		obj.addEventListener(event, listener, false);
	}
}

function styleMyElement(obj, styles) {
	for (var stylekey in styles) {
		obj.style[stylekey] = styles[stylekey];
	}
}

function cleanMyElement(obj, hide) {
	if (hide) {
		for (var i = 0; i < obj.children.length; i++) {
			styleMyElement(obj.children[i], {display: 'none'});
		}
	}
	else {
		if (obj.hasChildNodes()) {
			while (obj.childNodes.length >= 1) {
				obj.removeChild(obj.firstChild);
			}
		}
	}
}

function getMyElement(obj, type, from, value, child, content) {
	var getObj, chObj, coObj;
	var pObj = (!obj) ? page.doc : obj;
	if (type == 'body') {
		getObj = pObj.body;
	}
	else {
		if (from == 'id') getObj = pObj.getElementById(value);
		else if (from == 'class') getObj = pObj.getElementsByClassName(value);
		else if (from == 'tag') getObj = pObj.getElementsByTagName(type);
		else if (from == 'ns') {
			if (pObj.getElementsByTagNameNS) getObj = pObj.getElementsByTagNameNS(value, type);
		}
		else if (from == 'query') {
			if (child > 0) {
				if (pObj.querySelectorAll) getObj = pObj.querySelectorAll(value);
			}
			else {
				if (pObj.querySelector)	getObj = pObj.querySelector(value);
			}
		}
	}
	chObj = (getObj && child >= 0) ? getObj[child] : getObj;
	if (content && chObj) {
		if (type == 'html' || type == 'body' || type == 'div' || type == 'option') coObj = chObj.innerHTML;
		else if (type == 'object') coObj = chObj.data;
		else if (type == 'img' || type == 'video' || type == 'embed') coObj = chObj.src;
		else coObj = chObj.textContent;
		return coObj;
	}
	else {
		return chObj;
	}
}

function appendMyElement(parent, child) {
	parent.appendChild(child);
}

function removeMyElement(parent, child) {
	parent.removeChild(child);
}

function replaceMyElement(parent, orphan, child) {
	parent.replaceChild(orphan, child);
}

function cleanMyContent(content, unesc, extra) {
	if (unesc) content = unescape(content);
	content = content.replace(/\\u0025/g, '%');
	content = content.replace(/\\u0026/g, '&');
	content = content.replace(/\\u002F/g, '/');
	content = content.replace(/\\/g, '');
	content = content.replace(/\n/g, '');
	if (extra) {
		content = content.replace(/&quot;/g, '\'').replace(/&#34;/g, '\'').replace(/&#034;/g, '\'').replace(/"/g, '\'');
		content = content.replace(/&#39;/g, '\'').replace(/&#039;/g, '\'').replace(/'/g, '\'');
		content = content.replace(/&amp;/g, 'and').replace(/&/g, 'and');
		content = content.replace(/[\/\|]/g, '-');
		content = content.replace(/[#:\*\?]/g, '');
		content = content.replace(/^\s+|\s+$/, '').replace(/\.+$/g, '');
	}
	return content;
}

function parseMyContent(content, pattern) {
	var parse, response;
	content = content.replace(/(\r\n|\n|\r)/gm, '');
	parse = content.match(pattern);
	if (parse) {
		response = (/g$/.test(pattern)) ? parse : parse[1];
	}
	return response;
}

function getMyContent(url, pattern) {
	var urle, data, xhr, response;
	if (url.indexOf('|') != -1) {
		data = url.split('|')[1];
		url = url.split('|')[0];
	}
	if (data) {
		urle = btoa(data);
		if (!sources[urle]) {
			console.log('ViewTube: POST [' + pattern + '] ' + url);
			xhr = new XMLHttpRequest();
			xhr.open('POST', url, false);
			if (data.indexOf('{') != -1) {
				xhr.setRequestHeader('Content-Type', 'application/json');
			}
			else {
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
			xhr.send(data);
			sources[urle] = (xhr.responseText) ? xhr.responseText : xhr.responseXML;
		}
	}
	else {
		urle = btoa(url);
		if (!sources[urle]) {
			console.log('ViewTube: GET [' + pattern + '] ' + url);
			xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send();
			sources[urle] = (xhr.responseText) ? xhr.responseText : xhr.responseXML;
		}
	}
	if (sources[urle]) {
		response = sources[urle];
		if (pattern) {
			response = parseMyContent(response, pattern);
		}
	}
	return response;
}

function createMySaver() {
	/* The Panel */
	saver['saverPanel'] = createMyElement('div');
	styleMyElement(saver['saverPanel'], {position: 'fixed', fontFamily: 'sans-serif', fontSize: '10px', minHeight: panelHeight + 'px', lineHeight: panelHeight + 'px', backgroundColor: '#FFFFFF', padding: '0px 10px 5px 10px', bottom: '0px', right: '25px', zIndex: '2000000000', borderTop: '1px solid #CCCCCC', borderLeft: '1px solid #CCCCCC', borderRight: '1px solid #CCCCCC', borderRadius: '5px 5px 0px 0px', textAlign: 'center', boxSizing: 'content-box'});
	appendMyElement(page.body, saver['saverPanel']);

	/* Panel Hide/Show Toggle Button */
	saver['buttonHide'] = createMyElement('div', {title: '{Hide/Show: click to hide/show this panel}'}, 'click', function() {
		toggleMySaver();
	});
	styleMyElement(saver['buttonHide'], {width: '0px', height: '0px', display: 'inline-block', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '15px solid #777777', borderRight: '0px solid #777777', lineHeight: 'normal', verticalAlign: 'middle', marginLeft: '5px', marginRight: '10px', cursor: 'pointer', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['buttonHide']);

	/* Panel Logo */
	saver['panelLogo'] = createMyElement('div', {title: '{SaveTube: click to visit the script wesite}', textContent: userscript}, 'click', function() {
		page.win.location.href = website;
	});
	styleMyElement(saver['panelLogo'], {display: 'inline-block', color: '#32D132', fontSize: '14px', fontWeight: 'bold', border: '1px solid #32D132', borderRadius: '3px', padding: '0px 4px', marginRight: '10px', lineHeight: 'normal', verticalAlign: 'middle', cursor: 'pointer', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['panelLogo']);

	/* Warnings */
	if (saver['warnMess']) {
		saver['saverMessage'] = createMyElement('div');
		styleMyElement(saver['saverMessage'], {display: 'inline-block', fontSize: '12px', color: '#AD0000'});
		appendMyElement(saver['saverPanel'], saver['saverMessage']);
		if (saver['warnContent']) showMyMessage(saver['warnMess'], saver['warnContent']);
		else showMyMessage(saver['warnMess']);
		return;
	}

	/* Panel Video Menu */
	saver['videoMenu'] = createMyElement('select', {title: '{Videos: select the video format for download}'}, 'change', function() {
		saver['videoSave'] = this.value;
		if (saver['isShowingLink']) {
			cleanMyElement(saver['buttonSaveLink'], false);
			saver['isShowingLink'] = false;
		}
		if (option['autosave']) {
			saveMyVideo();
		}
	});
	styleMyElement(saver['videoMenu'], {display: 'inline-block', width: 'auto', height: '20px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold', padding: '0px 3px', overflow: 'hidden', border: '1px solid #CCCCCC', color: '#777777', backgroundColor: '#FFFFFF', lineHeight: 'normal', verticalAlign: 'middle', cursor: 'pointer', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['videoMenu']);
	if (feature['openpagelink']) {
		saver['videoList']['Page Link'] = page.url;
	}
	var videosProgressive = [];
	var videosAdaptiveHLS = [];
	var videosAdaptiveDASHVideo = [];
	var videosAdaptiveDASHAudio = [];
	var videosAdaptiveDASHMuxed = [];
	var videosExtra = [];
	for (var videoCode in saver['videoList']) {
		if (videoCode.indexOf('Video') != -1) videosAdaptiveDASHVideo.push(videoCode);
		else if (videoCode.indexOf('Audio') != -1) videosAdaptiveDASHAudio.push(videoCode);
		else if (saver['videoList'][videoCode] == 'DASH') videosAdaptiveDASHMuxed.push(videoCode);
		else if (videoCode.indexOf('M3U8') != -1) videosAdaptiveHLS.push(videoCode);
		else if (videoCode.indexOf('MP4') != -1 || videoCode.indexOf('WebM') != -1) videosProgressive.push(videoCode);
		else videosExtra.push(videoCode);
	}
	if (videosProgressive.length > 0) {
		for (var i = 0; i < videosProgressive.length; i++) {
			saver['videoItem'] = createMyElement('option', {value: videosProgressive[i], textContent: videosProgressive[i]});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(saver['videoMenu'], saver['videoItem']);
		}
	}
	if (videosAdaptiveHLS.length > 0) {
		saver['videoItem'] = createMyElement('option', {value: 'HLS', textContent: 'HLS'});
		styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', color: '#FF0000'});
		saver['videoItem'].disabled = 'disabled';
		appendMyElement(saver['videoMenu'], saver['videoItem']);
		for (var i = 0; i < videosAdaptiveHLS.length; i++) {
			saver['videoItem'] = createMyElement('option', {value: videosAdaptiveHLS[i], textContent: videosAdaptiveHLS[i]});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(saver['videoMenu'], saver['videoItem']);
		}
	}
	if (videosAdaptiveDASHVideo.length > 0) {
		saver['videoItem'] = createMyElement('option', {value: 'DASH (Video Only)', textContent: 'DASH (Video Only)'});
		styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', color: '#FF0000'});
		saver['videoItem'].disabled = 'disabled';
		appendMyElement(saver['videoMenu'], saver['videoItem']);
		for (var i = 0; i < videosAdaptiveDASHVideo.length; i++) {
			saver['videoItem'] = createMyElement('option', {value: videosAdaptiveDASHVideo[i], textContent: videosAdaptiveDASHVideo[i]});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(saver['videoMenu'], saver['videoItem']);
		}
	}
	if (videosAdaptiveDASHAudio.length > 0) {
		saver['videoItem'] = createMyElement('option', {value: 'DASH (Audio Only)', textContent: 'DASH (Audio Only)'});
		styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', color: '#FF0000'});
		saver['videoItem'].disabled = 'disabled';
		appendMyElement(saver['videoMenu'], saver['videoItem']);
		for (var i = 0; i < videosAdaptiveDASHAudio.length; i++) {
			saver['videoItem'] = createMyElement('option', {value: videosAdaptiveDASHAudio[i], textContent: videosAdaptiveDASHAudio[i]});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(saver['videoMenu'], saver['videoItem']);
		}
	}
	if (videosAdaptiveDASHMuxed.length > 0) {
		feature['savedash'] = true;
		if (option['savedash']) {
			saver['videoItem'] = createMyElement('option', {value: 'DASH (Video With Audio)', textContent: 'DASH (Video With Audio)'});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', color: '#FF0000'});
			saver['videoItem'].disabled = 'disabled';
			appendMyElement(saver['videoMenu'], saver['videoItem']);
			for (var i = 0; i < videosAdaptiveDASHMuxed.length; i++) {
				saver['videoItem'] = createMyElement('option', {value: videosAdaptiveDASHMuxed[i], textContent: videosAdaptiveDASHMuxed[i]});
				styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
				appendMyElement(saver['videoMenu'], saver['videoItem']);
			}
		}
		else {
			for (var videoCode in saver['videoList']) {
				if (saver['videoList'][videoCode] == 'DASH') delete saver['videoList'][videoCode];
			}
		}
	}
	if (videosExtra.length > 0) {
		saver['videoItem'] = createMyElement('option', {value: 'Extra', textContent: 'Extra'});
		styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', color: '#FF0000'});
		saver['videoItem'].disabled = 'disabled';
		appendMyElement(saver['videoMenu'], saver['videoItem']);
		for (var i = 0; i < videosExtra.length; i++) {
			saver['videoItem'] = createMyElement('option', {value: videosExtra[i], textContent: videosExtra[i]});
			styleMyElement(saver['videoItem'], {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(saver['videoMenu'], saver['videoItem']);
		}
	}

	/* Panel Options Button */
	saver['buttonOptions'] = createMyElement('div', {title: '{Options: click to show the available options}'}, 'click', function() {
		if (saver['showsOptions']) {
			saver['showsOptions'] = false;
			styleMyElement(saver['optionsContent'], {display: 'none'})
		}
		else {
			saver['showsOptions'] = true;
			styleMyElement(saver['optionsContent'], {display: 'block'})
		}
	});
	styleMyElement(saver['buttonOptions'], {width: '1px', height: '14px', display: 'inline-block', paddingTop: '3px', borderLeft: '3px dotted #777777', lineHeight: 'normal', verticalAlign: 'middle', marginLeft: '20px', cursor: 'pointer', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['buttonOptions']);

	/* Panel Save Button */
	saver['buttonSave'] = createMyElement('div', {title: '{Save: click to download the selected video format}'}, 'click', function() {
		saveMyVideo();
	});
	styleMyElement(saver['buttonSave'], {width: '0px', height: '0px', display: 'inline-block', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '15px solid #777777', borderBottom: '0px solid #777777', lineHeight: 'normal', verticalAlign: 'middle', marginTop: '2px', marginLeft: '20px', cursor: 'pointer', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['buttonSave']);

	/* Panel Save Button Link */
	saver['buttonSaveLink'] = createMyElement('div', {title: '{Save: right click & save as to download the selected video format}'});
	styleMyElement(saver['buttonSaveLink'], {display: 'inline-block', color: '#777777', fontSize: '14px', fontWeight: 'bold', lineHeight: 'normal', verticalAlign: 'middle', marginLeft: '5px', marginBottom: '2px', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['buttonSaveLink']);

	/* Disable Features */
	if (saver['videoDefinitions'].length < 2) feature['definition'] = false;
	if (saver['videoContainers'].length < 2) feature['container'] = false;

	/* Select The Video */
	if (feature['definition'] || feature['container'] || feature['openpagelink']) {
		if (!option['definition'] || saver['videoDefinitions'].indexOf(option['definition']) == -1) option['definition'] = saver['videoSave'].replace(/Definition.*/, 'Definition');
		if (!option['container'] || saver['videoContainers'].indexOf(option['container']) == -1) option['container'] = saver['videoSave'].replace(/.*\s/, '');
		selectMyVideo();
	}

	/* Save The Video On Autosave */
	if (option['autosave']) saveMyVideo();

	/* Panel Options */
	saver['optionsContent'] = createMyElement('div');
	styleMyElement(saver['optionsContent'], {display: 'none', fontSize: '14px', fontWeight: 'bold', padding: '10px', textAlign: 'center', boxSizing: 'content-box'});
	appendMyElement(saver['saverPanel'], saver['optionsContent']);

	/* Options Object => option: [label, options, new line, change video] */
	var options = {
		'definition': ['Definition', saver['videoDefinitions'], true, true],
		'container': ['Container', saver['videoContainers'], false, true],
		'openpagelink': ['Open Page Link', ['On', 'Off'], true, true],
		'autosave': ['Autosave', ['On', 'Off'], true, true],
		'showsavelink': ['Show Save Link', ['On', 'Off'], false, true],
		'savedash': ['Save DASH (Video With Audio)', ['On', 'Off'], true, false]
	};

	/* Options */
	var optionsBox, optionBox, optionLabel, optionMenu, optionMenuItem;
	for (var o in options) {
		if (feature[o] === false) continue;
		if (options[o][2]) {
			optionsBox = createMyElement('div');
			styleMyElement(optionsBox, {display: 'block', padding: '5px 0px 5px 0px'});
			appendMyElement(saver['optionsContent'], optionsBox);
		}
		optionBox = createMyElement('div');
		styleMyElement(optionBox, {display: 'inline-block'});
		optionLabel = createMyElement('div', {textContent: options[o][0]});
		styleMyElement(optionLabel, {display: 'inline-block', color: '#777777', marginRight: '10px', verticalAlign: 'middle'});
		optionMenu = createMyElement('select', {id: 'savetube-option-' + o}, 'change', function() {
			var id = this.id.replace('savetube-option-', '');
			if (this.value == 'On' || this.value == 'Off') {
				option[id] = (this.value == 'On') ? true : false;
			}
			else {
				option[id] = this.value;
			}
			setMyOptions(id, option[id]);
			if (options[id][3]) {
				if (saver['isShowingLink']) {
					cleanMyElement(saver['buttonSaveLink'], false);
					saver['isShowingLink'] = false;
				}
				selectMyVideo();
				if (option['autosave']) {
					saveMyVideo();
				}
			}
		});
		styleMyElement(optionMenu, {display: 'inline-block', width: 'auto', height: '20px', color: '#777777', backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold', marginRight: '10px', verticalAlign: 'middle'});
		appendMyElement(optionBox, optionLabel);
		appendMyElement(optionBox, optionMenu);
		appendMyElement(optionsBox, optionBox);
		for (var i = 0; i < options[o][1].length; i++) {
			optionMenuItem = createMyElement('option', {value: options[o][1][i], textContent: options[o][1][i]});
			styleMyElement(optionMenuItem, {fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'});
			appendMyElement(optionMenu, optionMenuItem);
		}
		if (optionMenu.value == 'On' || optionMenu.value == 'Off') {
			if (option[o]) optionMenu.value = 'On';
			else optionMenu.value = 'Off';
		}
		else {
			optionMenu.value = option[o];
		}
	}

	/* Hide */
	if (option['hidden']) {
		toggleMySaver('hide');
	}
}

function toggleMySaver(toggle) {
	if (toggle == 'hide') {
		styleMyElement(saver['saverPanel'], {right: '-' + (saver['saverPanel'].offsetWidth - 40) + 'px', backgroundColor: 'transparent', borderColor: '#777777'});
		styleMyElement(saver['buttonHide'], {borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '0px solid #777777', borderRight: '15px solid #777777'});
	}
	else {
		if (option['hidden']) {
			styleMyElement(saver['saverPanel'], {right: '25px', backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', transition: 'right 2s, background-color 5s, border-color 5s'});
			styleMyElement(saver['buttonHide'], {borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '15px solid #777777', borderRight: '0px solid #777777'});
			option['hidden'] = false;
		}
		else {
			styleMyElement(saver['saverPanel'], {right: '-' + (saver['saverPanel'].offsetWidth - 40) + 'px', backgroundColor: 'transparent', borderColor: '#777777', transition: 'right 2s, background-color 5s, border-color 5s'});
			styleMyElement(saver['buttonHide'], {borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '0px solid #777777', borderRight: '15px solid #777777'});
			option['hidden'] = true;
		}
		setMyOptions('hidden', option['hidden']);
	}
}

function setMyOptions(key, value) {
	key = page.site + '_' + userscript.toLowerCase() + '_' + key;
	try {
		localStorage.setItem(key, value);
		if (localStorage.getItem(key) == value) return;
		else throw false;
	}
	catch(e) {
		var date = new Date();
		date.setTime(date.getTime() + (356*24*60*60*1000));
		var expires = '; expires=' + date.toGMTString();
		page.doc.cookie = key + '=' + value + expires + '; path=/';
	}
}

function getMyOptions() {
	for (var opt in option) {
		var key = page.site + '_' + userscript.toLowerCase() + '_' + opt;
		try {
			if (localStorage.getItem(key)) {
				option[opt] = localStorage.getItem(key);
				continue;
			}
			else throw false;
		}
		catch(e) {
			var cookies = page.doc.cookie.split(';');
			for (var i=0; i < cookies.length; i++) {
				var cookie = cookies[i];
				while (cookie.charAt(0) == ' ') cookie = cookie.substring(1, cookie.length);
				option[opt] = (cookie.indexOf(key) == 0) ? cookie.substring(key.length + 1, cookie.length) : option[opt];
			}
		}
	}
	var boolOptions = ['openpagelink', 'autosave', 'showsavelink', 'savedash', 'hidden'];
	for (var i = 0; i < boolOptions.length; i++) {
		option[boolOptions[i]] = (option[boolOptions[i]] === true || option[boolOptions[i]] == 'true') ? true : false;
	}
}

function selectMyVideo() {
	if (option['openpagelink']) {
		saver['videoSave'] = 'Page Link';
	}
	else {
		var vdoCont = (option['container'] != 'Any') ? [option['container']] : saver['videoContainers'];
		var vdoDef = saver['videoDefinitions'];
		var vdoList = {};
		for (var vC = 0; vC < vdoCont.length; vC++) {
			if (vdoCont[vC] != 'Any') {
				for (var vD = 0; vD < vdoDef.length; vD++) {
					var format = vdoDef[vD] + ' ' + vdoCont[vC];
					if (!vdoList[vdoDef[vD]]) {
						for (var vL in saver['videoList']) {
							if (vL == format) {
								vdoList[vdoDef[vD]] = vL;
								break;
							}
						}
					}
				}
			}
		}
		var vdoDef2 = [];
		var keepDef = false;
		for (var vD = 0; vD < vdoDef.length; vD++) {
			if (vdoDef[vD] == option['definition'] && keepDef == false) keepDef = true;
			if (keepDef == true) vdoDef2.push(vdoDef[vD])
		}
		for (var vD = 0; vD < vdoDef2.length; vD++) {
			if (vdoList[vdoDef2[vD]]) {
				saver['videoSave'] = vdoList[vdoDef2[vD]];
				break;
			}
		}
	}
	saver['videoMenu'].value = saver['videoSave'];
}

function saveMyVideo() {
	var vdoURL = saver['videoList'][saver['videoSave']];
	var vdoDef = ' (' + saver['videoSave'].split(' ').slice(0, -1).join('').match(/[A-Z]/g).join('') + ')';
	var vdoExt = saver['videoSave'].split(' ').slice(-1).join('');
	var vdoTle = (saver['videoTitle']) ? saver['videoTitle'] : page.url.replace(/https?:\/\//, '').replace(/[^0-9a-zA-Z]/g, '-');
	if (saver['videoSave'] == 'Page Link' || vdoURL == 'DASH' || (vdoExt == 'M3U8' && !option['showsavelink'])) {
		var vdoV, vdoA;
		if (saver['videoSave'] == 'Page Link' || vdoExt == 'M3U8') {
			vdoV = vdoURL;
			vdoA = '';
			vdoDef = '';
		}
		else {
			if (saver['videoSave'].indexOf('MP4') != -1) {
				vdoV = saver['videoList'][saver['videoSave'].replace('MP4', 'Video MP4')];
				vdoA = saver['videoList']['Medium Bitrate Audio MP4'] || saver['videoList'][saver['videoSave'].replace('MP4', 'Audio MP4')];
			}
			else {
				vdoV = saver['videoList'][saver['videoSave'].replace('WebM', 'Video WebM')];
				vdoA = saver['videoList']['High Bitrate Audio WebM'] || saver['videoList']['Medium Bitrate Audio WebM'] || saver['videoList']['Medium Bitrate Audio MP4'];
			}
		}
		var vdoT = vdoTle + vdoDef;
		page.win.location.href = 'savetube:' + vdoT + 'SEPARATOR' + vdoV + 'SEPARATOR' + vdoA;
	}
	else {
		var vdoLnk = createMyElement('a', {href: vdoURL, target: '_blank', textContent: '[Link]'});
		styleMyElement(vdoLnk, {color: '#777777', textDecoration: 'underline'});
		var vdoT = vdoTle + vdoDef;
		if (option['showsavelink'] || vdoExt == 'M3U8') {
			appendMyElement(saver['buttonSaveLink'], vdoLnk);
			saver['isShowingLink'] = true;
			if (page.site == 'youtube' && saver['videoSave'] == 'High Definition MP4') {
				if (!page.win.URL || !page.win.URL.createObjectURL) {
					page.win.location.href = vdoURL + '&title=' + vdoT;
				}
			}
		}
		else {
			if (!saver['isSaving']) {
				if (page.site == 'youtube' && saver['videoSave'] == 'High Definition MP4') {
					page.win.location.href = vdoURL + '&title=' + vdoT;
				}
				else {
					if (page.win.URL && page.win.URL.createObjectURL) {
						saver['isSaving'] = true;
						styleMyElement(saver['buttonSave'], {borderBottomWidth: '1px', cursor: 'none'});
						var vdoLnkBlob, vdoBlob, vdoBlobLnk;
						vdoLnkBlob = createMyElement('a');
						styleMyElement(vdoLnkBlob, {display: 'none'});
						appendMyElement(page.body, vdoLnkBlob);
						var XHRequest = new XMLHttpRequest();
						XHRequest.open('GET', vdoURL);
						XHRequest.responseType = 'arraybuffer';
						XHRequest.onload = function() {
							if (this.status === 200 && this.response) {
								vdoBlob = new Blob([this.response], {type: mediatypes[vdoExt]});
								vdoBlobLnk = page.win.URL.createObjectURL(vdoBlob);
								modifyMyElement(vdoLnkBlob, {href: vdoBlobLnk, target: '_blank', download: vdoT + '.' + vdoExt.toLowerCase()});
								vdoLnkBlob.click();
								page.win.URL.revokeObjectURL(vdoBlobLnk);
								removeMyElement(page.body, vdoLnkBlob);
								saver['isSaving'] = false;
								styleMyElement(saver['buttonSave'], {borderBottomWidth: '0px', cursor: 'pointer'});
							}
							else {
								saver['isSaving'] = false;
								styleMyElement(saver['buttonSave'], {borderBottomWidth: '0px', cursor: 'pointer'});
								if (!saver['isShowingLink']) {
									appendMyElement(saver['buttonSaveLink'], vdoLnk);
									saver['isShowingLink'] = true;
								}
							}
						}
						XHRequest.onerror = function() {
							saver['isSaving'] = false;
							styleMyElement(saver['buttonSave'], {borderBottomWidth: '0px', cursor: 'pointer'});
							if (!saver['isShowingLink']) {
								appendMyElement(saver['buttonSaveLink'], vdoLnk);
								saver['isShowingLink'] = true;
							}
						}
						XHRequest.send();
					}
					else {
						appendMyElement(saver['buttonSaveLink'], vdoLnk);
						saver['isShowingLink'] = true;
					}
				}
			}
		}
	}
}

function showMyMessage(cause, content) {
	if (cause == '!content') {
		modifyMyElement(saver['saverMessage'], {innerHTML: 'Couldn\'t get the videos content. Please report it <a href="' + contact + '" style="color:#00892C">here</a>.'});
	}
	else if (cause == '!videos') {
		modifyMyElement(saver['saverMessage'], {innerHTML: 'Couldn\'t get any video. Please report it <a href="' + contact + '" style="color:#00892C">here</a>.'});
	}
	else if (cause == '!support') {
		modifyMyElement(saver['saverMessage'], {innerHTML: 'This video uses the RTMP protocol which is not supported.'});
	}
	else if (cause == 'embed') {
		modifyMyElement(saver['saverMessage'], {innerHTML: 'This is an embedded video. You can get it <a href="' + content + '" style="color:#00892C">here</a>.'});
	}
	else if (cause == 'other') {
		modifyMyElement(saver['saverMessage'], {innerHTML: content});
	}
}


// ==========Websites========== //

function SaveTube() {

	// =====YouTube===== //

	if (page.url.indexOf('youtube.com/watch') != -1) {

		/* Video Availability */
		if (getMyContent(page.url, /"playabilityStatus":\{"status":"(ERROR|UNPLAYABLE)"/)) return;

		/* Get Video ID */
		var ytVideoId = parseMyContent(page.url, /(?:\?|&)v=(.*?)(&|$)/);

		/* Create Saver */
		var ytVideoList = {};
		var ytDefaultVideo = 'Low Definition MP4';
		function ytCreateSaver(data) {
			/* Get Title */
			var ytVideoTitle = getMyContent(page.url, /"videoDetails".*?"title":"(.*?)"/);
			if (!ytVideoTitle) ytVideoTitle = getMyContent(page.url, /"title":\{"runs":\[\{"text":"(.*?)"/);
			if (!ytVideoTitle) ytVideoTitle = getMyContent(page.url, /meta\s+property="og:title"\s+content="(.*?)"/);
			if (!ytVideoTitle) ytVideoTitle = getMyContent(page.url, /meta\s+itemprop="name"\s+content="(.*?)"/);
			if (ytVideoTitle) {
				var ytVideoAuthor = getMyContent(page.url, /"(?:author|name)":\s*"(.*?)"/);
				if (ytVideoAuthor) ytVideoTitle = ytVideoTitle + ' by ' + ytVideoAuthor;
				ytVideoTitle = cleanMyContent(ytVideoTitle, false, true);
			}
			/* Create Saver */
			if (data) {
				saver = data;
			}
			else {
				saver = {
					'videoList': ytVideoList,
					'videoDefinitions': ['Ultra High Definition', 'Quad High Definition', 'Full High Definition', 'High Definition', 'Standard Definition', 'Low Definition', 'Very Low Definition'],
					'videoContainers': ['MP4', 'WebM', 'M3U8', 'Any'],
					'videoSave': ytDefaultVideo,
					'videoTitle': ytVideoTitle
				};
			}
			createMySaver();
		}

		/* Parameter Unscrambler */
		var ytScriptUrl;
		var ytUnscrambleParam = {};
		function ytGetUnscrambleParamFunc() {
			var ytMainFuncName, ytMainFuncBody, ytExtraFuncName, ytExtraFuncBody;
			/* s */
			ytMainFuncName = getMyContent(ytScriptUrl, /c&&\([\w$]+=([\w$]+)\(decodeURIComponent/);
			if (ytMainFuncName) {
				ytMainFuncBody = getMyContent(ytScriptUrl, new RegExp(';' + ytMainFuncName.replace(/\$/, '\\$') + '\\s*=\\s*function\\s*' + '\\s*\\(\\w+\\)\\s*\\{(.*?)\\};'));
				if (ytMainFuncBody) {
					ytExtraFuncName = parseMyContent(ytMainFuncBody, /([\w$]+)\.[\w$]+\(\w,[0-9]+\)/);
					if (ytExtraFuncName) {
						ytExtraFuncBody = getMyContent(ytScriptUrl, new RegExp('var\\s+' + ytExtraFuncName.replace(/\$/, '\\$') + '=\\s*\\{(.*?)\\};'));
						if (ytExtraFuncBody) {
							ytMainFuncBody = 'var ' + ytExtraFuncName + '={' + ytExtraFuncBody + '};' + ytMainFuncBody;
							ytMainFuncBody = 'try {' + ytMainFuncBody + '} catch(e) {return null}';
							ytUnscrambleParam['s'] = new Function('a', ytMainFuncBody);
						}
					}
				}
			}
			/* n */
			ytMainFuncName = getMyContent(ytScriptUrl, /&&\([\w$]+=([\w$]+)\(\w+\),\w+\.set\("n"/);
			if (ytMainFuncName) {
				ytMainFuncBody = getMyContent(ytScriptUrl, new RegExp(';' + ytMainFuncName.replace(/\$/, '\\$') + '\\s*=\\s*function\\s*' + '\\s*\\(\\w+\\)\\s*\\{(.*?)\\};'));
				if (ytMainFuncBody) {
					ytMainFuncBody = 'try {' + ytMainFuncBody + '} catch(e) {return null}';
					ytUnscrambleParam['n'] = new Function('a', ytMainFuncBody);
				}
			}
		}

		/* Get Videos Content */
		var ytVideosContent = {};
		var ytVideoInfoKey = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
		var ytVideoInfoUrl = page.win.location.protocol + '//' + page.win.location.hostname + '/youtubei/v1/player?key=' + ytVideoInfoKey;
		var ytVideoInfoClientVersion = {'WEB': '2.11111111', 'ANDROID': '16.20'};
		var ytVideoInfoDataRequest = {};
		function ytGetVideos(api, client, embed) {
			if (api) {
				ytVideoInfoDataRequest = {};
				ytVideoInfoDataRequest['context'] = {};
				ytVideoInfoDataRequest['context']['client'] = {};
				ytVideoInfoDataRequest['context']['client']['clientName'] = client;
				ytVideoInfoDataRequest['context']['client']['clientVersion'] = ytVideoInfoClientVersion[client];
				if (embed) {
					ytVideoInfoDataRequest['context']['client']['clientScreen'] = 'EMBED';
					ytVideoInfoDataRequest['context']['thirdParty'] = {};
					ytVideoInfoDataRequest['context']['thirdParty']['embedUrl'] = 'https://www.youtube.com';
				}
				ytVideoInfoDataRequest['videoId'] = ytVideoId;
				ytVideosContent = getMyContent(ytVideoInfoUrl + '|' + JSON.stringify(ytVideoInfoDataRequest));
			}
			else {
				ytVideosContent = getMyContent(page.url, /ytInitialPlayerResponse\s*=\s*({.*?});/);
			}
			try {
				ytVideosContent = JSON.parse(ytVideosContent);
			}
			catch(e) {
				ytVideosContent = {};
			}
			ytVideosContent = (ytVideosContent['streamingData']) ? ytVideosContent['streamingData'] : {};
		}

		/* Get Videos */
		ytGetVideos(true, 'ANDROID', false);
		if (!ytVideosContent['formats'] && ytVideosContent['hlsManifestUrl']) {
			var ytHLSFormats = {
				'92': 'Very Low Definition M3U8',
				'93': 'Low Definition M3U8',
				'94': 'Standard Definition M3U8',
				'95': 'High Definition M3U8',
				'96': 'Full High Definition M3U8'
			};
			ytVideoList["Multi Definition M3U8"] = ytVideosContent['hlsManifestUrl'];
			var ytHLSVideos, ytHLSVideo, ytVideoCode, myVideoCode;
			ytHLSVideos = getMyContent(ytVideosContent['hlsManifestUrl'], /(http.*?m3u8)/g);
			if (ytHLSVideos) {
				for (var i = 0; i < ytHLSVideos.length; i++) {
					ytHLSVideo = ytHLSVideos[i];
					ytVideoCode = parseMyContent(ytHLSVideo, /\/itag\/(\d{1,3})\//);
					if (ytVideoCode) {
						myVideoCode = ytHLSFormats[ytVideoCode];
						if (myVideoCode) {
							ytVideoList[myVideoCode] = ytHLSVideo;
						}
					}
				}
			}
			ytDefaultVideo = 'Multi Definition M3U8';
			ytCreateSaver();
		}
		else {
			if (!ytVideosContent['formats']) {
				ytGetVideos(true, 'ANDROID', true);
			}
			if (ytVideosContent['formats']) {
				var ytVideoFormats = {
					'18': 'Low Definition MP4',
					'22': 'High Definition MP4',
					'43': 'Low Definition WebM',
					'133': 'Very Low Definition Video MP4',
					'134': 'Low Definition Video MP4',
					'135': 'Standard Definition Video MP4',
					'136': 'High Definition Video MP4',
					'137': 'Full High Definition Video MP4',
					'140': 'Medium Bitrate Audio MP4',
					'242': 'Very Low Definition Video WebM',
					'243': 'Low Definition Video WebM',
					'244': 'Standard Definition Video WebM',
					'247': 'High Definition Video WebM',
					'248': 'Full High Definition Video WebM',
					'249': 'Low Bitrate Audio WebM',
					'250': 'Medium Bitrate Audio WebM',
					'251': 'High Bitrate Audio WebM',
					'264': 'Quad High Definition Video MP4',
					'271': 'Quad High Definition Video WebM',
					'272': 'Ultra High Definition Video WebM',
					'298': 'High Definition Video MP4',
					'299': 'Full High Definition Video MP4',
					'302': 'High Definition Video WebM',
					'303': 'Full High Definition Video WebM',
					'308': 'Quad High Definition Video WebM',
					'313': 'Ultra High Definition Video WebM',
					'315': 'Ultra High Definition Video WebM',
					'333': 'Standard Definition Video WebM',
					'334': 'High Definition Video WebM',
					'335': 'Full High Definition Video WebM',
					'337': 'Ultra High Definition Video WebM'
				};
				var ytVideoFound = false;
				var ytVideos = (ytVideosContent['adaptiveFormats']) ? ytVideosContent['formats'].concat(ytVideosContent['adaptiveFormats']) : ytVideosContent['formats']
				var ytVideoParse, ytVideoCodeParse, ytVideoCode, myVideoCode, ytVideo, ytSign, ytSignP;
				for (var i = 0; i < ytVideos.length; i++) {
					if (ytVideos[i]['signatureCipher'] || ytVideos[i]['cipher']) {
						if (!ytScriptUrl) {
							ytScriptUrl = getMyContent(page.url, /"js(?:Url)?":\s*"(.*?)"/);
							if (!ytScriptUrl) {
								ytScriptUrl = getMyContent(page.url.replace(/watch.*?v=/, 'embed/').replace(/&.*$/, ''), /"js(?:Url)?":\s*"(.*?)"/);
							}
							if (ytScriptUrl && ytScriptUrl.indexOf('//') == -1) {
								ytScriptUrl = page.win.location.protocol + '//' + page.win.location.hostname + ytScriptUrl;
								ytGetUnscrambleParamFunc();
							}
							else {
								ytCreateSaver({'warnMess': 'other', 'warnContent': '<b>SaveTube:</b> Couldn\'t get the signature link. Please report it <a href="' + contact + '" style="color:#00892C">here</a>.'});
								break;
							}
						}
						ytVideo = ytVideos[i]['signatureCipher'] || ytVideos[i]['cipher'];
						ytVideo = cleanMyContent(ytVideo, true);
						ytVideoParse = ytVideo.match(/(.*)(url=.*$)/);
						if (ytVideoParse) {
							ytVideo = ytVideoParse[2] + '&' + ytVideoParse[1];
							ytVideo = ytVideo.replace(/url=/, '').replace(/&$/, '');
						}
						ytSParam = parseMyContent(ytVideo, /&s=(.*?)(&|$)/);
						if (ytSParam && ytUnscrambleParam['s']) {
							ytSParam = ytUnscrambleParam['s'](ytSParam);
							if (ytSParam) {
								ytSParamName = parseMyContent(ytVideo, /&sp=(.*?)(&|$)/);
								ytSParamName = (ytSParamName) ? ytSParamName : ((/&lsig=/.test(ytVideo)) ? 'sig' : 'signature');
								ytVideo = ytVideo.replace(/&s=.*?(&|$)/, '&' + ytSParamName + '=' + ytSParam + '$1');
							}
							else ytVideo = '';
						}
						else ytVideo = '';
					}
					else {
						ytVideo = ytVideos[i]['url'];
						ytVideo = cleanMyContent(ytVideo, true);
						if (/&sig=/.test(ytVideo) && !/&lsig=/.test(ytVideo)) {
							ytVideo = ytVideo.replace(/&sig=/, '&signature=');
						}
					}
					ytVideoCode = ytVideos[i]['itag'];
					if (!ytVideoCode) continue;
					myVideoCode = ytVideoFormats[ytVideoCode];
					if (!myVideoCode) continue;
					if (myVideoCode.indexOf('Video') != -1) {
						if (ytVideo.indexOf('source=yt_otf') != -1) continue;
					}
					ytVideo = cleanMyContent(ytVideo, true);
					ytNParam = parseMyContent(ytVideo, /&n=(.*?)(&|$)/);
					if (ytNParam && ytUnscrambleParam['n']) {
						ytNParam = ytUnscrambleParam['n'](ytNParam);
						if (ytNParam) {
							ytVideo = ytVideo.replace(/&n=.*?(&|$)/, '&n=' + ytNParam + '$1');
						}
					}
					if (ytVideo.indexOf('ratebypass') == -1) ytVideo += '&ratebypass=yes';
					if (ytVideo && ytVideo.indexOf('http') == 0) {
						if (!ytVideoFound) ytVideoFound = true;
						ytVideoList[myVideoCode] = ytVideo;
					}
				}
				if (ytVideoFound) {
					/* DASH */
					if (ytVideoList['Medium Bitrate Audio MP4'] || ytVideoList['Medium Bitrate Audio WebM']) {
						for (var myVideoCode in ytVideoList) {
							if (myVideoCode.indexOf('Video') != -1) {
								if (!ytVideoList[myVideoCode.replace(' Video', '')]) {
									ytVideoList[myVideoCode.replace(' Video', '')] = 'DASH';
								}
							}
						}
					}
					ytCreateSaver();
				}
				else {
					ytCreateSaver({'warnMess': '!videos'});
				}
			}
			else {
				ytCreateSaver({'warnMess': '!content'});
			}
		}

	}

	// =====DailyMotion===== //

	else if (page.url.indexOf('dailymotion.com/video') != -1) {

		/* Video Source */
		var dmMetadataUrl = page.url.replace(/\/video\//, "/player/metadata/video/");

		/* Video Availability */
		if (getMyContent(dmMetadataUrl, /"error":\{"title":"(.*?)"/)) return;
		if (getMyContent(dmMetadataUrl, /"error_title":"(.*?)"/)) return;

		/* Get Video Title */
		var dmVideoTitle = getMyContent(dmMetadataUrl, /"title":"((\\"|[^"])*?)"/);
		if (dmVideoTitle) {
			var dmVideoAuthor = getMyContent(dmMetadataUrl, /"screenname":"((\\"|[^"])*?)"/);
			if (dmVideoAuthor) dmVideoTitle = dmVideoTitle + ' by ' + dmVideoAuthor;
			dmVideoTitle = cleanMyContent(dmVideoTitle, false, true);
		}

		/* Get Videos Content */
		var dmVideosContent = getMyContent(dmMetadataUrl, /"qualities":\{(.*?)\]\},/);

		/* Get Videos */
		if (dmVideosContent) {
			var dmVideoFormats = {'auto': 'Low Definition MP4', '240': 'Very Low Definition MP4', '380': 'Low Definition MP4',
														'480': 'Standard Definition MP4', '720': 'High Definition MP4', '1080': 'Full High Definition MP4'};
			var dmVideoList = {};
			var dmVideoFound = false;
			var myVideoCode, dmVideo;
			for (var dmVideoCode in dmVideoFormats) {
				dmVideo = parseMyContent(dmVideosContent, new RegExp('"' + dmVideoCode + '".*?"type":"video.*?mp4","url":"(.*?)"'));
				if (dmVideo) {
					if (!dmVideoFound) dmVideoFound = true;
					dmVideo = cleanMyContent(dmVideo, true);
					myVideoCode = dmVideoFormats[dmVideoCode];
					if (!dmVideoList[myVideoCode]) dmVideoList[myVideoCode] = dmVideo;
				}
			}
			if (!dmVideoFound) {
				var dmHLSManifest = parseMyContent(dmVideosContent, /"type":"application.*?mpegURL","url":"(.*?)"/);
				if (dmHLSManifest) {
					dmVideoFound = true;
					dmHLSManifest = cleanMyContent(dmHLSManifest, true);
					dmVideoList["Multi Definition M3U8"] = dmHLSManifest;
					for (var dmVideoCode in dmVideoFormats) {
						dmVideo = getMyContent(dmHLSManifest, new RegExp('NAME="' + dmVideoCode + '.*?",PROGRESSIVE-URI="(.*?)(#EXT|$)'));
						if (dmVideo) {
							myVideoCode = dmVideoFormats[dmVideoCode];
							if (!dmVideoList[myVideoCode] && dmVideo.split('"')[0]) {
								dmVideoList[myVideoCode] = dmVideo.split('"')[0];
							}
							myVideoCode = dmVideoFormats[dmVideoCode].replace('MP4', 'M3U8');
							if (!dmVideoList[myVideoCode] && dmVideo.split('"')[1]) {
								dmVideoList[myVideoCode] = dmVideo.split('"')[1];
							}
						}
					}
				}
			}

			if (dmVideoFound) {
				/* Create Saver */
				var dmDefaultVideo = 'Low Definition MP4';
				if (!dmVideoList[dmDefaultVideo]) dmDefaultVideo = 'Low Definition M3U8';
				saver = {
					'videoList': dmVideoList,
					'videoDefinitions': ['Full High Definition', 'High Definition', 'Standard Definition', 'Low Definition', 'Very Low Definition'],
					'videoContainers': ['MP4'],
					'videoSave': dmDefaultVideo,
					'videoTitle': dmVideoTitle
				};
				createMySaver();
			}
			else {
				saver = {'warnMess': '!videos'};
				createMySaver();
			}
		}
		else {
			saver = {'warnMess': '!content'};
			createMySaver();
		}

	}

	// =====Vimeo===== //

	else if (page.url.indexOf('vimeo.com/') != -1) {

		/* Page Type */
		var viPageType = getMyContent(page.url, /meta\s+property="og:type"\s+content="(.*?)"/);
		if (!viPageType || viPageType.indexOf('video') == -1) return;

		/* Get Video Title */
		var viVideoTitle;
		if (viPageType.indexOf('video') != -1) {
			viVideoTitle = getMyContent(page.url, /meta\s+property="og:title"\s+content="(.*?)"/);
		}
		else {
			viVideoTitle = getMyContent(page.url, /"title":"((\\"|[^"])*?)"/);
		}
		if (viVideoTitle) {
			viVideoTitle = viVideoTitle.replace(/\s*on\s*Vimeo$/, '');
			var viVideoAuthor = getMyContent(page.url, /"display_name":"((\\"|[^"])*?)"/);
			if (viVideoAuthor) viVideoTitle = viVideoTitle + ' by ' + viVideoAuthor;
			viVideoTitle = cleanMyContent(viVideoTitle, false, true);
		}

		/* Get Content Source */
		var viVideoSource = getMyContent(page.url, /config_url":"(.*?)"/);
		if (viVideoSource) viVideoSource = cleanMyContent(viVideoSource, false);
		else {
			viVideoSource = getMyContent(page.url, /data-config-url="(.*?)"/);
			if (viVideoSource) viVideoSource = viVideoSource.replace(/&amp;/g, '&');
		}

		/* Get Videos Content */
		var viVideosContent;
		if (viVideoSource) {
			viVideosContent = getMyContent(viVideoSource, /"progressive":\[(.*?)\]/);
		}

		/* Get Videos */
		if (viVideosContent) {
			var viVideoFormats = {'1440p': 'Quad High Definition MP4', '1080p': 'Full High Definition MP4', '720p': 'High Definition MP4', '540p': 'Standard Definition MP4',
														'480p': 'Standard Definition MP4', '360p': 'Low Definition MP4', '270p': 'Very Low Definition MP4', '240p': 'Very Low Definition MP4'};
			var viVideoList = {};
			var viVideoFound = false;
			var viVideo, myVideoCode;
			var viVideos = viVideosContent.split('},');
			for (var i = 0; i < viVideos.length; i++) {
				for (var viVideoCode in viVideoFormats) {
					if (viVideos[i].indexOf('"quality":"' + viVideoCode + '"') != -1) {
						viVideo = parseMyContent(viVideos[i], /"url":"(.*?)"/);
						if (viVideo) {
							if (!viVideoFound) viVideoFound = true;
							myVideoCode = viVideoFormats[viVideoCode];
							viVideoList[myVideoCode] = viVideo;
						}
					}
				}
			}

			if (viVideoFound) {
				/* Create Saver */
				var viDefaultVideo = 'Low Definition MP4';
				saver = {
					'videoList': viVideoList,
					'videoDefinitions': ['Quad High Definition', 'Full High Definition', 'High Definition', 'Standard Definition', 'Low Definition', 'Very Low Definition'],
					'videoContainers': ['MP4'],
					'videoSave': viDefaultVideo,
					'videoTitle': viVideoTitle
				};
				createMySaver();
			}
			else {
				saver = {'warnMess': '!videos'};
				createMySaver();
			}
		}
		else {
			saver = {'warnMess': '!content'};
			createMySaver();
		}

	}

	// =====Veoh===== //

	else if (page.url.indexOf('veoh.com/watch') != -1) {

		/* Video Info */
		var veVideoInfoUrl = page.url.replace(/\/watch\//, '/watch/getVideo/');

		/* Get Video Availability */
		if (getMyElement('', 'div', 'class', 'veoh-video-player-error', 0, false)) return;

		/* Get Video Title */
		var veVideoTitle = getMyContent(veVideoInfoUrl, /"title":"((\\"|[^"])*?)"/);
		if (!veVideoTitle) {
			veVideoTitle = getMyContent(page.url, /meta\s+name="og:title"\s+content="(.*?)"/);
		}
		if (veVideoTitle) veVideoTitle = cleanMyContent(veVideoTitle, false, true);

		/* Get Videos Content */
		var veVideosContent = getMyContent(veVideoInfoUrl, /"src"\s*:\s*\{(.*?)\}/);

		/* Get Videos */
		if (veVideosContent) {
			var veVideoFormats = {'Regular': 'Low Definition MP4', 'HQ': 'Standard Definition MP4'};
			var veVideoList = {};
			var veVideoFound = false;
				var veVideo, myVideoCode;
				for (var veVideoCode in veVideoFormats) {
					veVideo = parseMyContent(veVideosContent, new RegExp(veVideoCode + '":"(.*?)"'));
					if (veVideo) {
						if (!veVideoFound) veVideoFound = true;
						myVideoCode = veVideoFormats[veVideoCode];
						veVideoList[myVideoCode] = cleanMyContent(veVideo, false);
					}
				}

			if (veVideoFound) {
				/* Create Saver */
				var veDefaultVideo = 'Low Definition MP4';
				saver = {
					'videoList': veVideoList,
					'videoDefinitions': ['Standard Definition', 'Low Definition'],
					'videoContainers': ['MP4'],
					'videoSave': veDefaultVideo,
					'videoTitle': veVideoTitle
				};
				createMySaver();
			}
			else {
				saver = {};
				var ytVideoId = getMyContent(page.url, /youtube.com\/embed\/(.*?)("|\?)/);
				if (!ytVideoId) ytVideoId = getMyContent(page.url, /"videoId":"yapi-(.*?)"/);
				if (ytVideoId) {
					var ytVideoLink = 'http://youtube.com/watch?v=' + ytVideoId;
					saver['warnMess'] = 'embed';
					saver['warnContent'] = ytVideoLink;
				}
				else saver['warnMess'] = '!videos';
				createMySaver();
			}
		}
		else {
			saver = {'warnMess': '!content'};
			createMySaver();
		}

	}

	// =====IMDB===== //

	else if (page.url.indexOf('imdb.com') != -1) {

		/* Redirect To Video Page */
		if (page.url.indexOf('/video/') == -1 && page.url.indexOf('/videoplayer/') == -1) {
			page.doc.addEventListener('click', function(e) {
				var p = e.target.parentNode;
				while (p) {
					if (p.tagName === 'A' && p.href.indexOf('/video/imdb') != -1) {
						page.win.location.href = p.href.replace(/imdb\/inline.*/, '');
					}
					p = p.parentNode;
				}
			}, false);
			return;
		}

		/* Get Video Title */
		var imdbVideoTitle = getMyContent(page.url, /meta\s+property="og:title"\s+content="(.*?)"/);
		if (imdbVideoTitle) imdbVideoTitle = cleanMyContent(imdbVideoTitle, false, true);

		/* Get Data Key */
		var imdbVideoId = page.url.replace(/^.*?\/(vi\d+).*/, '$1');
		var imdbDataJSON = '{"type": "VIDEO_PLAYER", "subType": "FORCE_LEGACY", "id": "' + imdbVideoId + '"}';
		var imdbDataKey = btoa(imdbDataJSON);

		/* Get Videos Content */
		var imdbVideosContent = getMyContent(page.url.replace(/video\/.*/, 've/data/VIDEO_PLAYBACK_DATA?key=' + imdbDataKey), '"videoLegacyEncodings":\\[(.*?)\\]', false);

		/* Get Videos */
		var imdbVideoList = {};
		if (imdbVideosContent) {
			var imdbVideoFormats = {'1080p': 'Full High Definition MP4', '720p': 'High Definition MP4', '480p': 'Standard Definition MP4',
															'360p': 'Low Definition MP4', 'SD': 'Low Definition MP4', '240p': 'Very Low Definition MP4', 'AUTO': 'Multi Definition M3U8'};
			var imdbVideoFound = false;
			var myVideoCode, imdbVideo;
			for (var imdbVideoCode in imdbVideoFormats) {
				imdbVideo = parseMyContent(imdbVideosContent, new RegExp('"definition":"' + imdbVideoCode + '".*?"url":"(.*?)"'));
				if (imdbVideo) {
					imdbVideo = cleanMyContent(imdbVideo, false);
					if (!imdbVideoFound) imdbVideoFound = true;
					myVideoCode = imdbVideoFormats[imdbVideoCode];
					if (!imdbVideoList[myVideoCode]) imdbVideoList[myVideoCode] = imdbVideo;
				}
			}

			if (imdbVideoFound) {
				/* Create Saver */
				var imdbDefaultVideo = 'Low Definition MP4';
				saver = {
					'videoList': imdbVideoList,
					'videoDefinitions': ['Full High Definition', 'High Definition', 'Standard Definition', 'Low Definition', 'Very Low Definition'],
					'videoContainers': ['MP4', 'M3U8', 'Any'],
					'videoSave': imdbDefaultVideo,
					'videoTitle': imdbVideoTitle
				};
				createMySaver();
			}
			else {
				saver = {'warnMess': '!videos'};
				createMySaver();
			}
		}
		else {
			saver = {'warnMess': '!content'};
			createMySaver();
		}

	}

}


// ==========Run========== //

getMyOptions();
SaveTube();

page.win.setInterval(function() {
	if (page.url != page.win.location.href.replace(page.win.location.hash, '')) {
		if (saver['saverPanel'] && saver['saverPanel'].parentNode) {
			removeMyElement(saver['saverPanel'].parentNode, saver['saverPanel']);
		}
		page.doc = page.win.document;
		page.body = page.doc.body;
		page.url = page.win.location.href.replace(page.win.location.hash, '');
		SaveTube();
	}
}, 500);

})();
