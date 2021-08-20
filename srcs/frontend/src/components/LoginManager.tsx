import {Component} from "react";
import {Redirect} from 'react-router';
// import queryString from 'querystring';
// import * as React from "react";
// import { Button } from "@chakra-ui/react";

// type TLogin = {
//     user: any,
//     logged?: boolean
// }

interface PLogin {
    user: any;
    logged?: boolean
}



export default class LoginManager extends Component<PLogin> {
    state : any = {logged: false};

    async componentDidMount(){
        this.getUser().then((res) => {
            this.props?.user?.setUser(res);
            this.setState({logged: true})
        })
    }

    async getUser(){
        let res : any = await fetch("/api/users/me", {
            method: 'GET'
        }).catch((e) => {
            console.error(e.msg);
        });
        let out = await res.json();
        if (!out || out.statusCode === 401)
            return "null";
        return out;
    }

    render()
    {
        return(
                this.state.logged? <Redirect to="/"/> : <></>
            ) 
    }
}