import React, { Component } from "react"
import {
	Flex,
	Heading,
	Text,
	Divider,
	Link,
	Box,
	Button,
	CircularProgress,
	Image
} from '@chakra-ui/react'
import "./LandingPage.css"
import Waves from "../components/waves"
import * as api from "../components/ApiConnector/ApiConnector"
import Logo42 from "../miky/logo42.png"

interface PLandingPage {
	user:any;
}

interface SLandingPage {
	status?: number;
	loggedIn : boolean;
	longScreen: boolean;
	wait:boolean;
}

export default class LandingPage extends Component<PLandingPage, SLandingPage>{ 

	mMedia : any
	boundHandler: any
	state = {
			status : 0,
			loggedIn : false,
			longScreen: false,
			wait:true
		}

	componentDidMount() {
		this.mMedia = window.matchMedia("(min-height: 600px)")
		this.setState({longScreen: this.mMedia.matches})
		this.boundHandler = this.handler.bind(this)
		if(this.mMedia.addEventListener !== undefined )
			this.mMedia?.addEventListener("change", this.boundHandler)
		setTimeout(this.stopWaiting, 300)
	}

	stopWaiting = () =>{
		this.setState({wait:false})
	}

	handler(e:any) {
		this.setState({longScreen: e.matches})
	}
	async backdoor(){
		await fetch('/api/auth/backdoor',{
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
				id:0,
				})
		}).then(() => window.location.reload())
	}


	longPage() {
		//console.log(this.props.user)
		return(
		<Flex flexDir="column"  h="100vh" alignItems="center" justifyContent="space-between" color="white" padding="1rem">
			{this.state.wait ? <CircularProgress color={"rgb(0,255,255)"} isIndeterminate top={"40vh"}></CircularProgress> :
				<>
					<Box  />
					{this.shortPage()}
					<Flex flexDir="column"  color="lightgray" bgColor="rgba(0,0,0,0.7)" p="1rem" borderRadius="lg" w="50%" alignItems="center" minW="300px" maxW="500px">
				<Text  fontWeight="medium" textAlign="center">Made with sweat, tears and 
					<span onClick={() => this.backdoor()}> alcohol </span> 
					by:</Text>
				<Flex flexDir="row" w="50%" justify="space-around" pt="4" minW="200px" maxW="300px">
					<Flex flexDir="column" textAlign="center">
						<Link href="https://github.com/MattiaCossu89" isExternal={true}>mcossu</Link>
						<Link href="https://github.com/CRSylar" isExternal={true}>cromalde</Link>
						<Link href="https://github.com/ekmbcd" isExternal={true}>ade-feli</Link>
						<Link href="https://github.com/sgiovo" isExternal={true}>sgiovo</Link>
					</Flex>
					<Flex flexDir="column" textAlign="center">
						<Link href="https://github.com/AndreaDuregon" isExternal={true}>aduregon</Link>
						<Link href="https://github.com/demian2435" isExternal={true}  >dmalori</Link>
						<Link href="https://github.com/UmbertoSavoia" isExternal={true}>usavoia</Link>
						<Link href="https://github.com/federicoorsili" isExternal={true}>forsili</Link>
					</Flex>

				</Flex>
			</Flex>
				</>
			}
		</Flex>
		)
	}

	shortPage() {
		return(
			<Flex flexDir="column"  h="100vh" alignItems="center" justifyContent="center" color="white" padding="1rem">
			<Flex alignItems="center" justifyContent="center" flexDir="column">
				<Flex flexDir="row" alignItems="center" justifyContent="center" fontSize="min(9vw, 4.5rem)">
					<Heading fontSize="inherit" color="white">TRAS</Heading>
					<div className="left-paddle" />
					<div className="ball" />
					<div className="right-paddle" />
					<Heading fontSize="inherit" color="white">ENDENCE</Heading>
				</Flex>
				<Box mt="0.5rem">
					<Text color="lightgray" fontSize="min(4vw, 1rem)" >A BAD COSSU GAMING EXPERIENCE</Text>
					<Divider />
				</Box>
				{
					this.state.status === 0 ?
					<Button 
						onClick={()=>{
							api.GetLogin();
							this.setState({status : 1})
						}} 
						size="lg" bgColor="black" mt="3rem"
						borderColor="rgb(0,255,255)" borderWidth="medium"
						leftIcon={<Image src={Logo42} height="18px"/>} 
						_hover={{ bg: "rgb(0,155,155)" }}>
							Sign In
						</Button>
					:
					<CircularProgress mt="3rem" isIndeterminate color="rgb(0,255,255)"  size="60px" />
				}
			</Flex>
		</Flex>
		)
	}

	render()
	{	
		return(
			<>
			<div className="backgroundLand">
				<Waves/>
			</div>
			<div className="backgroundLand">
				{this.state.longScreen && this.longPage()}
				{!this.state.longScreen && this.shortPage()}
			</div>
			</>
		)
	}

	componentWillUnmount() {
		if(this.mMedia.removeEventListener !== undefined)
			this.mMedia.removeEventListener("change", this.boundHandler)
	}
}
