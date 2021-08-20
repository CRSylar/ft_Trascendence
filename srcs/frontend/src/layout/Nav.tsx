import {  Flex,  } from '@chakra-ui/layout';
import {Avatar, Icon, } from '@chakra-ui/react';
// import { userInfo } from 'os';
import { Component } from 'react';
import {Link} from 'react-router-dom';
import { ChatButton } from '../components/Chat';
import { UserContext } from '../App';
import Logo from '../components/Logo';
import Notification from '../components/Notification';
import './Nav.css'
import { MdHome, MdGames, MdPerson, MdViewList } from "react-icons/md";
// import {Backdoor} from "../Backdoor";
// import * as React from "react";

function smallNav(user: any, path:string, closeAll: any) {
	const iconSize = 6

	return(
		<Flex w="60%" justify="space-between" align="center" px="2em">
			<Link to="/" className={path === "/" ? "active" : "nav-link"}>
				<Icon as={MdHome} w={iconSize} h={iconSize}
				onClick={closeAll}/>
			</Link>
			<Link to="/game" className={path === "/game" ? "active" : "nav-link"} >
				<Icon as={MdGames} w={iconSize} h={iconSize}
				onClick={closeAll}/>
			</Link>
			<Link to={"/profile/" + user.user.idIntra} className={path === "/profile/:user" ? "active" : "nav-link"}>
				<Icon as={MdPerson} w={iconSize} h={iconSize}
				onClick={closeAll}/>
			</Link>
			<Link to="/profile" className={path === "/profile" ? "active" : "nav-link"}>
				<Icon as={MdViewList} w={iconSize} h={iconSize}
				onClick={closeAll}/>
			</Link>
		</Flex>
	)
}

function bigNav(user: any, path: string, closeAll: any) {
	return(
		<>
			<Link to="/" className={path === "/" ? "active" : "nav-link"}
				  onClick={closeAll}>
				<Logo/>
			</Link>
			<Flex w="35%" justify="space-between" align="center" >
				<Link to="/game" className={path === "/game" ? "active" : "nav-link"}
					onClick={closeAll}>
					Game
				</Link>
				<Link to={"/profile/" + user.user.idIntra} 
					className={path === "/profile/:user" ? "active" : "nav-link"}
					onClick={closeAll}>
					Profile
				</Link>
				<Link to="/profile" className={path === "/profile" ? "active" : "nav-link"}
					onClick={closeAll}>
					Leaderboard
				</Link>
			</Flex>
		</>
	)
}

type TNav = {
	page: string,
	chatOn: boolean,
	changeChatOn: any,
	closeChat: any
}

export default class Nav extends Component<TNav>{
	state = {
		page: "home",
		bigScreen: false,
		notificationsOn: false
	}
	boundHandler : any
	mMedia : any
	url = window.location.pathname.split('/').pop()
	
	handler(e:any) {
		this.setState({bigScreen: e.matches})
	}

	changeNotificationsOn() {
		this.setState({notificationsOn: !this.state.notificationsOn})
	}
	closeNotifications() {
		if (this.state.notificationsOn)
			this.setState({notificationsOn: false})
	}

	closeAll() {
		this.props.closeChat()
		this.closeNotifications.bind(this)()
	}

	newNotify(chatNotif :any) {
	    for(let key in chatNotif){
	        if (chatNotif[key].length > 0)
	            return true;
        }
        return false;
    }

	componentDidMount() {
		this.mMedia = window.matchMedia("(min-width: 850px)")
		this.setState({bigScreen: this.mMedia.matches})
		this.boundHandler = this.handler.bind(this)
		if(this.mMedia.addEventListener !== undefined)
		this.mMedia.addEventListener("change", this.boundHandler)
  }



	render(){

		return (
			<UserContext.Consumer>{(user : any) => {
				return(
					<Flex 
						bgColor="#333333" 
						color="white" 
						flexDir="row" 
						align="center" 
						justify="space-around" 
						fontSize="medium"  
						fontWeight="normal"
						zIndex="1000"
						w="100vw" 
						h="44px"
						mx="auto"
						position="relative"
					>
						<Flex 
							maxW="1080px"
							w="90%"
							flexDir="row" 
							align="center" 
							justify="space-between"
							zIndex="1001"
						>
							{this.state.bigScreen && 
								bigNav(user, this.props.page, this.closeAll.bind(this))}
							{!this.state.bigScreen && 
								smallNav(user, this.props.page, this.closeAll.bind(this))}
							<Flex justify="space-between" align="center"  w="130px">
								<Notification 
									notif={user.notify} 
									setNotif={user.setNotify} 
									numnotif={user.notify.length}
									notificationsOn={this.state.notificationsOn}
									changeNotificationsOn={this.changeNotificationsOn.bind(this)} 
									closeChat={this.props.closeChat}
								/>
								<ChatButton
									chatOn={this.props.chatOn}
									changeChatOn={this.props.changeChatOn}
									closeNotifications={this.closeNotifications.bind(this)}
									newNotif={ this.newNotify(user.chatNotify)}/>
								<Link to="/settings">
									<Avatar src={user.user.img} size="sm"
										onClick={this.closeAll.bind(this)}/>
								</Link>
							</Flex>
						</Flex>
					</Flex>
				)}}
			</UserContext.Consumer>
		)
	}

	componentWillUnmount() {
		this.mMedia.removeEventListener("change", this.boundHandler)
	}
}