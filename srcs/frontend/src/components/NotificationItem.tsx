// import React from "react";
// import { MdClose } from "react-icons/md";
import { Flex } from "@chakra-ui/react";
import {Link} from 'react-router-dom';
import { SmallCloseIcon } from "@chakra-ui/icons";
import "./NotificationItem.css"
import * as api from "./ApiConnector/ApiConnector"
// import {deleteFollowNotification} from "./ApiConnector/ApiConnector";

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

interface PNotify {
	n: INotify,
	handleClick: any
}

async function destroyNotification(n: any) {
	try {
		if (n.type === TNotify.follower)
			await api.deleteFollowNotification(n);
	} catch (e) {
		console.error("something wrong on destroy notification", e)
	}
}

export function GameInvite(props: PNotify) {
	// console.log(props.n.content)
	return(
		<Flex w="90%" alignItems="center" justifyContent="space-between" className="notifItem">
			<Link to={props.n.content.link} 
			className="noUnderline"
			onClick={() => {
				destroyNotification(props.n)
				props.handleClick()
			}}>
					{props.n.content.friend} wants to play!
			</Link>
			<SmallCloseIcon className="closeNotif" 
				w="5" h="5" background="none"
				onClick={() => {destroyNotification(props.n)}} />
		</Flex>
	)
}

export function FriendNotification(props: PNotify) {
	return(
		<Flex w="90%" alignItems="center" justifyContent="space-between" className="notifItem">
			<Link to={"/profile/" + props.n.content.userId} 
			className="noUnderline"
			onClick={() => {
				destroyNotification(props.n)
				props.handleClick()
			}}>
					{props.n.content.userId} added you!
			</Link>
			<SmallCloseIcon className="closeNotif"
			 w="5" h="5" background="none"
			 onClick={() => {destroyNotification(props.n)}} />
		</Flex>
	)

}