import {D2435} from "./game/D2435";
import {UserReadOnly} from "./App";
import {Component} from "react";
import { CircularProgress} from "@chakra-ui/react"
import * as React from "react";

interface PInfo {
    info: any
}

export class GameLoader extends Component<PInfo> {

    render (){
        return(
            UserReadOnly === 'null' ?
                <CircularProgress m="auto" color="rgb(0,255,255)" value={30} isIndeterminate />
            :
            <div className="Damcont" id="Damcont">
                <D2435 data={ {
                    idIntra: UserReadOnly.idIntra,
                    type: this.props.info.player === true ? "player" : "spectator",
                    sd: this.props.info.sd,
                    userName: UserReadOnly.userName,
                    mc: this.props.info.mc,
                    idGame: this.props.info.name,
                    idIntraFriend: this.props.info.idIntraFriend,
                    visual: this.props.info.visual,
                    pvt: this.props.info.private
                } }/>
            </div>
        )
    }
}
