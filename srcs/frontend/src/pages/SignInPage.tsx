import React, { Component } from "react"
import {
	Flex,
	Heading,
	Text,
	Image,
	Divider,
	Link,
	Box,
	Button,
	CircularProgress,

} from '@chakra-ui/react'
import "./LandingPage.css"
import { UserContext } from "../App";
import { Redirect } from "react-router";
import Logo42 from "../miky/logo42.png"
import { navbarHeight } from "../config/config";
import * as api from '../components/ApiConnector/ApiConnector'

interface PSignInPage {
}

interface SSignInPage {
  status?: number;
  loggedIn : boolean;
}

export default class SignInPage extends Component<PSignInPage, SSignInPage>{ 
	
	constructor(props : any){
		super(props);
		this.state = {
			status : 0,
			loggedIn : false,
		}
	}

	componentDidMount(){
	}

	logoRender(){
		return (<Image src={Logo42} height="26px"/>)
	}

	render()
	{	
		return(
			<>
			<UserContext.Consumer>
			{ (user:any)=>{ 
				if (user.user != "null")
					return (<Redirect to="/"/>)
			 }}
			</UserContext.Consumer>
			<div className="background">
				{/* <Waves/> */}
			</div>
			<div className="background">
			<Flex flexDir="column"  h={window.innerHeight - navbarHeight} bg="black" alignItems="center" justifyContent="space-between" color="white" padding="10">
				<Box h="20%" />
				<Flex alignItems="center" justifyContent="center" flexDir="column" h="60%" mt={50}>
					<Flex flexDir="row" alignItems="center" justifyContent="center">
						<Heading fontSize="7xl" color="white">TRAS</Heading>
						<div className="left-paddle" />
						<div className="ball" />
						<div className="right-paddle" />
						<Heading fontSize="7xl" color="white">ENDENCE</Heading>
					</Flex>
					<Box mt={4}>
						<Text color="lightgray" >BAD COSSU PLACEHOLDER NASM</Text>
						<Divider />
					</Box>
					<Flex width="80%" borderRadius="10px" alignItems="center" justifyContent="center" flexDir="column" m="auto" padding="5%"  bg="#2e2e2e">
						<Heading  color="white" size="lg" mb="8%">Welcome to Trashendence</Heading>
						{
							this.state.status == 0 ?
							<Button onClick={()=>{
								api.GetLogin();
								this.setState({status : 1})
							}} leftIcon={this.logoRender()} m="auto" size="lg" bgColor="black" borderColor="rgb(0,255,255)" borderWidth="medium" _hover={{ bg: "rgb(0,255,255)" }} >SignIn with Intranet</Button>
							:
							<CircularProgress isIndeterminate color="rgb(0,255,255)" mt={16} size="60px" />
					}
					</Flex>
				</Flex>
				<Flex flexDir="column" mt={90} color="lightgray" h="20%">
					<Text  fontWeight="medium">Made with sweat, tears and alcohol by:</Text>
					<Flex flexDir="row" w="100%" justify="space-around" pt="4">
						<Flex flexDir="column" textAlign="center">
							<Link>mcossu</Link>
							<Link>cromalde</Link>
							<Link>ade-feli</Link>
							<Link>sgiovo</Link>
						</Flex>
						<Flex flexDir="column" textAlign="center">
							<Link>aduregon</Link>
							<Link>dmalori</Link>
							<Link>usavoia</Link>
							<Link>forsili</Link>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
			</div>
			</>
		)
	}
}
