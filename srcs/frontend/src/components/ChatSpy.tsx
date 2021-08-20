import {Component} from "react";
import {Box, Button, Heading,  Text} from "@chakra-ui/react";
import {Flex} from "@chakra-ui/layout";
import {CloseIcon} from "@chakra-ui/icons";

export class ChatSpy extends Component<any, any>{

    getDate=(timestamp:number)=>{
        return  new Date(timestamp).toLocaleString()
    }

    render(){
        return(
            <Flex id={"chatSpy"} w={"100%"} h={"100%"}  zIndex={2000} color={"white"} justifyContent={"center"} bgColor={"black"} flexDirection={"column"} >
                <Box bgImage={"https://www.iodonna.it/wp-content/uploads/2017/10/Diabolik-occhi-Diabolik%C2%A9Astorina-srl1.jpg"} bgPosition={"center"} w={"50%"} margin={" 0 auto"} bgSize={"cover"} h={"30%"}/>
                <Flex margin={"1% auto"} color={"rgb(0,255,255)"}  w={"50%"} justifyContent={"space-evenly"}  alignItems={"center"} >
                    <Heading   textAlign={"center"}> Chat ID: {this.props.msgs[0] && this.props.msgs[0].idChat}</Heading>
                    <Button bgColor={"inherit"}   _hover={{color:"rgb(255,0,255)"}}  onClick={this.props.unSet}><CloseIcon ></CloseIcon> </Button>
                </Flex>
                <Flex id={"conti"} flexDirection={"column"} bgColor={"#000000"} rounded={15} overflowY={"auto"} h={"40%"} top={"20%"}  w={"80%"} margin={"0 auto"} >
                <Flex flexDir={"column-reverse"}  w={"100%"} justifyContent={"center"}  >
                {
                    this.props.msgs ? this.props.msgs.map((el:any, index:number)=>
                        <Box textAlign={"center"} key={el.sender+el.msgBody+el.timestamp} color={"white"} w={"70%"} bgColor={"rgba(255,0,255,0.8)"} margin={"2% auto"} rounded={8} >
                            <Flex justifyContent={"space-evenly"} fontSize={"0.8rem"} ><Text>Index: {index < this.props.msgs.length -1 ? index : index +" - Last Message"}</Text> <Text>Sender: {el.sender}</Text><Text>Date: {this.getDate(el.timestamp)}</Text> </Flex>
                            <Text fontSize={"1.3rem"}>{el.msgBody ? el.msgBody : "**EMPTY MESSAGE***"}</Text>
                        </Box>):<Text>"NO messages"</Text>
                }
                </Flex>
                </Flex>
            </Flex>
        )
    }
}