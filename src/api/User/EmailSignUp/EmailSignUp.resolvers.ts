import { Resolvers } from '../../../types/resolvers';
import { EmailSignUpMutationArgs, EmailSignUpResponse } from '../../../types/graph';
import User from '../../../entities/User';
import createJWT from '../../utils/createJWT';
import Verification from '../../../entities/Verification';
import { sendVerificationEmail } from '../../utils/sendEmail';

const resolvers: Resolvers = {
    Mutation: {
        EmailSignUp: async (_, args: EmailSignUpMutationArgs): Promise<EmailSignUpResponse> => {
            const { email } = args;
            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return {
                        ok: false,
                        error: "You should login instead",
                        token: null
                    }
                } else {
                    const phoneVerification = await Verification.findOne({ payload: args.phoneNumber, verified: true });
                    if (phoneVerification) {
                        const newUSer = await User.create({ ...args }).save();
                        if (newUSer.email) {
                            const emailVerification = await Verification.create({
                                payload: newUSer.email,
                                target: "EMAIL"
                            }).save();
                            await sendVerificationEmail(newUSer.fullName, emailVerification.key);
                        }
                        const token = createJWT(newUSer.id);
                        return {
                            ok: true,
                            error: null,
                            token
                        }
                    } else {
                        return {
                            ok: false,
                            error: "You haven't verified your phone number",
                            token: null
                        }
                    }
                }
            } catch (error) {
                return {
                    ok: false,
                    error: error.message,
                    token: null
                }
            }
        }
    }
}

export default resolvers;