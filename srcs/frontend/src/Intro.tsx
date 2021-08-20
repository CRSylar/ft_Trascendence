import { Component } from "react"

type IntroProps = {
	name?: string | undefined
}
export class Intro extends Component<IntroProps>{
	componentDidMount(){
		let value = this.context;
		
	}
	render()
	{return(
		<div className="App">
        <h1> 😈 Benvenuto su React {this.props.name}😈 </h1>
		<p>content --{this.context.user && this.context.user.name!== undefined ? this.context.user.name: "no-content" }--</p>
      	</div>
	)}
}
//Intro.contextType = UserContext;