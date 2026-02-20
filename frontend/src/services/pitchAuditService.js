import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class PitchAuditService {
    async generateAudit(profileId, customData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/pitch-audit/generate-audit`, {
                profileId,
                customData
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Audit generation error:', error);
            throw error;
        }
    }

    async generatePitch(profileId, auditData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/pitch-audit/generate-pitch`, {
                profileId,
                auditData
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Pitch generation error:', error);
            throw error;
        }
    }

    async generateShareableLink(profileId, auditData, pitchData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/pitch-audit/generate-share-link`, {
                profileId,
                auditData,
                pitchData
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Share link generation error:', error);
            throw error;
        }
    }

    async downloadPDF(auditData, pitchData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/pitch-audit/generate-pdf`, {
                auditData,
                pitchData
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `creator-pitch-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('PDF download error:', error);
            throw error;
        }
    }

    async getSharedReport(shareId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/pitch-audit/shared/${shareId}`);
            return response.data;
        } catch (error) {
            console.error('Shared report fetch error:', error);
            throw error;
        }
    }

    // Local calculation methods for offline functionality
    calculateLocalAudit(profile, customData = {}) {
        const profileData = profile.profileData || {};
        
        // Calculate various scores
        const engagementScore = this.calculateEngagementScore(profileData);
        const authenticityScore = this.calculateAuthenticityScore(profileData);
        const audienceQualityScore = this.calculateAudienceQuality(profileData);
        const contentConsistencyScore = this.calculateContentConsistency(profileData);
        const brandFitScore = this.calculateBrandFit(profileData);
        const growthTrendScore = this.calculateGrowthTrend(profileData);

        // Calculate overall completion score
        const completionFactors = [
            profileData.followersCount ? 15 : 0,
            profileData.engagementRate ? 15 : 0,
            profileData.biography ? 10 : 0,
            profileData.categories?.length ? 10 : 0,
            profileData.location ? 10 : 0,
            profileData.recentPosts?.length >= 12 ? 15 : (profileData.recentPosts?.length || 0) * 1.25,
            profileData.audienceDemographics ? 15 : 0,
            profileData.website ? 5 : 0,
            profileData.isVerified ? 5 : 0
        ];

        const completionScore = Math.round(completionFactors.reduce((sum, score) => sum + score, 0));

        return {
            profile: {
                name: profileData.fullName || profile.handle,
                handle: profile.handle,
                platform: profile.platform,
                followers: profileData.followersCount || 0,
                following: profileData.followingCount || 0,
                posts: profileData.mediaCount || 0,
                engagementRate: profileData.engagementRate || 0,
                category: profileData.categories?.[0] || 'Lifestyle',
                location: profileData.location || 'Global',
                avgViews: profileData.avgViews30d || Math.round((profileData.followersCount || 0) * 0.1),
                avgReach: Math.round((profileData.followersCount || 0) * 0.3),
                collaborationType: customData.collaborationType || 'Paid Collaboration',
                isVerified: profileData.isVerified || false,
                website: profileData.website,
                biography: profileData.biography,
                country: customData.country || 'India',
                city: customData.city || 'Mumbai'
            },
            performanceMetrics: {
                engagementScore,
                authenticityScore,
                audienceQualityScore,
                contentConsistencyScore,
                brandFitScore,
                growthTrendScore,
                overallRating: Math.round((engagementScore + authenticityScore + audienceQualityScore + contentConsistencyScore + brandFitScore + growthTrendScore) / 6)
            },
            audienceDemographics: {
                ageGroups: profileData.audienceDemographics?.ageGroups || [
                    { name: '18-24', value: 35, color: '#8884d8', range: '18-24' },
                    { name: '25-34', value: 40, color: '#82ca9d', range: '25-34' },
                    { name: '35-44', value: 20, color: '#ffc658', range: '35-44' },
                    { name: '45+', value: 5, color: '#ff7c7c', range: '45+' }
                ],
                genderDistribution: [
                    { name: 'Female', value: profileData.audienceDemographics?.genderDistribution?.female || 65, color: '#ff69b4' },
                    { name: 'Male', value: profileData.audienceDemographics?.genderDistribution?.male || 35, color: '#4169e1' }
                ],
                topLocations: profileData.audienceDemographics?.topLocations || [
                    { country: 'India', percentage: 45 },
                    { country: 'United States', percentage: 20 },
                    { country: 'United Kingdom', percentage: 15 },
                    { country: 'Canada', percentage: 10 },
                    { country: 'Australia', percentage: 10 }
                ]
            },
            contentAnalysis: {
                topPerformingTypes: this.getTopPerformingContentTypes(profileData),
                bestPostingTimes: this.getBestPostingTimes(profileData),
                contentThemes: this.getContentThemes(profileData),
                growthTrend: this.generateGrowthTrendData(profileData)
            },
            pitchInsights: {
                suggestedPrice: this.calculateSuggestedPrice(profileData),
                recommendedBrands: this.getRecommendedBrands(profileData),
                estimatedROI: this.calculateEstimatedROI(profileData),
                topPerformingPostType: this.getTopPerformingPostType(profileData),
                bestPostingTime: this.getBestPostingTime(profileData)
            },
            completionScore,
            recommendations: this.generateRecommendations(profileData, completionScore)
        };
    }

    calculateEngagementScore(profileData) {
        const engagementRate = profileData.engagementRate || 0;
        if (engagementRate >= 6) return 95;
        if (engagementRate >= 4) return 85;
        if (engagementRate >= 2) return 75;
        if (engagementRate >= 1) return 65;
        return 45;
    }

    calculateAuthenticityScore(profileData) {
        let score = 70;
        if (profileData.isVerified) score += 15;
        if (profileData.healthScore > 80) score += 10;
        if (profileData.followerGrowth && profileData.followerGrowth > 0) score += 5;
        return Math.min(score, 100);
    }

    calculateAudienceQuality(profileData) {
        let score = 60;
        if (profileData.audienceDemographics?.topLocations?.some(loc => loc.country === 'India')) score += 20;
        if (profileData.engagementRate > 3) score += 15;
        if (profileData.followersCount > 10000) score += 5;
        return Math.min(score, 100);
    }

    calculateContentConsistency(profileData) {
        const postingFrequency = profileData.postingHabits?.frequency || 'low';
        const consistency = profileData.postingHabits?.consistency || 'low';

        let score = 50;
        if (postingFrequency === 'high') score += 25;
        else if (postingFrequency === 'medium') score += 15;

        if (consistency === 'high') score += 25;
        else if (consistency === 'medium') score += 15;

        return Math.min(score, 100);
    }

    calculateBrandFit(profileData) {
        let score = 70;
        if (profileData.categories?.length > 1) score += 10;
        if (profileData.biography && profileData.biography.length > 50) score += 10;
        if (profileData.website) score += 10;
        return Math.min(score, 100);
    }

    calculateGrowthTrend(profileData) {
        const followerGrowth = profileData.followerGrowth || 0;
        if (followerGrowth > 10) return 90;
        if (followerGrowth > 5) return 80;
        if (followerGrowth > 0) return 70;
        return 50;
    }

    getTopPerformingContentTypes(profileData) {
        return profileData.contentTypes || [
            { name: 'Reels', value: 45, engagement: 'High', color: '#8884d8' },
            { name: 'Carousel', value: 30, engagement: 'Medium', color: '#82ca9d' },
            { name: 'Single Post', value: 25, engagement: 'Medium', color: '#ffc658' }
        ];
    }

    getBestPostingTimes(profileData) {
        return profileData.postingHabits?.bestTimes || ['6:00 PM - 8:00 PM', '12:00 PM - 2:00 PM', '8:00 AM - 10:00 AM'];
    }

    getContentThemes(profileData) {
        const categories = profileData.categories || ['Lifestyle'];
        return categories.map(cat => ({
            theme: cat,
            frequency: 'High',
            performance: 'Good'
        }));
    }

    generateGrowthTrendData(profileData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const baseFollowers = (profileData.followersCount || 10000) * 0.7;

        return months.map((month, index) => ({
            month,
            followers: Math.round(baseFollowers + (index * (profileData.followersCount || 10000) * 0.05)),
            engagement: Math.round((profileData.engagementRate || 3) + (Math.random() - 0.5) * 0.5 * 100) / 100
        }));
    }

    calculateSuggestedPrice(profileData) {
        const followers = profileData.followersCount || 0;
        const engagementRate = profileData.engagementRate || 0;
        const basePrice = (followers / 1000) * 10;
        const engagementMultiplier = Math.max(engagementRate / 2, 1);

        return {
            post: Math.round(basePrice * engagementMultiplier),
            story: Math.round(basePrice * engagementMultiplier * 0.5),
            reel: Math.round(basePrice * engagementMultiplier * 1.5)
        };
    }

    getRecommendedBrands(profileData) {
        const category = profileData.categories?.[0] || 'Lifestyle';
        const brandMap = {
            'Fashion': ['Zara', 'H&M', 'Nike', 'Adidas'],
            'Beauty': ['Nykaa', 'Lakme', 'Maybelline', 'L\'Oreal'],
            'Tech': ['Samsung', 'OnePlus', 'Xiaomi', 'Apple'],
            'Fitness': ['Nike', 'Adidas', 'Puma', 'Reebok'],
            'Food': ['Zomato', 'Swiggy', 'McDonald\'s', 'KFC'],
            'Travel': ['MakeMyTrip', 'Goibibo', 'OYO', 'Airbnb'],
            'Lifestyle': ['Amazon', 'Flipkart', 'Myntra', 'Ajio']
        };

        return brandMap[category] || brandMap['Lifestyle'];
    }

    calculateEstimatedROI(profileData) {
        const engagementRate = profileData.engagementRate || 0;
        const followers = profileData.followersCount || 0;

        const estimatedReach = followers * 0.3;
        const estimatedEngagement = estimatedReach * (engagementRate / 100);
        const costPerEngagement = 0.5;

        return {
            estimatedReach: Math.round(estimatedReach),
            estimatedEngagement: Math.round(estimatedEngagement),
            estimatedValue: Math.round(estimatedEngagement * costPerEngagement)
        };
    }

    getTopPerformingPostType(profileData) {
        const contentTypes = this.getTopPerformingContentTypes(profileData);
        return contentTypes.reduce((prev, current) =>
            (prev.value > current.value) ? prev : current
        ).name;
    }

    getBestPostingTime(profileData) {
        const times = this.getBestPostingTimes(profileData);
        return times[0] || '6:00 PM - 8:00 PM';
    }

    generateRecommendations(profileData, completionScore) {
        const recommendations = [];

        if (completionScore < 80) {
            recommendations.push('Complete your profile information to increase credibility');
        }
        if (!profileData.isVerified) {
            recommendations.push('Get your account verified to build trust with brands');
        }
        if ((profileData.engagementRate || 0) < 3) {
            recommendations.push('Focus on creating more engaging content to improve engagement rate');
        }
        if (!profileData.website) {
            recommendations.push('Add a professional website or portfolio link');
        }
        if ((profileData.recentPosts?.length || 0) < 12) {
            recommendations.push('Maintain consistent posting schedule with at least 12 recent posts');
        }

        return recommendations;
    }

    generateAITips(profileData, engagementScore, contentScore) {
        const tips = [];

        if (engagementScore < 70) {
            tips.push({
                type: 'engagement',
                message: 'Post more Reels — they get 3.2x engagement in your niche',
                impact: 'High',
                color: 'text-blue-600 bg-blue-50'
            });
        }

        if (contentScore < 80) {
            tips.push({
                type: 'consistency',
                message: 'Maintain posting 4-5 times per week for better algorithm performance',
                impact: 'Medium',
                color: 'text-green-600 bg-green-50'
            });
        }

        if (!profileData.isVerified) {
            tips.push({
                type: 'credibility',
                message: 'Get verified to increase brand trust by 40%',
                impact: 'High',
                color: 'text-purple-600 bg-purple-50'
            });
        }

        if ((profileData.followersCount || 0) > 10000 && (profileData.engagementRate || 0) > 3) {
            tips.push({
                type: 'monetization',
                message: 'You\'re ready for premium brand partnerships — aim for ₹500+ per post',
                impact: 'High',
                color: 'text-yellow-600 bg-yellow-50'
            });
        }

        return tips;
    }
}

export default new PitchAuditService();