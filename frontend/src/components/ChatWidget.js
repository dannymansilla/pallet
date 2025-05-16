import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { HiX } from "react-icons/hi";
import Lottie from "lottie-react";
import ReactMarkdown from "react-markdown";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import globeAnimation from "../assets/aiden_globe.json"; // Update path if needed
import { sendChatMessage } from "../services/api";

// Utility: format message timestamps as "6:30 PM"
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Loading indicator component
const LoadingIndicator = () => (
  <HStack spacing={2} align="center">
    <Spinner size="sm" color="blue.500" />
    <Text fontSize="sm" color="gray.500">
      Aiden is thinking...
    </Text>
  </HStack>
);

// Typing animation component
const TypingAnimation = () => (
  <HStack spacing={1} align="center">
    <Box
      w="2"
      h="2"
      bg="gray.400"
      borderRadius="full"
      animation="bounce 1s infinite"
    />
    <Box
      w="2"
      h="2"
      bg="gray.400"
      borderRadius="full"
      animation="bounce 1s infinite 0.2s"
    />
    <Box
      w="2"
      h="2"
      bg="gray.400"
      borderRadius="full"
      animation="bounce 1s infinite 0.4s"
    />
  </HStack>
);

// A small subcomponent to render each message bubble
function MessageBubble({
  message,
  userBubbleBg,
  userBubbleColor,
  botBubbleBg,
  botBubbleColor,
  closeChat // [ADDED] We receive closeChat here
}) {
  const isUser = message.role === "user";
  const navigate = useNavigate();

  // Custom link component for ReactMarkdown
  const CustomLink = ({ href, children }) => {
    // Check if it's an internal link (starts with '/')
    if (href.startsWith("/")) {
      return (
        <Link
          as={RouterLink}
          to={href}
          color="blue.500"
          textDecoration="underline"
          _hover={{ color: "blue.600" }}
          onClick={() => closeChat()} // [ADDED] Close chat on internal link click
        >
          {children}
        </Link>
      );
    }
    // External links open in new tab
    return (
      <Link
        href={href}
        color="blue.500"
        textDecoration="underline"
        isExternal
        _hover={{ color: "blue.600" }}
        onClick={() => closeChat()} // [ADDED] Close chat on external link click too
      >
        {children}
      </Link>
    );
  };

  // We'll align the chat bubble plus avatar: user on right, bot on left
  return (
    <Box alignSelf={isUser ? "flex-end" : "flex-start"} maxW="75%">
      <HStack spacing={3} justifyContent={isUser ? "flex-end" : "flex-start"} mb={1}>
        {/* Bot avatar on the left side, user avatar on the right side */}
        {!isUser && (
          <Box width="50px" height="50px" flexShrink={0}>
            <Lottie
              animationData={globeAnimation}
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        )}

        <Box
          bg={isUser ? userBubbleBg : botBubbleBg}
          color={isUser ? userBubbleColor : botBubbleColor}
          px={4}
          py={2}
          borderRadius="xl"
          boxShadow="md"
          whiteSpace="pre-wrap"
        >
          {isUser ? (
            message.text
          ) : (
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <Text as="h1" fontSize="xl" fontWeight="bold" mb={-1} {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <Text as="h2" fontSize="lg" fontWeight="bold" mb={-1} {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <Text as="h3" fontSize="md" fontWeight="bold" mb={-1} {...props} />
                ),
                p: ({ node, ...props }) => <Text as="p" mb={-1} {...props} />,
                ul: ({ node, ...props }) => <Box as="ul" pl={4} mb={-1} {...props} />,
                ol: ({ node, ...props }) => <Box as="ol" pl={4} mb={-1} {...props} />,
                li: ({ node, ...props }) => <Text as="li" mb={-1} {...props} />,
                strong: ({ node, ...props }) => (
                  <Text as="strong" fontWeight="bold" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <Text as="em" fontStyle="italic" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <Text
                    as="code"
                    bg="gray.100"
                    px={1}
                    py={0.5}
                    borderRadius="md"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => <CustomLink {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </Box>

        {isUser && (
          <Avatar name="You" bg="gray.400" color="white" size="md" />
        )}
      </HStack>

      {/* Subtle name + time below the bubble */}
      <HStack
        spacing={2}
        fontSize="xs"
        color="gray.500"
        justifyContent={isUser ? "flex-end" : "flex-start"}
      >
        <Text>{isUser ? "You" : "Aiden"}</Text>
        <Text>·</Text>
        <Text>{formatTime(message.time)}</Text>
      </HStack>
    </Box>
  );
}

export default function ChatWidget({ hideOnLanding = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Color / style setup
  const overlayBg = "rgba(0,0,0,0.15)";
  const panelBg = useColorModeValue("white", "gray.700");
  const panelRadius = "xl"; // more rounded
  const panelShadow = "2xl";
  const borderCol = useColorModeValue("gray.200", "gray.600");

  // Bubbles
  const userBubbleBg = useColorModeValue("blue.500", "blue.600");
  const userBubbleColor = "white"; // user text color
  const botBubbleBg = useColorModeValue("gray.100", "gray.600");
  const botBubbleColor = useColorModeValue("black", "white");

  // Chat history colors
  const historyItemBg = useColorModeValue("gray.100", "gray.600");
  const historyItemColor = useColorModeValue("black", "white");
  const historyItemHoverBg = useColorModeValue("gray.200", "gray.500");

  // Each conversation in history: { id, title, messages: [...] }
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Persil Auctions info",
      messages: [
        {
          id: 101,
          role: "user",
          text: "Hi Aiden, can you tell me about Persil auctions?",
          time: new Date(),
        },
        {
          id: 102,
          role: "bot",
          text: "Sure! Persil auctions start every Friday at 9am PST.",
          time: new Date(),
        },
      ],
    },
    {
      id: 2,
      title: "Listing a product",
      messages: [
        {
          id: 201,
          role: "user",
          text: "Hello, how do I list a new product?",
          time: new Date(),
        },
        {
          id: 202,
          role: "bot",
          text: "To list a product, click 'List Item' in your dashboard.",
          time: new Date(),
        },
      ],
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // If hideOnLanding is true, don't render anything
  if (hideOnLanding) {
    return null;
  }

  // [ADDED] This function closes the widget when called
  const closeChat = () => {
    setIsOpen(false);
  };

  // Enhanced typewriter effect for bot messages
  const typeBotMessage = (fullText) => {
    setIsTyping(true);
    let index = 0;
    const typingSpeed = 20; // ms per character
    const msgId = Date.now();
    const emptyBotMsg = {
      id: msgId,
      role: "bot",
      text: "",
      time: new Date(),
    };
    setMessages((prev) => [...prev, emptyBotMsg]);

    const typer = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.id === msgId) {
            const updated = {
              ...lastMsg,
              text: fullText.slice(0, index),
            };
            return [...prev.slice(0, prev.length - 1), updated];
          }
          return prev;
        });
      } else {
        clearInterval(typer);
        setIsTyping(false);
      }
    }, typingSpeed);
  };

  // Enhanced send message function
  const sendMessage = async () => {
    if (!inputVal.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: inputVal.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(inputVal.trim());
      if (response && response.reply) {
        typeBotMessage(response.reply);
      } else {
        typeBotMessage(
          "I'm sorry, I couldn't process your request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      typeBotMessage(
        "I'm sorry, there was an error processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If opening for the first time, greet
  const toggleChat = () => {
    setIsOpen((prev) => {
      if (!prev && messages.length === 0) {
        typeBotMessage("Hello, I'm Aiden! How can I assist you today?");
      }
      return !prev;
    });
  };

  // Start a new chat
  const startNewChat = () => {
    if (messages.length > 0) {
      // Name the chat from first user message or a fallback
      const firstUserMessage = messages.find((m) => m.role === "user");
      const chatTitle =
        firstUserMessage?.text?.slice(0, 20) ||
        "New Chat " + new Date().toLocaleTimeString();

      const newHistoryEntry = {
        id: Date.now(),
        title: chatTitle,
        messages: messages,
      };
      setChatHistory((prev) => [...prev, newHistoryEntry]);
    }

    // Clear current chat, show welcome
    setMessages([]);
    typeBotMessage("Hello, I'm Aiden! How can I assist you today?");
  };

  // Load an old conversation
  const loadChat = (historyItem) => {
    setMessages(historyItem.messages);
  };

  return (
    <Box position="fixed" bottom={8} right={16} zIndex={1000}>
      {/* Floating open-chat button if not open */}
      {!isOpen && (
        <IconButton
          aria-label="Open Chat"
          icon={
            <Lottie
              animationData={globeAnimation}
              loop
              style={{ width: "100%", height: "100%" }}
            />
          }
          onClick={toggleChat}
          bg="transparent"
          borderRadius="full"
          boxSize="70px"
          shadow="xl"
          _hover={{ transform: "scale(1.05)" }}
          transition="transform 0.2s"
        />
      )}

      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg={overlayBg}
          style={{ backdropFilter: "blur(6px)" }}
          zIndex={999999}
        >
          {/* Close button in top-right */}
          <IconButton
            icon={<HiX />}
            zIndex={999999}
            aria-label="Close Chat"
            onClick={toggleChat}
            position="absolute"
            top="1rem"
            right="1rem"
            size="lg"
            color="white"
            bg="black"
            _hover={{ bg: "rgba(0,0,0,0.7)" }}
          />

          {/* LEFT BOX: 25% width, tall column */}
          <Box
            position="absolute"
            top="2rem"
            bottom="2rem"
            left="2rem"
            width="25%"
            bg={panelBg}
            borderRadius={panelRadius}
            boxShadow={panelShadow}
            border="1px solid"
            borderColor={borderCol}
            p={4}
            overflowY="auto"
          >
            {/* "New Chat" */}
            <Button
              colorScheme="blue"
              variant="solid"
              bg="rgb(58, 144, 247)"
              mb={4}
              onClick={startNewChat}
              width="100%"
            >
              + New Chat
            </Button>

            {/* Chat History */}
            <Text fontSize="md" fontWeight="bold" mb={2} color="gray.500">
              Past Conversations
            </Text>
            <VStack align="stretch" spacing={2}>
              {chatHistory.map((item) => (
                <Box
                  key={item.id}
                  p={2}
                  borderRadius="md"
                  bg={historyItemBg}
                  color={historyItemColor}
                  cursor="pointer"
                  _hover={{
                    bg: historyItemHoverBg,
                  }}
                  onClick={() => loadChat(item)}
                >
                  {item.title}
                </Box>
              ))}
            </VStack>
          </Box>

          {/* SEARCH BOX at top */}
          <Box
            position="absolute"
            top="2rem"
            left="calc(25% + 3rem)"
            right="2rem"
            height="64px"
            bg={panelBg}
            borderRadius={panelRadius}
            boxShadow={panelShadow}
            border="1px solid"
            borderColor={borderCol}
            p={4}
            display="flex"
            alignItems="center"
          >
            <Input
              placeholder="Search..."
              minW="100%"
              variant="outline"
              _placeholder={{ color: "gray.400" }}
              borderRadius="full"
            />
          </Box>

          {/* MAIN CHAT BOX */}
          <Box
            position="absolute"
            top="calc(2rem + 64px + 1rem)"
            left="calc(25% + 3rem)"
            right="2rem"
            bottom="2rem"
            bg={panelBg}
            borderRadius={panelRadius}
            boxShadow={panelShadow}
            border="1px solid"
            borderColor={borderCol}
            p={4}
            display="flex"
            flexDirection="column"
          >
            {/* MESSAGES */}
            <VStack
              flex={1}
              spacing={4}
              overflowY="auto"
              align="stretch"
              mb={3}
              mt={2}
            >
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  userBubbleBg={userBubbleBg}
                  userBubbleColor={userBubbleColor}
                  botBubbleBg={botBubbleBg}
                  botBubbleColor={botBubbleColor}
                  closeChat={closeChat} // [ADDED] pass closeChat here
                />
              ))}
              {isLoading && (
                <Box alignSelf="flex-start" pl={4}>
                  <LoadingIndicator />
                </Box>
              )}
              {isTyping && (
                <Box alignSelf="flex-start" pl={4}>
                  <TypingAnimation />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </VStack>

            {/* INPUT at bottom */}
            <HStack spacing={2}>
              <Input
                placeholder="Type a message..."
                variant="outline"
                borderRadius="full"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    sendMessage();
                  }
                }}
                isDisabled={isLoading}
              />
              <Button
                colorScheme="blue"
                onClick={sendMessage}
                borderRadius="full"
                bg="rgb(58, 144, 247)"
                isLoading={isLoading}
                isDisabled={isLoading || !inputVal.trim()}
              >
                Send
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
