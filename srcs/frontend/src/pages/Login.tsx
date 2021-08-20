import {Component} from 'react'
import {UserContext} from './../App'

export class Login extends Component{
    state ={
        wannalog:false
    }
    render(){
    return(
        <UserContext.Consumer>
            { (user:any)=>{
                const handleClick=()=>{
                    user.setUser("tipo")
                }
                return(
                    <div style={{display:"flex",flexDirection:"column", alignItems:"center", margin:"auto", justifyContent:"center", height:"70vh"}}>
                        <h1>NON SEI LOGGATO</h1>
                        <h5 style={{cursor:"pointer"}} onClick={handleClick}>Click qui per continuare comunque</h5>
                    </div>
                )}}
        </UserContext.Consumer>
    )}
}