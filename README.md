# steem-vote-value
<br>
Git repo: https://github.com/softprodigyofficial/steem-vote-value/
<br><br>

## Installation

`npm install steem-vote-value`

## Usage

const SteemVoteValue = require('steem-vote-value'); <br>
SteemVoteValue.valuefrompercent(handle,vote_percent) <br>
.then(function(result) { <br>
    res.status(HTTPStatus.OK).json({ success: '1', message: "success", data: result }); <br>
}) <br>
.catch(function(error){ <br>
    res.status(HTTPStatus.NOT_FOUND).json({ success: '0', message: "failure", data: error }); <br>
}); <br>
<br>
SteemVoteValue.percentfromvalue(handle,vote_value) <br>
.then(function(result) { <br>
    res.status(HTTPStatus.OK).json({ success: '1', message: "success", data: result }); <br>
}) <br>
.catch(function(error){ <br>
    res.status(HTTPStatus.NOT_FOUND).json({ success: '0', message: "failure", data: error }); <br>
}); <br>
