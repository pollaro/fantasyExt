const clientID = 'dj0yJmk9czVITjBENktzUkNuJmQ9WVdrOVowWTVXbE4zTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNg--'
const clientSecret = 'b9c3952b8f4185ea5653652c74a62fbec64051fc'
const redirect = 'https://cnkafadbbingcfbcnecceakbpplibpop.chromiumapp.org'
const encoded = window.btoa(clientID + ':' + clientSecret)
;(async function main() {
	let token = outsideAuth((code) => {
		getAccessToken(code)
	})
})()

function getAccessToken(code) {
	let xhr = new XMLHttpRequest()
	xhr.open('POST', 'https://api.login.com/oauth2/get_token')
	console.log(encoded)
	xhr.setRequestHeader('Authorization', 'Basic ' + encoded)
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			resp.xhr.response
			console.log(resp)
		}
	}
	xhr.send('grant_type=authorization_code&code=' + code + '&redirect_uri=' + redirect)
}

function outsideAuth(callback) {
	chrome.identity.launchWebAuthFlow(
		{
			url:
				'https://api.login.yahoo.com/oauth2/request_auth?client_id=' +
				clientID +
				'&redirect_uri=' +
				redirect +
				'&response_type=code&language=en-us',
			interactive: true
		},
		function(redirect_url) {
			var regex = /code=(.*)/
			var code = redirect_url.match(regex)
			chrome.storage.local.set({ access_code: code[1] }, function() {
				console.log('The code is ' + code[1])
			})
		}
	)
}

function getFantasyStats(token) {
	console.log('fantasy stats')
	xmlReq(token, function(result) {
		console.log(result)
		return result
	})
}

function xmlReq(userToken, callback) {
	const apiURL = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1//'
	var xhr = new XMLHttpRequest()
	var resp
	xhr.open('GET', apiURL)
	xhr.withCredentials = true
	xhr.setRequestHeader('Authorization', 'Bearer ' + userToken)
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			resp = xhr.response
			callback(resp)
		}
	}
	xhr.send()
}
