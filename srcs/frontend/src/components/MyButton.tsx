import "./MyButton.css"

export function MyBigButton(props:any) {
	return(
		<button className="mybutton btn-design3">
			{props.txt}
		</button>
	)
}

export function MyButtonPink(props:any) {
	return(
		<button className="mybuttonsmall btn-design3">
			{props.txt}
		</button>
	)
}

export function MyButtonGreen(props:any) {
	return(
		<button className="mybuttonsmall btn-design3 mygreenbutton">
			{props.txt}
		</button>
	)
}