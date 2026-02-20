import React from 'react';
import PitchAudit from './PitchAudit';

// Test component to verify PitchAudit functionality
const PitchAuditTest = () => {
    const mockProfile = {
        handle: 'testcreator',
        platform: 'Instagram',
        profileData: {
            fullName: 'Test Creator',
            followersCount: 50000,
            engagementRate: 4.2,
            categories: ['Fashion'],
            location: 'Mumbai, India',
            biography: 'Fashion enthusiast and lifestyle blogger sharing daily inspiration.',
            isVerified: true,
            website: 'https://testcreator.com',
            profilePictureUrl: 'https://via.placeholder.com/150'
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pitch & Audit Test</h1>
                <PitchAudit 
                    profiles={[mockProfile]} 
                    selectedProfile={mockProfile} 
                />
            </div>
        </div>
    );
};

export default PitchAuditTest;