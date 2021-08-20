import { Component } from 'react'
import { Box, Button, Flex, Stack, Checkbox, Heading,Menu, MenuList, MenuButton, MenuItem } from '@chakra-ui/react'
import {GameLoader} from "./GameLoader";
import {ChevronDownIcon} from '@chakra-ui/icons'

interface IGame {
	name: string,
	idGame: string,
}

interface PDamcont {
}

interface SDamcont {
  player?: boolean;
  name?: string;
  idIntraFriend?: string;
  sd?: boolean;
  mc?: boolean;
  private?: boolean;
  visual?: string;
  games?: Array<IGame>;
}

export class Damcont extends Component <PDamcont, SDamcont>{

	games : Array<IGame> = [];

	constructor(props : any){
		super(props);
		if (window.location.href.split('?')[1])
		{
			let urlElements = window.location.href.split('?')[1].split('&')
			this.state = {
				name : urlElements[1].split("=")[1],
				idIntraFriend: urlElements[0].split("=")[1],
				sd: false,
				mc: false,
				private: true,
				visual: "CLASSIC",
				player: true,
				games: [],
			};
		}
		else
		{
			this.state = {
				player : undefined,
				name : "",
                idIntraFriend: "",
				sd: true,
				mc: true,
				visual: "TRON",
				games: [],
			};
		}
    }

	async componentDidMount()
	{
		await fetch(`http://${process.env.REACT_APP_MIOIP}/api/match/live`)
		  	.then(response => response.json())
		  	.then(data => {
				  data.forEach((e : any) => {
					  this.games.push({name: `${e.idP1} vs ${e.idP2}`, idGame: e.idGame})
				  });
		  })
		this.setState({
			games: this.games
		});
	}

	handleChangeSD(){
		if (this.state.sd === true)
			this.setState({sd : false});
		if (this.state.sd === false)
			this.setState({sd: true})
	}

	handleChangeMC(){
		if (this.state.mc === true)
			this.setState({mc : false});
		if (this.state.mc === false)
			this.setState({mc: true})
	}

	render() {
        return (
			this.state.player === undefined
			?
				<Flex  h="calc(100vh - 44px)" background="#141414" color="white" flexDir="column" alignItems="center" justifyContent="space-between" overflow="auto">
					<Flex flexDir="row" w="100%" alignItems="flex-end" justifyContent="space-evenly" h="50%" maxW="900px">
						<Flex  alignItems="center" flexDir="column" w="45%" maxW="200px"  >
							<Stack>
								<Checkbox  colorScheme="rgb(0,255,255)" onChange={() => this.handleChangeSD()} defaultIsChecked>Sudden death</Checkbox>
								<Checkbox colorScheme="rgb(0,255,255)" onChange={() => this.handleChangeMC()} defaultIsChecked>Camera music</Checkbox>
								{/* <Select onChange={ (e) => this.setState({visual: e.target.value}) }>
									<option value="TRON">TRON</option>
									<option value="CLASSIC">CLASSIC</option>
									<option value="RETRO">RETRO</option>
								</Select> */}
							</Stack>
							<Box mt="2rem"/>
							<Menu>
								<MenuButton as={Button} rightIcon={<ChevronDownIcon />} 
									background="none" w="60%"
									_hover={{bgGradient: "linear( to-l,  rgb(255,255),  rgb(0,255,255)"}}
									_selected={{}}
									_active={{bg: "rgb(0,255,255)"}}>
										{this.state.visual}
								</MenuButton>
								<MenuList background="rgb(36,36,36)" border="none">
									<MenuItem _hover={{bgGradient: "linear( to-l,  rgb(255,255),  rgb(0,255,255)"}} _focus={{bg: "rgb(0,155,155)"}}
										onClick={() => this.setState({visual: 'TRON'})}>
										TRON
									</MenuItem>
									<MenuItem _hover={{bgGradient: "linear( to-l,  rgb(255,255),  rgb(0,255,255)"}} _focus={{bg: "rgb(0,155,155)"}}
										onClick={() => this.setState({visual: 'CLASSIC'})}>
										CLASSIC
									</MenuItem>
									<MenuItem _hover={{bgGradient: "linear( to-l,  rgb(255,255),  rgb(0,255,255)"}} _focus={{bg: "rgb(0,155,155)"}}
										onClick={() => this.setState({visual: 'RETRO'})}>
										RETRO
									</MenuItem>
								</MenuList>
							</Menu>
							<Button 
								size="lg" bgColor="black" w="150px"
								borderColor="rgb(0,255,255)" borderWidth="medium"
								_hover={{ bg: "rgb(0,155,155)" }} mt="3rem"
								onClick={() => { this.setState({player : true}) }} >
								New Game
							</Button>
						</Flex>
					</Flex>
					{/* <Divider/> */}
					<Flex flexDir="column" h="40%" w="min(80%, 400px)" overflow="auto">
						<Heading fontSize="xl" fontFamily="Montserrat" textAlign="center" mb="1rem">GAMES LIST</Heading>
						<Flex flexDir="column" w="100%">
							{this.state.games?.map(game => {
								return (
									<Flex justifyContent="space-between" alignItems="center" mb="0.5rem">
										<h1>{game.name}</h1>
										<Button size="md" bgColor="black" _hover={{ bg: "rgb(0,155,155)" }}
										borderColor="rgb(0,255,255)" borderWidth="thin"
										onClick={() => { this.setState({name: game.idGame, player : false}) }}>
											Watch
										</Button>
									</Flex>
							)})}
						</Flex>

					</Flex>
				</Flex>
				:
                <GameLoader info={this.state} />

		)
	}
}
