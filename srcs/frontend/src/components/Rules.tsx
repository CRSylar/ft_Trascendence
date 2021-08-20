import React, { useState } from "react";
import { Flex, Heading, Text, Button,  UnorderedList, ListItem, Box } from "@chakra-ui/react";


export default function Rules (props: any) {

    const [lang, changeLang] = useState(true);

    return(
		<Flex 
			h="calc(100vh - 44px)" w="100%"
			position="absolute" left="0" top="44px"
			background="rgba(66,66,66,0.8)" zIndex="5">
			<Flex 
				border="4px solid #666666" borderRadius="2rem" 
				// h="80%" w="80%" 
				h="80%" flex="1" margin="auto"
				p="2rem" maxW="600px"
				background="#141414" color="white"
				flexDir="column" justifyContent="space-beetween" alignItems="center" overflow="auto"
			>
				<Flex w="100%" justifyContent="space-between" alignItems="flex-start" mb="2rem">
					<Box w="80px"/>
					<Heading fontFamily="Montserrat" fontSize="5xl" fontWeight="extrabold" textAlign="center">
						F.A.Q
					</Heading>
					{ (!lang)?
							<Button 
								bg="none"
								fontSize="4xl" size="md" 
								// border= "1px solid yellow"
								onClick={() => changeLang(!lang)}
								_hover={{}}
								_focus={{}}
								_after={{
									content: '"🇮🇹"',
									position: "absolute",
									left: "0.5rem",
									top: "0.5rem",
								}}>
								🇬🇧
							</Button>
						:
							<Button bg="none" 
								fontSize="4xl" size="md" 
								onClick={() => changeLang(!lang)}
								_hover={{}}
								_focus={{}}
								_after={{
									content: '"🇬🇧"',
									position: "absolute",
									left: "0.5rem",
									top: "0.5rem",
								}}> 
									🇮🇹
							</Button>
					}
				</Flex>
				{(!lang) ?
						<>
							<Text textAlign="center" fontSize="1.3rem" fontWeight="bold">
								Benvenuto su Trashendence!
							</Text>
							<Text >
									Dimostra a tutti le tue Skill sfidandoli a Pong!<br/>
								    Il sistema Ladder è sempre attivo, giocare ti consentirà <br/>
								    di guadagnare o perdere punti in base al risultato della partita, <br/>
								    al tuo rank attuale e al rank del tuo avversario.
									<br/>
									Di seguito alcune informazioni utili per vivere la miglior <br/> 
									esperienza di gioco possibile:
							</Text>
							<br/>
							<Text w="100%" mb="0.2rem">
								I Seguenti tasti modificano la posizione del Giocatore:
							</Text>
							<UnorderedList spacing="2" w="90%" mb="1rem">
								<ListItem>
										W / ⬆️ per andare in su
								</ListItem>
								<ListItem>
										S / ⬇️️ per andare in giù
								</ListItem>
							</UnorderedList>
							<Text  w="100%" mb="0.2rem"> 
								Modalità di Gioco:
							</Text>
							<UnorderedList spacing="2" w="90%">
								<ListItem >Sudden Death:
										<Text fontSize="0.9rem" color="#aaaaaa">
											Ogni Tocco aumenta la velocita della pallina
										</Text>
								</ListItem>
								<ListItem >Camera Music:
										<Text fontSize="0.9rem" color="#aaaaaa">
											La telecamera si muove sul BassDrop
										</Text>
								</ListItem>
								<ListItem > Classic Theme:
										<Text fontSize="0.9rem" color="#aaaaaa">
											Abbandona gli effetti glow e goditi il tema Classico!
										</Text>
								</ListItem>
								<ListItem >Private Game:
										<Text fontSize="0.9rem" color="#aaaaaa">
										Invita un amico per una partita privata (il sistema<br/>
										ladder resterà attivo, non essere troppo amichevole!)
										</Text>
								</ListItem>
								<ListItem > Retro:
									<Text fontSize="0.9rem" color="#aaaaaa">
										Goditi il Pong Originale! <br/>
										In questa modalità tutte le opzioni di gioco<br/>
										saranno disabilitate
									</Text>
								</ListItem>
							</UnorderedList>
						</>
						:
						<>
							<Text textAlign="center" fontSize="1.3rem" fontWeight="bold">
									Welcome to Trashendence!
							</Text>
							<Text >
									Show everyone your skills by challenging them to Pong!<br/>
									The Ladder system is always active, playing will allow you <br/>
									gain or lose points depending on the result of the game,<br/>
									your current rank and your opponent's rank.
									<br/>
									Here is some useful information for the best possible <br/> 
									gaming experience:
							</Text>
							<br/>
							<Text w="100%" mb="0.2rem">
									The following keys change the position of the player:
							</Text>
							<UnorderedList spacing="2" w="90%" mb="1rem">
								<ListItem>
										W / ⬆️ to go Up
								</ListItem>
								<ListItem>
										S / ⬇️️ to go Down
								</ListItem>
							</UnorderedList>
							<Text  w="100%" mb="0.2rem"> 
								Game modes:
							</Text>
							<UnorderedList spacing="2" w="90%">
								<ListItem >Sudden Death:
										<Text fontSize="0.9rem" color="#aaaaaa">
											Each touch increases the speed of the ball
										</Text>
								</ListItem>
								<ListItem >Camera Music:
										<Text fontSize="0.9rem" color="#aaaaaa">Camera moves on BassDrop</Text>
								</ListItem>
								<ListItem > Classic Theme:
										<Text fontSize="0.9rem" color="#aaaaaa">Abandon the glow effects and enjoy che classic Theme!</Text>
								</ListItem>
								<ListItem >Private Game:
										<Text fontSize="0.9rem" color="#aaaaaa">
											Invite a friend for a private game (the ladder system will <br/>
											remain active so don't get too friendly!)
										</Text>
								</ListItem>
								<ListItem > Retro:
									<Text fontSize="0.9rem" color="#aaaaaa">
										Enjoy the Original Pong! <br/>
										In this mode all game options<br/>
										will be disabled
									</Text>
								</ListItem>
							</UnorderedList>
						</>
				}
				<Button
					onClick={props.setRules}
					size="lg" bgColor="black" mt="3rem"
					borderColor="rgb(0,255,255)" borderWidth="medium"
					_hover={{bg: "rgb(0,155,155)"}}>
					Ok
				</Button>
			</Flex>
		</Flex>
	)
}