import  React ,{ Component } from "react";
import {AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button} from "@chakra-ui/react";

export class ErrorBanner extends Component<any, any>{

	
	state={
		ref: React.createRef()
	}
	leastDestructive: any = this.state.ref
    render(){
        // @ts-ignore
        // @ts-ignore
        return(
            <AlertDialog
                isOpen={this.props.isError}
                leastDestructiveRef={this.leastDestructive}
                onClose={this.props.onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bgColor={"rgba(255,0,255,0.3)"} color={"rgb(0,255,255)"}>
                        <AlertDialogHeader textAlign={"center"} fontSize="lg" fontWeight="bold" >
                            {this.props.errHead}
                        </AlertDialogHeader>
                        {this.props.errMsg && this.props.errMsg !== "" ?
                            <AlertDialogBody>
                                {this.props.errMsg}
                            </AlertDialogBody>
                        : null}
                        <AlertDialogFooter justifyContent={"center"}>
                            <Button bgColor={"inherit"} ref={this.leastDestructive} onClick={this.props.onClose}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        )
    }

}