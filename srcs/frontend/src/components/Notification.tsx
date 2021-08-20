import {
    Box,
    Flex,
    // Heading,
    // Button,
		Text
} from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons'
import react from 'react'
import './Notification.css';
import {UserContext} from "../App"
// import * as React from "react";
// import { Link } from "react-router-dom";
import { FriendNotification, GameInvite } from './NotificationItem';

interface PNotificationBoard {
    notifBody :any,
		handleClick: any
}

interface INotify {
    type : TNotify,
    content : any,
    timestamp : number,
}

enum TNotify {
    follower,
    message,
    game_req
}

export class NotificationBoard extends react.Component<PNotificationBoard>{
    state = {click : false}
    componentDidMount(){
    }

    handleClick(){
        if (this.state.click)
            this.setState({click : false});
        else
            this.setState({click : true});

    }

    render(){
			return(
			<>
			<UserContext.Consumer>
				{
					(user : any) => {
						return(
							<>
							<Flex zIndex="100" className="notification-board" flexDir="column" alignItems="center">
								{ 
									this.props.notifBody.length ?
									this.props.notifBody.map( (e : INotify) => {
									if (e.type === TNotify.game_req)
									{
										return (
											<GameInvite n={e} handleClick={this.props.handleClick} key={e.timestamp}/>
											// <Link to={e.content.link}>
											// 	{e.content.friend} wants to play!
											// </Link>
										)
									}
									else if (e.type === TNotify.follower)
									{
										return (
											<FriendNotification n={e} handleClick={this.props.handleClick} key={e.timestamp}/>
											// <div>
											// 	{e.content.userId} added you!
											// </div>
										)
									}
									return null
									})
									:
									<Flex w="90%" alignItems="center" justifyContent="center" py="1rem">
										<Text >No new notifications</Text>
									</Flex> 
								}
							</Flex>
							</>
						)
					}
				}
			</UserContext.Consumer>
			</>
			)
    }
}

interface PNotification {
    notif: any,
    setNotif: any,
    numnotif: number,
		notificationsOn: boolean,
		changeNotificationsOn: any,
		closeChat: any
}

interface SNotification {
    notificationNumber : number,
    }

export default class Notification extends react.Component<PNotification, SNotification>{
		iconSize = 6

    componentDidMount(){
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidUpdate(){
    }

    handleClick(){
			this.props.closeChat()
      this.props.changeNotificationsOn()
    }

    render(){
			return(
			<>
			<UserContext.Consumer>
				{
					(user : any) => {
				return(
						<>
						{
						this.props.notificationsOn ?
								<>
									<Box as="button" onClick={this.handleClick.bind(this)} _hover={{color:"rgb(240,0,225)"}}>
											<BellIcon  h={this.iconSize} w={this.iconSize} />
									</Box>
									<NotificationBoard 
									notifBody={this.props.notif}
									handleClick={this.handleClick.bind(this)}
									/>
								</>
								:
								<Box as="button" onClick={this.handleClick.bind(this)}
                                     _hover={{color:"rgb(240,0,225)"}}
									pos={'relative'}
										_after={this.props.numnotif !== 0 ? {
												content: '""',
												w: 3.5,
												h: 3.5,
												bg: 'rgb(0,255,255)',
												border: '2px solid white',
												rounded: 'full',
												pos: 'absolute',
												bottom: 4,
												right: -2,
										} : {} }>
									<BellIcon  h={this.iconSize} w={this.iconSize} />
							</Box>
						}
						</>
					)
					}
				}
			</UserContext.Consumer>
			</>
			)
    }
}