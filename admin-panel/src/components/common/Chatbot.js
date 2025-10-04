// admin-panel/src/components/common/Chatbot.js
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiSend, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import TanisiBot from '../../assets/Tanisi-Bot.jpg';

const ChatContainer = styled.div`
  width: 350px;
  background-color: #1e1e2d;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1001;
  transform: translateX(${({ isOpen }) => (isOpen ? '0%' : '100%')});
  transition: transform 0.3s ease-in-out;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Adjusted for close button */
  padding: 1rem;
  background-color: #2a2a3e;
  border-bottom: 1px solid #333;
  img { width: 40px; height: 40px; border-radius: 50%; margin-right: 1rem; }
  h4 { margin: 0; }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background-color: ${props => (props.isUser ? '#00bfa6' : '#2a2a3e')};
  align-self: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  margin-left: ${props => (props.isUser ? 'auto' : '0')};
  color: white;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #333;
  display: flex;
  background-color: #2a2a3e;
  textarea {
    flex-grow: 1; background: #1e1e2d; border: 1px solid #444;
    border-radius: 8px; padding: 0.75rem; color: white; resize: none;
    &:focus { outline: none; border-color: #00bfa6; }
    &:disabled { background-color: #333; cursor: not-allowed; }
  }
  button {
    background: #00bfa6; border: none; color: white; border-radius: 8px;
    padding: 0 1rem; margin-left: 0.5rem; cursor: pointer;
    &:disabled { background-color: #555; cursor: not-allowed; }
  }
`;

const Chatbot = ({ chatHistory, isReadOnly, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ChatContainer isOpen={isOpen}>
      <ChatHeader>
        <HeaderInfo>
            <img src={TanisiBot} alt="Tanisi AI Tutor" />
            <h4>AI Tutor</h4>
        </HeaderInfo>
        <CloseButton onClick={onClose}><FiX /></CloseButton>
      </ChatHeader>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageBubble key={index} isUser={msg.sender === 'user'}>
            <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <textarea
          placeholder={isReadOnly ? "Viewing chat history..." : "Ask me anything..."}
          rows="2"
          disabled={true}
        />
        <button disabled={true}>
          <FiSend />
        </button>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;