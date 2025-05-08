import { streamClient } from './streamClient';

/**
 * Controller for Stream Chat operations
 */
export const StreamChatController = {
  /**
   * Connect a user to Stream Chat
   * @param {string} userId - User ID
   * @param {string} token - Stream Chat user token
   * @param {Object} userData - Additional user data (name, image, etc.)
   */
  connectUser: async (userId, token, userData = {}) => {
    try {
      if (!userId || !token) {
        throw new Error('User ID and token are required');
      }
      
      // Disconnect if already connected
      if (streamClient.userID) {
        await streamClient.disconnectUser();
      }
      
      // Connect user
      await streamClient.connectUser(
        {
          id: userId.toString(),
          ...userData
        },
        token
      );
      
      console.log('Stream user connected:', userId);
      return true;
    } catch (error) {
      console.error('Error connecting to Stream:', error);
      return false;
    }
  },
  
  /**
   * Disconnect the current user
   */
  disconnectUser: async () => {
    try {
      if (streamClient.userID) {
        await streamClient.disconnectUser();
        console.log('Stream user disconnected');
      }
      return true;
    } catch (error) {
      console.error('Error disconnecting from Stream:', error);
      return false;
    }
  },
  
  /**
   * Create or fetch a channel between two users
   * @param {string} currentUserId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @param {Object} channelData - Additional channel data
   */
  createOrGetDirectChannel: async (currentUserId, otherUserId, channelData = {}) => {
    try {
      if (!currentUserId || !otherUserId) {
        throw new Error('Both user IDs are required');
      }
      
      // Ensure client is connected
      if (!streamClient.userID) {
        throw new Error('Stream client not connected');
      }
      
      // Sort member IDs to ensure consistent channel ID
      const members = [currentUserId.toString(), otherUserId.toString()].sort();
      const channelId = `messaging:${members[0]}-${members[1]}`;
      
      // Create or get channel
      const channel = streamClient.channel('messaging', channelId, {
        members,
        ...channelData
      });
      
      // Initialize the channel
      await channel.create();
      
      // Watch the channel to receive updates
      await channel.watch();
      
      return channel;
    } catch (error) {
      console.error('Error creating/getting channel:', error);
      throw error;
    }
  },
  
  /**
   * Get a channel by ID
   * @param {string} channelId - Channel ID
   */
  getChannel: async (channelId) => {
    try {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      
      // Ensure client is connected
      if (!streamClient.userID) {
        throw new Error('Stream client not connected');
      }
      
      // Get the channel
      const channel = streamClient.channel('messaging', channelId);
      
      // Watch the channel to receive updates
      await channel.watch();
      
      return channel;
    } catch (error) {
      console.error('Error getting channel:', error);
      throw error;
    }
  },
  
  /**
   * Get all channels for the current user
   */
  getUserChannels: async () => {
    try {
      // Ensure client is connected
      if (!streamClient.userID) {
        throw new Error('Stream client not connected');
      }
      
      // Query channels
      const filter = { 
        type: 'messaging',
        members: { $in: [streamClient.userID] } 
      };
      
      const sort = [{ last_message_at: -1 }];
      
      const channels = await streamClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });
      
      return channels;
    } catch (error) {
      console.error('Error getting user channels:', error);
      throw error;
    }
  },
  
  /**
   * Send a message to a channel
   * @param {Object} channel - Stream channel object
   * @param {string} text - Message text
   * @param {Object} attachments - Message attachments
   */
  sendMessage: async (channel, text, attachments = []) => {
    try {
      if (!channel) {
        throw new Error('Channel is required');
      }
      
      // Send message
      await channel.sendMessage({
        text,
        attachments,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }