const clientID = 'dj0yJmk9czVITjBENktzUkNuJmQ9WVdrOVowWTVXbE4zTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNg--'
const clientSecret = 'b9c3952b8f4185ea5653652c74a62fbec64051fc'
const redirect = 'https://cnkafadbbingcfbcnecceakbpplibpop.chromiumapp.org'

chrome.identity.launchWebAuthFlow(
	{
		url:
			'https://api.login.yahoo.com/oauth/v2/get_request_token?client_id=' +
			clientID +
			'&redirect_uri=' +
			redirect +
			'&response_type=token&language=en-us',
		interactive: true
	},
	function(redirect_url) {
		var token = document.querySelector['#access_token']
		chrome.storage.local.set({ access_token: token }, function() {
			console.log('The token is ' + token)
		})
	}
)
