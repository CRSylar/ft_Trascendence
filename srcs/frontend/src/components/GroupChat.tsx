import React, {Component} from "react";
import {Flex} from "@chakra-ui/layout";
import {Box, Checkbox, Spacer} from "@chakra-ui/react";
import {Button,Text,Input} from "@chakra-ui/react";
import {MakeSinglePersonBox} from "../pages/ChatUser";
import * as api from './ApiConnector/ApiConnector'
import "./GroupChat.css"

export class GroupChat extends Component<any,any>{
    componentDidMount() {
        window.addEventListener("click", (el:any)=>{this.unsetIt(el)})
    }
    unsetIt = (el: any) =>{
        if(el?.path && el.path[0]?.id === "GChatForm")
            this.props.unset();
    }
		checkPasswordLength() {
			const n = Buffer.from(this.state.password).length
			if (n > 70)
				return false
			return true
		}
    manageChange=(e:any)=>{
        this.setState({visualize:e.target.id})
    }
    createGroupChat=()=>{
        if(this.state.visualize === "PrivateButton") {
            if (this.state.chatName === "" || this.state.group.length === 0) {
                if (this.state.chatName === "")
                    this.props.setError("Non ci siamo zi", "Devi scrivere il nome della chat di gruppo... su .... su!")
                else
                    this.props.setError("Non ci siamo zi", "Devi aggiungere qualcuno... sennò che gruppo è?? Su .... SU!")
            }else {
                this.props.data.user.reqidIntra = this.props.data.user.idIntra
                api.NewChat(this.props.data.client, this.state.chatName, this.state.group.map((el: any) => {
                    return {idIntra: el}
                }), this.props.data.user.idIntra, "private")
            }
        } else {
            if(this.state.chatName === "")
                this.props.setError("non ci siamo zi.... il nome della chat?")
            else if(this.state.showPassword && this.state.password === "")
                this.props.setError("non ci siamo zi.... la password la vuoi o no?")
            else if(!this.checkPasswordLength())
                this.props.setError("placeholder password too long")
            else {
                this.props.data.user.reqidIntra = this.props.data.user.idIntra
                api.NewChat(this.props.data.client, this.state.chatName, [],this.props.data.user.idIntra, "public", this.state.password )
            }
        }
        this.props.unset();
    }

    addToGroup=(idIntra :any)=>{
		let newGroup=this.state.group;
		// @ts-ignore
        if (!this.state.group.includes(idIntra))
		{
			// @ts-ignore
            newGroup.push(idIntra);
		}
		else
            newGroup = newGroup.filter((el:any)=> el!== idIntra)
        this.setState({group:newGroup})
    }
    manageInput = (e:any) => {
        this.setState({chatName: e.target.value});
    }
    setPswd=(e:any)=>
    {
        this.setState({password:e.target.value})
    }
    showPassInput=()=>{
        this.setState({showPassword:!this.state.showPassword});
    }
    state={
        visualize:"PrivateButton",
        group: [] as any,
        chatName:"",
        showPassword:false,
        password:""
    }
    render(){
        return(
					<Flex id="GChatForm" justifyContent={"center"} 
						alignItems={"center"} mx="auto"
						w={"100%"} h={"100%"} zIndex={540} flexDir="column" 
						position="absolute" top="0" left="0" 
						>
						<Flex justifyContent={"center"} w={"55%"} 
							minW="350px" alignItems="flex-end">
							<Box id="PrivateButton"
								className={this.state.visualize==="PrivateButton" ?
									"selectedGroupChatButton"
									: "unselectedGroupChatButton"
								}
								onClick={this.manageChange} >
								Group Chat
							</Box>
							<Box id="PublicButton" 
								className={this.state.visualize==="PublicButton" ?
									"selectedGroupChatButton" 
									: "unselectedGroupChatButton"
								}
								onClick={this.manageChange} >
								Public Chat 
							</Box>
						</Flex>
						<Flex borderRadius="10px" p="1rem" 
							justifyItems={"space-between"} flexDir={"column"}  
							bgColor={"rgb(30,30,30)"} alignItems={"center"}  
							w={"60%"} height={"70%"} overflow={"hidden"}
							minW="350px" border="2px solid #666666">
							<Input
								variant="flushed"
								placeholder={"Group Name"}
								margin={"auto"} w={"80%"}
								onChange={this.manageInput}/>
							<Flex margin={"auto"} w={"100%"} h={"70%"} shrink={0} >
								{this.state.visualize === "PrivateButton" ?
									<Flex margin="auto"   className="rowToColumn"
										width="100%" h="90%" justifyContent="space-between">
										<Flex shrink={0} id={"addFriendsList"} className="extendWidth"
											overflowY={"auto"} flexDir={"column"}>
											{this.props.data.user.userFriends.map((el: any) => {
												// @ts-ignore
												if (!this.state.group.includes(el.idIntra))
													return <MakeSinglePersonBox addToGroup={this.addToGroup}
														key={"Groupchat" + el.idIntra} user={el}
														img={el.img} buttonContent={"Add"}/>
												return null
											})}
										</Flex>
										<Flex flexDir={"column"}
											shrink={0} className="extendWidth" overflow={"auto"} >
											{this.state.group.length === 0 ? 
												<Text textAlign="center">Add friends to the chat</Text> 
												: this.state.group.map((el: any, index: number) => {
													return (
														// <MakeSinglePersonBox addToGroup={this.addToGroup}
														// 	key={"Button" + el} user={el} img={el.img} buttonContent={"Remove"}/>
														<Button flexShrink={0} key={"Button" + el} 
															variant={"ghost"} bgColor={"inherit"} 
															onClick={() => this.addToGroup(el)}
															_hover={{color: "red.500", background: "#333333"}}>
																{el}
														</Button>
														)
											})}
										</Flex>
									</Flex>
								:
									<Flex w={"100%"} justifyContent={"space-evenly"} flexDir="column"
										alignItems="center">
											{this.state.showPassword ?
												<Box h="3rem" w="80%">
													<Input onChange={this.setPswd} 
														variant="flushed"
														placeholder={"Password"}/>
												</Box>
											:	<Box h="3rem"/>
											}
											<Checkbox isChecked={this.state.showPassword} 
												onChange={this.showPassInput} mt="2rem">
												Password
											</Checkbox>
											<Spacer/>
									</Flex>
								}
							</Flex>
								<Button size="lg" bgColor="black"
									borderColor="rgb(0,255,255)" borderWidth="thin"
									onClick={this.createGroupChat}
									_hover={{ bg: "rgb(0,155,155)" }}>
									Create Chat
								</Button>
						</Flex>
					</Flex>
        )
    }
}