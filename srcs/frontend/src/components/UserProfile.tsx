import { Component } from "react";
import {
    CircularProgress,
    Avatar,
    Heading,
    Flex,
    CircularProgressLabel,
		Center,
		Divider,
		AvatarBadge
} from '@chakra-ui/react'
import '../pages/Users.css'
import { UserButtons } from "./UserButtons";

interface PUserProfile {
	user: any,
	me: any
}


export class UserProfile extends Component<PUserProfile>{

	searchFriends() {
		if (!this.props.user || !this.props.me.userFriends)
				return false;
		for (const f of this.props.me.userFriends) {
				if (f.idIntra === this.props.user.idIntra) {
						return true;
				}
		}
		return false
	}

    findBlock = () => {
	    if (!this.props.me.blocked.hasOwnProperty(this.props.user.idIntra))
		    return false;
	    return true;
    }


    render() {
		return(
			<>
					
			{/* <Text color="white">{JSON.stringify(this.props.user)}</Text> */}
			<Flex flexDir="column" color="white" alignItems="center"
					fontFamily="Montserrat" justifyContent="space-around"
				p="min(2rem, 5%)" background="#333333" borderRadius="1rem" mx="0.5rem"
				minHeight="60%" w="90%" maxW="800px" flex-wrap="wrap" margin="auto"
				>

				<Flex className="userflex" justifyContent="space-between" alignItems="center" w="100%">
					<Center w="30%"  flex="1">
						<Avatar src={this.props.user.img} w="min(10rem, 20vw)" h="min(10rem, 20vw)" minWidth="5rem" minHeight="5rem">
							<AvatarBadge boxSize="30%" borderColor="#333333" 
							bg={ this.props.user.status === "online" ?
								"rgb(0,255,255)"
								:	(this.props.user.status === "in-game" ?
									"rgb(255,0,255)" :
									"red.500")
								} />
						</Avatar>
					</Center>
					<Flex flexDir="column" justifyContent="center" alignItems="center" m="1rem" className="username">
						<Heading className="text" fontSize="4xl"  w="100%" textAlign="center">{this.props.user.userName}</Heading>
						<Heading className="text" color="lightgray" fontSize="2xl" textAlign="center">{this.props.user.idIntra}</Heading>
					</Flex>
				</Flex>

				<Divider/>

				<Flex className="userflex" justifyContent="space-between" w="100%" >
					<Flex className="start" flexDir="column"  justifyContent="center">
						<Heading className="text" fontSize="2xl">
							{this.props.user.firstName} {this.props.user.lastName}
						</Heading>
						
						<Heading className="text" fontSize="lg">{this.props.user.campus}</Heading>
					</Flex>
					
					<Flex  alignItems="center" justifyContent="center">
					{
						Number(this.props.user.win) === 0 && Number(this.props.user.loses) === 0 ?
						<CircularProgress trackColor="rgb(255,0,255)" size="5rem" value={50} color="rgb(0,255,255)">
								<CircularProgressLabel>0%</CircularProgressLabel>
						</CircularProgress>
						:
						<CircularProgress trackColor="#bb0000" size="5rem" value={Number(this.props.user.win) * 100 / (Number(this.props.user.win) + Number(this.props.user.loses))} color="rgb(0,255,255)">
								<CircularProgressLabel>{Math.round(Number(this.props.user.win) * 100 / (Number(this.props.user.win) + Number(this.props.user.loses)))}%</CircularProgressLabel>
						</CircularProgress>
					}
					</Flex> 

					<Flex flexDir="column" className="end" justifyContent="center">
						<Heading className="text" fontSize="2xl" textAlign="center">
							Rank: {this.props.user.rank}
						</Heading>
						<Heading className="text" fontSize="lg" textAlign="center">
							W: {this.props.user.win} - L: {this.props.user.loses}
						</Heading>
					</Flex>
				</Flex>
				<UserButtons 
					isMe={this.props.me.idIntra === this.props.user.idIntra } 
					user={this.props.user}
					me = {this.props.me}
					isFriend={this.searchFriends()}
                    isBlocked={this.findBlock()}/>
			</Flex>
			</>
		)
	}

}