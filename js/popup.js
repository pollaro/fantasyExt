chrome.runtime.sendMessage({ init: true }, function(response) {
	if (response) {
		let userToken = response.access_token
		let userRefresh = response.refresh_token
		console.log(response)
	}
})
