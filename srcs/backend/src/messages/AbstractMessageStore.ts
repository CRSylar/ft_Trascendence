import Message from './entities/message.entity';

export default /*abstract*/ class AbstractMessageStore {
    async findMessagesForUser(idUser : string) : Promise<any> { }

    async findMessagesPerUser(idUser : string) : Promise<any> { }

    async findMessagePerChat(chatId: string) : Promise<any> { } // tutti i messagi di una chat

    async saveMessage(message : Message) { }
}