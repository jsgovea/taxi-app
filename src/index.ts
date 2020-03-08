import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createConnection } from 'typeorm';
import { Options } from 'graphql-yoga';
import connectionOptions from './ormConfig';
import decodeJWT from './api/utils/decodeJWT';


const PORT: number | string = process.env.PORT || 4000;
const PLAYGROUND: string = '/playground';
const GRAPHQL_ENDPOINT: string = '/graphql';
const SUBSCRIPTION_ENDPOINT: string = '/subscription';

const appOptions: Options = {
    port: PORT,
    playground: PLAYGROUND,
    endpoint: GRAPHQL_ENDPOINT,
    subscriptions: {
        path: SUBSCRIPTION_ENDPOINT,
        onConnect: async (connectionParams) => {
            const token = connectionParams['X-JWT'];
            if (token) {
                const user = await decodeJWT(token);
                if (user) {
                    return {
                        currentUser: user
                    }
                }
            }

            throw new Error("No JWT. Cant' subscribe");

        }
    }
};

const handleAppStat = () => console.log(`Listening on port ${PORT}`);

createConnection(connectionOptions).then(() => {
    app.start(appOptions, handleAppStat);
}).catch(error => console.log(error));