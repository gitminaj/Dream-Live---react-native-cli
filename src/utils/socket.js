import { io } from 'socket.io-client';
import {BACKEND_URL} from './constant.ts';

export const socket = io.connect(BACKEND_URL);
