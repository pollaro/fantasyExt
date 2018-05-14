const clientID = 'dj0yJmk9czVITjBENktzUkNuJmQ9WVdrOVowWTVXbE4zTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNg--'
const clientSecret = 'b9c3952b8f4185ea5653652c74a62fbec64051fc'
const redirect = 'https://cnkafadbbingcfbcnecceakbpplibpop.chromiumapp.org'
const encoded = window.btoa(clientID + ':' + clientSecret)

outsideAuth(function(code) {
	let xhr = new XMLHttpRequest()
	xhr.open('POST', 'https://api.login.yahoo.com/oauth2/get_token')
	xhr.withCredentials = true
	xhr.setRequestHeader('Authorization', 'Basic ' + encoded)
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
	xhr.onreadystatechange = function() {
		if (xhr.status === 200) {
			let resp = xhr.response
			chrome.storage.local.set(
				{ access_token: resp['access_token'], refresh_token: resp['refresh_token'] },
				function() {
					console.log('supposedly saved')
				}
			)
		}
	}
	xhr.send('grant_type=authorization_code&redirect_uri=' + redirect + '&code=' + code)
})

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
			callback(code[1])
		}
	)
}
