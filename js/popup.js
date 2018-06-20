let userToken
let userRefresh

chrome.runtime.sendMessage({ init: true, parseSports: false }, function(response) {
	if (response) {
		userToken = response.access_token
		console.log(response)
		let allPlayers = getRosters(userToken)
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

function getStats(token, objIn) {
	let url = 'https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys='
	let url2 = 'https://fantasysports.yahooapis.com/fantasy/v2/league/'
	let date = new Date()
	let month = (date.getMonth() + 1).toString()
	let day = date.getDate().toString()
	let year = date.getFullYear().toString()
	let strDate = year + '-' + month + '-' + day
	let objOut = {}
	for (var sport in objIn) {
		if (sport != 'user' && sport != 'Football') {
			objOut[sport] = { team: {} }
			let objInShrt = objIn[sport]
			let teamCnt = 0
			for (var teams in objInShrt) {
				objOut[sport].team[teamCnt] = {}
				objOut[sport].team[teamCnt]['name'] = teams
				// get league settings for stats counted
				let leagueUrl = url2 + objInShrt[teams].leagueID + '/settings?format=json'
				let statObj = {}
				let statOrd = []
				let teamObj = {}
				let teamOrd = []
				$.ajax({
					url: leagueUrl,
					beforeSend: function(xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer ' + token)
					},
					xhrFields: { withCredentials: true }
				}).done(function(result) {
					let tmpResult = result.fantasy_content.league[1].settings[0].stat_categories.stats
					for (var x = 0; x < tmpResult.length; x++) {
						statObj[tmpResult[x].stat.stat_id] = tmpResult[x].stat.display_name
						statOrd.push(tmpResult[x].stat.stat_id)
					}
				})
				// get player data for current day
				let tmpUrl = url + objInShrt[teams].rosterIDs + '/stats;date=' + strDate + ';type=date?format=json'
				$.ajax({
					url: tmpUrl,
					beforeSend: function(xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer ' + token)
					},
					xhrFields: { withCredentials: true }
				}).done(function(result) {
					console.log(result)
					let tmpResult = result.fantasy_content.players
					for (var y = 0; y < tmpResult.count; y++) {
						let tmpStats = tmpResult[y].player[1].player_stats.stats
						let plyrsObj = {}
						for (var z = 0; z < tmpStats.length; z++) {
							if (tmpStats[z].stat.stat_id in statObj) {
								plyrsObj[statObj[tmpStats[z].stat.stat_id]] = tmpStats[z].stat.value
							}
						}
						teamObj[tmpResult[y].player[0][2].name.full] = plyrsObj
						teamOrd.push(tmpResult[y].player[0][2].name.full)
					}
					console.log(teamObj)
				})
				objOut[sport].team[teamCnt]['roster'] = teamObj
				teamCnt++
			}
		}
	}
	console.log(objOut)
	return objOut
}
