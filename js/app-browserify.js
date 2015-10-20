// es5 and 6 polyfills, powered by babel
require("babel/polyfill")

let fetch = require('./fetcher'),
	$ = require('jquery'),
	Backbone = require('backbone'),
	React = require('react'),
	_ = require('underscore')

var clientId = '06863df05ed7c08a37f445c425f2213c',
	secret = '108d1f2149929bf398ed970ffca7d348',
	endUserAuthorization = 'https://soundcloud.com/connect',
	token = 'https://api.soundcloud.com/oauth2/token'

console.log('loaded javascript')


var PlaylistContainer = React.createClass({

	componentDidMount: function(){
		console.log('mounting parent')

	},

	_getTracks: function(trackInfo){
		return (<TrackContainer trackInfo={trackInfo}/>)
	},

	render: function(){
		return (
			<div id='playlistContainer'>
				{this.props.playlist.map(this._getTracks)}
			</div>
			)
	}
})

var TrackContainer = React.createClass({

	componentDidMount: function(){
	},

	render: function(){
		var trackInfo = this.props.trackInfo
		console.log(trackInfo)
		return (
			<div>
				<Music trackInfo={trackInfo}/>
			</div>
			)
	}
})

var Music = React.createClass({

	getInitialState: function(){
		return {
			focusId: null
		}
	},

	_walkieTalkie: function(trackId){
		this.setState({
			focusId: trackId
		})

	},

	render: function(){
		var trackInfo = this.props.trackInfo

		return (
			<div id='music'>
				<PlayBox focusId={this.state.focusId} _walkieTalkie={this._walkieTalkie} trackInfo={trackInfo}/>
				<TrackInfo id="trackInfo" trackInfo={trackInfo}/>
			</div>
			)
	}
})

var PlayBox = React.createClass({

	defaults: {
		playing: null
	},

	getInitialState: function(){
		return{player: null}
	},

	_handleClick: function(){
		var walkieTalkie = this.props._walkieTalkie,
			trackId = this.props.trackInfo.id
		walkieTalkie(trackId)
	},

	render: function(){

		var self = this
		var trackId = this.props.trackInfo.id,
			focusId = this.props.focusId,
			url = this.props.trackInfo.artwork_url,
			styleObj = {},
			styleObj2 = {}

		if (trackId === focusId) {

			if (this.state.player) {

				this.state.player.toggle()
				styleObj = {visibility:'hidden'}
				styleObj2 = {visibility:'visible'}
					
			}

			else {
				SC.stream(`/tracks/${trackId}`).then(function(player){
					self.setState({player:player})
				})
			}
		}
		

		return (
			<div onClick={this._handleClick} id='playbox'>
				<img src={url}/>
				<i id="albumIcon" className="material-icons">album</i>
				<i id="play" style={styleObj} className="material-icons">play_circle_outline</i>
				<i id="pause" style={styleObj2} className="material-icons">pause_circle_outline</i>
			</div>
			)
	}
})

var TrackInfo = React.createClass({

	_genTrackInfo: function(){
		var trackInfo = this.props.trackInfo,
			title = trackInfo.title,
			playcount = trackInfo.playback_count,
			likes = trackInfo.likes_count

		return (
			<div id="trackInfo">
				<p id="title">{title}</p>
				<div id="meta">
					<p id="playCount">Played {playcount} times.</p>
					<p id="likes"><i id='likeIcon' className="material-icons">stars</i>{likes}</p>
				</div>
			</div>
				)
	},

	render: function(){
		return (
			<div>
				{this._genTrackInfo()}
			</div>
			)
	}
})


// Incorporating Meta data into PlayBox for now
// 
// =========== React MetaData Class ============
// 
// var Meta = React.createClass({

// 	render: function(){
// 		return (
// 			<div>
// 				<Icon />
// 				<SongCounter />
// 				<Favorites />
// 			</div>
// 			)
// 	}
// })

// var Icon = React.createClass({

// 	render: function(){
// 		return (
// 			<div>
// 				Words
// 			</div>
// 			)
// 	}
// })

// var SongCounter = React.createClass({

// 	render: function(){
// 		return (
// 			<div>
// 				Words
// 			</div>
// 			)
// 	}
// })

// var Favorites = React.createClass({

// 	render: function(){
// 		return (
// 			<div>
// 				Words
// 			</div>
// 			)
// 	}
// })
//////////////////////////////////////




var TrackCollection = Backbone.Collection.extend({

	url: `https://api.soundcloud.com/tracks.json?client_id=${clientId}&q=sinatra`,

	parse: function(responseData){
		return responseData
	}
})

var playlist = new TrackCollection()
console.log('made playlist')

var deferredObj = playlist.fetch()

function renderApp(data){
	React.render(<PlaylistContainer playlist={data}/>,document.querySelector('.container'))
}

deferredObj.then(renderApp)

// Initializing app using SoundCloud SDK

var SC = require('soundcloud')

SC.initialize({
  client_id: clientId
})











