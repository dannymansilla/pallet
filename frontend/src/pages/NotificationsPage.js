import React from 'react';
import { Box, Heading, Text, Container, SimpleGrid } from '@chakra-ui/react';

// Reuse the same notifications data or fetch from an API
const notificationsData = [
  {
    id: 1,
    subject: 'New Invoice Received',
    timestamp: '03/22/25 10:15',
    preview: 'Invoice #1234 from ACME Corp has been received.'
  },
  {
    id: 2,
    subject: 'Payment Reminder',
    timestamp: '03/21/25 09:00',
    preview: 'Please check the overdue payment for PO #5678.'
  },
  {
    id: 3,
    subject: 'Contract Signed',
    timestamp: '03/20/25 14:30',
    preview: 'Your new contract with XYZ Ltd. has been signed.'
  }
];

export default function NotificationsPage() {
  return (
    <Container maxW="container.lg" py={6} minH={"90vh"}>
      <Heading as="h1" size="lg" mb={6}>
        All Notifications
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
        {notificationsData.map((notification) => (
          <Box
            key={notification.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            shadow="sm"
          >
            <Text fontWeight="bold" mb={1}>
              {notification.subject}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={2}>
              {notification.timestamp}
            </Text>
            <Text>{notification.preview}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
