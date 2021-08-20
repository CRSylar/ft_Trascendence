import {Component } from 'react';
import {
	Flex,
	Heading,
} from '@chakra-ui/react'
import "./Logo.css"

class Logo extends Component {
	render() {
		return (
		<>
			<Flex flexDir="row" alignItems="center" justifyContent="center" >
				<Heading fontSize="xl" color="white" >TRAS</Heading>
				<div className="left-paddle-nav" />
				<div className="ball-nav" />
				<div className="right-paddle-nav" />
				<Heading fontSize="xl" color="white">ENDENCE</Heading>
			</Flex>
		</>
		)
	}
}
export default Logo