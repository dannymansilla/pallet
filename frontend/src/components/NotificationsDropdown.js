import React from 'react';
import {
  Box,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';

// Helper function to format dates in "MM/dd/yy HH:mm"
const formatTimestamp = (date) => {
  if (!(date instanceof Date)) return '';

  const padZero = (num) => (num < 10 ? `0${num}` : num);

  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const year = String(date.getFullYear()).slice(-2); // last two digits
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

// Sample notifications data (you can fetch from API or context instead)
const notificationsData = [
  {
    id: 1,
    subject: 'New Invoice Received',
    timestamp: new Date('2025-03-22T10:15:00'),
    preview: 'Invoice #1234 from ACME Corp has been received.'
  },
  {
    id: 2,
    subject: 'Payment Reminder',
    timestamp: new Date('2025-03-21T09:00:00'),
    preview: 'Please check the overdue payment for PO #5678.'
  },
  {
    id: 3,
    subject: 'Contract Signed',
    timestamp: new Date('2025-03-20T14:30:00'),
    preview: 'Your new contract with XYZ Ltd. has been signed.'
  }
];

export default function NotificationsDropdown() {
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      {/* Notification Icon (bell) in the header */}
      <MenuButton
        as={IconButton}
        icon={<BellIcon />}
        variant="ghost"
        aria-label="Notifications"
        _hover={{ bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
      />

      {/* Dropdown List */}
      <MenuList minWidth="320px" p={0}>
        {/* Header of the dropdown */}
        <Box
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor="gray.200"
          bg="gray.50"
        >
          <Text fontSize="md" fontWeight="bold">
            Notifications
          </Text>
        </Box>

        {/* Display each notification */}
        {notificationsData.map((notification) => (
          <Box
            key={notification.id}
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Text fontWeight="semibold">
              {notification.subject}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {formatTimestamp(notification.timestamp)}
            </Text>
            <Text mt={1}>{notification.preview}</Text>
          </Box>
        ))}

        {/* 'See All' button at the bottom */}
        <Box textAlign="center" px={4} py={2}>
          {/* This Button should link to the full notifications page */}
          <Button
            as="a"
            variant="link"
            colorScheme="blue"
            href="/notifications" // This will work with client-side routing if using react-router
          >
            See All
          </Button>
        </Box>
      </MenuList>
    </Menu>
  );
}
