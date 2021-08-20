import * as React from 'react';
import {
    Input,
    InputGroup,
    InputRightElement,
    Button,
		Center,
} from "@chakra-ui/react"

interface PUsers {
    user?: string;
}

interface IState {
    totp : string;
    id : number;
}

export default class twoFactor extends React.Component<PUsers, {} > {
   constructor(props: any) {
       super(props);
       this.submit = this.submit.bind(this)
   }

   state: IState = {
       totp: "",
       id : 0,
   }

    async componentDidMount() {
        await this.setState({ id : Number(window.location.pathname.replace("/2fa/", "")) } );

    }

    async submit() {
       let ret = await fetch('/api/auth/verify2fa', {
           method: "POST",
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               id : this.state.id,
               totp: this.state.totp })
       });
       window.location.assign(ret.url)

    }

    render() {
            return(
                <Center h="100vh" background="#141414">
                    <InputGroup w="21vw" minWidth="300px">
                        <Input
														variant="flushed"
                            color="white"
                            placeholder="Enter TOTP"
                            value={this.state.totp}
                            onChange={ (event : React.ChangeEvent<HTMLInputElement>) => this.setState({totp: event.target.value})}
                        />
                        <InputRightElement width="4.5rem">
                            <Button 
														bgColor="black"
														borderColor="rgb(0,255,255)" borderWidth="medium" _hover={{ bg: "rgb(0,255,255)" }}
														color="white"
														onClick={this.submit}>Submit
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </Center>
            )
    }
}