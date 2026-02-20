import React from 'react';
import BrandMatches from './BrandMatches';

// Demo data for testing the BrandMatches component
const mockProfiles = [
  {
    id: 1,
    platform: 'Instagram',
    profileData: {
      followersCount: 50000,
      engagementRate: 3.5,
      categories: ['fashion', 'lifestyle'],
      username: 'fashionista_demo'
    }
  }
];

const mockDashboardData = {
  totalApplications: 15,
  approvedApplications: 8,
  pendingApplications: 5,
  rejectedApplications: 2
};

const BrandMatchesDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Brand Matches Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive brand collaboration platform for creators
          </p>
        </div>
        
        <BrandMatches 
          profiles={mockProfiles}
          selectedProfile={mockProfiles[0]}
          dashboardData={mockDashboardData}
        />
      </div>
    </div>
  );
};

export default BrandMatchesDemo;