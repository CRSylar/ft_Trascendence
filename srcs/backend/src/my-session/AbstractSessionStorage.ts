import {ISession} from "../../types/Types";

export default abstract class AbstractSessionStorage {
	abstract findSession(id : string) : Promise<ISession> ;

	abstract saveSession(id : string, session : ISession) ;

	abstract findAllSessions() : Promise< Map<string, ISession> > ;
}