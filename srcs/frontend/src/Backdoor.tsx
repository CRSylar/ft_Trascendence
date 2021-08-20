import { Component } from 'react';
import { Button } from '@chakra-ui/react';

export class Backdoor extends Component {

    async handleClick(){
            await fetch('/api/auth/backdoor',{
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id:0,
                })
            })
        }

    render(){
        return(
            <div style={{display:"block", zIndex:90000}}>
                <Button onClick={this.handleClick}>
                    Log in
                </Button>
            </div>
        )
    }
}