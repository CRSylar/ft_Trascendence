import {
	Heading,
	Avatar, 
	Flex,
	Spacer,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import "./UserCard.css"

type Props = {
	img : string,
	username : string,
	idIntra : string,
	points : number,
	position: number,
	self?: string
}

function UserCard(props: Props) {
	return (
		<>
		<Link to={"/profile/" + props.idIntra}>
		<Flex 
			justify="space-between" 
			align="center"
			flexDir="row" 
			mb="0.8rem" 
			paddingX="0.5rem" paddingBottom="0.8rem" 
			// boxShadow="md" 
			// borderRadius="20" 
			// backgroundColor="gray.800" 
			w="min(600px, 90vw)"
			borderBottom="1px solid #666666"
			color={
				props.self === props.idIntra ? "rgb(0,255,255)" : "white"
			}
			>
			<Heading fontSize="3xl" mr="4" className="text" textAlign="end" w="3rem">
				{props.position}
			</Heading>
			<Avatar src={props.img}/>
			<Heading fontSize="xl" ml="5" className="text" maxW="40%" overflow="hidden">
				{props.username}
			</Heading>
			<Spacer/>
			<Heading fontSize="xl" mr="1.5" className="text">Rank:</Heading>
			<Heading fontSize="2xl" className="text">{props.points}</Heading>
		</Flex>
		</Link>
		</>
	)
}

export default UserCard