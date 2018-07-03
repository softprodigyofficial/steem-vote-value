function calc(username,vote_percent){
	return username+vote_percent;
}

function getSteemVoteValue(username,vote_percent) {
	return calc(username,vote_percent);
}

module.exports = getSteemVoteValue;
