import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BusinessCard from '@/components/BusinessCard';
import type { Business } from '@/lib/types';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: () => [vi.fn(), true],
}));

const mockBusiness: Business = {
  id: '1',
  name: 'Test Spa',
  description: 'A relaxing spa experience',
  address: '123 Main St, City',
  phone: '555-1234',
  rating: 4.5,
  reviewCount: 10,
  category: 'Spa & Wellness',
  businessType: 'SPA_WELLNESS',
};

const renderBusinessCard = (business = mockBusiness, lowestPrice?: number) => {
  return render(
    <BrowserRouter>
      <BusinessCard business={business} lowestPrice={lowestPrice} />
    </BrowserRouter>
  );
};

describe('BusinessCard', () => {
  it('renders business name', () => {
    renderBusinessCard();
    expect(screen.getByText('Test Spa')).toBeInTheDocument();
  });

  it('renders business address', () => {
    renderBusinessCard();
    expect(screen.getByText('123 Main St, City')).toBeInTheDocument();
  });

  it('renders business description', () => {
    renderBusinessCard();
    expect(screen.getByText('A relaxing spa experience')).toBeInTheDocument();
  });

  it('renders business rating', () => {
    renderBusinessCard();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    renderBusinessCard();
    expect(screen.getByText('Spa & Wellness')).toBeInTheDocument();
  });

  it('renders lowest price when provided', () => {
    renderBusinessCard(mockBusiness, 49.99);
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('Starting from')).toBeInTheDocument();
  });

  it('does not render price section when no price provided', () => {
    renderBusinessCard(mockBusiness);
    expect(screen.queryByText('Starting from')).not.toBeInTheDocument();
  });

  it('links to business detail page', () => {
    renderBusinessCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/business/1');
  });

  it('does not render rating when not provided', () => {
    const businessWithoutRating = { ...mockBusiness, rating: undefined };
    renderBusinessCard(businessWithoutRating);
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });
});
