
import { StreamChat } from 'stream-chat';
import { STEAM_API_KEY } from './constant';

export const streamClient = StreamChat.getInstance(STEAM_API_KEY);
