import { Resolvers } from '../../../types/resolvers';
import privateResolver from '../../utils/privateResolver';
import User from '../../../entities/User';
import { EditPlaceResponse, EditPlaceMutationArgs } from '../../../types/graph';
import Place from '../../../entities/Place';
import cleanNullArgs from '../../utils/cleanNullArgs';


const resolvers: Resolvers = {
    Mutation: {
        EditPlace: privateResolver(async (_, args: EditPlaceMutationArgs, { req }): Promise<EditPlaceResponse> => {
            const user: User = req.user;
            try {
                const place = await Place.findOne({ id: args.placeId });
                if (place) {
                    if (place.userId === user.id) {
                        const notNull: any = cleanNullArgs(args);
                        if (notNull.placeId !== null) {
                            delete notNull.placeId;
                        }
                        await Place.update({ id: args.placeId }, { ...notNull });
                        return {
                            ok: true,
                            error: null
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Not Authorized"
                        }
                    }
                } else {
                    return {
                        ok: false,
                        error: "Place not found"
                    }
                }
            } catch (error) {
                return {
                    ok: false,
                    error: error.message
                }
            }
        })
    }
}

export default resolvers;