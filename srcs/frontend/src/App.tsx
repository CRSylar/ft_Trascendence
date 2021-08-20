import * as React from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {Damcont} from './DamCont';
import Nav from './layout/Nav'
import './App.css';
import {HomePage} from './pages/HomePage';
import {NotFound} from './pages/404';
import {AuthRoute, PrivateRoute} from './components/PrivateRoute'
import LoginManager from './components/LoginManager'
import Waves from './components/waves';
import Users from './pages/Users';
import ChatWrapper from './pages/ChatWrapper';
import io from 'socket.io-client';
import Settings from './pages/Settings';
import twoFactor from "./pages/twoFactorAuth";
import AllUser from './pages/AllUser';
import {Backdoor} from "./Backdoor";
import {AdminPage} from './pages/AdminPage';
import * as api from './components/ApiConnector/ApiConnector';
import Universe from './components/Universe';
import {ErrorBanner} from "./components/ErrorBanner";

// enum eMatch {
//     classic,
//     sd,
//     mc,
//     full,
// }

// interface IMatch {
//     user            : string, // Nome utente visualizzato
//     idIntra         : string,
//     matchType       : eMatch,
//     pvt             : boolean,
//     friend?         : string,
//     idIntraFriend?  : string, // id Intra dell'amico da invitare
//     spectator?      : string,
// }

interface IFollower {
    friendId        : string,      // followed
    userId          : string,        // follower
    img             : string,       // followerImg
    userName        : string       // followerName
}

// interface IMessageNotify {
//     idChat          : number,
//     idSender        : string,
//     timestamp       : number
// }

enum TNotify {
    followed,
    message,
    game_req
}

class CNotifyFollowed implements INotify {
    public type         : TNotify;
    public content      : IFollower;
    public timestamp    : number;
    public id			: string;

    constructor(content : IFollower) {
        this.type = TNotify.followed;
        this.content = content;
        this.timestamp = Date.now()
        this.id = `${this.content.friendId}${this.type}${this.content.userId}`
    }
}

// class CNotifyMessage implements INotify {
//     public type         : TNotify;
//     public content      : IMessageNotify;
//     public timestamp    : number;
//     public id			: string;

//     constructor(content : IMessageNotify) {
//         this.type = TNotify.message;
//         this.content = content;
//         this.timestamp = Date.now()
//         this.id = `${this.type}${this.content.idChat}${this.content.timestamp}`
//     }
// }

// class CNotifyGame implements INotify {
//     public type         : TNotify;
//     public content      : IMatch;
//     public timestamp    : number;
//     public id			: string;

//     constructor(content : IMatch) {
//         this.type = TNotify.game_req;
//         this.content = content;
//         this.timestamp = Date.now()
//         this.id = `${this.content.idIntra}${this.type}${this.content.idIntraFriend}`
//     }
// }

interface INotify {
    type        : TNotify,
    content     : any,
    timestamp   : number,
    id			: string,
}


export const UserContext = React.createContext(undefined);
export let UserReadOnly : any = "null";

class App extends React.Component {

    setUser=(user:any)=>{
        this.setState({user : user});
    }

    setDisplayedChat=(displayedChat:any)=>{
        this.setState({displayedChat : displayedChat});
    }

    updateNotification=(notification : any )=> {
        this.setState({notify: notification})
    }

    updateChatNotification = (newChatNotify : any) => {
        this.setState({chatNotify : newChatNotify})
    }

    updateUser=(userUpdated : any) => {
        let newUser = this.state.user;
        newUser.img = userUpdated.img;
        this.setState({ user: newUser})
    }

    setPbChats=(id:number)=>{
        if(this.state.chat.filter((el:any)=>el.id === id).length > 0){
            let newPbChats = this.state.pubChats.filter((el: any) => el.id !== id);
            this.setState({pubChats : newPbChats});
        }
    }

    setError=(head:string, body?:string)=>{
        this.setState({errMsg:body, isError:true, errHead:head})
    }

  state : any = {
    user:"null",
    setUser: this.setUser,
    client : null,
    chat: [],
    notify: [],
    chatNotify: {},
    displayedChat: null,
    setDisplayedChat : this.setDisplayedChat,
    updateChatNotification : this.updateChatNotification,
    setNotify : this.updateNotification,
    updateUser: this.updateUser,
    check : true,
	page: "/",
	pubChats:[],
	setPbChats:this.setPbChats,
	chatOn: false,
      isError:false,
      errMsg:"",
      errHead:"",
      setError:this.setError
  }
	changeChatOn() {
		if (this.state.displayedChat)
			this.setState({displayedChat: null})
		this.setState({chatOn: !this.state.chatOn})
	}
	closeChat() {
		if (this.state.chatOn)
			this.setState({chatOn: false})
	}


  async componentDidMount(){
    this.getUser()
        .then((res) => {
            this.setUser(res);
            UserReadOnly = res;
            this.setState({logged: true})
		})
  }

  addPbChat(chat :any) {
        let pubChats = this.state.pubChats;
        pubChats.push(chat);
        this.setState({pubChats});
  }

  setChats(newChat:any){
        let sortedChats = newChat;
        sortedChats = sortedChats.sort((el1 : any, el2 : any) =>{
            if( el1.msg.length === 0)
                return 1
            if(el2.msg.length === 0)
                return -1
           return (el1.msg[el1.msg.length -1].timestamp > el2.msg[el2.msg.length -1].timestamp) ? -1 : 1
        })
        for(let indx in sortedChats)
            sortedChats[indx].msg= sortedChats[indx].msg.filter((el:any)=> !this.state.user.blocked.hasOwnProperty(el.sender))
        this.setState({chat: sortedChats})
  }


  componentDidUpdate(){
    if (this.state.user && this.state.user !== "null")
        {
            if (this.state.client === null)
                this.setState({client : io(`http://${process.env.REACT_APP_MIOIP}:4050`,{
                        transports: ["websocket"],
                        query: {
                            auth: this.state.user.idIntra
                        }
                })})

            if (this.state.client && this.state.check) {

                this.state.client.on('alreadyLoggedIn' , (payload :any) => {
                   api.GetLogout();
                });

                this.state.client.on('gameReq', (payload: any) => {
                    let vect = this.state.notify;
                    vect.push(payload);
                    this.setState({notify: vect})
                })
	            this.state.client.on("joinChatRequest", async (payload: any) => {
                    this.state.client.emit('joinChatCli' , payload );
	            });

	            this.state.client.on("joinSuccess", (payload: any) => {
                    let newChat = this.state.chat;
                    newChat.push(payload);
                    this.setChats( newChat );
                    if (payload.idIntra === this.state.user.reqidIntra) {
                        this.setState( { displayedChat: payload.id });
                    }
                    if (payload.types === 'public') {
                        this.setPbChats(payload.id);
                    }
	            });
	            this.state.client.on("loadChats", (payload: any) => {
		            this.setChats(payload)
	            });
                this.state.client.on('msgToClient', (message: any) => {
                    let newChats=this.state.chat;
                    let chat = newChats.find((el:any)=> el.id === message.content.idChat);
                    if (chat === undefined)
                        return ;
                    chat.msg.push(message.content);
                    this.setChats(newChats);
                    if (this.state.displayedChat === message.content.idChat) {
                        this.state.client.emit("readChat", this.state.displayedChat);
                    }
                })
	            this.state.client.on("addedAsFriend", (payload:any) =>{
                    let vect = this.state.notify;
                    vect.push(payload);
                    this.setState({notify: vect})
                });
                this.state.client.on('userUpdate', (user :any) => {
                    UserReadOnly = user;
                    this.state.setUser(user);
                });

                this.state.client.on('public_update', (payload :any ) => {
                    if (payload.idIntra === this.state.user.idIntra)
                        return ;
                    let updateFriends = this.state.user.userFriends.map( (friend : any) => {
                        if (friend.idIntra === payload.idIntra)
                            return payload;
                        else
                            return friend;
                    })
										// eslint-disable-next-line
                    this.state.user.userFriends = updateFriends;
                    this.setUser(this.state.user);
                });

                this.state.client.on('chatRemoved', (payload : any ) => {
                    delete this.state.chatNotify[payload.idChat];
                    this.updateChatNotification(this.state.chatNotify);
                    if (payload.idChat === this.state.displayedChat)
                        this.setDisplayedChat(null);
                    this.removeChat(payload.idChat);
                });

                this.state.client.on('newParticipant', (payload : any) => {
                    if (this.state.user.idIntra !== payload.user.idIntra){
                         let chat = this.state.chat.find( (el :any) => el.id === payload.idChat);
                         chat.participant.push(payload.user);
                         let newChat = this.state.chat.filter( (el :any) => el.id !== payload.idChat);
                         newChat.push(chat);
                         this.setChats(newChat);
                    }
                });

                this.state.client.on('removedFromChat', (payload :any) => {
                    if (this.state.displayedChat === payload.idChat)
                        this.setDisplayedChat(null);
                    let chat = this.state.chat.find((el:any) => el.id === payload.idChat || el.id === payload.id)
                    if (chat.types === "public")
                        this.addPbChat(chat);
                    this.removeChat(payload.idChat)
                    let participant = this.state.user.participant;
                    participant.filter( (el : any) => el.id !== payload.idChat)
                    let user = this.state.user;
                    delete user.participant;
                    user.participant = participant;
                    this.setUser(user);

                })

                this.state.client.on('bannedFromChat', (payload :any) => {
                    //console.log("bannedFromChat", payload)
                    if (this.state.displayedChat === payload.idChat)
                        this.setDisplayedChat(null);
                    //let chat = this.state.chat.find((el:any) => el.id === payload.idChat || el.id === payload.id) non lo usa nesssuno... che fa qui??
                    this.removeChat(payload.idChat)
                    let participant = this.state.user.participant;
                    participant.filter( (el : any) => el.id !== payload.idChat)
                    let user = this.state.user;
                    delete user.participant;
                    user.participant = participant;
                    this.setUser(user);

                })

                this.state.client.on('joinFailure', (payload :any) => {
                    this.setError("Wrong Password")
                });

                this.state.client.on('someoneHasLeft', (payload : any ) => {
                    let chat = this.state.chat.find( (el :any) => el.id === payload.idChat);
                    if (chat.types === "private-duo") {
                        this.state.client.emit('deleteChat', chat.id)
                        return ;
                    }
                    let newParticipants = chat.participant.filter( (el :any) => el.idIntra !== payload.idIntra);
                    chat.participant = newParticipants;
                    let newChat = this.state.chat.filter( (el :any) => el.id !== payload.idChat);
                    newChat.push(chat);
                    this.setChats(newChat);
                })

               this.state.client.on('chatUpdate', (payload : any) => {
                   this.setDisplayedChat(null);
                   let SChats=this.state.chat.filter((el:any)=>el.id !== payload.idChat)
                   let Upartecipants= this.state.user.participant.filter((el:any)=> el!== payload.idChat)
                   let updatedUser=this.state.user;
                   updatedUser.chat.participant=Upartecipants;
                   this.setChats(SChats);
                   this.setState({pubChats : payload.chats});
                   this.setUser(updatedUser);
                });

                this.state.client.on('messageNotification', (notifyEntry : INotify) => {
                    if (notifyEntry.content.idSender === this.state.user.idIntra)
                        return ;
                    let notifications = this.state.chatNotify;
                    if (!notifications[notifyEntry.content.idChat])
	                    notifications[notifyEntry.content.idChat] = []
                    notifications[notifyEntry.content.idChat].push(notifyEntry);
                    this.setState({chatNotify : notifications})
                });

                this.state.client.on('readSuccess', (event : {idChat : number, last : number}) =>{
                   let chatNotify = this.state.chatNotify;
                   let notifyArray : any[] = chatNotify[event.idChat];
                   if (!notifyArray || !notifyArray.length || notifyArray[notifyArray.length - 1].content.timestamp <= event.last)
                        chatNotify[event.idChat] = [];
                   else
                       chatNotify[event.idChat] = notifyArray.filter((entry : any) => entry.content.timestamp > event.last)
                   this.setState({ chatNotify: chatNotify } );
                });

                this.state.client.on('lastMessageRead', (event : {idChat : number, readUntil: number}) => {
                    let chat = this.state.chat;
                    let entry = chat.find((element : any) => element.id === event.idChat)
                        // .readUntil = event.readUntil
                    if (!entry)
                        return ;
                    entry.readUntil = event.readUntil;
                    this.setState({chat : chat})
                })

                this.state.client.on('banned', (user : any) => {
                    api.GetLogout();
                });
                this.state.client.on("loadPublicChats", (publicChats:any)=> {
                    this.setState({pubChats:publicChats})
                })

                this.state.client.on('newPublicChat', (payload :any) => {
                  if (payload.idIntra !== this.state.user.idIntra){
                   this.state.pubChats.push(payload);
                   this.setState({pubChats: this.state.pubChats});
                    }
                });

                this.state.client.on('loadNotifications', (payload :any) => {
                  this.setState({
                      notify: payload.followed,
                      chatNotify: payload.message,
                  });
                });

                this.state.client.on('addedAsAdmin', (payload :any) => {
                   let chat = this.state.chat.find( (el:any) => el.id === payload.idChat);
                   chat.admin.push(payload);
                   let newChat = this.state.chat.filter((el:any) => el.id !== payload.idChat);
                   newChat.push(chat);
                   this.setChats(newChat);
                   let user = this.state.user;
                   user.admin.push(payload);
                   this.setUser(user);
                });

                this.state.client.on('removedAsAdmin', (payload :any) => {
                    let chat = this.state.chat.find( (el:any) => el.id === payload.idChat);
                    let newChat = chat.admin.filter( (el:any) => el.idIntra !== payload.idIntra);
                    let chats = this.state.chat.filter( (el:any) => el.id !== payload.idChat);
                    chats.push(newChat);
                    this.setChats(chats);
                    let user = this.state.user;
                    user.admin = user.admin.filter((el: any) => el.idChat !== payload.idChat);
                    this.setUser(user)
                });

                this.state.client.on('addedAsModerator', (payload :any) => {
                    let chat = this.state.chat.find( (el:any) => el.id === payload.idChat);
                    chat.moderators.push(payload);
                    let newChat = this.state.chat.filter((el:any) => el.id !== payload.idChat);
                    newChat.push(chat);
                    this.setChats(newChat);
                    let user = this.state.user;
                    user.moderators.push(payload);
                    this.setUser(user);
                })

                this.state.client.on('removedAsModerator', (payload:any) => {
                    let chat = this.state.chat.find( (el:any) => el.id === payload.idChat);
                    let newChat = chat.moderators.filter( (el:any) => el.idIntra !== payload.idIntra);
                    let chats = this.state.chat.filter( (el:any) => el.id !== payload.idChat);
                    chats.push(newChat);
                    this.setChats(chats);
                    let user = this.state.user;
                    user.moderators = user.moderators.filter((el: any) => el.idChat !== payload.idChat);
                    this.setUser(user)
                });

                this.state.client.on('online', (idIntra : any) => {
                    if (this.state.user.idIntra === idIntra)
                    {
											// eslint-disable-next-line
                        this.state.user.status = 'online';
                        this.setUser(this.state.user);
                    }
                    else {
                        let friend = this.state.user.userFriends.map( (friend : any) => {
                            if (friend.idIntra === idIntra)
                                friend.status = 'online';
                            return friend;
                            }
                        )
												// eslint-disable-next-line
                        this.state.user.userFriends = friend;
                        this.setUser(this.state.user);
                    }
                })

                this.state.client.on('in_game', (idIntra : any) => {
                    if (this.state.user.idIntra === idIntra)
                    {
											// eslint-disable-next-line
                        this.state.user.status = 'in_game';
                        this.setUser(this.state.user);
                    }
                    else {
                        let friend = this.state.user.userFriends.map( (friend : any) => {
                                if (friend.idIntra === idIntra)
                                    friend.status = 'in_game';
                                return friend;
                            }
                        )
												// eslint-disable-next-line
                        this.state.user.userFriends = friend;
                        this.setUser(this.state.user);
                    }
                })

                this.state.client.on('offline', (idIntra : any) => {
                    if (this.state.user.idIntra === idIntra)
                    {
											// eslint-disable-next-line
                        this.state.user.status = 'offline';
                        this.setUser(this.state.user);
                    }
                    else {
                        let friend = this.state.user.userFriends.map( (friend :any ) => {
                                if (friend.idIntra === idIntra)
                                    friend.status = 'offline';
                                return friend;
                            }
                        )
												// eslint-disable-next-line
                        this.state.user.userFriends = friend;
                        this.setUser(this.state.user);
                    }
                })

                this.state.client.on('deleteGameNotification', (payload :any) => {
                   let N = this.state.notify;
                    N = N.filter( ( notif : INotify ) =>
                       notif.type !== TNotify.game_req || notif.content.idIntraFriend !== payload.idIntraFriend);
                    this.updateNotification(N);
                });
                this.state.client.on('removeFollowed', (payload : CNotifyFollowed) => {
                    let notify = this.state.notify;
                    notify = notify.filter((notification : INotify) => notification.type !== payload.type || notification.id !== payload.id)
                    this.setState({notify});
                })
	            this.setState({check : false})
            }
        }
  }

  removeChat(idChat : Number){
    let newChats = this.state.chat.filter( (el: any) => el.id !== idChat);
    this.setChats(newChats);
  }

  async getUser(){
    let res : any = await fetch("/api/users/me", {
      method: 'GET'
    }).catch((e) => {
      console.error(e.msg);
    });
    let out = await res.json();
    if (!out || out.statusCode)
      return "null";
    return out;
  }

  setPage = (path: string) => {
		if(path !== this.state.page)
			this.setState({page: path})
    }


    closeError=()=>{
        this.setState({isError:false, errMsg:"", errHead:""})
    }

  render(){
    return (
    <Router>
        <ErrorBanner isError={this.state.isError} onClose={this.closeError} errHead={this.state.errHead} errMsg={this.state.errMsg} />
    <UserContext.Provider value={this.state}>
			{this.state.user !== "null" &&
      <Nav
          page={this.state.page}
          chatOn={this.state.chatOn}
          changeChatOn={this.changeChatOn.bind(this)}
          closeChat={this.closeChat.bind(this)} />
			}

      <Switch >
          <Route component={Backdoor} path='/backdoor'/>
          <Route render={()=><LoginManager user={this.state}/>} exact path='/login' />
          <Route render={()=> <PrivateRoute  setPage={this.setPage} user={this.state.user} comp={Settings} path='/settings' data={this.state}/>}  exact  path='/settings' />
          {
              this.state.user !== 'null' && this.state.user.firstLogin &&
              <Redirect to='/settings'/>
          }
          <Route render={()=> <PrivateRoute user={this.state.user} setPage={this.setPage} comp={ChatWrapper}  path='/chatwrapper' data={this.state}/>} exact path='/chatwrapper' />
          <Route render={()=> <PrivateRoute user={this.state.user} setPage={this.setPage} comp={Damcont}  path='/game'/>}  exact path='/game' />
          <Route render={()=> <PrivateRoute  setPage={this.setPage} user={this.state.user} comp={Waves} path='/waves'/> }  exact  path='/waves' />
          <Route render={()=> <AuthRoute setPage={this.setPage} user={this.state.user} data={this.state} comp={AdminPage} path='/admin' />} exact path='/admin'/>
          <Route render={()=> <PrivateRoute  setPage={this.setPage} user={this.state.user} comp={Users} data={this.state.user} path='/profile/:user'/>} exact   path='/profile/:user' />
          <Route render={()=> <PrivateRoute  setPage={this.setPage} user={this.state.user} comp={AllUser} data={this.state.user.idIntra}  path='/profile'/>}   exact path='/profile' />
          <Route component={twoFactor} path='/2fa/:id'/>
          <Route component={Universe} path='/easteregg'/>
          <Route render={()=> <HomePage  user={this.state.user} data={this.state.chatOn} setPage={this.setPage.bind(this)}/> } exact path='/' />
          <Route component={NotFound} />
      </Switch>
    </UserContext.Provider>
    </Router>
  )}
}
export default App;
