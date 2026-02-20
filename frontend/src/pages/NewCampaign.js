import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
  Plus,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
  Focus,
  Maximize2,
  Zap,
  Trash2,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import CampaignEstimation from '../components/CampaignEstimation';
import MatchingResults from '../components/MatchingResults';
import SampleMatchSelector from '../components/SampleMatchSelector';
import CampaignTermsModal from '../components/CampaignTermsModal';

// All countries list
const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
  'Anguilla', 'Montserrat', 'Sint Maarten', 'Cayman Islands', 'Bermuda', 'Belize', 'Guam', 'Puerto Rico', 'Virgin Islands'
];

// All languages list
const ALL_LANGUAGES = [
  'English', 'Spanish', 'Portuguese', 'French', 'Haitian Creole', 'Dutch', 'Irish', 'German', 'Luxembourgish', 'Italian',
  'Latin', 'Norwegian', 'Icelandic', 'Danish', 'Finnish', 'Swedish', 'Greek', 'Croatian', 'Slovenian',
  'Maltese', 'Catalan', 'Belarusian', 'Russian', 'Ukrainian', 'Polish', 'Czech', 'Slovak', 'Hungarian', 'Romanian',
  'Bulgarian', 'Lithuanian', 'Latvian', 'Estonian', 'Serbian', 'Bosnian', 'Macedonian', 'Armenian', 'Azerbaijani', 'Tajik',
  'Kazakh', 'Kyrgyz', 'Uzbek', 'Turkmen', 'Georgian', 'Urdu', 'Bengali', 'Nepali', 'Sinhala', 'Tamil',
  'Dzongkha', 'Divehi', 'Pashto', 'Burmese', 'Thai', 'Vietnamese', 'Malay', 'Chinese', 'Indonesian', 'Filipino',
  'Khmer', 'Lao', 'Japanese', 'Korean', 'Mongolian', 'Fijian', 'Bislama', 'Samoan', 'Gilbertese', 'Tongan',
  'Marshallese', 'Palauan', 'Nauruan', 'Tuvaluan', 'Rarotongan', 'Niuean', 'Arabic', 'Hebrew', 'Persian', 'Turkish',
  'Kurdish', 'Swahili', 'Amharic', 'Tigrinya', 'Somali', 'Afrikaans', 'Zulu', 'Xhosa', 'Setswana', 'Sesotho',
  'Hindi', 'Punjabi', 'Gujarati', 'Marathi', 'Telugu', 'Kannada', 'Malayalam', 'Odia'
];

// Country to languages mapping
const COUNTRY_LANGUAGES = {
  'United States': ['English', 'Spanish'],
  'United Kingdom': ['English'],
  'Canada': ['English', 'French'],
  'Australia': ['English'],
  'Germany': ['German'],
  'France': ['French'],
  'India': ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'],
  'Japan': ['Japanese'],
  'Brazil': ['Portuguese'],
  'Mexico': ['Spanish'],
  'Spain': ['Spanish', 'Catalan'],
  'Italy': ['Italian'],
  'Netherlands': ['Dutch'],
  'Singapore': ['English', 'Malay', 'Chinese', 'Tamil'],
  'United Arab Emirates': ['Arabic', 'English'],
  'China': ['Chinese'],
  'South Korea': ['Korean'],
  'Russia': ['Russian'],
  'Indonesia': ['Indonesian'],
  'Thailand': ['Thai'],
  'Vietnam': ['Vietnamese'],
  'Philippines': ['Filipino', 'English'],
  'Malaysia': ['Malay', 'English', 'Chinese', 'Tamil'],
  'Saudi Arabia': ['Arabic'],
  'Turkey': ['Turkish'],
  'Poland': ['Polish'],
  'Sweden': ['Swedish'],
  'Norway': ['Norwegian'],
  'Denmark': ['Danish'],
  'Finland': ['Finnish', 'Swedish'],
  'Portugal': ['Portuguese'],
  'Argentina': ['Spanish'],
  'Colombia': ['Spanish'],
  'Chile': ['Spanish'],
  'Peru': ['Spanish'],
  'Venezuela': ['Spanish'],
  'Egypt': ['Arabic'],
  'South Africa': ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
  'Nigeria': ['English'],
  'Kenya': ['English', 'Swahili'],
  'Pakistan': ['Urdu', 'English', 'Punjabi'],
  'Bangladesh': ['Bengali'],
  'Sri Lanka': ['Sinhala', 'Tamil', 'English'],
  'Nepal': ['Nepali'],
  'Ukraine': ['Ukrainian', 'Russian'],
  'Greece': ['Greek'],
  'Czech Republic': ['Czech'],
  'Hungary': ['Hungarian'],
  'Romania': ['Romanian'],
  'Austria': ['German'],
  'Switzerland': ['German', 'French', 'Italian'],
  'Belgium': ['Dutch', 'French', 'German'],
  'Ireland': ['English', 'Irish'],
  'New Zealand': ['English', 'Maori'],
  'Israel': ['Hebrew', 'Arabic', 'English'],
  'Taiwan': ['Chinese'],
  'Hong Kong': ['Chinese', 'English'],
};

// Placement options grouped by platform
const PLACEMENT_OPTIONS = [
  // YouTube
  { id: 'youtube_dedicated', label: 'YouTube dedicated videos', platform: 'YouTube' },
  { id: 'youtube_integrated', label: 'YouTube integrated videos', platform: 'YouTube' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', platform: 'YouTube' },
  { id: 'youtube_livestream', label: 'YouTube livestream', platform: 'YouTube' },
  // Instagram
  { id: 'instagram_reels', label: 'Instagram Reels', platform: 'Instagram' },
  { id: 'instagram_story', label: 'Instagram Story', platform: 'Instagram' },
  { id: 'instagram_post', label: 'Instagram Post', platform: 'Instagram' },
  { id: 'instagram_carousel', label: 'Instagram carousel posts', platform: 'Instagram' },
  { id: 'instagram_live', label: 'Instagram Live', platform: 'Instagram' },
];

const NewCampaign = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Current step and substep state
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState('basic-information');

  // URL input state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState([]);

  // Collapsible sections state
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);

  // Campaign data state
  const [campaignData, setCampaignData] = useState({
    campaignName: '',
    businessLogo: null,
    businessName: '',
    productServiceType: 'ecommerce',
    benchmarkBrands: [],
    productDelivery: 'ship',
    productName: '',
    productPhoto: null,
    productRetailPrice: '',
    businessIntroduction: '',
    brandHighlights: '',
    coreSellingPoints: [],
    coreProductAudiences: [],
    additionalInfo: '',
    previousMatches: [],
    budget: '',
    analysis: '',
  });

  // Matching state
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [similarCreators, setSimilarCreators] = useState([]); // NEW: Similar creators after brand selects references
  const [platformBreakdown, setPlatformBreakdown] = useState({});
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingSimilarCreators, setIsLoadingSimilarCreators] = useState(false); // NEW: Loading state for similar creators
  const [campaignEstimation, setCampaignEstimation] = useState(null);
  const [selectedReferenceCreators, setSelectedReferenceCreators] = useState([]);
  const [showSampleSelector, setShowSampleSelector] = useState(true);
  const [draftCampaignId, setDraftCampaignId] = useState(null); // NEW: Store draft campaign ID
  const [autoInviteStorageComplete, setAutoInviteStorageComplete] = useState(false); // NEW: Track if storage is complete

  // Terms and conditions state
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState({
    matchingAccuracy: 'scale', // focus, scale, max_scale
    placements: ['youtube_dedicated', 'youtube_integrated', 'instagram_reels', 'instagram_carousel'],
    locations: [],
    languages: [],
    postDateType: 'flexible', // flexible, fixed
    fixedPostStartDate: '',
    fixedPostEndDate: '',
    productLink: '',
    campaignBrief: '',
    desiredInfluencerProfiles: [],
    // Advanced settings
    referenceInfluencers: [],
    blocklist: [],
    brandAssets: '',
    productExplainerVideo: '',
    autoApproveSubmissions: false,
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(true);
  const [showPlacementsDropdown, setShowPlacementsDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [referenceInfluencersFile, setReferenceInfluencersFile] = useState(null);
  const [blocklistFile, setBlocklistFile] = useState(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPlacementsDropdown && !event.target.closest('.placements-dropdown-container')) {
        setShowPlacementsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlacementsDropdown]);

  // Sidebar navigation structure
  const sidebarSteps = [
    {
      id: 1,
      title: 'Set up campaign',
      subSteps: [
        { id: 'basic-information', title: 'Basic Information' },
        { id: 'settings', title: 'Settings' },
        { id: 'preview-sample-matches', title: 'Preview sample matches' },
        { id: 'similar-creators', title: 'Similar creators' }, // NEW: Similar creators step
      ],
    },
    {
      id: 2,
      title: 'Budget and results',
      subSteps: [],
    },
  ];

  // Handle edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    const campaignId = urlParams.get('id');

    if (mode === 'edit' && campaignId) {
      const editingCampaign = localStorage.getItem('editingCampaign');
      if (editingCampaign) {
        try {
          const campaign = JSON.parse(editingCampaign);
          console.log('Loading campaign for editing:', campaign);

          // Parse description to extract parts
          const descriptionParts = campaign.description?.split('\n\n') || [];
          const businessIntroduction = descriptionParts[0] || '';
          const brandHighlights = descriptionParts[1] || '';
          const coreSellingPointsText = descriptionParts[2] || '';
          const coreSellingPoints = coreSellingPointsText.includes('Key Points:')
            ? coreSellingPointsText.replace('Key Points:', '').split(',').map(p => p.trim()).filter(Boolean)
            : [];

          // Map platforms to placements
          const placements = [];
          if (campaign.platforms?.includes('instagram')) {
            placements.push('instagram_reels', 'instagram_carousel');
          }
          if (campaign.platforms?.includes('youtube')) {
            placements.push('youtube_dedicated', 'youtube_integrated');
          }

          setCampaignData({
            campaignName: campaign.title || '',
            businessLogo: campaign.brandId?.logoUrl || null,
            businessName: campaign.brandId?.name || '',
            productServiceType: campaign.brandId?.industry || 'ecommerce',
            benchmarkBrands: campaign.tags || [],
            productDelivery: 'no_ship',
            productName: '',
            productPhoto: null,
            productRetailPrice: '',
            businessIntroduction: businessIntroduction,
            brandHighlights: brandHighlights,
            coreSellingPoints: coreSellingPoints,
            coreProductAudiences: [],
            additionalInfo: '',
            previousMatches: [],
            budget: campaign.budget?.toString() || '',
            analysis: '',
          });

          setSettingsData(prev => ({
            ...prev,
            placements: placements.length > 0 ? placements : prev.placements,
            locations: campaign.targetAudience?.locations || [],
            languages: campaign.targetAudience?.languages || [],
          }));

          setHasGenerated(true);
          localStorage.removeItem('editingCampaign');
        } catch (error) {
          console.error('Error loading campaign for editing:', error);
          toast.error('Error loading campaign for editing');
        }
      }
    }
  }, [location.search]);

  // Handle navigation
  const handleStepChange = (stepId, subStepId = null) => {
    if (stepId === 1) {
      setCurrentStep(1);
      // If no substep specified, default to the first substep
      setCurrentSubStep(subStepId || 'basic-information');
    } else if (stepId === 2) {
      setCurrentStep(2);
      setCurrentSubStep('budget-analysis');
    }
  };

  // Analyze website URL with AI
  const analyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSteps([
      { id: 1, text: 'Searching online to gauge information about your product...', status: 'active' },
    ]);

    try {
      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.id === 1
            ? {
              ...s,
              status: 'completed',
              details: [
                `Browsing product website: https://${websiteUrl.replace(/^https?:\/\//, '')}`,
                `Googling the product: https://www.google.com/search?q=site:${websiteUrl.replace(/^https?:\/\//, '')}`,
              ],
            }
            : s
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAnalysisSteps((prev) => [
        ...prev,
        { id: 2, text: 'Summarizing and optimizing key messages for your product', status: 'active' },
      ]);

      const response = await axios.post('/api/gemini/analyze-website', {
        websiteUrl: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
      });

      if (response.data.success) {
        const data = response.data.data;

        setAnalysisSteps((prev) =>
          prev.map((s) =>
            s.id === 2
              ? {
                ...s,
                status: 'completed',
                details: ['Summarizing key messages based on the retrieved search results', 'Generating key message'],
              }
              : s
          )
        );

        setCampaignData((prev) => ({
          ...prev,
          // businessLogo is not auto-filled - user will upload it manually
          businessName: data.businessName || prev.businessName,
          productServiceType: data.productServiceType || prev.productServiceType,
          businessIntroduction: data.businessIntroduction || prev.businessIntroduction,
          brandHighlights: data.brandHighlights || prev.brandHighlights,
          benchmarkBrands: data.benchmarkBrands || prev.benchmarkBrands,
          coreSellingPoints: data.coreSellingPoints || prev.coreSellingPoints,
          coreProductAudiences: data.coreProductAudiences || prev.coreProductAudiences,
          productDelivery: data.productDelivery || prev.productDelivery,
          // productRetailPrice is not auto-filled - user will enter it manually
        }));

        setHasGenerated(true);
        setIsAnalysisExpanded(false);
        toast.success('✅ Campaign data generated successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to analyze website');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      toast.error(`Failed to analyze website: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file upload for business logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setCampaignData((prev) => ({ ...prev, businessLogo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add/remove benchmark brands
  const addBenchmarkBrand = (brand) => {
    if (brand.trim() && !campaignData.benchmarkBrands.includes(brand.trim())) {
      setCampaignData((prev) => ({
        ...prev,
        benchmarkBrands: [...prev.benchmarkBrands, brand.trim()],
      }));
    }
  };

  const removeBenchmarkBrand = (index) => {
    setCampaignData((prev) => ({
      ...prev,
      benchmarkBrands: prev.benchmarkBrands.filter((_, i) => i !== index),
    }));
  };

  // Add/remove core selling points
  const addCoreSellingPoint = (point) => {
    if (point.trim()) {
      setCampaignData((prev) => ({
        ...prev,
        coreSellingPoints: [...prev.coreSellingPoints, point.trim()],
      }));
    }
  };

  const removeCoreSellingPoint = (index) => {
    setCampaignData((prev) => ({
      ...prev,
      coreSellingPoints: prev.coreSellingPoints.filter((_, i) => i !== index),
    }));
  };

  // Add/remove core product audiences
  const addCoreAudience = (segment, description) => {
    if (segment.trim() && description.trim()) {
      setCampaignData((prev) => ({
        ...prev,
        coreProductAudiences: [...prev.coreProductAudiences, { segment: segment.trim(), description: description.trim() }],
      }));
    }
  };

  const removeCoreAudience = (index) => {
    setCampaignData((prev) => ({
      ...prev,
      coreProductAudiences: prev.coreProductAudiences.filter((_, i) => i !== index),
    }));
  };

  // Save draft
  const saveDraft = async () => {
    try {
      // Validate minimum required fields
      if (!campaignData.campaignName?.trim()) {
        toast.error('Campaign name is required to save draft');
        return;
      }

      toast.loading('Saving draft...');

      // Check if we're in edit mode
      const urlParams = new URLSearchParams(location.search);
      const mode = urlParams.get('mode');
      const campaignId = urlParams.get('id');
      const isEditMode = mode === 'edit' && campaignId;

      // Map placements to platforms
      const platforms = [];
      if (settingsData.placements.some(p => p.includes('instagram'))) {
        platforms.push('instagram');
      }
      if (settingsData.placements.some(p => p.includes('youtube'))) {
        platforms.push('youtube');
      }

      // If no platforms selected, default to both
      if (platforms.length === 0) {
        platforms.push('instagram', 'youtube');
      }

      const campaignPayload = {
        title: campaignData.campaignName || 'Draft Campaign',
        description: [
          campaignData.businessIntroduction,
          campaignData.brandHighlights,
          campaignData.coreSellingPoints?.length > 0 ? `Key Points: ${campaignData.coreSellingPoints.join(', ')}` : '',
        ].filter(Boolean).join('\n\n'),
        budget: parseInt(campaignData.budget) || 10000,
        platforms: platforms,
        targetAudience: {
          minFollowers: 1000,
          locations: settingsData.locations,
          languages: settingsData.languages,
        },
        status: 'draft',
        tags: campaignData.benchmarkBrands || [],
        extendedDetails: {
          ...campaignData,
          website: websiteUrl
        }
      };

      // Create or update campaign as draft
      const response = isEditMode
        ? await axios.put(`/api/campaigns/${campaignId}`, campaignPayload)
        : draftCampaignId
          ? await axios.put(`/api/campaigns/${draftCampaignId}`, campaignPayload)
          : await axios.post('/api/campaigns', campaignPayload);

      if (response.data.success && !draftCampaignId && !isEditMode) {
        setDraftCampaignId(response.data.campaign._id);
      }

      toast.dismiss();

      if (response.data.success) {
        toast.success('Draft saved successfully!');
        // Navigate back to campaigns list after a short delay
        setTimeout(() => {
          navigate('/brand/campaigns');
        }, 1000);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Failed to save draft:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || 'Failed to save draft';
      toast.error(errorMessage);
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 1 && currentSubStep === 'basic-information') {
      // Validate mandatory fields in basic information
      const errors = [];

      if (!campaignData.campaignName?.trim()) {
        errors.push('Campaign name is required');
      }
      if (!campaignData.businessName?.trim()) {
        errors.push('Business name is required');
      }
      if (!campaignData.productServiceType) {
        errors.push('Product/Service type is required');
      }
      if (campaignData.benchmarkBrands.length === 0) {
        errors.push('At least one benchmark brand is required');
      }
      if (campaignData.productDelivery === 'ship') {
        if (!campaignData.productName?.trim()) {
          errors.push('Product name is required when shipping products');
        }
        if (!campaignData.productPhoto) {
          errors.push('Product photo is required when shipping products');
        }
        if (!campaignData.productRetailPrice) {
          errors.push('Product retail price is required when shipping products');
        }
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      // Generate settings suggestions when moving to settings
      await generateSettingsSuggestions();
      setCurrentSubStep('settings');
    } else if (currentStep === 1 && currentSubStep === 'settings') {
      // Validate campaign name before proceeding
      if (!campaignData.campaignName?.trim()) {
        toast.error('Please enter a campaign name');
        setCurrentStep(1);
        setCurrentSubStep('basic-information');
        return;
      }

      setCurrentSubStep('preview-sample-matches');
      // Fetch sample matches when entering preview section
      await fetchSampleMatches();
    } else if (currentStep === 1 && currentSubStep === 'preview-sample-matches') {
      // This step is handled by SampleMatchSelector component
      // It will call handleSampleMatchComplete when brand selects 5 references
      toast.info('Please select 5 reference creators to continue');
    } else if (currentStep === 1 && currentSubStep === 'similar-creators') {
      // NEW: Move from similar creators to budget page
      setCurrentStep(2);
      setCurrentSubStep('budget-analysis');
    }
  };

  // Fetch sample matches for preview
  const fetchSampleMatches = async () => {
    setIsLoadingMatches(true);
    try {
      // Map placements to platforms
      const platforms = [];
      if (settingsData.placements.some(p => p.includes('instagram'))) {
        platforms.push('instagram');
      }
      if (settingsData.placements.some(p => p.includes('youtube'))) {
        platforms.push('youtube');
      }

      // If no platforms selected, default to both
      if (platforms.length === 0) {
        platforms.push('instagram', 'youtube');
      }

      // CRITICAL FIX: Build campaign-specific description with ALL relevant data
      // This ensures each campaign gets a UNIQUE brand embedding
      const fullDescription = [
        campaignData.businessIntroduction || '',
        campaignData.brandHighlights || '',
        campaignData.coreSellingPoints?.length > 0 ? `Key Points: ${campaignData.coreSellingPoints.join(', ')}` : '',
        campaignData.additionalInfo || ''
      ].filter(Boolean).join('\n\n');

      // CRITICAL FIX: Extract interests from campaign data
      // These will be used in brand embedding generation
      const campaignInterests = [
        ...campaignData.benchmarkBrands || [],
        campaignData.productServiceType || '',
        ...(campaignData.coreProductAudiences?.map(a => a.segment) || [])
      ].filter(Boolean);

      // Create or update draft campaign to get an ID for matching
      let campaignResponse;
      const payload = {
        title: campaignData.campaignName || `${campaignData.businessName} Campaign ${Date.now()}`, // UNIQUE title
        description: fullDescription, // FULL campaign description
        budget: parseInt(campaignData.budget) || 50000,
        platforms: platforms,
        settings: {
          placements: settingsData.placements || []
        },
        targetAudience: {
          minFollowers: 1000,
          locations: settingsData.locations || [],
          languages: settingsData.languages || [],
          interests: campaignInterests // CRITICAL: Campaign-specific interests
        },
        tags: campaignData.benchmarkBrands || [], // Add benchmark brands as tags
        status: 'draft',
        matching_config: {
          matching_mode: 'flexible_tier',
          min_match_score: 50, // Lower threshold for better results
          max_risk_score: 60
        }
      };

      if (draftCampaignId) {
        campaignResponse = await axios.put(`/api/campaigns/${draftCampaignId}`, payload);
      } else {
        campaignResponse = await axios.post('/api/campaigns', payload);
      }

      if (campaignResponse.data.success) {
        const campaignId = campaignResponse.data.campaign._id;
        setDraftCampaignId(campaignId); // Store campaign ID for later use

        // Now fetch matches for this campaign using DYNAMIC matching
        const matchResponse = await axios.post(`/api/dynamic-matching/campaigns/${campaignId}/sample-matches`);

        if (matchResponse.data.success) {
          setMatchingCandidates(matchResponse.data.candidates || []);
          setPlatformBreakdown(matchResponse.data.platform_breakdown || {});
          toast.success(`Found ${matchResponse.data.candidates?.length || 0} potential matches!`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sample matches:', error);
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.error || 'Failed to load sample matches';
      toast.error(errorMsg + '. You can continue and view matches later.');
      // Don't block the user, just show empty state
      setMatchingCandidates([]);
      setPlatformBreakdown({});
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Handle sample match selection complete
  const handleSampleMatchComplete = async (selectedCreators) => {
    setSelectedReferenceCreators(selectedCreators);

    // NEW WORKFLOW: Find similar creators based on selected references
    setCurrentSubStep('similar-creators');
    await fetchSimilarCreators(selectedCreators);

    toast.success(`${selectedCreators.length} references selected! Finding similar creators...`);
  };

  // NEW: Fetch similar creators based on brand's reference selections
  const fetchSimilarCreators = async (referenceCreators) => {
    if (!draftCampaignId) {
      toast.error('Campaign ID not found. Please try again.');
      return;
    }

    setIsLoadingSimilarCreators(true);
    try {
      // Format reference creators for API
      const formattedReferences = referenceCreators.map(creator => ({
        creatorId: creator.original_creator_id || creator._id,
        platform: creator.target_platform,
        matchScore: creator.match_score || creator.growth_adjusted_score || 70
      }));

      // Call find-similar-matches endpoint using DYNAMIC matching
      const response = await axios.post(
        `/api/dynamic-matching/campaigns/${draftCampaignId}/similar-matches`,
        { referenceCreators: formattedReferences }
      );

      if (response.data.success) {
        const similarCreatorsData = response.data.candidates || [];
        setSimilarCreators(similarCreatorsData);
        setPlatformBreakdown(response.data.platform_breakdown || {});

        const count = similarCreatorsData.length;
        toast.success(`Found ${count} similar creators!`);

        // NEW: Store similar creators and generate rankings for auto-invite system
        if (count > 0) {
          toast.loading('Preparing auto-invite system...');
          
          try {
            // Get campaign budget (default to 50000 if not set yet)
            const budgetAmount = parseInt(campaignData.budget) || 50000;
            
            // Call the storage endpoint to prepare auto-invite system
            const storageResponse = await axios.post(
              `/api/campaigns/${draftCampaignId}/store-similar-creators`,
              {
                similarCreators: similarCreatorsData,
                totalBudget: budgetAmount
              }
            );

            toast.dismiss();
            
            if (storageResponse.data.success) {
              setAutoInviteStorageComplete(true); // Mark storage as complete
              toast.success('Auto-invite system ready! Proceed to budget page.');
            }
          } catch (storageError) {
            toast.dismiss();
            console.error('Failed to store similar creators:', storageError);
            setAutoInviteStorageComplete(false);
            // Don't block the user, just log the error
            toast.warning('Auto-invite setup incomplete. You can still continue.');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch similar creators:', error);
      const errorMsg = error.response?.data?.error || 'Failed to find similar creators';
      toast.error(errorMsg);
      setSimilarCreators([]);
    } finally {
      setIsLoadingSimilarCreators(false);
    }
  };

  // Handle budget change and update auto-invite budget tracking
  // Use a ref to store the timeout ID for debouncing
  const budgetUpdateTimeoutRef = useRef(null);
  
  const handleBudgetChange = async (newBudget) => {
    setCampaignData((prev) => ({ ...prev, budget: newBudget }));
    
    // Clear any existing timeout
    if (budgetUpdateTimeoutRef.current) {
      clearTimeout(budgetUpdateTimeoutRef.current);
    }
    
    // Only update budget tracking if:
    // 1. We have a draft campaign
    // 2. Similar creators were successfully stored
    // 3. Budget is valid (>= 10000)
    if (draftCampaignId && autoInviteStorageComplete && parseInt(newBudget) >= 10000) {
      // Debounce the API call - wait 1 second after user stops typing
      budgetUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          // Update budget tracking in auto-invite system
          await axios.post(
            `/api/campaigns/${draftCampaignId}/store-similar-creators`,
            {
              similarCreators: similarCreators,
              totalBudget: parseInt(newBudget)
            }
          );
          console.log('Budget tracking updated successfully');
        } catch (error) {
          console.error('Failed to update budget tracking:', error);
          // Don't show error to user, this is a background update
        }
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  // Handle update feedback - go back to sample selector
  const handleUpdateFeedback = () => {
    setShowSampleSelector(true);
    setSelectedReferenceCreators([]);
  };

  // Generate settings suggestions using Gemini
  const generateSettingsSuggestions = async () => {
    setIsLoadingSettings(true);
    try {
      const response = await axios.post('/api/gemini/generate-campaign-settings', {
        businessName: campaignData.businessName,
        productServiceType: campaignData.productServiceType,
        businessIntroduction: campaignData.businessIntroduction,
        coreSellingPoints: campaignData.coreSellingPoints,
        coreProductAudiences: campaignData.coreProductAudiences,
        benchmarkBrands: campaignData.benchmarkBrands,
        websiteUrl: websiteUrl,
      });

      if (response.data.success) {
        const suggestions = response.data.data;

        // Update settings with AI suggestions
        setSettingsData(prev => ({
          ...prev,
          locations: suggestions.locations || prev.locations,
          languages: suggestions.languages || prev.languages,
          desiredInfluencerProfiles: suggestions.desiredInfluencerProfiles || prev.desiredInfluencerProfiles,
        }));

        toast.success('Settings suggestions generated!');
      }
    } catch (error) {
      console.error('Failed to generate settings suggestions:', error);
      // Set default locations and languages based on common markets
      setSettingsData(prev => ({
        ...prev,
        locations: ['United States', 'United Kingdom', 'Canada', 'Australia'],
        languages: ['English'],
        desiredInfluencerProfiles: [
          { description: 'Influencers who review and explain products with clear, practical examples.' },
          { description: 'Influencers who break down the latest trends and explain their impact on business.' },
          { description: 'Influencers who turn complex concepts into easy, beginner-friendly knowledge.' },
          { description: 'Influencers who deliver quick, easy-to-digest updates on the latest developments.' },
          { description: 'Influencers who recommend useful apps and websites that improve daily life and productivity.' },
        ],
      }));
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Handle CSV file upload for reference influencers
  const handleReferenceInfluencersUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setReferenceInfluencersFile(file);
      setSettingsData(prev => ({
        ...prev,
        referenceInfluencers: [{ fileName: file.name, file: file }]
      }));
      toast.success(`Reference influencers file "${file.name}" uploaded successfully`);
    }
  };

  // Handle CSV file upload for blocklist
  const handleBlocklistUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setBlocklistFile(file);
      setSettingsData(prev => ({
        ...prev,
        blocklist: [{ fileName: file.name, file: file }]
      }));
      toast.success(`Blocklist file "${file.name}" uploaded successfully`);
    }
  };

  // Remove uploaded file
  const removeReferenceInfluencersFile = () => {
    setReferenceInfluencersFile(null);
    setSettingsData(prev => ({ ...prev, referenceInfluencers: [] }));
  };

  const removeBlocklistFile = () => {
    setBlocklistFile(null);
    setSettingsData(prev => ({ ...prev, blocklist: [] }));
  };

  // Add location
  const addLocation = (location) => {
    if (!settingsData.locations.includes(location)) {
      const newLocations = [...settingsData.locations, location];
      setSettingsData(prev => ({ ...prev, locations: newLocations }));

      // Auto-add languages for the location
      const locationLanguages = COUNTRY_LANGUAGES[location] || [];
      const newLanguages = [...new Set([...settingsData.languages, ...locationLanguages])];
      setSettingsData(prev => ({ ...prev, languages: newLanguages }));
    }
    setLocationSearch('');
    setShowLocationDropdown(false);
  };

  // Remove location
  const removeLocation = (location) => {
    setSettingsData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  // Add language
  const addLanguage = (language) => {
    if (!settingsData.languages.includes(language)) {
      setSettingsData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
    setLanguageSearch('');
    setShowLanguageDropdown(false);
  };

  // Remove language
  const removeLanguage = (language) => {
    setSettingsData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  // Toggle placement
  const togglePlacement = (placementId) => {
    setSettingsData(prev => ({
      ...prev,
      placements: prev.placements.includes(placementId)
        ? prev.placements.filter(p => p !== placementId)
        : [...prev.placements, placementId]
    }));
  };

  // Add desired influencer profile
  const addInfluencerProfile = () => {
    setSettingsData(prev => ({
      ...prev,
      desiredInfluencerProfiles: [...prev.desiredInfluencerProfiles, { description: '' }]
    }));
  };

  // Update influencer profile
  const updateInfluencerProfile = (index, description) => {
    const newProfiles = [...settingsData.desiredInfluencerProfiles];
    newProfiles[index] = { description };
    setSettingsData(prev => ({ ...prev, desiredInfluencerProfiles: newProfiles }));
  };

  // Remove influencer profile
  const removeInfluencerProfile = (index) => {
    setSettingsData(prev => ({
      ...prev,
      desiredInfluencerProfiles: prev.desiredInfluencerProfiles.filter((_, i) => i !== index)
    }));
  };

  // Filter locations based on search
  const filteredLocations = ALL_COUNTRIES.filter(
    country => country.toLowerCase().includes(locationSearch.toLowerCase()) && !settingsData.locations.includes(country)
  ).slice(0, 10);

  // Filter languages based on search
  const filteredLanguages = ALL_LANGUAGES.filter(
    lang => lang.toLowerCase().includes(languageSearch.toLowerCase()) && !settingsData.languages.includes(lang)
  ).slice(0, 10);

  // Reset and generate new
  const handleGenerateNew = () => {
    setHasGenerated(false);
    setWebsiteUrl('');
    setIsAnalysisExpanded(true);
    setCampaignData({
      campaignName: '',
      businessLogo: null,
      businessName: '',
      productServiceType: 'ecommerce',
      benchmarkBrands: [],
      productDelivery: 'ship',
      productName: '',
      productPhoto: null,
      productRetailPrice: '',
      businessIntroduction: '',
      brandHighlights: '',
      coreSellingPoints: [],
      coreProductAudiences: [],
      additionalInfo: '',
      previousMatches: [],
      budget: '',
      analysis: '',
    });
  };

  // Handle terms acceptance and publish campaign
  const handleTermsAccepted = async () => {
    setShowTermsModal(false);

    try {
      // Check if we're in edit mode
      const urlParams = new URLSearchParams(location.search);
      const mode = urlParams.get('mode');
      const campaignId = urlParams.get('id');
      const isEditMode = mode === 'edit' && campaignId;

      toast.loading(isEditMode ? 'Updating campaign...' : 'Publishing campaign...');

      // Map placements to platforms
      const platforms = [];
      if (settingsData.placements.some(p => p.includes('instagram'))) {
        platforms.push('instagram');
      }
      if (settingsData.placements.some(p => p.includes('youtube'))) {
        platforms.push('youtube');
      }

      // If no platforms selected, default to both
      if (platforms.length === 0) {
        platforms.push('instagram', 'youtube');
      }

      const campaignPayload = {
        title: campaignData.campaignName || campaignData.businessName || 'New Campaign',
        description: [
          campaignData.businessIntroduction,
          campaignData.brandHighlights,
          campaignData.coreSellingPoints?.length > 0 ? `Key Points: ${campaignData.coreSellingPoints.join(', ')}` : '',
        ].filter(Boolean).join('\n\n'),
        budget: parseInt(campaignData.budget),
        platforms: platforms,
        targetAudience: {
          minFollowers: 1000,
          locations: settingsData.locations,
          languages: settingsData.languages,
        },
        status: 'active',
        tags: campaignData.benchmarkBrands || [],
        // NEW: Store selected reference creators for similar creator matching
        selectedCreators: selectedReferenceCreators.map(creator => ({
          profileId: creator.original_creator_id || creator._id,
          platform: creator.target_platform,
          matchScore: creator.match_score || creator.growth_adjusted_score || 70,
          status: 'invited'
        })),
        budget_management: campaignEstimation?.budget_distribution ? {
          total_budget: campaignEstimation.budget_distribution.total_budget,
          invitation_budget: campaignEstimation.budget_distribution.invitation_budget,
          negotiation_buffer: campaignEstimation.budget_distribution.negotiation_buffer,
          available: campaignEstimation.budget_distribution.invitation_budget,
        } : undefined,
        campaign_estimation: campaignEstimation ? {
          predicted_views: campaignEstimation.predicted_views,
          predicted_clicks: campaignEstimation.predicted_clicks,
          cpm_range: campaignEstimation.cpm_range,
          cpc_range: campaignEstimation.cpc_range,
        } : undefined,
        // Extended campaign details
        extendedDetails: {
          campaignName: campaignData.campaignName,
          productName: campaignData.productName,
          businessName: campaignData.businessName,
          businessIntroduction: campaignData.businessIntroduction,
          website: websiteUrl,
          businessLogo: campaignData.businessLogo,
          brandHighlights: Array.isArray(campaignData.brandHighlights)
            ? campaignData.brandHighlights.join('\n')
            : campaignData.brandHighlights,
          coreSellingPoints: campaignData.coreSellingPoints || [],
          coreProductAudiences: campaignData.coreProductAudiences || [],
          benchmarkBrands: campaignData.benchmarkBrands || [],
          productServiceType: campaignData.productServiceType,
          productDelivery: campaignData.productDelivery,
          productRetailPrice: campaignData.productRetailPrice ? parseFloat(campaignData.productRetailPrice) : undefined,
          additionalInfo: campaignData.additionalInfo
        },
        settings: {
          productLink: settingsData.productLink,
          campaignBrief: settingsData.campaignBrief,
          brandAssets: settingsData.brandAssets,
          productExplainerVideo: settingsData.productExplainerVideo,
          placements: settingsData.placements || [],
          postDateType: settingsData.postDateType || 'flexible',
          autoApproveSubmissions: settingsData.autoApproveSubmissions || false,
          desiredInfluencerProfiles: settingsData.desiredInfluencerProfiles || []
        }
      };

      // CRITICAL FIX: Use draftCampaignId that already has similarCreatorsCache
      // Don't create a new campaign or overwrite the existing one
      const campaignIdToUse = draftCampaignId || campaignId;

      if (!campaignIdToUse) {
        throw new Error('Campaign ID not found. Please go back and complete the previous steps.');
      }

      // Update the existing campaign (which already has similarCreatorsCache from /similar-matches call)
      const response = await axios.put(`/api/campaigns/${campaignIdToUse}`, campaignPayload);

      toast.dismiss();

      if (response.data.success) {
        // If creating new campaign (not editing), automatically trigger auto-invites
        if (!isEditMode) {
          // Only trigger auto-invites if storage was completed successfully
          if (autoInviteStorageComplete) {
            toast.loading('Triggering auto-invites...');

            try {
              // CORRECTED: Use the correct campaign-collaboration publish endpoint
              const autoInviteResponse = await axios.post(
                `/api/campaign-collaboration/${campaignIdToUse}/publish`
              );

              toast.dismiss();

              if (autoInviteResponse.data.success) {
                const invitationsCount = autoInviteResponse.data.invitations_count || 0;
                const budgetAllocated = autoInviteResponse.data.budget_allocated || 0;
                toast.success(
                  `Campaign published! ${invitationsCount} auto-invites sent. Budget allocated: ₹${budgetAllocated.toLocaleString()}`,
                  { duration: 5000 }
                );
              } else {
                toast.warning('Campaign created but auto-invites failed to trigger');
              }
            } catch (autoInviteError) {
              console.error('Failed to trigger auto-invites:', autoInviteError);
              const errorMsg = autoInviteError.response?.data?.message || autoInviteError.response?.data?.error || 'Failed to trigger auto-invites';
              toast.error(`Error: ${errorMsg}`);
            }
          } else {
            // Storage was not complete, inform user
            toast.success('Campaign published! Auto-invites will be sent manually.');
          }
        } else {
          toast.success(isEditMode ? 'Campaign updated successfully!' : 'Campaign published successfully!');
        }

        // Navigate back to campaigns list and force refresh
        setTimeout(() => {
          navigate('/brand/campaigns', { replace: true, state: { refresh: true } });
        }, 1000);
      } else {
        throw new Error(isEditMode ? 'Campaign update failed' : 'Campaign creation failed');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Failed to save campaign:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || 'Failed to save campaign';
      toast.error(errorMessage);
    }
  };

  // Validate all required fields before publishing
  const validateCampaignForPublish = () => {
    const errors = [];

    // Basic Information validation
    if (!campaignData.campaignName?.trim()) {
      errors.push('Campaign name is required');
    }
    if (!campaignData.businessName?.trim()) {
      errors.push('Business name is required');
    }
    if (!campaignData.productServiceType) {
      errors.push('Product/Service type is required');
    }
    if (!campaignData.benchmarkBrands || campaignData.benchmarkBrands.length === 0) {
      errors.push('At least one benchmark brand is required');
    }
    if (!campaignData.businessIntroduction?.trim()) {
      errors.push('Business introduction is required');
    }
    // Fix: Check if brandHighlights is a string before calling trim()
    if (!campaignData.brandHighlights ||
      (typeof campaignData.brandHighlights === 'string' && !campaignData.brandHighlights.trim())) {
      errors.push('Brand highlights are required');
    }
    if (!campaignData.coreSellingPoints || campaignData.coreSellingPoints.length === 0) {
      errors.push('At least one core selling point is required');
    }

    // Product delivery validation
    if (campaignData.productDelivery === 'ship') {
      if (!campaignData.productName?.trim()) {
        errors.push('Product name is required when shipping products');
      }
      if (!campaignData.productPhoto) {
        errors.push('Product photo is required when shipping products');
      }
      if (!campaignData.productRetailPrice) {
        errors.push('Product retail price is required when shipping products');
      }
    }

    // Settings validation
    if (!settingsData.placements || settingsData.placements.length === 0) {
      errors.push('At least one placement is required');
    }
    if (!settingsData.locations || settingsData.locations.length === 0) {
      errors.push('At least one target location is required');
    }
    if (!settingsData.languages || settingsData.languages.length === 0) {
      errors.push('At least one target language is required');
    }

    // Budget validation
    if (!campaignData.budget || parseInt(campaignData.budget) < 10000) {
      errors.push('Budget must be at least ₹10,000');
    }

    return errors;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Sticky */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/brand/campaigns')} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {(() => {
                const urlParams = new URLSearchParams(location.search);
                const mode = urlParams.get('mode');
                return mode === 'edit' ? 'Edit Campaign' : 'New Campaign';
              })()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-600 flex items-center gap-1 cursor-pointer hover:text-blue-700">
              <span className="w-4 h-4 rounded-full border border-blue-600 flex items-center justify-center text-xs">?</span>
              What happens after you publish?
            </span>
            <Button onClick={saveDraft} variant="outline" className="text-gray-600 border-gray-300">
              Save draft
            </Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] relative">
          <div className="p-4">
            <div className="space-y-4">
              {sidebarSteps.map((step) => (
                <div key={step.id} className="space-y-2">
                  <div
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    onClick={() => handleStepChange(step.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {step.id}
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>

                  {step.subSteps.length > 0 && currentStep === step.id && (
                    <div className="ml-9 space-y-1">
                      {step.subSteps.map((subStep) => (
                        <div
                          key={subStep.id}
                          className={`text-sm py-1 cursor-pointer transition-colors ${currentSubStep === subStep.id ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          onClick={() => handleStepChange(step.id, subStep.id)}
                        >
                          {subStep.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Collapse button */}
          <div className="absolute bottom-4 left-4">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
              Collapse
            </button>
          </div>
        </div>

        {/* Main Content Area - Full Width */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && currentSubStep === 'basic-information' && (
              <div className="space-y-6">
                {/* AI Assistant Section - Collapsible */}
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* AI Header - Always visible */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => hasGenerated && setIsAnalysisExpanded(!isAnalysisExpanded)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Sera AI</h3>
                        <p className="text-sm text-gray-500">Your 24/7 AI employee for influencer marketing</p>
                      </div>
                    </div>
                    {hasGenerated && (
                      <button className="text-gray-400 hover:text-gray-600">
                        {isAnalysisExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  {/* Collapsible Content */}
                  {isAnalysisExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      {/* Analysis Progress */}
                      {isAnalyzing && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-600 text-sm font-medium">Sera AI finished thinking.</span>
                          </div>

                          {analysisSteps.map((step) => (
                            <div key={step.id} className="mb-3">
                              <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => { }}
                              >
                                {step.status === 'active' ? (
                                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-green-500" />
                                )}
                                <span className="text-sm text-gray-700">{step.text}</span>
                                {step.details && <ChevronDown className="w-4 h-4 text-gray-400" />}
                              </div>
                              {step.details && (
                                <div className="ml-5 mt-2 space-y-1">
                                  {step.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                                      <span className="text-green-500">✓</span>
                                      {detail}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="mt-4 bg-white rounded-lg p-3">
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                              <span className="text-sm text-gray-600">Setting up campaign...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Welcome Message and URL Input - Show when not analyzing */}
                      {!isAnalyzing && (
                        <>
                          <div className="mt-4 mb-4">
                            <p className="text-gray-700 text-sm">
                              Hi {user?.name || 'there'}! Happy to partner with you to build real marketing strategies and run an
                              expert-level campaign. Drop your website URL and I'll review it, offering a brand overview we can refine
                              together. It also helps me identify the best-fit influencers for your brand.
                            </p>
                          </div>

                          {/* URL Input */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">https://</span>
                              <input
                                type="text"
                                value={websiteUrl.replace(/^https?:\/\//, '')}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="Paste your product link, website link, course link, etc."
                                className="flex-1 px-3 py-2 outline-none text-sm"
                                disabled={isAnalyzing}
                              />
                            </div>
                            <Button
                              onClick={analyzeWebsite}
                              disabled={isAnalyzing || !websiteUrl.trim()}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                            >
                              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                            </Button>
                          </div>

                          {/* Generated Content Notice */}
                          {hasGenerated && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-blue-700">
                                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-2"></span>
                                  These details are generated by Sera AI based on an analysis of your brand. Please review and customize them as necessary.
                                </p>
                                <Button
                                  onClick={handleGenerateNew}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50 ml-4"
                                >
                                  Generate New
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Collapsed State - Show URL and status */}
                  {!isAnalysisExpanded && hasGenerated && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            {websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">✓ Generated</span>
                          <Button
                            onClick={handleGenerateNew}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            Generate New
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generated Content - After URL Analysis */}
                {hasGenerated && (
                  <>
                    {/* Campaign Title */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        {campaignData.campaignName || campaignData.businessName || 'Your Campaign'}
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </h2>
                    </div>

                    {/* Basic Information Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic information</h3>

                      {/* Campaign Name */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign name<span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={campaignData.campaignName}
                          onChange={(e) => setCampaignData((prev) => ({ ...prev, campaignName: e.target.value }))}
                          placeholder="e.g., Summer Product Launch 2024"
                        />
                        <p className="text-xs text-gray-500 mt-1">Give your campaign a unique name to easily identify it</p>
                      </div>

                      {/* Business Logo */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Logo <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <div className="flex items-center gap-4">
                          {campaignData.businessLogo ? (
                            <div className="relative">
                              <img src={campaignData.businessLogo} alt="Logo" className="w-16 h-16 object-contain border rounded-lg" />
                              <button
                                onClick={() => setCampaignData((prev) => ({ ...prev, businessLogo: null }))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <span className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Upload</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Upload your business logo manually. Supports PNG, JPG, or SVG format.</p>
                      </div>

                      {/* Business Name & Product Type */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business name<span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={campaignData.businessName}
                            onChange={(e) => setCampaignData((prev) => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Enter business name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product / Service type<span className="text-red-500">*</span>
                          </label>
                          <select
                            value={campaignData.productServiceType}
                            onChange={(e) => setCampaignData((prev) => ({ ...prev, productServiceType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="ecommerce">E-commerce</option>
                            <option value="saas">SaaS</option>
                            <option value="fashion">Fashion</option>
                            <option value="beauty">Beauty</option>
                            <option value="food_beverage">Food & Beverage</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="finance">Finance</option>
                            <option value="travel">Travel</option>
                            <option value="fitness">Fitness</option>
                            <option value="education">Education</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Benchmark Brands */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Benchmark brands<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {campaignData.benchmarkBrands.map((brand, index) => (
                            <Badge key={index} className="bg-gray-100 text-gray-700 px-3 py-1 flex items-center gap-2">
                              {brand}
                              <button onClick={() => removeBenchmarkBrand(index)} className="hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add benchmark brand"
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addBenchmarkBrand(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          We'll recommend influencers who have worked with these brands or reached similar audiences.
                        </p>
                      </div>

                      {/* Product Delivery */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product delivery</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="delivery"
                              value="ship"
                              checked={campaignData.productDelivery === 'ship'}
                              onChange={(e) => setCampaignData((prev) => ({ ...prev, productDelivery: e.target.value }))}
                              className="w-4 h-4 text-orange-500"
                            />
                            <span className="text-sm">I will ship the product</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="delivery"
                              value="no_ship"
                              checked={campaignData.productDelivery === 'no_ship'}
                              onChange={(e) => setCampaignData((prev) => ({ ...prev, productDelivery: e.target.value }))}
                              className="w-4 h-4 text-orange-500"
                            />
                            <span className="text-sm">No shipment needed</span>
                          </label>
                        </div>
                        {campaignData.productDelivery === 'ship' && (
                          <p className="text-xs text-gray-500 mt-2">
                            You will need to send products to each creator and provide necessary shipping information on the platform.
                            Once they receive the products, they will begin creating content.
                          </p>
                        )}
                      </div>

                      {/* Product Name & Photo (if shipping) */}
                      {campaignData.productDelivery === 'ship' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Product name<span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={campaignData.productName}
                              onChange={(e) => setCampaignData((prev) => ({ ...prev, productName: e.target.value }))}
                              placeholder="Product name / Course name / Service name etc."
                            />
                            <p className="text-xs text-gray-500 mt-1">{campaignData.productName.length} / 70</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Product photo<span className="text-red-500">*</span>
                            </label>
                            {campaignData.productPhoto ? (
                              <div className="relative inline-block">
                                <img
                                  src={campaignData.productPhoto}
                                  alt="Product"
                                  className="w-32 h-32 object-cover border rounded-lg"
                                />
                                <button
                                  onClick={() => setCampaignData((prev) => ({ ...prev, productPhoto: null }))}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">Upload photo</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      if (file.size > 5 * 1024 * 1024) {
                                        toast.error('File size must be less than 5MB');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        setCampaignData((prev) => ({ ...prev, productPhoto: event.target.result }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Product Retail Price */}
                      {campaignData.productDelivery === 'ship' && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product retail price<span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2 max-w-xs">
                            <span className="text-gray-500">$</span>
                            <Input
                              type="number"
                              value={campaignData.productRetailPrice}
                              onChange={(e) => setCampaignData((prev) => ({ ...prev, productRetailPrice: e.target.value }))}
                              placeholder="199.99"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Business Introduction */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business introduction</h3>
                      <textarea
                        value={campaignData.businessIntroduction}
                        onChange={(e) => setCampaignData((prev) => ({ ...prev, businessIntroduction: e.target.value }))}
                        placeholder="Provide a brief overview of your business, including what you do, your mission, and what makes your brand unique. Mention your industry, target audience, and any key achievements or milestones that define your brand's identity and values."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Brand Highlights & Endorsements */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand highlights & endorsements</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add highlights that boost influencer trust and increase collaboration rates.
                      </p>
                      <textarea
                        value={campaignData.brandHighlights}
                        onChange={(e) => setCampaignData((prev) => ({ ...prev, brandHighlights: e.target.value }))}
                        placeholder="Highlight your brand's key achievements such as funding rounds, strategic partnerships, celebrity endorsements, media coverage, awards, customer testimonials, revenue milestones, market traction, or any notable recognition that builds credibility and trust with influencers."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">{campaignData.brandHighlights.length} / 200</p>
                    </div>

                    {/* Core Selling Points */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Core selling points</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 border-b pb-2">
                          <div className="col-span-1">Number</div>
                          <div className="col-span-10">Description</div>
                          <div className="col-span-1"></div>
                        </div>
                        {campaignData.coreSellingPoints.map((point, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100">
                            <div className="col-span-1 text-sm text-gray-500">{index + 1}</div>
                            <div className="col-span-10">
                              <Input
                                value={point}
                                onChange={(e) => {
                                  const newPoints = [...campaignData.coreSellingPoints];
                                  newPoints[index] = e.target.value;
                                  setCampaignData((prev) => ({ ...prev, coreSellingPoints: newPoints }));
                                }}
                                className="border-0 bg-transparent focus:ring-0 p-0"
                              />
                            </div>
                            <div className="col-span-1">
                              <button onClick={() => removeCoreSellingPoint(index)} className="text-gray-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => addCoreSellingPoint('')}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add selling point
                        </button>
                      </div>
                    </div>

                    {/* Core Product Audiences */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Core product audiences</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Your audience definitions are critical — they directly impact which influencers are matched for your campaign.
                      </p>

                      {/* AI Generated Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700">
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-2"></span>
                          These audiences are pre-filled by Sera AI based on your campaign. Please review and refine as needed.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 border-b pb-2">
                          <div className="col-span-1">Number</div>
                          <div className="col-span-10">Title & Description</div>
                          <div className="col-span-1"></div>
                        </div>
                        {campaignData.coreProductAudiences.map((audience, index) => (
                          <div key={index} className="border-b border-gray-100 py-3">
                            <div className="flex items-start gap-4">
                              <div className="text-sm text-gray-500 w-8">{index + 1}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {typeof audience.segment === 'string' ? audience.segment : audience.segment?.segment || 'N/A'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 ml-6">
                                  {typeof audience.description === 'string' ? audience.description : audience.segment?.description || audience.description || ''}
                                </p>
                              </div>
                              <button onClick={() => removeCoreAudience(index)} className="text-gray-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const segment = prompt('Enter audience segment name:');
                            const description = prompt('Enter audience description:');
                            if (segment && description) {
                              addCoreAudience(segment, description);
                            }
                          }}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add audience segment
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 1: Settings */}
            {currentStep === 1 && currentSubStep === 'settings' && (
              <div className="space-y-6">
                {/* AI Assistant Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Sera AI</h3>
                      <p className="text-sm text-gray-500">Your 24/7 AI employee for influencer marketing</p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  {isLoadingSettings && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Sera AI finished thinking.</span>
                    </div>
                  )}
                </div>

                {/* Matching Accuracy Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Matching accuracy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Focus Mode */}
                    <div
                      onClick={() => setSettingsData(prev => ({ ...prev, matchingAccuracy: 'focus' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${settingsData.matchingAccuracy === 'focus'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Focus className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Focus mode</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settingsData.matchingAccuracy === 'focus' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                          {settingsData.matchingAccuracy === 'focus' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Focuses on highly aligned influencers for better match accuracy. Expect higher costs and a longer campaign cycle.
                      </p>
                    </div>

                    {/* Scale Mode */}
                    <div
                      onClick={() => setSettingsData(prev => ({ ...prev, matchingAccuracy: 'scale' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${settingsData.matchingAccuracy === 'scale'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Scale mode</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settingsData.matchingAccuracy === 'scale' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                          {settingsData.matchingAccuracy === 'scale' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Expands the influencer pool while keeping solid relevance, improving efficiency, lowering costs, and shortening the campaign cycle.
                      </p>
                    </div>

                    {/* Max Scale Mode */}
                    <div
                      onClick={() => setSettingsData(prev => ({ ...prev, matchingAccuracy: 'max_scale' }))}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${settingsData.matchingAccuracy === 'max_scale'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Max scale mode</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settingsData.matchingAccuracy === 'max_scale' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                          {settingsData.matchingAccuracy === 'max_scale' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Maximizes reach by widening relevance boundaries, greatly lowering costs and accelerating the campaign cycle.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Learn more</a>
                  </div>

                  {/* Placements */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Placements*</label>
                    {/* Selected placements */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settingsData.placements.map(placementId => {
                        const placement = PLACEMENT_OPTIONS.find(p => p.id === placementId);
                        return placement ? (
                          <Badge
                            key={placement.id}
                            className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1"
                          >
                            {placement.label}
                            <button onClick={() => togglePlacement(placement.id)} className="hover:text-blue-200">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    {/* Dropdown for adding placements */}
                    <div className="relative placements-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowPlacementsDropdown(!showPlacementsDropdown)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <span className="text-gray-500">Select placements...</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPlacementsDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showPlacementsDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto">
                          {/* YouTube Section */}
                          <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                            YouTube
                          </div>
                          {PLACEMENT_OPTIONS.filter(p => p.platform === 'YouTube').map(placement => (
                            <div
                              key={placement.id}
                              onClick={() => togglePlacement(placement.id)}
                              className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${settingsData.placements.includes(placement.id)
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-100'
                                }`}
                            >
                              <span>{placement.label}</span>
                              {settingsData.placements.includes(placement.id) && (
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                          {/* Instagram Section */}
                          <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-t">
                            Instagram
                          </div>
                          {PLACEMENT_OPTIONS.filter(p => p.platform === 'Instagram').map(placement => (
                            <div
                              key={placement.id}
                              onClick={() => togglePlacement(placement.id)}
                              className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${settingsData.placements.includes(placement.id)
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-100'
                                }`}
                            >
                              <span>{placement.label}</span>
                              {settingsData.placements.includes(placement.id) && (
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                      Locations*
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settingsData.locations.map(location => (
                        <Badge
                          key={location}
                          className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1"
                        >
                          {location}
                          <button onClick={() => removeLocation(location)} className="hover:text-blue-200">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <Input
                        value={locationSearch}
                        onChange={(e) => {
                          setLocationSearch(e.target.value);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        placeholder="Click a location group above to quickly add predefined countries/regions"
                        className="w-full"
                      />
                      {showLocationDropdown && locationSearch && filteredLocations.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredLocations.map(location => (
                            <div
                              key={location}
                              onClick={() => addLocation(location)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {location}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Quick add location groups */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => {
                          ['United States', 'United Kingdom', 'Canada', 'Australia', 'Ireland', 'New Zealand'].forEach(addLocation);
                        }}
                        className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50"
                      >
                        Developed English-speaking markets (6) +
                      </button>
                      <button
                        onClick={() => {
                          ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium', 'Austria', 'Switzerland'].forEach(addLocation);
                        }}
                        className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50"
                      >
                        Developed markets (41) +
                      </button>
                      <button
                        onClick={() => {
                          ['India', 'Brazil', 'Mexico', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'South Africa', 'Nigeria'].forEach(addLocation);
                        }}
                        className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50"
                      >
                        Developed and emerging markets (67) +
                      </button>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                      Languages*
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settingsData.languages.map(language => (
                        <Badge
                          key={language}
                          className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1"
                        >
                          {language}
                          <button onClick={() => removeLanguage(language)} className="hover:text-blue-200">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <Input
                        value={languageSearch}
                        onChange={(e) => {
                          setLanguageSearch(e.target.value);
                          setShowLanguageDropdown(true);
                        }}
                        onFocus={() => setShowLanguageDropdown(true)}
                        placeholder="Search and add languages..."
                        className="w-full"
                      />
                      {showLanguageDropdown && languageSearch && filteredLanguages.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredLanguages.map(language => (
                            <div
                              key={language}
                              onClick={() => addLanguage(language)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {language}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Influencer Marketing Post Date */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                      Influencer marketing post date*
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <select
                      value={settingsData.postDateType}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, postDateType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="flexible">Flexible post time: Creators can publish their content as soon as it's approved.</option>
                      <option value="fixed">Fixed post time: Creators are required to post within a time window.</option>
                    </select>

                    {/* Date Range Picker - Show only when Fixed post time is selected */}
                    {settingsData.postDateType === 'fixed' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3 font-medium">Select posting time window</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={settingsData.fixedPostStartDate}
                              onChange={(e) => setSettingsData(prev => ({ ...prev, fixedPostStartDate: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={settingsData.fixedPostEndDate}
                              onChange={(e) => setSettingsData(prev => ({ ...prev, fixedPostEndDate: e.target.value }))}
                              min={settingsData.fixedPostStartDate || new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Creators will be required to post their content between these dates
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Product/Website Link */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provide the link where the audience will be taken when they click*
                    </label>
                    <Input
                      value={settingsData.productLink}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, productLink: e.target.value }))}
                      placeholder="The audience will visit this link after watching the influencer's content"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sera will generate a unique tracking link for each influencer from this link to help you track performance (e.g., views, clicks, CPM and CPC).
                    </p>
                  </div>

                  {/* Campaign Brief */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom brand guidelines / Campaign brief
                    </label>
                    <textarea
                      value={settingsData.campaignBrief}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, campaignBrief: e.target.value }))}
                      placeholder="e.g., Must use xxx features"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Requirements that you'd like the creators to follow in addition to{' '}
                      <a href="#" className="text-blue-600 hover:underline">Platform requirements</a>.
                      If you already have a campaign brief prepared, you're welcome to include it here.
                    </p>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2">
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Desired Influencer Profiles */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Desired influencer profiles</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 border-b pb-2">
                      <div className="col-span-1">#</div>
                      <div className="col-span-10">Description</div>
                      <div className="col-span-1"></div>
                    </div>
                    {settingsData.desiredInfluencerProfiles.map((profile, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100">
                        <div className="col-span-1 text-sm text-gray-500">{index + 1}</div>
                        <div className="col-span-10">
                          <Input
                            value={profile.description}
                            onChange={(e) => updateInfluencerProfile(index, e.target.value)}
                            placeholder="Describe the type of influencer you're looking for..."
                            className="border-0 bg-transparent focus:ring-0 p-0"
                          />
                        </div>
                        <div className="col-span-1">
                          <button onClick={() => removeInfluencerProfile(index)} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addInfluencerProfile}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                    className="w-full p-6 flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Advanced settings</h3>
                    {isAdvancedExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isAdvancedExpanded && (
                    <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-6">
                      {/* Reference Influencers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reference influencers</label>
                        <p className="text-xs text-gray-500 mb-2">
                          Upload a list of influencers you like, and Sera will find similar ones for your campaign's{' '}
                          <a href="#" className="text-blue-600 hover:underline">cover card template</a>.
                        </p>
                        <div className="flex items-center gap-4">
                          {referenceInfluencersFile ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-sm text-blue-700">{referenceInfluencersFile.name}</span>
                              <button
                                onClick={removeReferenceInfluencersFile}
                                className="text-blue-500 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                              <Upload className="w-4 h-4" />
                              Upload
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleReferenceInfluencersUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                          <span className="text-xs text-gray-500">*Only csv files</span>
                        </div>
                      </div>

                      {/* Blocklist */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blocklist</label>
                        <p className="text-xs text-gray-500 mb-2">
                          Upload a list of influencers you do not want to work with.{' '}
                          <a href="#" className="text-blue-600 hover:underline">Download template</a>
                        </p>
                        <div className="flex items-center gap-4">
                          {blocklistFile ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-sm text-blue-700">{blocklistFile.name}</span>
                              <button
                                onClick={removeBlocklistFile}
                                className="text-blue-500 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                              <Upload className="w-4 h-4" />
                              Upload
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleBlocklistUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                          <span className="text-xs text-gray-500">*Only csv files</span>
                        </div>
                      </div>

                      {/* Brand Assets */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand assets</label>
                        <p className="text-xs text-gray-500 mb-2">
                          Upload the brand assets you want to share with influencers like{' '}
                          <a href="#" className="text-blue-600 hover:underline">Google Drive</a> or other links. If these assets are in the{' '}
                          <a href="#" className="text-blue-600 hover:underline">brand's asset library</a>,
                          no need to re-upload here. Ensure that the links are viewable and that invites are not required for optimal results.
                        </p>
                        <Input
                          value={settingsData.brandAssets}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, brandAssets: e.target.value }))}
                          placeholder="Please enter the Brand assets link..."
                          className="w-full"
                        />
                      </div>

                      {/* Product Explainer Video */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product explainer video</label>
                        <p className="text-xs text-gray-500 mb-2">
                          Upload a YouTube video explaining your products or services to help creators better understand your campaign requirements.
                        </p>
                        <Input
                          value={settingsData.productExplainerVideo}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, productExplainerVideo: e.target.value }))}
                          placeholder="e.g. https://youtu.be/xxxxxxxxxxx?si=xxxxxxxxxx"
                          className="w-full"
                        />
                      </div>

                      {/* Auto-approve Submissions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Miniscript auto-revision</label>
                          <p className="text-xs text-gray-500">
                            If required, the influencer should submit an idea or script to align on creative direction before starting production.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsData.autoApproveSubmissions}
                            onChange={(e) => setSettingsData(prev => ({ ...prev, autoApproveSubmissions: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Preview Sample Matches */}
            {currentStep === 1 && currentSubStep === 'preview-sample-matches' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Preview Sample Matches</h3>
                    <p className="text-gray-600">
                      Based on your campaign details, here are some potential creator matches. Select 5 reference creators to find similar matches.
                    </p>
                  </div>

                  {/* Sample Match Selector */}
                  <SampleMatchSelector
                    candidates={matchingCandidates}
                    loading={isLoadingMatches}
                    onComplete={handleSampleMatchComplete}
                    onUpdateFeedback={handleUpdateFeedback}
                  />
                </div>
              </div>
            )}

            {/* NEW STEP: Similar Creators */}
            {currentStep === 1 && currentSubStep === 'similar-creators' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Similar Creators</h3>
                    <p className="text-gray-600">
                      Based on your {selectedReferenceCreators.length} reference selections, we found {similarCreators.length} similar creators ranked by platform and placement.
                    </p>
                  </div>

                  {/* Show selected reference creators summary */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          ✓ Reference Creators Selected
                        </h4>
                        <p className="text-gray-600">
                          {selectedReferenceCreators.length} reference creators selected
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentSubStep('preview-sample-matches');
                          setShowSampleSelector(true);
                          setSelectedReferenceCreators([]);
                          setSimilarCreators([]);
                        }}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Change References
                      </Button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoadingSimilarCreators && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600">Finding similar creators...</p>
                    </div>
                  )}

                  {/* Similar Creators Results */}
                  {!isLoadingSimilarCreators && similarCreators.length > 0 && (
                    <>
                      <MatchingResults
                        candidates={similarCreators}
                        platformBreakdown={platformBreakdown}
                        loading={false}
                      />

                      {/* Action Buttons */}
                      <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">
                            Found {similarCreators.length} similar creators. Invitations will be sent automatically when you publish the campaign.
                          </p>
                        </div>
                        <Button
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Continue to Budget
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Empty State */}
                  {!isLoadingSimilarCreators && similarCreators.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">No similar creators found. Try selecting different reference creators.</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentSubStep('preview-sample-matches');
                          setShowSampleSelector(true);
                          setSelectedReferenceCreators([]);
                        }}
                      >
                        Go Back
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Budget and Results */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Budget and Campaign Estimation</h3>
                    <p className="text-gray-600">
                      Set your campaign budget and see predicted results based on industry benchmarks.
                    </p>
                  </div>

                  {/* Campaign Estimation Component */}
                  <CampaignEstimation
                    budget={campaignData.budget}
                    onBudgetChange={handleBudgetChange}
                    onEstimationComplete={(estimation) => {
                      setCampaignEstimation(estimation);
                    }}
                  />

                  {/* Campaign Summary */}
                  {campaignEstimation && campaignData.budget && parseInt(campaignData.budget) >= 10000 && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Campaign Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{campaignData.campaignName || 'Unnamed Campaign'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Business Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{campaignData.businessName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Budget:</span>
                          <span className="ml-2 font-medium text-gray-900">₹{parseInt(campaignData.budget).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Platforms:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {Object.keys(platformBreakdown).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') || 'All'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-8 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(1);
                        setCurrentSubStep('preview-sample-matches');
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Matches
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={saveDraft}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => {
                          // Validate all required fields
                          const validationErrors = validateCampaignForPublish();

                          if (validationErrors.length > 0) {
                            // Show all errors
                            validationErrors.forEach(error => toast.error(error));

                            // Navigate to the first section with errors
                            if (validationErrors.some(e => e.includes('Campaign name') || e.includes('Business name') ||
                              e.includes('Product/Service') || e.includes('benchmark') || e.includes('introduction') ||
                              e.includes('highlights') || e.includes('selling point') || e.includes('Product'))) {
                              setCurrentStep(1);
                              setCurrentSubStep('basic-information');
                            } else if (validationErrors.some(e => e.includes('placement') || e.includes('location') || e.includes('language'))) {
                              setCurrentStep(1);
                              setCurrentSubStep('settings');
                            }
                            return;
                          }

                          // Show terms and conditions modal
                          setShowTermsModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {(() => {
                          const urlParams = new URLSearchParams(location.search);
                          const mode = urlParams.get('mode');
                          return mode === 'edit' ? 'Update Campaign' : 'Publish Campaign';
                        })()}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <CampaignTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        campaignData={campaignData}
      />
    </div>
  );
};

export default NewCampaign;
