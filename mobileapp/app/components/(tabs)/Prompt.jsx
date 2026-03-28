import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../../../config'; // Adjust the path as necessary

const modelUrl = `${config.SERVER_URL}/ask_pdf`;

const Prompt = () => {
  const [inputText, setInputText] = useState('');
  const [qaPairs, setQaPairs] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentChatTitle, setCurrentChatTitle] = useState('New Chat');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');

  const handleTextInputChange = (text) => {
    setInputText(text);
  };

  const handleNewChat = () => {
    setQaPairs([]);
    setInputText('');
    setShowHistory(false);
    setCurrentSessionId(null);
    setSelectedHistoryIndex(null);
    setCurrentChatTitle('New Chat');
  };

  const handleToggleHistory = async () => {
    if (!showHistory) {
      await loadChatHistory();
    } else {
      setSelectedHistoryIndex(null);
      setIsRenaming(false);
    }
    setShowHistory((prev) => !prev);
  };

  const handleHistoryItemPress = (index) => {
    setSelectedHistoryIndex(index);
    setIsRenaming(false);
  };

  const handleDeleteHistoryItem = async (index) => {
    const entry = history[index];
    if (!entry) return;
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const payload = { token };
      if (entry.session_id) {
        payload.session_id = entry.session_id;
      } else if (entry.created_at) {
        payload.created_at = entry.created_at;
      }
      const response = await fetch(`${config.SERVER_URL}/chat-history/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setHistory((prev) => prev.filter((_, i) => i !== index));
        if (selectedHistoryIndex === index) {
          setSelectedHistoryIndex(null);
          setIsRenaming(false);
        } else if (selectedHistoryIndex !== null && index < selectedHistoryIndex) {
          setSelectedHistoryIndex((prev) => prev - 1);
        }

        if (
          (entry.session_id && currentSessionId === entry.session_id) ||
          (!entry.session_id && currentSessionId === null && currentChatTitle === (entry.initial_question || entry.messages?.[0]?.question))
        ) {
          setCurrentSessionId(null);
          setQaPairs([]);
          setCurrentChatTitle('New Chat');
        }

        await loadChatHistory();
      } else {
        console.error('Failed to delete history item', data.message);
      }
    } catch (error) {
      console.error('Delete history failed', error);
    }
  };

  const handleRenameHistoryItem = (index) => {
    const entry = history[index];
    if (!entry) return;
    const title = entry.initial_question || (entry.messages && entry.messages[0]?.question) || '';
    setRenameText(title);
    setSelectedHistoryIndex(index);
    setIsRenaming(true);
  };

  const handleSaveRenamedHistoryItem = async () => {
    if (selectedHistoryIndex === null) return;
    const entry = history[selectedHistoryIndex];
    if (!entry || !renameText.trim()) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const payload = {
        token,
        new_title: renameText.trim(),
      };
      if (entry.session_id) {
        payload.session_id = entry.session_id;
      } else if (entry.created_at) {
        payload.created_at = entry.created_at;
      }

      const response = await fetch(`${config.SERVER_URL}/chat-history/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setHistory((prev) => prev.map((item, idx) => {
          if (idx !== selectedHistoryIndex) return item;
          return {
            ...item,
            initial_question: renameText.trim(),
          };
        }));
        setIsRenaming(false);
        await loadChatHistory();
      } else {
        console.error('Failed to rename history item', data.message);
      }
    } catch (error) {
      console.error('Rename history failed', error);
    }
  };

  const handleContinueHistoryChat = (index) => {
    if (index === null || index === undefined) return;
    const selectedEntry = history[index];
    if (!selectedEntry) return;

    const messages = Array.isArray(selectedEntry.messages)
      ? selectedEntry.messages
      : [{ question: selectedEntry.message, response: selectedEntry.response, created_at: selectedEntry.created_at || new Date().toISOString() }];

    setQaPairs(messages.map((msg) => ({ question: msg.question, answer: msg.response })));
    setCurrentSessionId(selectedEntry.session_id || null);
    setSelectedHistoryIndex(index);
    setCurrentChatTitle(selectedEntry.initial_question || selectedEntry.messages?.[0]?.question || 'Chat');
    setShowHistory(false);
  };

  const saveChatHistory = async (message, responseText, sessionId = null) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;
      const response = await fetch(`${config.SERVER_URL}/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          message,
          response: responseText,
          session_id: sessionId,
        }),
      });
      const data = await response.json();
      if (response.ok && data.session_id) {
        setCurrentSessionId(data.session_id);
        return data.session_id;
      }
      return null;
    } catch (error) {
      console.error('Failed to save chat history', error);
      return null;
    }
  };

  const loadChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${config.SERVER_URL}/chat-history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.chat_history)) {
        setHistory(data.chat_history);
      }
    } catch (error) {
      console.error('Failed to load chat history', error);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleSendInput = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    setInputText('');

    const newQaPairs = [...qaPairs, { question: currentInput, answer: 'Generating...' }];
    setQaPairs(newQaPairs);

    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (!currentSessionId) {
        setCurrentChatTitle(currentInput);
      }
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: currentInput }),
      });
      const data = await response.json();
      console.log('Response from model:', data.answer);

      const updatedQaPairs = newQaPairs.map((qa, index) =>
        index === newQaPairs.length - 1 ? { ...qa, answer: data.answer } : qa
      );
      setQaPairs(updatedQaPairs);
      const savedSessionId = await saveChatHistory(currentInput, data.answer, currentSessionId);
      if (savedSessionId && !currentSessionId) {
        setCurrentSessionId(savedSessionId);
      }
      await loadChatHistory();

    } catch (error) {
      console.error('Error sending prompt to model:', error);
      const updatedQaPairs = newQaPairs.map((qa, index) =>
        index === newQaPairs.length - 1 ? { ...qa, answer: 'Error fetching answer' } : qa
      );
      setQaPairs(updatedQaPairs);
    }
  };

  const renderHistoryList = () => {
    if (history.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500">No chat history available yet.</Text>
        </View>
      );
    }

    return history.map((entry, index) => {
      const selected = index === selectedHistoryIndex;
      return (
        <View key={index} className={`w-11/12 my-2 mx-auto rounded-lg overflow-hidden border ${selected ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200 bg-white'}`}>
          <TouchableOpacity
            onPress={() => handleHistoryItemPress(index)}
            className={`p-4 ${selected ? 'bg-cyan-50' : 'bg-white'}`}
          >
            <Text className="text-gray-700 font-semibold">
              {entry.initial_question || (entry.messages && entry.messages[0]?.question) || entry.message || 'Chat'}
            </Text>
            <Text className="text-xs text-gray-400 mt-2">
              {entry.created_at || entry.messages?.[0]?.created_at ? new Date(entry.created_at || entry.messages?.[0]?.created_at).toLocaleString() : ''}
            </Text>
          </TouchableOpacity>
          {selected && isRenaming ? (
            <View className="p-4 bg-white border-t border-cyan-200">
              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                placeholder="Enter chat name"
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <View className="flex-row justify-end space-x-2 mt-3">
                <TouchableOpacity onPress={() => setIsRenaming(false)} className="px-3 py-2 rounded-full bg-gray-200">
                  <Text className="text-gray-700 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveRenamedHistoryItem} className="px-3 py-2 rounded-full bg-cyan-600">
                  <Text className="text-white text-sm">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <View className="flex-row justify-between p-2 bg-gray-50">
            <TouchableOpacity onPress={() => handleDeleteHistoryItem(index)} className="px-3 py-2 rounded-full bg-red-100">
              <Text className="text-red-600 text-sm">Delete</Text>
            </TouchableOpacity>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity onPress={() => handleRenameHistoryItem(index)} className="px-3 py-2 rounded-full bg-cyan-600">
                <Text className="text-white text-sm font-semibold">Rename</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleContinueHistoryChat(index)} className="px-3 py-2 rounded-full bg-cyan-800">
                <Text className="text-white text-sm font-semibold">Continue this chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-lg font-semibold text-black">
          {showHistory ? 'History' : 'Chat'}
        </Text>
        {showHistory ? (
          <TouchableOpacity onPress={handleToggleHistory} className="bg-gray-200 px-4 py-2 rounded-full">
            <Text className="text-black">Back to Chat</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={handleNewChat} className="bg-cyan-600 px-4 py-2 rounded-full">
              <Text className="text-white">New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleHistory} className="bg-gray-200 px-4 py-2 rounded-full">
              <Text className="text-black">History</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {!showHistory ? (
        <View className="px-4 py-2 bg-white border-b border-gray-200">
          <Text className="text-sm text-gray-500">{currentChatTitle || 'New Chat'}</Text>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}>
        {showHistory ? (
          <>
            {renderHistoryList()}
          </>
        ) : (
          qaPairs.map((qa, index) => (
            <View key={index} className="w-11/12 my-2 mx-auto">
              <View className="bg-transparent p-2 rounded">
                <Text className="text-gray-500 text-left">{qa.question}</Text>
              </View>
              <View className="bg-gray-200 p-2 mt-2 rounded">
                <Text className="text-gray-700 text-left">{qa.answer}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {!showHistory && (
        <View className="absolute bottom-0 w-full bg-white p-3 border-t border-gray-300 flex-row items-center shadow-md">
          <TouchableOpacity>
            <MaterialCommunityIcons name="chat-processing-outline" size={24} color="#00acc1" />
          </TouchableOpacity>
          <TextInput
            placeholder="Enter your prompt..."
            className="flex-1 ml-2 border-transparent"
            value={inputText}
            onChangeText={handleTextInputChange}
            onSubmitEditing={handleSendInput}
          />
          <TouchableOpacity onPress={handleSendInput}>
            <MaterialCommunityIcons name="send" size={24} color="#00acc1" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Prompt;
