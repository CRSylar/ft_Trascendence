import React, { Component } from "react"
import {
	Text,
	Flex,
	CircularProgress,
	Center,
	Heading
} from '@chakra-ui/react'
import "./LandingPage.css"
import * as api from "../components/ApiConnector/ApiConnector"
import UserCard from "../components/UserCard";

interface PAllUser {
	data?: string;
}

interface SAllUser {
  user?: any;
}

export default class AllUser extends Component<PAllUser, SAllUser>{ 
	
	constructor(props : any){
		super(props);
		this.state = {
			user : null,
			};
		}
		_isMounted = false


	async componentDidMount(){
		this._isMounted = true
		const temp = { user: [] }

		temp.user = await api.GetAllUser()
		temp.user?.sort((a: any, b: any) => {return (b.rank - a.rank)})
		if (this._isMounted)
		this.setState({user: temp.user})
			
	}

	render(){
			return(
					<Flex background="#141414" flexDir="column" h="calc(100vh - 44px)" overflow="auto">
						<Heading color="rgb(255,255,255)"  fontFamily="Montserrat" fontSize="min(3rem, 8vw)" textAlign="center" m="min(5rem, 8%)">
							<Text  bgGradient="linear(to-r, #00ffff, #ff00ff)" bgClip={"text"}>LEADERBOARD</Text>
						</Heading>
					{
						this.state.user === null ? 
						<Center h="100%">
							<CircularProgress isIndeterminate color="rgb(0,255,255)" /> 
						</Center>
						: 
						<>
						{/* <Text color="white">{JSON.stringify(this.state.user)}</Text> */}
						<Flex flexDir="column" alignItems="center" w="100%" p="1rem">
								{
									this.state.user.map((user : any, index: number) => 
									<UserCard 
										position={index + 1} 
										key={user.idIntra} 
										img={user.img} 
										username={user.userName} 
										idIntra={user.idIntra} 
										points={user.rank} 
										self={this.props.data}/>)		
								}
						</Flex>
						</>
					}
					</Flex>
			)
	}

	componentWillUnmount() {
		this._isMounted = false
	}
}