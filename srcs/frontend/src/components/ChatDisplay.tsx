import {
    Box,
} from '@chakra-ui/react'
import react from 'react'
// import * as api from "../components/ApiConnector/ApiConnector"
import Chat from "./Chat"
import {UserContext} from "../App"
type TChatDisplay = {
    chatData : any,
}

interface IChatDisplay {
    chatData : any,
}

export default class ChatDisplay extends react.Component<TChatDisplay, IChatDisplay>{
    state : any = {}

    componentDidMount(){

    }

    render(){
        return (
            <>
                <UserContext.Consumer>
                    { (data:any)=>{
                        let content = data.chat.find((el: any) => el.id === data.displayedChat)
                        return (
                            <>
                                {/* <Box id={"blurMe"} as="button" top={0} onClick={() => {data.setDisplayedChat(null)}
                                } className="background" position="absolute"  h="100%" left="0px" w="100%"  bgColor="rgba(30,30,30,0.3)" zIndex="80" >
                                </Box> */}
                                <Box  className="displayer" zIndex="170" 
																	color={"inherit"}>
                                    <Chat 
																			messages={content.msg}  
																			client= {data.client} 
																			user={data.user} 
																			idChat={content.id} 
																			setChat={data.setDisplayedChat}
																			close={data.setDisplayedChat}
																			readUntil={content.readUntil}
                                                                            admin={content.admin}
                                                                            moderators={content.moderators}
                                                                            participants={content.participant}

                                    />
                                </Box>
                            </>
                        )}
                    }
                </UserContext.Consumer>
            </>
        )
    }

}