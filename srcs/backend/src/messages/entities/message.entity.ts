export default class Message {

  public timestamp : number;
  public sender:string;
  public idChat: string;
  public userName : string;
  public msgBody : string;

  constructor(msg:any){
      this.timestamp = msg.timestamp;
      this.sender = msg.sender;
      this.idChat = msg.idChat;
      this.msgBody = msg.msgBody;
      this.userName = msg.userName;
  }
}
