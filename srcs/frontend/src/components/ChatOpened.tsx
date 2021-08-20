import { 
    Text,
    Heading,
    Flex,
    Avatar,
    Box,
    CircularProgress} from '@chakra-ui/react'
import react from 'react'
import { UserContext } from '../App'
import * as api from "../components/ApiConnector/ApiConnector"

type TMakeSingleBox = {
    type:string
    name : string,
    partecipants : any,
    img? : any,
    msg : any,
    time : string,
    idChat : number,
    me : string,
    myUsrName?:string,
    lastSender?:any
}

interface IMakeSingleBox {
    type:string
    name : string,
    partecipants : any,
    img? : any,
    msg : any,
    time : string,
    idChat : number,
    me : string,

}

class MakeSingleBox extends react.Component<TMakeSingleBox, IMakeSingleBox>{
    state : any = {img: null}

    async componentDidMount(){
        //console.log("monto")
        let newimg : string | undefined;
        if(this.props.partecipants.length === 2 && this.props.type !== "public"){
            if (this.props.partecipants[0].idIntra === this.props.me)
                newimg = this.props.partecipants[1].img
            else
                newimg = this.props.partecipants[0].img
            this.setState({img : newimg})
        }
    }


    timestampToHour(UNIX_timestamp : number){
			var time: string
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

    async takeimg(name : string){
        let name_obj : any = await api.GetUserByName(name)
        if (!name_obj || name_obj.img === undefined)
            return null;
        return name_obj.img
    }

	render(){
		return(
			<UserContext.Consumer>
				{ (data:any)=>{
					return (
						<Flex as="button"
                              onClick={() => {
								data.setDisplayedChat(this.props.idChat)
								data.client.emit('readChat', Number(this.props.idChat));
							}} 
							w="100%" borderRadius="10px" 
							bgColor={this.props.idChat === data.displayedChat ? "#666666" : "#333333"}
							display="flex" h="64px"
							padding="0.6rem" mb="0.5rem" 
							alignItems="center">
								<Avatar name={this.props.name} src={this.state.img} mr="1rem"/>													
								<Box w="65%">
									<Box display="flex" flexDirection="column">
										{
										    this.props.type === "private-duo" ?
												( this.props.partecipants[0].idIntra === data.user.idIntra ?
													<Heading align="left" color="white" size="sm">{this.props.partecipants[1].userName}</Heading>
													:
													<Heading align="left" color="white" size="sm">{this.props.partecipants[0].userName}</Heading>
												)
												:
												(<Heading align="left" color="white" size="sm">{this.props.name} - {(this.props.lastSender !== this.props.myUsrName) ? this.props.lastSender : "You"}</Heading>)
										}
										{
											this.props.msg &&
											<Text align="left" color="white" 
											maxH="1.5rem" maxW="200px"
											overflow="hidden">
												{this.props.msg}
											</Text> 
										}
									</Box>
								</Box>
								<Box w="15%">
									{
										this.props.msg && 
										<Text fontSize="0.8rem" color="white">
											{this.timestampToHour(Number(this.props.time))}
										</Text>
									}
									{
										(data.chatNotify[this.props.idChat] &&
										data.chatNotify[this.props.idChat].length) ?
										<Flex bg='rgb(0,255,255)' borderRadius="xl" h="1.5rem"
											fontWeight="bold" alignItems="center" textAlign="center"
											justifyContent="center" paddingTop="2px">
												{data.chatNotify[this.props.idChat].length}
										</Flex> :
										<Box h="1.5rem"/>
									}														
								</Box>
						</Flex>
					)} 
				}
			</UserContext.Consumer>
		)
	}
}




type TChatOpened = {
    chats : any,
    context : any,
    msg? : any,
    index?: number,
    return?: any
}

interface IChatOpened {
    chats : any,
    context : any,
    msg? : any,
    index?: number,
    return?: any
}

export default class ChatOpened extends react.Component<TChatOpened, IChatOpened>{
    state : any = {return : null, msg : null, index : -1, chats : null}

    /*shouldComponentUpdate(nextProps: Readonly<TChatOpened>, nextState: Readonly<IChatOpened>, nextContext: any): boolean {
        console.log(this.props.context.chat !== nextProps.context.chat)
        return true
        //if(this.props.contex.chat !== nextProps.context.chat )
    }*/

    render(){
        return(
            <>
                {this.props.context.chat ?
                    <Box w="100%" h="100%" display="flex" flexDirection="column" overflowY="auto">
                        {
                            this.props.context.chat.map((el : any) => {
                                let elMsg = (this.props.context.chat.find((contextChats: any) => contextChats.id === el.id))
                                let lastMsg:any
                                let nombre = "";
                                if(elMsg.msg.length !== 0){
                                    lastMsg = elMsg.msg[elMsg.msg.length - 1];
                                    nombre= el.participant.find((el:any)=>el.idIntra === lastMsg.sender)?.userName
                                }
                                return ((el.participant !== undefined  && (lastMsg || el.types !== "private-duo")) ?
                                    <MakeSingleBox
                                        type={el.types}
                                        idChat={el.id}
                                        key={el.id+ Math.random()}
                                        name={el.name}
                                        myUsrName={this.props.context.user.userName}
                                        msg={lastMsg?.msgBody}
                                        lastSender={nombre}
                                        partecipants={el.participant}
                                        time={lastMsg?.timestamp}
                                        me={this.props.context.user.idIntra}/>
                                    : "")
                            })}
                    </Box>
                    :
                    <CircularProgress m="auto" size="40px" isIndeterminate color="rgb(0,255,255)" />}
            </>
        )
    }
}