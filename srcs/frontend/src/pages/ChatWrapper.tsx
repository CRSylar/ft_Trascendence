import {
	Avatar,
	Box,
	Button,
	CircularProgress, Input,
	Text
} from '@chakra-ui/react'
import React from 'react'
import ChatOpened from '../components/ChatOpened'
import ChatUsers from './ChatUser'
import "./ChatWrapper.css"
import * as api from "../components/ApiConnector/ApiConnector"
import ChatDisplay from "../components/ChatDisplay"
import { UserContext } from '../App'
// import io from 'socket.io-client';
import {Flex} from "@chakra-ui/layout";
import {GroupChat} from "../components/GroupChat";


interface PChatWrapper {
	data : any
}

interface SChatWrapper {
	users			:any;
	context			:any;
	chats			:any;
	rdy				:boolean;
	group			:boolean;
	friends_public 	:string,
	passInsert:boolean,
	pwdChatId:number | undefined

}

export default class ChatWrapper extends React.Component<PChatWrapper, SChatWrapper> {
	state : any = {users : null, context : null, chats : null, rdy:false, group:false, friends_public:"Public", passInsert: false}

	groupChatCreation(){
		this.setState({group:true});
	}

	unsetGroup(){
		this.setState({group:false});
	}

	changeFriends_public = () => {
	    this.setState({friends_public : this.state.friends_public === "Friends" ? "Public" : "Friends"})
    }

	async componentDidMount(){
			const chats = await api.GetChatPerUser(this.props.data.user.idIntra);
			this.setState({
				users: this.props.data.user.userFriends, 
				rdy: true, 
				chats: chats
			});
	}

	beParticipant=(id:number, idIntra: string)=>{
		this.props.data.client.emit("joinPublicChat", {
			idChat:id,
			idIntra: idIntra,
		})
		this.props.data.setPbChats(id);
	}

	beParticipantPassword =()=>{
		// @ts-ignore
		let pwd : any= document.getElementById("SetPwd")?.value;
		this.props.data.client.emit("joinPublicChat", {
			idChat:this.state.pwdChatId,
			idIntra: this.props.data.user.idIntra,
			pwd : pwd
		})
		this.props.data.setPbChats(this.state.pwdChatId);
		this.setState({passInsert:false, pwdChatId:undefined});
	}

	render(){
	return(
		<>
			<UserContext.Consumer>
				{ (data:any)=>{
					return (
						<Box id="blurIt">
							{
								this.state.passInsert ?
								<Flex zIndex={205 } flexDir={"column"} alignContent={"center"} justifyContent={"space-evenly"} alignItems={"center"} borderRadius={"10px"} w={"100%"} h={"30%"} bgColor={"rgba(38, 38, 38, 1)"} maxW="500px" margin="auto">
									<Input id="SetPwd" w={"80%"} placeholder={"Insert Password"}
										variant="flushed"></Input>
									<Button onClick={this.beParticipantPassword}
										bgColor="black"
										borderColor="rgb(0,255,255)" borderWidth="thin" 
										_hover={{ bg: "rgb(0,155,155)" }}>
										Enter
									</Button>
								</Flex>
									:

							<Flex h="92%" w="100%"
									// border="2px solid yellow"
									maxW="1200px"
									id="clickToExit"
									mx="auto" position="relative">

								{
									this.state.group &&
									<GroupChat unset={this.unsetGroup.bind(this)} data={data} setError={data.setError}/>
								}
								{
									data.displayedChat && 
									<ChatDisplay chatData={data.chatDisplay}/> 
								}

								<Box className="left-wrapper" zIndex="1">
									<Box className="opened-chat">
										{this.state.chats ?
											<ChatOpened context={data} chats={data.chat}/>
											:
											<CircularProgress m="auto" size="40px" isIndeterminate color="rgb(0,255,255)"/>
										}
									</Box>
									<Box className={"newGroupChatButton"}
									onClick={()=>this.groupChatCreation()}>
										New group chat
									</Box>
									<Flex w="80%" alignItems="flex-end">
										<Box  
											className={this.state.friends_public === "Public" ?
												"selectedFriendsButton"
												: "unselectedFriendsButton"
											}
											onClick={this.changeFriends_public}>
											Friends
										</Box>
										<Box  
											className={this.state.friends_public === "Friends" ?
											"selectedFriendsButton"
											: "unselectedFriendsButton"
										}
											onClick={this.changeFriends_public}>
											Public
										</Box>
									</Flex>
									{ 
										this.state.friends_public === "Public" ?
											<Box className="friends-wrapper" >
											{
												this.state.users ?
													<ChatUsers 
														client={this.props.data.client} 
														obj={this.state.users} 
														chats={data.chat} 
														me={this.props.data.user} 
														chatUpdate={this.props.data.setDisplayedChat}/>
													:
													<CircularProgress m="auto" size="40px" isIndeterminate color="rgb(0,255,255)"/>
											}
											</Box>
											:
											<Flex className="public-wrapper" >
												<Flex flexDir={"column"} justifyContent={"flex-start"} align={"center"}  >
													{data.pubChats.map((el:any)=> {
														return (
															<Flex id={"pbchat"+el.id}
																  key={"pbchat"+el.id}
																  bg={"#333333"}
																  cursor={"pointer"}
																  borderRadius={"10px"}
																  /*_hover={{bg:"#666666"}}*/
																  w={"100%"}
																  justify={"space-evenly"}
																  align={"center"}
																  onClick={()=>{
																	return(el.pwd ?
																		this.setState({passInsert:true, pwdChatId: el.id})
																		:
																		this.beParticipant(el.id, data.user.idIntra))
																	}}
																  >
																<Avatar w={"30%"} name={el.name}/>
																<Text w={"60%"}>{el.name}</Text>
															</Flex>
														)
													})}
												</Flex>
											</Flex>
									}
								</Box>
							</Flex>}
						</Box>
					)}
				}
			</UserContext.Consumer>
		</>
	)
}
}