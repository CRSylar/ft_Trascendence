import {
	Heading,
	Avatar,
	AvatarBadge,
	Flex,
	Box,
} from '@chakra-ui/react'
import { EmailIcon, AddIcon,} from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import react from 'react'
import * as api from "../components/ApiConnector/ApiConnector"
import "./Chat.css"

// type TFormNewChat = {
//     user? : any,
//     chats? : any,
//     img? : any,
// }

// interface IFormNewChat {
//     user? : any,
//     chats? : any,
//     img? : any,
// }

// class FormNewChat extends react.Component<TFormNewChat, IFormNewChat>{

//     render(){
//         return(
//             <>
//                 <FormControl id="email">
//                     <FormLabel>Nome chat</FormLabel>
//                     <Input type="name" />
//                     <RadioGroup defaultValue="pubblica">
//                         <HStack spacing="24px">
//                             <Radio value="privata">Privata</Radio>
//                             <Radio value="pubblica">Pubblica</Radio>
//                         </HStack>
//                     </RadioGroup>
//                 </FormControl>
//             </>
//         )
//     }
// }




type TMakeSinglePersonBox = {
    user ? : any,
    chats ? : any,
    img  ?: any,
    chatUpdate ?: any,
    newChat?:any,
    addToGroup?:any,
    buttonContent?:string
}

interface IMakeSinglePersonBox {
    user ?: any,
    chats ?: any,
    img ?: any,
    chatUpdate?: any
    newChat?:any,
    addToGroup?:any,
    buttonContent?:string
}

export class MakeSinglePersonBox extends react.Component<TMakeSinglePersonBox, IMakeSinglePersonBox>{

    manageClick=()=>{
        if (this.props.buttonContent === "Chat")
          this.props.newChat(this.props.user);
        else if (this.props.buttonContent === "Add")
          this.props.addToGroup(this.props.user.idIntra);
    }

    render(){
        return(
            <>
                <Flex
                    w="100%" borderRadius="10px"
                    bgColor="#333333"
                    h="auto" py="0.6rem" px="1rem" mb="0.5rem"
                    // border="2px solid yellow"
                    alignItems="center">
                    <Avatar name={this.props.user.userName} src={this.props.img} size="sm" mr="1rem">
                        <AvatarBadge boxSize="50%" borderColor="#333333"
                            bg={ this.props.user.status === "online" ?
                            "rgb(0,255,255)"
                            :	(this.props.user.status === "in-game" ?
                                "rgb(255,0,255)" :
                                "red.500")
                        } />
                    </Avatar>
                    <Link to={"/profile/" + this.props.user.idIntra}
                    style={{width: "55%"}}>
                        <Heading size="xs" w="100%" overflow="hidden">{this.props.user.userName}</Heading>
                    </Link>
                    {this.props.buttonContent === "Chat" &&
                        <EmailIcon onClick={this.manageClick.bind(this)}
                            className="openChatIcon"/>
                    }
                    {this.props.buttonContent === "Add" &&
                        <AddIcon onClick={this.manageClick.bind(this)}
                            className="openChatIcon"/>
                    }
                    {/* {this.props.buttonContent === "Remove" &&
                        <MinusIcon onClick={this.manageClick.bind(this)}
                            className="openChatIcon"/>
                    } */}
                </Flex>
            </>
        )}
}




type TChatUsers = {
    obj : any,
    chats: any,
    me: any,
    client: any,
    return?: any,
    chatUpdate: any

}

interface IChatUsers {
    obj : any,
    chats: any,
    me: any,
    client: any,
    return?: any,
    chatUpdate:any
}

export default class ChatUsers extends react.Component<TChatUsers, IChatUsers>{
    state : any = {return : null}

    isChatNew=(el:any)=>{
        let searchChat= this.props.chats?.find((elo:any)=>elo.types === "private-duo" ? elo.participant.find((elu:any)=>elu.idIntra === el.idIntra) : undefined)
        if(searchChat !== undefined) {
            this.props.chatUpdate(searchChat.id);
        }
        else {
            this.props.me.reqidIntra = this.props.me.idIntra
            api.NewChat(this.props.client, el.idIntra, [{idIntra: el.idIntra}], this.props.me.idIntra, 'private-duo');
        }
    }
    render(){
        let friendz = this.props.obj.map((el : any) => <MakeSinglePersonBox   key={el.idIntra+this.props.client.id} user={el} img={el.img} newChat={this.isChatNew} chats={this.props.chats} buttonContent={"Chat"}/>)
        return(
            <>
                <Box w="100%" h="100%" overflowY="auto">
                    {friendz.length === 0 ? "No friendz...loozer..." : friendz}
                </Box>
            </>
        )
    }
}