import {
	Flex, Heading
} from '@chakra-ui/react'
// import "./MyCard.css"

export default function SelectedCard(props:any) {
	return(
		<Flex 
			flexDir="column" 
			bgColor="#202020" 
			alignItems="center" 
			justifyContent="center" 
			color="white" 
			border="2px" 
			borderColor="rgb(0,255,255)" 
			h="30vh"
			w="40vh"
			boxShadow="0 4px 8px 0 rgba(255, 255, 255, 0.2), 0 6px 20px 0 rgba(255, 255, 255, 0.19)"
			borderRadius="md" 
			m="10" 
			paddingY="2"
			paddingX="2"
			zIndex="3"
			mx="-18">
				<Heading fontSize="xxx-large" color="rgb(0,255,255)">{props.txt}</Heading>
		</Flex>
	)
}