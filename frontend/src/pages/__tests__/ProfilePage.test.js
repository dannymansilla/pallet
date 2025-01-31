import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import ProfilePage from '../ProfilePage';
import axios from 'axios';

// Mock axios requests
jest.mock('axios');

describe('ProfilePage', () => {
  it('displays user profile data correctly', async () => {
    // Mock profile data
    axios.get.mockResolvedValueOnce({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        company: {
          company_name: 'Test Company',
          address: '123 Test St',
          phone: '123456789'
        }
      }
    });

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    // Check that the profile data is loaded correctly
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(await screen.findByText('testuser@example.com')).toBeInTheDocument();
    expect(await screen.findByText('Test Company')).toBeInTheDocument();
  });
});
