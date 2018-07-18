const clientID = 'dj0yJmk9czVITjBENktzUkNuJmQ9WVdrOVowWTVXbE4zTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNg--'
const clientSecret = 'b9c3952b8f4185ea5653652c74a62fbec64051fc'
const redirect = 'https://cnkafadbbingcfbcnecceakbpplibpop.chromiumapp.org'
const encoded = window.btoa(clientID + ':' + clientSecret)

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.init) {
		chrome.storage.local.get(['access_token', 'refresh_token', 'date'], function(result) {
			if (result.date) {
				let currTime = new Date()
				if (currTime - Date.parse(result.date) < 360000) {
					sendResponse({ access_token: result.access_token })
				} else {
					$.ajax({
						method: 'POST',
						data:
							'grant_type=refresh_token&redirect_uri=https%3A%2F%2Fwww.example.com&refresh_token=' +
							result.refresh_token,
						url: 'https://api.login.yahoo.com/oauth2/get_token',
						beforeSend: function(xhr) {
							xhr.setRequestHeader('Authorization', 'Basic ' + encoded)
						},
						xhrFields: { withCredentials: true }
					}).done(function(res) {
						let newDate = new Date()
						chrome.storage.local.set(
							{
								access_token: res.access_token,
								refresh_token: res.refresh_token,
								date: newDate
							},
							function() {
								sendResponse({ access_token: res.access_token })
							}
						)
					})
				}
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
							let dateTaken = new Date()
							chrome.storage.local.set(
								{
									access_token: access_token,
									refresh_token: refresh_token,
									date: dateTaken.toString()
								},
								function() {
									sendResponse({ access_token: access_token })
								}
							)
						}
					}
					xhr.send('grant_type=authorization_code&redirect_uri=' + redirect + '&code=' + code)
				})
			}
		})
	}
	if (msg.parseSports) {
		let leagueInfo = parseLeagues(msg.parseSports)
		sendResponse(leagueInfo)
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

function parseLeagues(objIn) {
	console.log(objIn)
	let sports = {}
	sports['user'] = objIn.fantasy_content.users[0].user[0]
	let sport = objIn.fantasy_content.users[0].user[1].games
	let sprtCnt = sport.count
	for (var x = 0; x < sprtCnt; x++) {
		let name = sport[x].game[0].name
		sports[name] = {}
		let teamCnt = sport[x].game[1].teams.count
		for (var y = 0; y < teamCnt; y++) {
			let team = sport[x].game[1].teams[y].team[0][2].name
			sports[name][team] = sport[x].game[1].teams[y].team[2].roster
			let league = sport[x].game[1].teams[y].team[0][0].team_key
			league = league.match(/^(.+)\.t+/i)[1]
			sports[name][team]['leagueID'] = league
			let roster = mapRoster(sports[name][team])
			sports[name][team]['rosterIDs'] = roster[0]
			sports[name][team]['positions'] = roster[1]
		}
	}
	return sports
}

function mapRoster(rosterIn) {
	let playerStr = ''
	let playerCnt = rosterIn[0].players.count
	let posObj = {}
	for (var p = 0; p < playerCnt; p++) {
		let status = rosterIn[0].players[p].player[1].selected_position[1].position
		console.log(status)
		if (status !== 'BN' && status !== 'DL') {
			let playerID = rosterIn[0].players[p].player[0][0].player_key
			playerStr = playerStr + playerID
			if (p !== playerCnt - 1) {
				playerStr = playerStr + ','
			}
			posObj[rosterIn[0].players[p].player[0][2].name.full] = [status, p]
			// posArr.push(posObj)
		}
	}

	if (playerStr[playerStr.length - 1] === ',') {
		playerStr = playerStr.slice(0, playerStr.length - 1)
	}
	console.log(posObj)
	return [playerStr, posObj]
}
