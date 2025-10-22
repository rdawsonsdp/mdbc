import { db } from '../lib/firebaseClient';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';

/**
 * Save a chat conversation to Firestore
 */
export async function saveChatConversation(userId, conversationData) {
  try {
    console.log('📤 Attempting to save conversation...', {
      userId: userId,
      messageCount: conversationData.messages?.length,
      userData: conversationData.userData
    });

    if (!userId) {
      throw new Error('User must be logged in to save conversations');
    }

    if (!db) {
      throw new Error('Firestore database not initialized');
    }

    const conversationsRef = collection(db, 'chatConversations');
    
    const conversation = {
      userId: userId,
      messages: conversationData.messages,
      userData: {
        name: conversationData.userData?.name || 'User',
        birthCard: conversationData.userData?.birthCard || '',
        age: conversationData.userData?.age || null
      },
      title: conversationData.title || `Chat ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    console.log('📝 Conversation data prepared:', {
      userId: conversation.userId,
      title: conversation.title,
      messageCount: conversation.messages?.length
    });

    const docRef = await addDoc(conversationsRef, conversation);
    console.log('✅ Conversation saved with ID:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}

/**
 * Update an existing chat conversation
 */
export async function updateChatConversation(conversationId, conversationData) {
  try {
    const conversationRef = doc(db, 'chatConversations', conversationId);
    
    await updateDoc(conversationRef, {
      messages: conversationData.messages,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Conversation updated:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    throw error;
  }
}

/**
 * Get all chat conversations for a user
 */
export async function getChatConversations(userId) {
  try {
    if (!userId) {
      throw new Error('User ID required');
    }

    const conversationsRef = collection(db, 'chatConversations');
    const q = query(
      conversationsRef, 
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);
    return conversations;
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    throw error;
  }
}

/**
 * Delete a chat conversation
 */
export async function deleteChatConversation(conversationId) {
  try {
    const conversationRef = doc(db, 'chatConversations', conversationId);
    await deleteDoc(conversationRef);
    
    console.log('✅ Conversation deleted:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    throw error;
  }
}

