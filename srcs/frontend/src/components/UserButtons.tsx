import { Component } from "react";
import {
	Flex,
	Button,
	Box, Icon, Tooltip
} from '@chakra-ui/react'
import {Link} from 'react-router-dom'
import '../pages/Users.css'
import * as api from "./ApiConnector/ApiConnector"
import {GiHandOfGod} from 'react-icons/gi'

interface PUserButtons {
	user: any,
    me : any,
	isFriend: boolean,
	isMe: boolean,
    isBlocked: boolean,
}


export class UserButtons extends Component<PUserButtons>{

	friendReq = ()=> {
		api.PostFriendshipRequest(this.props.user.idIntra);
	};

	unFriendReq = () => {
		api.PostUnFriendshipRequest(this.props.user.idIntra);
	};

	handleMute = () => {
	    api.blockUser(this.props.me.idIntra, this.props.user.idIntra)
    }

    handleUnMute = () => {
        api.unBlockUser(this.props.me.idIntra, this.props.user.idIntra)
    }


	render(){
		return(
			<>
			{
				// this.props.data.idIntra === this.props.user.idIntra ?
				this.props.isMe ?
					this.props.user.owner || this.props.user.isAdmin ?
					<Flex>
						<Link to={"/admin"}>
							<Tooltip label={"En†3r †h3 G0dM0D£"}>
								<Button bgColor={"inherit"}  color={"inherit"} _hover={{bg: "#666666"}}>
									<Icon as={GiHandOfGod} color={"rgb(112,255,255)"} w={10} h={10}></Icon>
								</Button>
							</Tooltip>
						</Link>
					</Flex> :
						<Box/>
				:
				<Flex  justifyContent="space-between" alignItems="center" w="100%">
					{
						!this.props.isFriend ? 
						<Button 
							onClick={this.friendReq}
							size="lg" bgColor="black" mt="1rem"
							borderColor="rgb(0,255,255)" borderWidth="2px"
							w="30%" maxW="200px"
							_hover={{ bg: "rgb(0,155,155)" }} >
								Add
						</Button>
						:
						<Button
							onClick={this.unFriendReq}
							size="lg" bgColor="black" mt="1rem"
							borderColor="rgb(255,0,255)" borderWidth="2px"
							_hover={{ bg: "rgb(255,0,255)" }}
							w="30%" maxW="200px" 
							>
									Remove
						</Button>

					}
					<Button
						as={Link} to={`/game?id=${this.props.user.idIntra}&name=${this.props.user.userName}`}
						size="lg" bgColor="black" mt="1rem"
						borderColor="rgb(0,255,255)" borderWidth="2px"
						w="30%" maxW="200px" px="0"
						_hover={{ bg: "rgb(0,155,155)", color: "white" }}>
							Invite
					</Button>
                    {
                        !this.props.isBlocked?
                    <Button
						onClick={this.handleMute}
						size="lg" bgColor="black" mt="1rem"
						borderColor="rgb(0,255,255)" borderWidth="2px"
						w="30%" maxW="200px"
						_hover={{ bg: "rgb(0,155,155)" }}>
							Mute
					</Button>
					:
                            <Button
                                onClick={this.handleUnMute}
                                size="lg" bgColor="black" mt="1rem"
                                borderColor= "rgb(255,0,255)" borderWidth="2px"
                                w="30%" maxW="200px"
                                _hover={{ bg: "rgb(255,0,255)" }}>
                                UnMute
                            </Button>
                    }
				</Flex>
			}
			</>
		)

	}
	
}