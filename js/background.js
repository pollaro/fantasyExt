const clientID = 'dj0yJmk9czVITjBENktzUkNuJmQ9WVdrOVowWTVXbE4zTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNg--'
const clientSecret = 'b9c3952b8f4185ea5653652c74a62fbec64051fc'
const redirect = 'https://cnkafadbbingcfbcnecceakbpplibpop.chromiumapp.org'
const encoded = window.btoa(clientID + ':' + clientSecret)

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.init) {
		chrome.storage.local.get(['access_token', 'refresh_token'], function(result) {
			if (result.refresh_token != '') {
				sendResponse({ access_token: result.access_token, refresh_token: result.refresh_token })
			} else {
				outsideAuth(function(code) {
					let xhr = new XMLHttpRequest()
					xhr.open('POST', 'https://api.login.yahoo.com/oauth2/get_token')
					xhr.withCredentials = true
					xhr.setRequestHeader('Authorization', 'Basic ' + encoded)
					xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
					xhr.onreadystatechange = function() {
						if (xhr.readyState === 4 && xhr.status === 200) {
							let resp = xhr.response
							let tokRegex = /.*access_token\"\:\"(.*)\"\,.*refresh_token\"\:\"(.*)\"\,\"e.*/
							let access_token = resp.match(tokRegex)[1]
							let refresh_token = resp.match(tokRegex)[2]
							chrome.storage.local.set(
								{ access_token: access_token, refresh_token: refresh_token },
								function() {
									sendResponse({ access_token: access_token, refresh_token: refresh_token })
								}
							)
						}
					}
					xhr.send('grant_type=authorization_code&redirect_uri=' + redirect + '&code=' + code)
				})
			}
		})
	}
	return true
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
			return callback(code[1])
		}
	)
}
