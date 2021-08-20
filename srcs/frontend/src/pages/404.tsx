import React from "react"
import {Center, Heading} from '@chakra-ui/react'
import './404.css'

export class NotFound extends React.Component{

    render(){
        return(
					<Center flexDir="column" h="100vh" background="#141414" color="white"
						position="absolute" top="0" left="0" w="100vw" zIndex="1"> 
							{/* <div className="maincontainer">
									<Text fontSize="6xl">Error: 404 Not Found</Text>
							</div> */}
							<Heading fontFamily="Montserrat" fontSize="8xl">404</Heading>
							<Heading fontFamily="Montserrat" fontSize="3xl">NOT FOUND</Heading>
							<Heading color="#333333" fontFamily="Montserrat" fontSize="lg">very bad cossu</Heading>
          </Center>

        )
    }
}