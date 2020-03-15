import { Resolvers } from '../../../types/resolvers';
import { SendMessageChatMutationArgs, SendMessageChatResponse } from '../../../types/graph';
import User from '../../../entities/User';
import Message from '../../../entities/Message';
import Chat from '../../../entities/Chat';
import privateResolver from '../../utils/privateResolver';

const resolvers: Resolvers = {
    Mutation: {
        SendMessageChat: privateResolver(async (_, args: SendMessageChatMutationArgs, { req, pubSub }): Promise<SendMessageChatResponse> => {
            const user: User = req.user;
            try {
                const chat = await Chat.findOne({ id: args.chatId });
                if (chat) {
                    if (chat.passengerId === user.id || chat.driverId === user.id) {
                        const message = await Message.create({
                            text: args.text,
                            chat,
                            user
                        }).save();
                        pubSub.publish("newChatMessage", { MessageSubscription: message });
                        return {
                            ok: true,
                            error: null,
                            message
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Unauthorized",
                            message: null
                        }
                    }
                } else {
                    return {
                        ok: false,
                        error: "Chat not found",
                        message: null
                    }
                }
            } catch (error) {
                return {
                    ok: false,
                    error: error.message,
                    message: null
                }
            }
        })
    }
}

export default resolvers;