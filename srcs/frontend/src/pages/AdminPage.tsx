import { Component } from "react"
import {
	Flex,
	Input,
	Button,
	InputRightElement,
	InputGroup,
	Box,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton, Text, Divider,
} from "@chakra-ui/react";
import * as api from '../components/ApiConnector/ApiConnector';
import { UserContext } from "../App";
import {ChatSpy} from "../components/ChatSpy";

interface PUser {
    user : any,
	data : any
}

export class AdminPage extends Component<PUser> {

	state = {
		ban         : "",
        banInValid  : false,
		newAdmin    : "",
		adminInValid  : false,
		rmvAdmin    : "",
		rmvAdminInValid  : false,
		unban       : "",
		mod         : "",
		unmod       : "",
        unModInvalid: false,
        chatVisible : false,			
		modalOpen	: false,
        chats: [],
		selected: 0,
		spyMsgs : [] as any,
		spyChat: false,
	}

	componentDidMount(){
	}

	handleBan(event: any) {
    this.setState({ban: event.target.value})
	}
	handleUnban(event: any) {
    this.setState({unban: event.target.value})
	}

	handleNewAdmin(event: any) {
		this.setState({newAdmin: event.target.value})
	}
	async newAdminButton() {
		let status = await fetch('/api/users/addAdmin', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				idIntra: this.state.newAdmin,
			}),
		});
		if (status.status > 203)
			this.setState({adminInValid: true});
		this.setState({newAdmin: ""})
	}

	handleRmvAdmin(event: any) {
		this.setState({rmvAdmin: event.target.value})
	}
	async rmvAdminButton() {
		let status = await fetch('/api/users/removeAdmin', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				idIntra: this.state.rmvAdmin,
			}),
		});
		if (status.status > 203)
			this.setState({adminInValid: true});
		this.setState({newAdmin: ""})
	}

	handleMod(event: any) {
    this.setState({mod: event.target.value})
	}
	handleUnmod(event: any) {
    this.setState({unmod: event.target.value})
	}

	async banButton() {
		let status = await fetch('/api/users/permaban', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                idIntra: this.state.ban,
            }),
        });
		if (status.status > 203)
		    this.setState({banInValid: true});
        this.setState({ban: ""})
    }

    async unbanButton() {
        await fetch('/api/users/unBan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                idIntra: this.state.unban,
            }),
        });
        this.setState({unban: ""})
	}

	showChats = async () => {
       let chats: any = await fetch('/api/chat/show');
        chats = await chats.json();
        this.setState({chats: chats});
        this.setState({chatVisible: !this.state.chatVisible});
    }

    /*modButton() {
		// TODO: ADD API
		console.log("mod " + this.state.mod)
	}
	unmodButton() {
		// TODO: ADD API
		console.log("unmod " + this.state.unmod)
	}*/

	openModal = (selected: number) => {
			this.setState({selected: selected})
    	this.setState({modalOpen : true})
	}

	closeModal = () => {
		this.setState({modalOpen : false})
	}
	emitRemoveChat = (client : any) => {
		// @ts-ignore
    	client.emit("deleteChat", String(this.state.chats[this.state.selected].id));
		this.setState({chatVisible: !this.state.chatVisible});
		this.setState({chats : [] });
		this.setState( {selected : 0 });
    }

    callbackOnMsg = (payload : any) => {
		if (this.state.spyMsgs.length && Number(payload.to) === this.state.spyMsgs[0]?.idChat) {
			this.props.data.client.emit("readChat", payload.to)
			this.state.spyMsgs.push(payload.content);
		}
	}

    setSpyChat  = async (msgs:any[]) =>{
		if (!msgs || !msgs.length)
			msgs = []
		this.setState({
			spyChat: true,
			spyMsgs: msgs,
			modalOpen: false
		})
		if (!this.state.spyMsgs.length)
			return ;
		this.props.data.client.off("msgToClient", this.callbackOnMsg)
		this.props.data.client.on("msgToClient", this.callbackOnMsg)
		//console.log("first msg", this.state.spyMsgs[0])
		this.props.data.client.emit("spyChatCli", {idChat : this.state.spyMsgs[0].idChat})
	}

    stopSpying=()=>{
		if (this.state.spyMsgs.length)
			this.props.data.client.emit("stopSpyChat", {idChat : this.state.spyMsgs[0].idChat})
		this.setState({
			spyChat:false,
			spyMsgs:[],
			modalOpen:true
		})
		this.props.data.client.off("msgToClient", this.callbackOnMsg)
	}

	render(){
		return(
			<UserContext.Consumer>{ (context : any) => {
				return (
					<Box background="gray.900" p="0" m="0" h="calc(100vh - 44px)" overflow={"hidden"} >
						{this.state.spyChat ? <ChatSpy msgs={this.state.spyMsgs} unSet={this.stopSpying} /> :
							<Box paddingTop={"5%"} flexDir="column" align="center" justifyContent="center" h="80vh" color="white">
								<InputGroup w="21vw" minWidth="300px" m="2rem">
									<Input
										placeholder={"Ban User"}
										value={this.state.ban}
										isInvalid={this.state.banInValid}
										errorBorderColor="rgb(255,0,255)"
										onChange={this.handleBan.bind(this)}
									/>
									<InputRightElement width="4.5rem">
										<Button bgColor="black"
												borderColor="rgb(0,255,255)" borderWidth="medium"
												_hover={{bg: "rgb(0,255,255)"}}
												onClick={this.banButton.bind(this)}
										>
											Submit
										</Button>
									</InputRightElement>
								</InputGroup>
								<InputGroup w="21vw" minWidth="300px" m="2rem">
									<Input
										placeholder={"Unban User"}
										value={this.state.unban}
										onChange={this.handleUnban.bind(this)}
									/>
									<InputRightElement width="4.5rem">
										<Button bgColor="black"
												borderColor="rgb(0,255,255)" borderWidth="medium"
												_hover={{bg: "rgb(0,255,255)"}}
												onClick={this.unbanButton.bind(this)}
										>
											Submit
										</Button>
									</InputRightElement>
								</InputGroup>
								<InputGroup w="21vw" minWidth="300px" m="2rem">
									<Input
										placeholder={"Add Admin"}
										value={this.state.newAdmin}
										isInvalid={this.state.adminInValid}
										errorBorderColor="rgb(255,0,255)"
										onChange={this.handleNewAdmin.bind(this)}
									/>
									<InputRightElement width="4.5rem">
										<Button bgColor="black"
												borderColor="rgb(0,255,255)" borderWidth="medium"
												_hover={{bg: "rgb(0,255,255)"}}
												onClick={this.newAdminButton.bind(this)}
										>
											Submit
										</Button>
									</InputRightElement>
								</InputGroup>
								<InputGroup w="21vw" minWidth="300px" m="2rem">
									<Input
										placeholder={"Remove Admin"}
										value={this.state.rmvAdmin}
										onChange={this.handleRmvAdmin.bind(this)}
									/>
									<InputRightElement width="4.5rem">
										<Button bgColor="black"
												borderColor="rgb(0,255,255)" borderWidth="medium"
												_hover={{bg: "rgb(0,255,255)"}}
												onClick={this.rmvAdminButton.bind(this)}
										>
											Submit
										</Button>
									</InputRightElement>
								</InputGroup>
								<Button bgColor="black"
										borderColor="rgb(0,255,255)" borderWidth="medium"
										_hover={{bg: "rgb(0,255,255)"}}
										onClick={this.showChats}
								>
									Show Chats
								</Button>
								{
									this.state.chatVisible ?
										<Flex w={"100%"} justifyContent={"center"}>
											<Flex marginTop={"5%"} minWidth={"30%"}  maxW={"80%"} flexDir={"row"} overflowX={"scroll"}> {
												this.state.chats.map((chat: any, index: number) =>
													<Button flexShrink={0} margin={"2%"} bg="teal" onClick={() => this.openModal(index)}
															key={chat.id}>
														{chat.name}
													</Button>
												)}
												{this.state.chats.length &&
												<Modal size={"xl"} isOpen={this.state.modalOpen}
													   onClose={this.closeModal.bind(this)}>
													<ModalOverlay/>
													<ModalContent bgColor={"rgb(0,255,255)"}>
														<ModalHeader>
															Chat n. {
															// @ts-ignore
															this.state.chats[this.state.selected].id
														}
														</ModalHeader>
														<ModalCloseButton/>
														<ModalBody>
															<ChatInfo chat={this.state.chats[this.state.selected]}
																	  spyChat={this.setSpyChat}
																	  callback={() => this.emitRemoveChat(context.client)}/>
														</ModalBody>
														<ModalFooter>
															<Button colorScheme="rgb(0,255,255)" mr={3} color={"black"} onClick={this.closeModal}>
																Close
															</Button>
														</ModalFooter>
													</ModalContent>
												</Modal>}
											</Flex>
										</Flex>
										:
										<></>
								}
							</Box>
						}
					</Box>)
			}}
			</UserContext.Consumer>
		)
	}
}


function ChatInfo(chat :any) {

	let removeAdmin = async (chat :any, idIntra :string) : Promise<any> => {
		await api.removeAdmin( { idParticipant: idIntra, idChat: chat.id } );
		//console.log('rimosso Admin', chat.id, idIntra);
	}

	let removeParticipant = async (chat :any, idIntra: string) : Promise<any> => {
		await api.removeParticipant({idParticipant : idIntra, idChat : chat.id});
		//console.log('rimosso Partecipante', chat.id, idIntra);
	}

	let getMessages = async (chatDue: any) : Promise<any> => {
		let ref = await api.getMessages(chatDue.id);
		chat.spyChat(await ref);
	}

	return( 
		<>
			<Box>{
				chat.chat.admin.map( (admn: any, index: number) =>
				// <InputGroup size="md">
				// 	<Input variant='filled' placeholder={admn}/>
				// 	<InputRightElement>
				// 		<Button bg="black">
				// 			Remove Admin
				// 		</Button>
				// 	</InputRightElement>
				// </InputGroup>
				<Flex alignItems="center" justifyContent="space-between" w="100%" key={index}>
					<Text>{admn.idIntra}</Text>
					<Button bg="gray.700" color="rgb(255,0,255)" onClick={ () => removeAdmin(chat.chat, admn.idIntra)} >
			 			Remove Admin
					</Button>
				</Flex>
				)
			}
			</Box>
			<Divider mt="1.5rem" mb="1.5rem" borderColor="black"/>
			<Box>{
				chat.chat.participant.map( (participant: any, index: number) =>
				// <InputGroup size="md">
				// 	<Input variant='filled' placeholder={participant}/>
				// 	<InputRightElement>
				// 		<Button bg="black">
				// 			Remove Admin
				// 		</Button>
				// 	</InputRightElement>
				// </InputGroup>
				<Flex margin={"1%"} alignItems="center" justifyContent="space-between" w="100%" key={index}>
					<Text>{participant.idIntra}</Text>
					<Button bg="gray.700" color="rgb(255,0,255)" onClick={ ()=> removeParticipant(chat.chat, participant.idIntra) } >
			 			Remove Participant
					</Button>
				</Flex>
				)
			}
			</Box>
			<Box>
				<Flex alignItems="center" flexDir={"column"} marginTop={"5%"} justifyContent="space-between" w="100%" >
					<Button margin={"1% auto"} w={"40%"} bg="gray.700" color="rgb(255,0,255)" onClick={ () => getMessages(chat.chat)}>
						Spy Chat
					</Button>
					<Button margin={"1% auto"} w={"40%"} bg="gray.700" color="rgb(255,0,255)" onClick={(e)=>chat.callback(e)}>
						Delete Chat
					</Button>
				</Flex>
			</Box>
		</>
	)
}

/*
<InputGroup w="21vw" minWidth="300px" m="2rem">
						<Input
							placeholder={"Mod User"}
							// value={this.state.newAvatar}
							onChange={this.handleMod.bind(this)}
						/>
						<InputRightElement width="4.5rem">
							<Button bgColor="black"
								borderColor="rgb(0,255,255)" borderWidth="medium" _hover={{ bg: "rgb(0,255,255)" }}
								onClick={this.modButton.bind(this)}
							>
								Submit
							</Button>
						</InputRightElement>
					</InputGroup>
					<InputGroup w="21vw" minWidth="300px" m="2rem">
						<Input
							placeholder={"Unmod User"}
                            isInvalid={this.state.banInValid}
                            errorBorderColor="rgb(255,0,255)"
							// value={this.state.newAvatar}
							onChange={this.handleUnban.bind(this)}
						/>
						<InputRightElement width="4.5rem">
							<Button bgColor="black"
								borderColor="rgb(0,255,255)" borderWidth="medium" _hover={{ bg: "rgb(0,255,255)" }}
								onClick={this.unbanButton.bind(this)}

							>
								Submit
							</Button>
						</InputRightElement>
					</InputGroup>
 */
