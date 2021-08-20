import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
} from "@chakra-ui/react"
import { Component } from "react";


interface PQr {
    qr : string,
}

export class PopUpAlert extends Component<PQr, {}> {
    constructor(props : any){
        super(props)
        this.onClose = this.onClose.bind(this);
    }

    state:any = {
        isOpen : true
    }

    onClose() {
        this.setState({isOpen: false})
    }

    render () {
        return(
            <>
                <AlertDialog
                    motionPreset="slideInBottom"
                   leastDestructiveRef={undefined}
                    onClose={this.onClose}
                    isOpen={this.state.isOpen}
                    isCentered
                    closeOnOverlayClick={false}
                    closeOnEsc={false}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <img src={this.props.qr} alt="qr code"/>
                            <AlertDialogBody>
                                Salva Questo QRCode per il prossimo login !
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button onClick={this.onClose}>
                                   Fatto
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </>
        )
    }
}