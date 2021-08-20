import { Component } from "react";
import { Game } from "./Game";
import * as THREE from "three";
import { E_Game_status, E_Player_type } from "./Enums";
import sound_goal_classic from "./assets/goal.ogg"
import sound_hit_classic from "./assets/hit.ogg"
import sound_goal_retro from "./assets/goal_retro.ogg"
import sound_hit_retro from "./assets/hit_retro.ogg"
import sound_goal_tron from "./assets/goal_tron.ogg"
import sound_hit_tron from "./assets/hit_tron.ogg"
import io from 'socket.io-client';
import { Flex, CircularProgress, Heading } from "@chakra-ui/react";

enum eMatch {
    classic,
    sd,
    mc,
    full
}

type TD2435 = {
	data: any
}

interface ID2435 {
	waiting: boolean
}

export class D2435 extends Component<TD2435, ID2435>{

	game!: Game;
	clock!: THREE.Clock;
	player: E_Player_type = E_Player_type.null;
	client!: any;
	visual!: string;
	matchType! : eMatch;

	keyUp: EventListenerOrEventListenerObject = (event: any) => {
		this.client.emit("keypressed", {
			player: this.player, key: event.key, pressed: 0, idGame: this.game?.ID
		});
	}
	
	keyDown: EventListenerOrEventListenerObject = (event: any) => {
		this.client.emit("keypressed", {
			player: this.player, key: event.key, pressed: 1, idGame: this.game?.ID
		});
	}

	state = {
		waiting: true
	}


	// SETUP
	componentDidMount() {
		this.visual = this.props.data.visual;
		let typeMatchSelected = eMatch.classic;
		if (this.props.data.sd && this.props.data.mc && this.visual !== "RETRO")
			typeMatchSelected = eMatch.full
		else if (!this.props.data.sd && this.props.data.mc && this.visual !== "RETRO")
			typeMatchSelected = eMatch.mc
		else if (this.props.data.sd && !this.props.data.mc && this.visual !== "RETRO")
			typeMatchSelected = eMatch.sd

		if (this.props.data.type === "player")
		{
			if (!this.props.data.pvt)
			{
				this.client = io(`http://${process.env.REACT_APP_MIOIP}:4051`,
							{
								transports: ["websocket"],
								query: {
									user: this.props.data.userName,
									idIntra : this.props.data.idIntra,
									matchType: typeMatchSelected,
									pvt: false,
								}
							})
			}
			else
			{
				this.client = io(`http://${process.env.REACT_APP_MIOIP}:4051`,
							{
								transports: ["websocket"],
								query: {
									user: this.props.data.userName,
									idIntra : this.props.data.idIntra,
									matchType: typeMatchSelected,
									pvt: true,
									friend: this.props.data.idGame,
									idIntraFriend: this.props.data.idIntraFriend,
								}
							})
			}
		}
		else
		{
			this.client = io(`http://${process.env.REACT_APP_MIOIP}:4051`,
						{
							transports: ["websocket"],
							query: {
								user: this.props.data.userName,
								idIntra : this.props.data.idIntra,
								matchType: typeMatchSelected,
								pvt: false,
								spectator: this.props.data.idGame,
							}
						})
		}
		this.socket_controller();

	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.keyDown, true);
		window.removeEventListener("keyup", this.keyUp, true);
		this.client.disconnect();
		if (this.game)
		{
            this.game.game_status = E_Game_status.exit;
            if (this.game.sound.isPlaying)
				this.game.sound.stop();
        }
		this.game?.renderer?.forceContextLoss()
		this.game?.renderer?.renderLists.dispose()
		this.game?.renderer?.dispose()
	}
				
	
	socket_controller() {
		this.client.on("start-game", (payload: any) => {
			this.setState({waiting: false})
			this.startGame(payload)
		});
		this.client.on("keypressed", (payload: any) => {
			this.keypressed(payload)
		});
		this.client.on("hit", (payload: any) => {
			this.hit(payload)
		});
		this.client.on("ball", (payload: any) => {
			this.ball(payload)
		});
		this.client.on("goal", (payload: any) => {
			this.goal(payload)
		});
		this.client.on("request-game-update", (payload: any) => {
			this.request_game_update(payload)
		});
		this.client.on("game-update", (payload: any) => {
			this.game_update(payload)
		});
		this.client.on("spectator", (payload: any) => {
			this.spectator(payload)
		});
		this.client.on("finish", (payload: any) => {
			this.finish(payload)
		});
		this.client.on("disconnect", (payload: any) => {
			if (this.game !== undefined && this.player !== E_Player_type.null)
				this.client.emit("disconnect-player", {idGame: this.game.ID})
		});
		this.client.on("disconnect-player", (payload: any) => {
			this.disconnect(payload)
		});		
	}
	// SOCKET EVENT
	startGame(pd: any) {
		if (this.game)
			return;
		//REMOVE LOADING PAGE
		switch (pd.matchType) {
			case eMatch.classic:
				this.matchType = eMatch.classic;
				this.game = new Game(pd.idGame, false, false, this.visual, pd.seed, 0, 0);	
				break;
			case eMatch.mc:
				this.matchType = eMatch.mc;
				this.game = new Game(pd.idGame, true, false, this.visual, pd.seed, 0, 0);	
				break;
			case eMatch.sd:
				this.matchType = eMatch.sd;
				this.game = new Game(pd.idGame, false, true, this.visual, pd.seed, 0, 0);	
				break;
			case eMatch.full:
				this.matchType = eMatch.full;
				this.game = new Game(pd.idGame, true, true, this.visual, pd.seed, 0, 0);	
				break;
			default:
				break;
		}
		this.game.stadium.addNames(pd.name1, pd.name2);
		if (pd.idP1 === this.client.id) {
			this.game.player_1.client = this.client;
			this.player = E_Player_type.one;
			this.game.player_type = E_Player_type.one;
		}
		else {
			this.game.player_2.client = this.client;
			this.player = E_Player_type.two;
			this.game.player_type = E_Player_type.two;
		}
		
		window.addEventListener("keyup", this.keyUp, true);
		window.addEventListener("keydown", this.keyDown, true);
		this.game.start();
	}

	keypressed(pd: any) {
		if (!this.game)
			return 
		if (pd.player === E_Player_type.one) {
			this.game.player_1.input(pd.key, pd.pressed);
		}
		else if (pd.player === E_Player_type.two) {
			this.game.player_2.input(pd.key, pd.pressed);
		}
	}
	
	hit(pd: any) {
		if (!this.game)
			return;
		const sound = new THREE.Audio(this.game.listener);
		if (this.visual === "CLASSIC")
			new THREE.AudioLoader().load(sound_hit_classic, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(1);
				sound.play();
			});
		else if (this.visual === "RETRO")
			new THREE.AudioLoader().load(sound_hit_retro, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(1);
				sound.play();
			});
		else if (this.visual === "TRON")
			new THREE.AudioLoader().load(sound_hit_tron, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(1);
				sound.play();
			});
	}

	ball(pd: any) {
		if (this.player === E_Player_type.one || !this.game)
			return;
		this.game.ball.dir = pd.dir;
		this.game.ball.transform.position.set(pd.pos.x, pd.pos.y, pd.pos.z);
		this.game.ball.transform.rotation.set(pd.rot._x, pd.rot._y, pd.rot._z);
	}

	goal(pd: any) {
		if (!this.game)
			return;
		this.game.score_p1 = pd.player_1;
		this.game.score_p2 = pd.player_2;
		this.game.player_1.start();
		this.game.player_2.start();
		this.game.stadium.update_score(pd.player_1, pd.player_2);
		const sound = new THREE.Audio(this.game.listener);
		if (this.visual === "CLASSIC")
			new THREE.AudioLoader().load(sound_goal_classic, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(0.5);
				sound.play();
			});
		else if (this.visual === "RETRO")
			new THREE.AudioLoader().load(sound_goal_retro, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(0.5);
				sound.play();
			});
		else if (this.visual === "TRON")
			new THREE.AudioLoader().load(sound_goal_tron, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(0.5);
				sound.play();
			});	
	}

	request_game_update(pd: any) {
		if (this.player !== E_Player_type.one || !this.game)
			return;
		this.client.emit("game-update", {
			player_1: this.game.score_p1,
			player_2: this.game.score_p2,
			name_p1: this.game.stadium.name_p1,
			name_p2: this.game.stadium.name_p2,
			idGame: this.game.ID,
			time_music: this.game.clock.getElapsedTime(),
			time: Date.now(),
			seed: this.game.seed,
			matchType: this.matchType
		});
		
	}

	game_update(pd: any) {
		if (this.player !== E_Player_type.null || this.game)
			return;
		switch (pd.matchType) {
			case eMatch.classic:
				this.game = new Game(pd.idGame, false, false, this.visual, pd.seed, pd.player_1, pd.player_2);	
				break;
			case eMatch.mc:
				this.game = new Game(pd.idGame, true, false, this.visual, pd.seed, pd.player_1, pd.player_2);
				break;
			case eMatch.sd:
				this.game = new Game(pd.idGame, false, true, this.visual, pd.seed, pd.player_1, pd.player_2);
				break;
			case eMatch.full:
				this.game = new Game(pd.idGame, true, true, this.visual, pd.seed, pd.player_1, pd.player_2);
				break;
			default:
				break;
		}
		this.game.sound.offset = (Date.now() - pd.time) * 0.001 + pd.time_music
		this.game.stadium.addNames(pd.name_p1, pd.name_p2);
		this.game.start();
	}

	spectator(pd: any) {
		if (this.player !== E_Player_type.null || this.game)
			return;
		this.client.emit("request-game-update", {
			idGame: pd.idGame
		});
	}

	finish(pd: any) {
		if (!this.game || this.game.game_status === E_Game_status.finish)
			return;
		window.removeEventListener("keydown", this.keyDown, true);
		window.removeEventListener("keyup", this.keyUp, true);
		this.game.game_status = E_Game_status.finish;
	}

	disconnect(pd: any) {
		if (this.game && this.game.game_status !== E_Game_status.finish && pd.player === 2)
		{
			window.removeEventListener("keydown", this.keyDown, true);
			window.removeEventListener("keyup", this.keyUp, true);
			this.game.score_p1 = 3;
			this.game.score_p2 = 0;
			this.game.stadium.update_score(3, 0);
			this.game.game_status = E_Game_status.finish;
			this.client.emit('update-game-finish', {
				idGame: this.game.ID,
				score_p1: 3,
				score_p2: 0,
			})
		}
		else if (this.game && this.game.game_status !== E_Game_status.finish && pd.player === 1)
		{
			window.removeEventListener("keydown", this.keyDown, true);
			window.removeEventListener("keyup", this.keyUp, true);
			this.game.score_p1 = 0;
			this.game.score_p2 = 3;
			this.game.stadium.update_score(0, 3);
			this.game.game_status = E_Game_status.finish;
            this.client.emit('update-game-finish', {
                idGame: this.game.ID,
                score_p1: 0,
                score_p2: 3,
            })
		}
	}

	render() { 
		return (
			<>
			{ this.state.waiting && this.props.data.type === "player" &&
				<Flex flexDir="column" 
				h="calc(100vh - 44px)" w="100%" 
				background="#141414"
				alignItems="center" justifyContent="center">
					<CircularProgress  color="rgb(0,255,255)" isIndeterminate/>
					<Heading fontFamily="Montserrat" color="white" 
						m="2rem" textAlign="center">
						Waiting for opponent...
					</Heading>
				</Flex>
			}
			</>
		) 
	}
}


