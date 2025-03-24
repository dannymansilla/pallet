import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { HiX } from "react-icons/hi";
import Lottie from "lottie-react";
import globeAnimation from "../assets/aiden_globe.json"; // Update path as needed

// 23 keyword entries
const QA_DICT = [
  {
    keywords: ["bid", "place bid"],
    answer: "To place a bid, navigate to your Auctions page and choose an item.",
  },
  {
    keywords: ["inventory", "upload inventory"],
    answer: "As a seller, you can upload inventory on your My Inventory page.",
  },
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    answer: "Hey there! How can I help you today?",
  },
  {
    keywords: ["payment method", "credit card", "paypal"],
    answer:
      "We accept various payment methods including credit cards and PayPal. Check your Account Settings for details.",
  },
  {
    keywords: ["shipping", "shipment", "delivery"],
    answer:
      "Shipping times vary by location. Typically, items ship within 2-3 business days.",
  },
  {
    keywords: ["refund", "return policy", "returns"],
    answer:
      "We offer a 14-day return policy on most items. Check the item page or contact support for more details.",
  },
  {
    keywords: ["fees", "transaction fee", "service charge"],
    answer:
      "We charge a small service fee for each completed transaction. See our Fees page for the full breakdown.",
  },
  {
    keywords: ["support", "help", "assist"],
    answer:
      "Our support team is here to help! Type your question or check our FAQ for common issues.",
  },
  {
    keywords: ["auction rules", "bidding rules", "rules"],
    answer:
      "You can find the auction rules on our 'How It Works' page, which covers minimum bids, increments, and more.",
  },
  {
    keywords: ["profile update", "change profile", "edit profile"],
    answer:
      "To update your profile, go to Account Settings, then click the 'Edit Profile' button.",
  },
  {
    keywords: ["password reset", "forgot password"],
    answer:
      "Click 'Forgot Password' on the login page, and we'll send you an email to reset your password.",
  },
  {
    keywords: ["notifications", "email alerts", "alerts"],
    answer:
      "Manage your notification settings in Account Settings under the Notifications tab.",
  },
  {
    keywords: ["seller fees", "listing fees"],
    answer:
      "Sellers pay a small listing fee and final value fee. See Seller Fees for details.",
  },
  {
    keywords: ["contact", "email", "phone number"],
    answer:
      "You can contact us via the Contact Us page or by emailing help@yourapp.com.",
  },
  {
    keywords: ["withdraw funds", "payout", "money"],
    answer:
      "To withdraw funds, go to your Wallet and click 'Request Payout'. We process payouts within 2-5 days.",
  },
  {
    keywords: ["recommended auctions", "hot items"],
    answer:
      "Check out our Trending Auctions section for items with the most views or bids!",
  },
  {
    keywords: ["watchlist", "watch list", "favorites"],
    answer:
      "You can add items to your watchlist by clicking the 'Add to Watchlist' button on any item page.",
  },
  {
    keywords: ["bulk upload", "import inventory"],
    answer:
      "For large catalogs, use our Bulk Upload tool under the Seller Dashboard.",
  },
  {
    keywords: ["cancel bid", "remove bid", "retract bid"],
    answer:
      "To cancel or retract a bid, please contact support. Bids are generally final unless there's an error.",
  },
  {
    keywords: ["end auction early", "close auction", "stop auction"],
    answer:
      "Sellers can end an auction early from the Seller Dashboard, but it may incur a fee for early closure.",
  },
  {
    keywords: ["reserve price", "minimum price"],
    answer:
      "A reserve price is a hidden minimum. If bidding doesn't reach it, the item won't sell.",
  },
  {
    keywords: ["live chat", "live assistance"],
    answer:
      "We offer live chat during business hours! Type your question here or schedule a call with our team.",
  },
  {
    keywords: ["goodbye", "bye", "thank you"],
    answer: "Thanks for chatting! Feel free to come back if you need anything else.",
  },
];

// Simple helper: partial match user input to dictionary answer
function findBotResponse(input) {
  const lowerInput = input.toLowerCase();
  for (let entry of QA_DICT) {
    for (let kw of entry.keywords) {
      if (lowerInput.includes(kw)) {
        return entry.answer;
      }
    }
  }
  return "I'm not sure how to answer that yet, but I'll learn over time!";
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");

  // Chakra color mode values
  const chatBg = useColorModeValue("white", "gray.800");
  const chatHeaderGradient = 'rgb(227, 97, 146)';
  const chatInputBg = useColorModeValue("gray.50", "gray.700");
  const chatBorderColor = useColorModeValue("gray.300", "gray.600");
  const userBubbleBg = useColorModeValue("blue.50", "blue.900");
  const botBubbleBg = useColorModeValue("gray.200", "gray.700");
  const userTextColor = useColorModeValue("black", "white");
  const botTextColor = useColorModeValue("black", "white");
  const inputContainerBg = useColorModeValue("gray.100", "gray.900"); // NEW


  // For auto-scroll
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Typewriter effect for bot messages
  const typeBotMessage = (fullText) => {
    let index = 0;
    const typingSpeed = 20; // ms per character

    // Temporary ID for typed message
    const msgId = Date.now();
    const emptyBotMsg = { id: msgId, role: "bot", text: "" };

    // Add empty bot message
    setMessages((prev) => [...prev, emptyBotMsg]);

    const typer = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.id === msgId) {
            const updated = { ...lastMsg, text: fullText.slice(0, index) };
            return [...prev.slice(0, prev.length - 1), updated];
          }
          return prev;
        });
      } else {
        clearInterval(typer);
      }
    }, typingSpeed);
  };

  // Send user message
  const sendMessage = () => {
    if (!inputVal.trim()) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: inputVal.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    // Bot response
    const botReply = findBotResponse(inputVal.trim());
    typeBotMessage(botReply);
  };

  // Toggle chat and show initial message if first open
  const toggleChat = () => {
    setIsOpen((prev) => {
      // If about to open (prev === false) and no messages yet, show welcome
      if (!prev && messages.length === 0) {
        typeBotMessage("Hello, I'm Aiden! How can I assist you today?");
      }
      return !prev;
    });
  };

  return (
    <Box position="fixed" bottom={8} right={16} zIndex={1000}>
      {!isOpen ? (
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
      ) : (
        <Box
          width="350px"
          height="520px"
          bg={chatBg}
          borderRadius="xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={chatBorderColor}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Header */}
          <Box
            bg={chatHeaderGradient}
            color="white"
            py={3}
            px={4}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderTopRadius="xl"
          >
            <Text fontWeight="bold" fontSize="lg">
              Aiden Chat
            </Text>
            <IconButton
              icon={<HiX />}
              variant="ghost"
              colorScheme="whiteAlpha"
              aria-label="Close Chat"
              onClick={toggleChat}
              _hover={{ bg: "whiteAlpha.300" }}
            />
          </Box>

          {/* Messages Area */}
          <VStack
            flex={1}
            p={3}
            spacing={3}
            overflowY="auto"
            align="stretch"
            bg={chatInputBg}
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <Box
                  key={msg.id}
                  alignSelf={isUser ? "flex-end" : "flex-start"}
                  bg={isUser ? userBubbleBg : botBubbleBg}
                  color={isUser ? userTextColor : botTextColor}
                  px={4}
                  py={2}
                  borderRadius="xl"
                  maxWidth="80%"
                  whiteSpace="pre-wrap"
                  boxShadow="md"
                  fontSize="sm"
                >
                  {msg.text}
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Input Box */}
          <HStack
            p={3}
            borderTop="1px solid"
            borderColor={chatBorderColor}
            bg={inputContainerBg} // Fixed to use top-level hook value
          >
            <Input
              placeholder="Type a message..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              variant="outline"
              _placeholder={{ color: "gray.500" }}
            />
            <Button colorScheme="blue" onClick={sendMessage}>
              Send
            </Button>
          </HStack>

        </Box>
      )}
    </Box>
  );
}
