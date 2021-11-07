// https://developers.meethue.com/develop/get-started-2/
// https://developers.meethue.com/develop/hue-api/lights-api/
// http://philips-hue/debug/clip.html

const huebridgehost = 'philips-hue';
const api = 'http://' + huebridgehost + '/api';
var apiuser = (localStorage.apiuser === undefined) ? '' : localStorage.apiuser;
var button = [];
var info;

authCheck();

// On load
window.addEventListener('load', (event) => {

	// Setup button event listeners
	document.querySelectorAll('button').forEach((btn) => {
		btn.addEventListener('mousedown', buttonEvent);
		btn.addEventListener('mouseup', buttonEvent);
		btn.addEventListener('mouseleave', buttonEvent);
		btn.addEventListener('contextmenu', buttonEvent);
		btn.addEventListener('touchstart', buttonEvent);
		btn.addEventListener('touchend', buttonEvent);
	});
	
	// Create button objects
	for (i = 0; i < document.querySelectorAll('button').length; i++) {
		button.push({
			'lightid':9,
			'latch':false,
			'params':{
				'on':false,
				'transitiontime':0,
				'bri':254,
				'hue':0,
				'sat':0,
				'effect':'none'
			}
		});
	}
	
});

function buttonDown(btn) {
		if (button[btn].latch)
			button[btn].params.on = !button[btn].params.on;
		else
			button[btn].params.on = true;
		call('/lights/' + button[btn].lightid + '/state', 'PUT',
			JSON.stringify(button[btn].params)
		);
}

function buttonUp(btn) {
		if(!button[btn].latch) {
			button[btn].params.on = false;
			call('/lights/' + button[btn].lightid + '/state', 'PUT',
				JSON.stringify(button[btn].params)
			);
		}
}

function buttonToggleLatch(btn) {
	button[btn].latch = !button[btn].latch;
	if (button[btn].latch) {
		document.getElementById(btn).style.setProperty('border-style','solid');
	}
	else {
		if (button[btn].params.on) {
			button[btn].params.on = false;
			call('/lights/' + button[btn].lightid + '/state', 'PUT',
				JSON.stringify(button[btn].params)
			);
		}
		e.target.style.setProperty('border-style','dotted');
	}
}

function buttonEvent(e) {
	e.preventDefault();
	if (e.type == 'mousedown' || e.type == 'touchstart') {
		buttonDown(e.target.id);
	}
	else if (e.type == 'mouseup' || e.type == 'touchend') {
		buttonUp(e.target.id);
	}
}

function call(endpoint = '', method = 'GET', body = '') {
	let init;
	let callurl = api + '/' + apiuser + endpoint;
	console.log('Calling: ' + callurl + ' ' + method + ' ' + body);
	if (body) init = {method:method,body:body};
	else init = {method:method};
	return fetch(callurl, init).then(response => response.json())
}

function authCheck() {
	call().then(response => {
		if (response.config) {
			info = response;
			console.log('Connection to %s (%s) successful',
				response.config.name,
				response.config.bridgeid
			);
		}
		else {
			call('', 'POST', '{"devicetype":"LightJockey"}')
				.then(response => {
					if (response[0]) {
						if (response[0].error) {
							if (response[0].error.type == 101) {
								let message = 'Not linked with Hue Bridge\n';
								message += 'Press the button on the Hue Bridge, then click OK';
								if (confirm(message)) authCheck();
							}
							else alert(response[0].error.description);
						}
						else if (response[0].success && response[0].success.username) {
							apiuser = localStorage.apiuser = response[0].success.username;
							authCheck();
						}
						else console.log(response);
					}
					else console.log(response);
				});
		}
	});
}
