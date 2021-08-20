import {
	Box,
	Button,
	Flex,
	Input,
	Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Component } from "react";
import * as api from './ApiConnector/ApiConnector';
// import {banParticipant} from "./ApiConnector/ApiConnector";

interface PChatSettings {
	settings: boolean,
	closesettings: any,
	user: any,
	idChat: any,
	admin: any,
	participants: any,
	moderators: any
}

export class ChatSettings extends Component<PChatSettings> {

	state = {
		toMute: "",
		toMuteError: false,
		toKick: "",
		toKickError: false,
		toBan: "",
		toBanError: false,
		toMod: "",
		toModError: false,
		newPassword: "",
		newPasswordError: false
	}

	updateToMute(evt: any) {
		if (this.state.toMuteError)
			this.setState({ toMuteError: false });
		this.setState({
			toMute: evt.target.value
		});
	}
	updateToKick(evt: any) {
		if (this.state.toKickError)
			this.setState({ toKickError: false });
		this.setState({
			toKick: evt.target.value
		});
	}
	updateToBan(evt: any) {
		if (this.state.toKickError)
			this.setState({ toKickError: false });
		this.setState({
			toBan: evt.target.value
		});
	}
	updateToMod(evt: any) {
		if (this.state.toModError)
			this.setState({ toModError: false });
		this.setState({
			toMod: evt.target.value
		});
	}
	updateNewPassword(evt: any) {
		if (this.state.newPasswordError)
			this.setState({ newPasswordError: false });
		this.setState({
			newPassword: evt.target.value
		});
	}

	async muteUser() {
		if (!this.checkParticipants(this.state.toMute))
			this.setState({ toMuteError: true });
		else if (this.checkAdmin(this.state.toMute))
			this.setState({ toMuteError: true });
		else if (!this.checkAdmin(this.props.user.idIntra) && this.checkModerators(this.state.toMute))
			this.setState({ toMuteError: true });
		else
		{
			await api.muteParticipant( {idParticipant: this.state.toMute, idChat:this.props.idChat})
			//console.log("Mute " + this.state.toMute + " to chat " + this.props.idChat)
			this.setState({toMute: ""})
		}
	}
	async kickUser() {
		if (!this.checkParticipants(this.state.toKick))
			this.setState({ toKickError: true });
		else if (this.checkAdmin(this.state.toKick))
			this.setState({ toKickError: true });
		else if (!this.checkAdmin(this.props.user.idIntra) && this.checkModerators(this.state.toKick))
			this.setState({ toKickError: true });
		else
		{
			await api.removeParticipant({idParticipant :this.state.toKick, idChat: this.props.idChat});
			//console.log("kick " + this.state.toKick + " from chat " + this.props.idChat)
			this.setState({toKick: ""})
		}
	}
	async banUser() {
		if (!this.checkParticipants(this.state.toBan))
			this.setState({ toBanError: true });
		else if (this.checkAdmin(this.state.toBan))
			this.setState({ toBanError: true });
		else
		{
			await api.banParticipant({idParticipant:this.state.toBan, idChat:this.props.idChat})
			this.setState({ toBanError: false });
			this.setState({toBan: ""})
		}
	}
	async modUser() {
		if (!this.checkParticipants(this.state.toMod))
			this.setState({ toModError: true });
		else if (this.checkAdmin(this.state.toMod))
			this.setState({ toModError: true });
		else if (this.checkModerators(this.state.toMod))
			this.setState({ toModError: true });
		else
		{
			await api.addModerator( {idParticipant: this.state.toMod, idChat : this.props.idChat } )
			this.setState({toMod: ""})
		}
	}

	async changePassword() {
		if (!this.checkPasswordLength())
			this.setState({ newPasswordError: true });
		else
		{
			await api.changePwd({idChat: Number(this.props.idChat), newPwd: this.state.newPassword})
			this.setState({newPassword: ""})
		}
	}

	checkAdmin(id: string) {
		if (this.props.admin[0].idIntra === id)
			return true
		return false
	}
	checkParticipants(id: string) {
		for (const user of this.props.participants)
		{
			if (user.idIntra === id)
				return true
		}
		return false
	}
	checkModerators(id: string) {
		for (const user of this.props.moderators)
		{
			if (user.idIntra === id)
				return true
		}
		return false
	}
	checkPasswordLength() {
		const n = Buffer.from(this.state.newPassword).length
		if (n > 70)
			return false
		return true
	}

	render() {
		return (
			<Modal isOpen={this.props.settings} onClose={this.props.closesettings}
			isCentered>
				<ModalOverlay />
				<ModalContent background="#333333" color="white">
					<ModalHeader>Chat Settings</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex alignItems="center" mb="2rem">
							<Input 
								variant="flushed"
								isInvalid={this.state.toMuteError}
								placeholder="Mute user"
								value={this.state.toMute}
								onChange={(evt: any) => this.updateToMute(evt)}/>
							<Button 
								borderColor="rgb(0,255,255)" borderWidth="thin"
								ml="1rem" w="100px"
								background="none"
								_hover={{background: "rgb(0,155,155)"}}
								onClick={this.muteUser.bind(this)}>
									Mute
							</Button>
						</Flex>
						<Flex alignItems="center" mb="2rem">
							<Input 
								variant="flushed"
								isInvalid={this.state.toKickError}
								placeholder="Kick user"
								value={this.state.toKick}
								onChange={(evt: any) => this.updateToKick(evt)}/>
							<Button 
								borderColor="rgb(0,255,255)" borderWidth="thin"
								ml="1rem" w="100px"
								background="none"
								_hover={{background: "rgb(0,155,155)"}}
								onClick={this.kickUser.bind(this)}>
									Kick
							</Button>
						</Flex>
						<Flex alignItems="center" mb="2rem">
							<Input 
								variant="flushed"
								isInvalid={this.state.toBanError}
								placeholder="Ban user"
								value={this.state.toBan}
								onChange={(evt: any) => this.updateToBan(evt)}/>
							<Button 
								borderColor="rgb(0,255,255)" borderWidth="thin"
								ml="1rem" w="100px"
								background="none"
								_hover={{background: "rgb(0,155,155)"}}
								onClick={this.banUser.bind(this)}>
									Ban
							</Button>
						</Flex>

						{/* PARTE VISIBILE SOLO AD ADMIN */}
						{	this.checkAdmin(this.props.user.idIntra) &&
							<Box>
								<Flex alignItems="center" mb="2rem">
									<Input 
										variant="flushed"
										isInvalid={this.state.toModError}
										placeholder="Mod user"
										value={this.state.toMod}
										onChange={(evt: any) => this.updateToMod(evt)}/>
									<Button 
										borderColor="rgb(0,255,255)" borderWidth="thin"
										ml="1rem" w="100px"
										background="none"
										_hover={{background: "rgb(0,155,155)"}}
										onClick={this.modUser.bind(this)}>
											Mod
									</Button>
								</Flex>
								<Flex alignItems="center">
									<Input 
										variant="flushed"
										isInvalid={this.state.newPasswordError}
										placeholder="Change password"
										value={this.state.newPassword}
										onChange={(evt: any) => this.updateNewPassword(evt)}/>
									<Button 
										borderColor="rgb(0,255,255)" borderWidth="thin"
										ml="1rem" w="100px"
										background="none"
										_hover={{background: "rgb(0,155,155)"}}
										onClick={this.changePassword.bind(this)}>
											Change
									</Button>
								</Flex>
							</Box>}

					</ModalBody>
	
					<ModalFooter>
						{/* <Button colorScheme="rgb(0,255,255)" mr={3} onClick={this.props.closesettings}>
							Close
						</Button> */}
					</ModalFooter>
				</ModalContent>
			</Modal>
		)
	}
}