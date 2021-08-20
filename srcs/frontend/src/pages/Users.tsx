import { Component } from "react"
import {
	CircularProgress,
	Flex,
} from '@chakra-ui/react'
import * as api from "../components/ApiConnector/ApiConnector"
import './Users.css'
import { NotFound } from "./404"
import { UserProfile } from "../components/UserProfile"

interface PUsers {
	data: any
}

interface SUsers {
  user?: any;
  userState?: any,
}

export default class Users extends Component<PUsers, SUsers>{ 
    constructor(props : any){
		super(props);
		this.state = {
			user : "waiting",
      userState: null,
		};
	}
	
    componentDidMount(){
			api.GetUserByLocation(window.location.pathname)
				.then((res : any) => {
					if (res) {
						this.setState({user : res});
					}
					else {
						this.setState({user : null})
					}
			})
    }



    render(){
        return(
            <Flex background="#141414" w="100%" h="calc(100vh - 44px)" overflow="auto" flex="1">
            {
							this.state.user === "waiting" ?
							<CircularProgress margin="auto" isIndeterminate color="rgb(0,255,255)" /> : (
							<>
							{
								this.state.user === null ? <NotFound/> :
								<UserProfile user={this.state.user} me={this.props.data}/>
							}
              </>
            )}
            </Flex>
        )
    }
}