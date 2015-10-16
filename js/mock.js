// es6 polyfills, powered by babel
require("babel/polyfill")

var Promise = require('es6-promise').Promise

var Backbone = require('Backbone')

var React = require('react')

var _ = require('Underscore')

var clientId = '06863df05ed7c08a37f445c425f2213c',
	secret = '108d1f2149929bf398ed970ffca7d348',
	endUserAuthorization = 'https://soundcloud.com/connect',
	token = 'https://api.soundcloud.com/oauth2/token'

window._ = _

//IIFE

var Track = Backbone.Model.extend({

	defaults: {
		permalink: "nobody",
		title: "nothing"
	},

	initialize: function(trackId) {
		this.trackId = trackId
		
		this.url = `https://api.soundcloud.com/tracks/${this.trackId}?client_id=${clientId}`
	}
})

var Playlist = Backbone.Collection.extend({

	defaults: {
		query: '',
		error: ''
	},

	fetchQuery: function(q) {
		this.query = q
		this.genUrl()
		console.log('fetching')
		this.fetch().then((results)=> {
			console.log(results)
			if (results.length === 0) this.error = "no results found"
			this.trigger('change')
		})
	},

	genUrl: function() {
		this.url = `https://api.soundcloud.com/tracks?client_id=${clientId}&q=${this.query}`
	},

	initialize: function() {
		this.genUrl()	
	}
})


class Bar extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			ballLeft: '0px',
			width: '400px'
		}
	}

	componentDidMount() {
		var x = 7 
	}

	_ballPosToTime(ballLeft,barWidth){
		var newTime = (ballLeft * this.props.player._duration) / barWidth
		return newTime
}

	_followCursor(e) {
		e.preventDefault()
		console.log('following cursor')
		var mouseWithinDiv = e.clientX - parseInt(this.state.leftBorder)
		this.state.ballLeft = mouseWithinDiv - parseInt(this.refs.ball.props.style.width)/2 + 'px'
		this.setState({ballLeft:this.state.ballLeft})
	}

	_finishScrub(e) {
		this.setState({'dragging':false})
		window.removeEventListener('mousemove',this.state.dragListener)
		var newTime = this._ballPosToTime(parseInt(this.state.ballLeft),parseInt(this.state.width))
		this.props.player.seek(newTime)

	}

	_startScrub(e) {
		e.preventDefault()
		window.fart = this
		console.log('start scrub')
		this.setState({'dragging':true})
		var domBar = React.findDOMNode(this)
		this.state.leftBorder = domBar.getBoundingClientRect().left
		this.state.dragListener = (e) => this._followCursor.bind(this,e)()
		window.addEventListener('mousemove',this.state.dragListener)

	}

	render() {
		
		var ballStyle = {
			width:'12px',
			left:this.state.ballLeft},

			dragFn = this.state.dragging ? (e) => this._followCursor.bind(this,e)() : null

		return (
			<div style={{width: this.state.width}} className="bar">
				<div ref="ball" draggable='true' style={ballStyle} className="ball" 
				onMouseDown={(e) => this._startScrub.bind(this,e)()} 
				onMouseUp={(e) => this._finishScrub.bind(this,e)()}>
				</div>
			</div>
		)
	}
}

class TrackView extends React.Component {

	constructor(props) {
		super(props)
		
		this.state = {
			playing: "notready",
			}
		this.props.track.on('sync', this.forceUpdate)
		
	}

	componentDidMount() {
		SC.stream(`/tracks/${this.props.track.attributes.id}`,
 				(sound) => {
 					this.setState({player:sound._player})
 				})

	}

 	_playOrPause() {
 		
 		if (this.state.playing == "notready"){
 			this.setState({playing:"playing"})
 			this.state.player.play()
 			return
 		}
 		
 		else if (this.state.playing == "notplaying"){ 
 			this.state.player.play()
 			this.setState({playing:"playing"})
 		}

 		else if (this.state.playing == "playing"){
 			this.state.player.pause()
 			this.setState({playing:"notplaying"})
 		}
		
	}

	render() {

		var playState = this.state.playing == "playing" ? "pause": "play"
		return (
			<div className="track-view">
				<i className={playState + " material-icons"} onClick={this._playOrPause.bind(this)}></i>
				<div ref="trackData" className="track-data">
					<p className="title">{this.props.track.attributes.permalink}</p>
					<p className="artist">{this.props.track.attributes.title}</p>
					<Bar player={this.state.player}></Bar>
				</div>
	    	</div>
		)
	}
}

class PlaylistView extends React.Component {

	constructor(props) {

		super(props)
		console.log(this.props.playlist)
		this.props.playlist.on('sync', () => this.forceUpdate())	
	}

	_search(e) {
		window.e = e
		var q = e.target.value
		console.log('calling fetchQuery')
		this.props.playlist.fetchQuery(q)
	}

	render() {
		console.log('rendering pv')
		return (
			<div className="playlist-view">
				<input type="text" onKeyPress={(e) => this._search.bind(this,e)()} defaultValue="enter a search term"></input> 
				<h1>{this.props.playlist.error}</h1>
				{this.props.playlist.map((track) => {return <TrackView key={track.id} track={track}></TrackView>})}
			</div>
			)
	}
}

SC.initialize({
    client_id: clientId,
})

var playlist = new Playlist()

console.log('made playlist')
console.log(playlist)
React.render(<PlaylistView playlist={playlist}/>,document.querySelector('.container'))
console.log('rendered app')
playlist.fetch()
