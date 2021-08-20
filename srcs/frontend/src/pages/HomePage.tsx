import {
	Box,
	Flex,
	Spacer,
} from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import {MyBigButton, MyButtonGreen, MyButtonPink} from '../components/MyButton'
import { Monolith } from '../components/Monolith'
import "./HomePage.css"
import LandingPage from './LandingPage'
import * as api from "../components/ApiConnector/ApiConnector"
import { Redirect } from 'react-router-dom'
import Rules from '../components/Rules'
import {AutoComplete, AutoCompleteInput, AutoCompleteItem, AutoCompleteList} from "@choc-ui/chakra-autocomplete";
// this also works with react-router-native


interface Iprops {
	user:any,
	data: any,
	setPage: any
}
export class HomePage extends React.Component <Iprops> {

	state = {
		search: "",
		redirect: false,
		rules: false,
		users: [] as any,
	}
	users: any = []
	toSearch = ""

	constructor(props: Iprops) {
		super(props);
		this.handleTermChange = this.handleTermChange.bind(this);
	}

	componentDidMount() {
		this.props.setPage('/')
	}

	async handleTermChange(event: any) {

		if (event.target.value.length > 0) {
			this.users = await api.findUsers(event.target.value)
		}
		else {
			this.users = []
		}
		this.setState( {
			users : this.users,
			search: event.target.value
		});
	}
	handleKeyPress(e: any) {
		// console.log(this.users)
		if (e.key === 'Enter') {
			this.searchUser(this.state.search)
		}
	}
	setRules() {
		this.setState({rules: !this.state.rules})
	}
	searchUser(username: string){
		this.toSearch = username
		for (const user of this.users) {
			if (user.userName === username) {
				this.toSearch = user.idIntra
				break
			}
		}
		this.setState({redirect: true})
	}

	render(){
		//console.log(this.state.users);
		return(
			this.props.user !== "null"
				?
			<Flex flexDir="column">
				{this.state.rules && <Rules setRules={this.setRules.bind(this)}/>}
				{this.state.redirect && <Redirect to={"/profile/" + this.toSearch} push/>}
				<div className="background">
					<Monolith stop={this.props.data}/>
				</div>
				<Flex className="background" overflow="auto">
					<Flex w="90vw" maxW="400px" alignItems="center" justifyContent="space-between" h="100%" color="white" py="10" className="menu" margin="auto">

						{/* <input placeholder="Search users" className="searchbar"
						onChange={this.handleTermChange.bind(this)}
						onKeyUp={this.handleKeyPress.bind(this)} /> */}
						<AutoComplete rollNavigation
									  emptyState={false}
							onSelectOption={(obj: any) => {
								this.searchUser(obj.optionValue)
							}}>
							<AutoCompleteInput
								variant="filled"
								className="searchbar"
								placeholder="Search..."
								autoFocus
								onChange={this.handleTermChange}
								onKeyUp={this.handleKeyPress.bind(this)} />
							{
								this.state.users.length ?
								<AutoCompleteList style={{
									background: "#333333",
									marginTop: "2px",
									}}>
									{
										this.state.users.map( (option : any, oid : any) => {
											return (
													<Box _hover={{cursor: 'pointer', color : "rgb(0,255,255)"}}
														onClick={ () => this.searchUser(option.userName)}
													>
															{option['userName']}
													</Box>
										)
									})
								}
								</AutoCompleteList>
								: null
							}
						</AutoComplete>
						<Spacer/>
						<Link to="/game">
							<MyBigButton txt="PLAY" link="/game" 
							// onHover={() => {this.changeSelected(0)}}
							/>
						</Link>
						<div onClick={this.setRules.bind(this)}>
							<MyButtonGreen txt="RULES" 
							// onHover={() => {this.changeSelected(3)}}
							/>
						</div>
						<div onClick={()=>{return api.GetLogout()}}>
							<MyButtonPink txt="LOGOUT" 
							// onHover={() => {this.changeSelected(3)}}
							/>
						</div>
						{/* <Spacer/> */}
					</Flex>
				</Flex>
			</Flex>
				:
				<LandingPage user={this.props.user}/>
		)
	}
}
