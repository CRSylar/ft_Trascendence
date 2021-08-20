import {
    Box,
    Heading,
    Text,
    Textarea,
    Button,
    Flex,
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverHeader,
    PopoverCloseButton,
} from '@chakra-ui/react'
import {IoExit} from "react-icons/io5";
import react from 'react'
import './ChatDisplay.css';
import {UserContext} from "../App"
import ChatWrapper from '../pages/ChatWrapper';
import {ChatIcon, DeleteIcon, CloseIcon, SettingsIcon} from '@chakra-ui/icons'
// import React from "react";
import { ChatSettings } from './ChatSettings';
import { Link } from 'react-router-dom';

type TDisplayMsg = {
    data: any,
    user: any,
    client: any,
    idChat: any,
    readUntil : number,
    participants:any[],
		// muted: any[]
}

interface IDisplayMsg {
    address: string;
    connected: boolean;
    userName: string;
}

class  DisplayMsg extends react.Component<TDisplayMsg, IDisplayMsg> {

	timestampToHour(UNIX_timestamp : number){
		let time: string
		const a = new Date(UNIX_timestamp);
		// const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		// const year = a.getFullYear();
		// const month = months[a.getMonth()];
		// const date = a.getDate();
		const hour = a.getHours();
		const min = a.getMinutes();
		// const sec = a.getSeconds();
		if (min < 10)
			time = hour + ':0' + min ;
		else
			time = hour + ':' + min ;
		return time
	}

    executeScroll = () => {
        let number = this.props.data;
        let composition = "message" + (number.length - 1).toString();
        document.getElementById(composition)?.scrollIntoView()

    }

    componentDidMount() {
        // document.getElementById('blurMe')?.setAttribute("style", "backdrop-filter: blur(3px)");
        this.executeScroll();
        this.props.client.on("msgToClient", (message: any) => {
            if (message?.id === this.props.idChat) {
                this.executeScroll()
            }
        })
    }
    componentDidUpdate(prevProps: Readonly<TDisplayMsg>, prevState: Readonly<IDisplayMsg>, snapshot?: any) {
	    this.executeScroll();
    }

    render() {
        return (
            <>
                {
                    this.props.data?.map((message: any, index: number) => {

												const visualizeMessage = () => {
													return !this.props.user.blocked.hasOwnProperty(message.sender);
												}
												let content : any = this.props.participants.find((el:any)=>el.idIntra === message.sender)
                        return (
													visualizeMessage() &&
                            <div key={"message" + Date.now() + index} id={"message" + index}>
                                {
                                    this.props.user.idIntra === message.sender ?
                                        <Box w="100%" overflow="auto">
                                            <Box w="60%" bgColor="#333333" borderRadius="10px" 
																						py="0.8rem" px="0.8rem"
                                                 borderStyle="solid" mt="10px" float="right" overflow="auto">
                                                <Heading size="sm">
                                                <Link to={`/profile/${this.props.user.idIntra}`}>
                                                    {this.props.user.userName}
                                                </Link>
                                                </Heading>
                                                <Text my="0.2rem">
                                                    {message.msgBody}
                                                </Text>
                                                <Text align="right"
                                                      fontSize="xs">
                                                        {this.timestampToHour(message.timestamp)}
                                                    {Number(this.props.readUntil) > message.timestamp ? " 🐵" : " 🙈" }
                                                </Text>
                                            </Box>
                                        </Box>
                                        :
                                        <Box w="100%" overflow="auto">
                                            <Box w="60%" bgColor="#333333" borderRadius="10px" 
																						py="0.5rem" px="1rem"
                                                 borderStyle="solid" mt="10px" float="left" overflow="auto">
                                                <Link to={`/profile/${content?.idIntra}`}>
                                                    <Heading size="sm">{content?.userName}</Heading>
                                                </Link>
                                                <Text my="0.2rem">
																									{message.msgBody}
																								</Text>
                                                <Text align="right"
                                                      fontSize="xs">{this.timestampToHour(message.timestamp)}
																											{/* <br/>
																											{Number(this.props.readUntil) > message.timestamp ? "🐵" : "🙈" } */}
																								</Text>
                                            </Box>
                                        </Box>
                                }
                            </div>

                        )
                    })
                }
            </>
        )
    }
}


type PChat = {
    messages: any,
    client: any,
    user: any,
    readUntil : number,
    idChat: any,
    setChat: any,
    close: any,
    admin: any;
    moderators : any,
    participants:any,
}

interface SChat {
    address: string;
    connected: boolean;
    userName: string;
    isLoggedIn: boolean;
    isTyping: boolean;
    messages: any[];
    whoIsTyping: any[];
    searchVal: string;
    idChat: string;
    readUntil : number;
		settings: boolean;
}

export default class Chat extends react.Component<PChat, SChat> {
    state: any = {messages: null, whoIsTyping:[], settings: false}

    onButtonClicked() {
				const messageBar: any = document.getElementById("messageBar")
        const value = messageBar?.value
        // let tmp: any;
        // tmp = Date().toString().split(" ")[4].split(':')
        // tmp = tmp[0] + ":" + tmp[1]
        if (value !== "") {
            this.props.client.emit('msgToServer', {
                to: this.props.idChat,
                msg: true,
                content: {
                    idChat: this.props.messages.displayedChat,
                    msgBody: value,
                    sender: this.props.user.idIntra,
                    timestamp: Date.now()
                }
            })
        }
        this.setState({searchVal: "", isTyping: false})
        this.props.client.emit('isTyping', {
            to: this.props.idChat,
            msg: false,
            user: this.props.user.userName
        });
    }

    typingUptime=(msg: any)=>{
            if (msg.msg === false) {
                for (let i in this.state.whoIsTyping) {
                    if (msg && msg.user && this.state.whoIsTyping[i] === msg.user && msg.msg === false) {
                        let filtered = this.state.whoIsTyping.filter((el: any) => (el !== msg.user && el !== undefined))
                        this.setState({whoIsTyping: (filtered.length !== 0 ? filtered : [])})
                    }
                }
            } else {
                if(msg.user !== this.props.user.userName){
                        let newState = this.state;
                        newState.whoIsTyping && newState.whoIsTyping.push(msg.user)
                        this.setState(newState);
                    }
                }
            }

    manageChanges(e: any) {
        if (e) {
            if (this.state.isTyping === undefined || this.state.isTyping === false) {
                this.setState({isTyping: true})
                this.props.client.emit('isTyping',
                    {
                        to: this.props.idChat,
                        msg: true,
                        user: this.props.user.userName
                    }
                )
            }
            if (( e.target.value === "") || this.state.searchVal === "") {
                this.setState({isTyping: false})
                this.props.client.emit('isTyping', {
                        to: this.props.idChat,
                        msg: false,
                        user: this.props.user.userName,
                    }
                )
            }
            if (e !== undefined)
                this.setState({searchVal: e.target.value});
        }
    }

    manageKeyPressure = (e: any) => {
        if (e.key === "Enter")
            this.onButtonClicked()
    }

    componentDidMount() {
        this.setState({connected: true});
        // window.addEventListener("keypress", this.manageKeyPressure);
        this.props.client.on("isTyping", (message: any)=>{
            if (message.to === this.props.idChat)
                this.typingUptime(message);
        })
    }

    componentWillUnmount() {
        // window.removeEventListener("keypress", this.manageKeyPressure)
    }

    async deleteChat() {
        this.props.setChat(undefined)
        this.props.client.emit('deleteChat', this.props.idChat)
    }

		openSettings() {
			this.setState({settings: true})
		}

		closeSettings() {
			this.setState({settings: false})
		}

    leaveChat=()=>{
        this.props.client.emit("leaveChat", {idChat:this.props.idChat, idIntra:this.props.user.idIntra})
    }

		checkModerators(id: string) {
			for (const user of this.props.moderators)
			{
				if (user.idIntra === id)
					return true
			}
			return false
		}

    render() {
        //console.log(this.props.user.chat.find((el : any) => el.id === this.props.idChat))
        return (
            <>
                <Box w="100%" h="100%" borderRadius="15px"
									color="inherit"
									// backgroundColor="rgba(38, 38, 38,0.7)"
									padding="1.5rem"
									display="flex"
									flexDirection="column">
										<ChatSettings settings={this.state.settings} user={this.props.user} 
											idChat={this.props.idChat} closesettings={this.closeSettings.bind(this)}
											participants={this.props.participants} admin={this.props.admin}
											moderators={this.props.moderators}/>
										<Flex justifyContent="space-between" alignItems="center" h="10px">
											<Flex alignItems="center">
												{this.props.user.idIntra === this.props.admin[0].idIntra ? 
													<DeleteIcon onClick={() => this.deleteChat()} className="iconHover"/> 
												:
													<Popover>
														<PopoverTrigger>
															<Box>
																<Icon as={IoExit} className="iconHover" w="5" h="5"/>
															</Box>
														</PopoverTrigger>
														<PopoverContent bgColor={"rgba(30,30,30,0.6)"} color={"inherit"}>
																<PopoverArrow />
																<PopoverCloseButton />
																<PopoverHeader>Do you really want to leave this chat?</PopoverHeader>
																<Button bgColor={"inherit"} 
																	onClick={this.leaveChat} color={"inherit"}>
																	Confirm
																</Button>
														</PopoverContent>
													</Popover>
												}
												{
													(this.props.user.idIntra === this.props.admin[0].idIntra ||
													this.checkModerators(this.props.user.idIntra)) &&
														<SettingsIcon onClick={() => this.openSettings()} className="settingsHover" mx="1rem"/>
												}
												
											</Flex>
                    	<CloseIcon  onClick={() => this.props.close(null)} className="iconHover"/>
                                            
										</Flex>
                    <Box className="msgSpace" id="msgSpace">
                        {this.props.messages ?
                            <DisplayMsg data={this.props.messages}  participants={this.props.participants} user={this.props.user}  client={this.props.client} readUntil={this.props.readUntil}
                                        idChat={this.props.idChat}/> : <> </>}
                    </Box>
                    <Box>
                        {(this.state.whoIsTyping.length !== 0 ) ? (this.state.whoIsTyping?.map((el:any, index:number) => {
                        if(el !== this.props.user.userName) {
                            if (index === 0)
                                return el
                            else
                                return (", "+el);
                        }
												return null
                    })+((this.state.whoIsTyping.length === 1)? " is " :" are " )+ "typing...")
                        :
                            ""}
                    </Box>
                    <Box className="senderSpace">
											{/* <InputGroup size="xl"> */}
												<Textarea
													width="80%"
													variant="filled"
													background="#141414"
													resize="none"
													id={"messageBar"}
													value={this.state.searchVal}
													onChange={(e: any) => this.manageChanges(e)}
													onKeyUp={(e: any) => this.manageKeyPressure(e)}
													placeholder="Write a message..."
													_hover={{}}
													_focus={{}}
													rows={2}
													borderRadius="10px 0 0 10px"
													/>
													{/* <InputRightElement width="4rem"> */}
													<Button 
														h="4rem" 
														borderRadius="0 10px 10px 0"
														// size="md" 
														onClick={this.onButtonClicked.bind(this)}
														backgroundColor="#141414"
														border="2px solid rgb(0,255,255)"
                            _hover={{backgroundColor: "rgb(0,155,155)"}}
													>
															Send
													</Button>
													{/* </InputRightElement> */}
											{/* </InputGroup> */}
                    </Box>
                </Box>
            </>
        )
    }

}

type TChatButton = {
	chatOn: boolean,
	changeChatOn: any,
	closeNotifications: any,
    newNotif: boolean,
}

interface IChatButton {
    messageNumber: number,
}

export class ChatButton extends react.Component<TChatButton, IChatButton> {

    iconSize = 6

    componentDidMount() {
        this.handleClick = this.handleClick.bind(this)
        window.addEventListener("click", this.outClick);

    }
    outClick=(e:any)=>{
        if (e.path && (e.path[0]?.id === "blurIt" ||
					e.path[0]?.id === "clickToExit"))
            this.handleClick();
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.outClick)
    }

    handleClick() {
			this.props.closeNotifications()
      this.props.changeChatOn()
    }

    render() {
			return (
				<>
					<UserContext.Consumer>
						{
							(context: any) => {
								return (
									<>
										{
											this.props.chatOn ?
											(
												<>
													<Box as="button"
                                                         _hover={{color:"rgb(240,0,225)"}}
                                                         onClick={this.handleClick}>
															<ChatIcon w={this.iconSize} h={this.iconSize}/>
													</Box>
													<ChatWrapper data={context}/>
												</>
											)
											:
											(
												<Box as="button" onClick={this.handleClick}
													// className="on-notification-circle"
													pos={'relative'}
													_after={this.props.newNotif ? {
															content: '""',
															w: 3.5,
															h: 3.5,
															bg: 'rgb(0,255,255)',
															border: '2px solid white',
															rounded: 'full',
															pos: 'absolute',
															bottom: 4,
															right: -2,
													} : {}}>
														<ChatIcon w={this.iconSize} h={this.iconSize} _hover={{color:"rgb(240,0,225)"}}

														/>

														{/* <Heading m="auto" size="lg">{this.state.messageNumber}</Heading> */}
													</Box>
													// )
												)
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
