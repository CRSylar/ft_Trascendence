import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
type TPrivateRoute = {
    comp: any,
    data?: any,
    setPage: any;
    user:any;
    path:any;
}

interface IPrivateRoute {
    comp: any;
    data?: any;
}

export class PrivateRoute extends Component <TPrivateRoute, IPrivateRoute> {

	componentDidMount(){
		this.props.setPage(this.props.path)
	}

    componentDidUpdate(){
		this.props.setPage(this.props.path)
	}

    render() {

        return (
                <div>
                    {
                    (this.props.user?.idIntra === undefined ) ?
                       <Redirect to={"/"}/>
                     : // SENNO'
                        <this.props.comp  key={window.location.pathname} data={this.props.data}/>
                    }
                </div>
            )
    }
}

export class AuthRoute extends Component<TPrivateRoute, IPrivateRoute> {

    componentDidUpdate() {
        this.props.setPage(this.props.path)
    }
    render() {
        return(
            <div>
                {
                    (this.props.data.user.owner || this.props.data.user.isAdmin) ?
                        <this.props.comp data={this.props.data}/>
                        :
                        <Redirect to={"/"}/>
                }
            </div>
        )
    }
}