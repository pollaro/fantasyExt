let userToken
let userRefresh

chrome.runtime.sendMessage({ init: true, parseSports: false }, function(response) {
	if (response) {
		userToken = response.access_token
		console.log(response)
		getRosters(userToken)
	} else {
		console.log('No response from background.js')
	}
})

function getRosters(token) {
	let url =
		'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb,nfl/teams;out=roster?format=json'
	$.ajax({
		url: url,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + token)
		},
		xhrFields: { withCredentials: true }
	}).done(function(result) {
		chrome.runtime.sendMessage({ init: false, parseSports: result }, function(response) {
			chrome.storage.local.set({ rosters: response }, function() {
				console.log(response)
			})
			getStats(token, response)
		})
	})
}

function getStats(token, objIn) {}
