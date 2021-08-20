import {
    Flex,
    Input,
    Button,
    Avatar,
    Heading,
    Switch,
    FormControl,
    FormLabel,
    InputRightElement,
    InputGroup,
		Icon,
} from "@chakra-ui/react";
import { Component } from "react";
import { UserContext } from '../App';
import {PopUpAlert} from "./popUpAlert";
import './Settings.css'
import { MdPhone, MdMail, MdPerson, MdImage} from "react-icons/md";

interface TSettingsProps {
    data: any,
};

let regexUrl = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/);
let regexPhone = new RegExp( /^((00|\+)39[. ]??)??3\d{2}[. ]??\d{6,7}$/);
let regexMail = new RegExp( /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);

export default class Settings extends Component<TSettingsProps> {

    numberVisual : string = "Insert Phone";
    emailVisual: string = "Insert eMail";
    usernameVisual: string = "Insert Username";
    urlAvatarVisual: string = "Insert Url Avatar";

    constructor(props: any) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.toogleTwoFa = this.toogleTwoFa.bind(this);

        if (this.props.data.user.tel)
            this.numberVisual = this.props.data.user.tel;
        if (this.props.data.user.email)
            this.emailVisual = this.props.data.user.email;
        if (this.props.data.user.userName)
            this.usernameVisual = this.props.data.user.userName;
        if (this.props.data.user.img)
            this.urlAvatarVisual = this.props.data.user.img;
    }

    state = {
        newUserName: "",
        newAvatar: "",
        phone: "",
        mail: "",
        userName: this.props.data.user.userName,
        userImg: this.props.data.user.img,
        invalidName: false,
        invalidUrl: false,
        invalidPhone: false,
        invalidMail: false,
        qrUrl: "",
        toogle: this.props.data.user.twoFa,
        changed : false,
    }
    
    componentDidMount() {
        if (this.props.data.user.firstLogin)
            this.props.data.client.emit('firstLogin', this.props.data.user.idIntra)
    }

    updateUserName(evt: any) {
        this.setState({
      newUserName: evt.target.value
    });
    }


    updateAvatar(evt: any) {
        this.setState({
      newAvatar: evt.target.value
    });
    }

    updatePhone(evt :any){
        this.setState( {
            phone : evt.target.value
        })
    }

    updateMail(evt: any) {
        this.setState( {
            mail : evt.target.value
        })
    }

    async changeMail(user: any|null) {
        if (this.state.mail !== "" && regexMail.test(this.state.mail))
        {
            fetch('/api/users/update/mail/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body : JSON.stringify( {
                    idIntra : this.props.data.user.idIntra,
                    email : this.state.mail
                } ),
            })
                .then(e => {
                    if (e.status >= 200 && e.status < 300){
                        this.emailVisual = this.state.mail;
                        this.setState({mail : "", invalidMail: false});
                        return e.json();
                    }
                })
                .then(e =>{
                    user.updateUser(e);
                })
        }
        else
            this.setState({invalidMail: true})
    }

    async changePhone(user: any|null) {
        if (this.state.phone !== "" && regexPhone.test(this.state.phone))
        {
            fetch('/api/users/update/phone/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body : JSON.stringify( {
                    idIntra : this.props.data.user.idIntra,
                    tel : this.state.phone
                } ),
            })
                .then(e => {
                    if (e.status >= 200 && e.status < 300){
                        this.numberVisual = this.state.phone;
                        this.setState({phone : "", invalidPhone: false});
                        return e.json();
                    }
                })
                .then(e =>{
                    user.updateUser(e);
                })
        }
        else
            this.setState({invalidPhone: true})
    }

    async handleClick(user :any|null) {
        if (this.state.newUserName !== "")
        {
					if (this.state.newUserName.length > 14)
					{
						this.setState({invalidName: true})
						return
					}
            fetch('/api/users/update/showedname/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body : JSON.stringify( {
                    idIntra : this.props.data.user.idIntra,
                    userName: this.state.newUserName,
                } ),
            })
                        .then(e => {
                                if (e.status >= 200 && e.status < 300)
                                {
                                    this.usernameVisual = this.state.newUserName;
                                    this.setState({userName : this.state.newUserName, newUserName : "", invalidName: false});
                                }
                                else
                                        this.setState({invalidName: true})
                        })
        }
        if (this.state.newAvatar !== "" && regexUrl.test(this.state.newAvatar)) {
            fetch('/api/users/update/changeAvatar/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body : JSON.stringify( {
                    idIntra : this.props.data.user.idIntra,
                    img : this.state.newAvatar
                } ),
            })
                        .then(e => {
                                if (e.status >= 200 && e.status < 300){
                                    this.urlAvatarVisual = this.state.newAvatar;
                                    this.setState({userImg : this.state.newAvatar, newAvatar : "", invalidUrl: false});
                                    return e.json();
                                }
                })
            //     .then(e =>{
            //     user.updateUser(e);
            // })
        }
        else if (this.state.newAvatar !== "")
            this.setState({invalidUrl: true})
    }

    async toogleTwoFa(){
        let res : any;
        try {
            if (!this.state.toogle) {
                this.setState({qrUrl : ""})
                res = await fetch(`/api/users/activate/2fa/${this.props.data.user.id}`, {
                    method: 'POST',
                })
                //if(res.status >= 200 && res.status < 300)
                    await this.getQr()
            }
            else {
                res = await fetch(`/api/users/deactivate/2fa/${this.props.data.user.idIntra}`, {
                    method: 'POST',
                })
            }
            if (res.status >= 200 && res.status < 300) {
                this.setState({
                    toogle: !this.state.toogle,
                    changed: true,
                })
            }
        } catch (e) {
            console.error("some error in deactivate 2fa")
        }

    }

    async getQr() {
            const middle :any = await fetch("/api/auth/2fa", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({id : this.props.data.user.id}),
            });
            middle.json().then((out :any) => {
                this.setState({qrUrl : out.QRcode});
            })
    }



    render() {
        return(
            <UserContext.Consumer>{(user : any) => {
                return(
            <Flex background="#141414" h="calc(100vh - 44px)" color="white" overflow="auto">
                <Flex flexDir="column" justifyContent="center" align="center" fontSize="1.5em" margin="auto">
                    <Flex className="settingsflex" mb="1rem">
                        <Avatar src={this.props.data.user.img} m="1rem" className="myavatar" />
                        <Heading color="white">{this.props.data.user.userName}</Heading>
                    </Flex>
                    <Flex alignItems="center" justifyContent="center" m="3">
											<Icon as={MdPerson} w="8" h="8" mr="1rem" />
                        <InputGroup w="21vw" minWidth="300px">
                        <Input  isInvalid={this.state.invalidName}
                                        variant="flushed"
                                        placeholder={this.usernameVisual}
                                        value={this.state.newUserName}
                                        onChange={(evt: any) => this.updateUserName(evt)}/>
                                <InputRightElement width="5rem">
                                <Button bgColor="black"
                                                borderColor="rgb(0,255,255)" borderWidth="thin" _hover={{ bg: "rgb(0,155,155)" }}
                                                onClick={() => this.handleClick(null)}>
                                        Update
                                </Button>
                                </InputRightElement>
                        </InputGroup>
                    </Flex>
                    <Flex align="center" justifyContent="center" m="3">
										<Icon as={MdImage} w="8" h="8" mr="1rem" />
                        <InputGroup w="21vw" minWidth="300px">
                            <Input  isInvalid={this.state.invalidUrl}
                                            variant="flushed"
                                            errorBorderColor="rgb(255,0,255)"
                                            placeholder={this.urlAvatarVisual}
                                            value={this.state.newAvatar}
                                            onChange={evt => this.updateAvatar(evt)}/>
                                    <InputRightElement width="5rem">
                                    <Button bgColor="black"
                                            borderColor="rgb(0,255,255)" borderWidth="thin" _hover={{ bg: "rgb(0,155,155)" }}
                                            onClick={ () => {this.handleClick(user) } }>
                                            Update
                                    </Button>
                                    </InputRightElement>
                        </InputGroup>
                </Flex>
                <Flex align="center" justifyContent="center" m="3">
									<Icon as={MdPhone} w="8" h="8" mr="1rem" />
                        <InputGroup w="21vw" minWidth="300px">
                                <Input  isInvalid={this.state.invalidPhone}
                                                variant="flushed"
                                                errorBorderColor="rgb(255,0,255)"
                                                placeholder={this.numberVisual}
                                                value={this.state.phone}
                                                onChange={evt => this.updatePhone(evt)}/>
                                <InputRightElement width="5rem">
                                        <Button bgColor="black"
                                                        borderColor="rgb(0,255,255)" borderWidth="thin" _hover={{ bg: "rgb(0,155,155)" }}
                                                        onClick={ () => {this.changePhone(user) } }>
                                                Update
                                        </Button>
                                </InputRightElement>
                        </InputGroup>
                </Flex>
                <Flex align="center" justifyContent="center" m="3">
									<Icon as={MdMail} w="8" h="8" mr="1rem" />
                    <InputGroup w="21vw" minWidth="300px">
                        <Input  isInvalid={this.state.invalidMail}
                                variant="flushed"
                                errorBorderColor="rgb(255,0,255)"
                                placeholder={this.emailVisual}
                                value={this.state.mail}
                                onChange={evt => this.updateMail(evt)}/>
                        <InputRightElement width="5rem">
                            <Button bgColor="black"
                                    borderColor="rgb(0,255,255)" borderWidth="thin" _hover={{ bg: "rgb(0,155,155)" }}
                                    onClick={ () => {this.changeMail(user) } }>
                                Update
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </Flex>
                <Flex align="center" justifyContent="center" m="3">
                <FormControl display="flex" alignItems="center" justifyContent="center">
                        <FormLabel htmlFor="email-alerts" mb="0">
                                Enable Two Factor Authentication?
                        </FormLabel>
                        <Switch defaultChecked={this.state.toogle} onChange={this.toogleTwoFa} />
                        {this.state.toogle && this.state.changed ?  (<PopUpAlert qr={this.state.qrUrl}/>) : null}
                </FormControl>
                </Flex>
                </Flex>
            </Flex>
        )}}
        </UserContext.Consumer>
        )
    }
}

