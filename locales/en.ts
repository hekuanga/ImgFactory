export const en = {
  // Navigation
  nav: {
    home: 'Home',
    restore: 'Restore Photo',
    passportPhoto: 'Passport Photo',
    studio: 'Blue Star Studio',
  },
  // User actions
  user: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    subscribe: 'Subscribe',
    manageSubscription: 'Manage Subscription',
    loading: 'Loading...',
    processing: 'Processing...',
    email: 'Email',
    credits: 'Credits',
    creditsBalance: 'Credits Balance',
    creditsDescription: 'Each photo generation costs 1 credit',
    rechargeCredits: 'Recharge Credits',
    viewDetails: 'View Details',
    paymentSuccess: 'Payment Successful!',
    creditsPurchased: 'Successfully purchased {{amount}} credits',
    startUsing: 'Start Using',
    backToCredits: '← Back to Credits',
  },
  // Home page
  home: {
    title: 'Restore Your Photos',
    subtitle: 'Use AI technology to restore and enhance your precious photos',
    restoreButton: 'Restore Your Photos',
    passportPhotoButton: 'Generate Your ID Photo',
    beforeExample: 'Before Example',
    afterExample: 'After Example',
  },
  // Photo restoration page
  restore: {
    title: 'Photo Restoration',
    selectModel: 'Select Model',
    uploadPhoto: 'Upload Photo',
    originalPhoto: 'Original',
    restoredPhoto: 'Restored',
    regenerate: 'Regenerate',
    download: 'Download',
    loading: 'Processing...',
    error: 'An error occurred',
    fileSizeExceeded: 'Image size cannot exceed 20MB',
    uploadNewPhoto: 'Upload New Photo',
    usedModel: 'Model Used',
    beforePhoto: 'Before Photo',
    beforePhotoAlt: 'Before',
    largePreviewAlt: 'Large Preview',
    errorTitle: 'Error',
    closeError: 'Close Error',
    sideBySide: 'Side by Side',
    compareSlider: 'Compare Slider',
    originalPhotoAlt: 'Original Photo',
    restoredPhotoAlt: 'Restored Photo',
    insufficientCredits: 'Insufficient credits. Please recharge your credits first.',
    loginRequired: 'Please log in first to use the photo restoration feature.',
    serviceUnavailable: 'Service temporarily unavailable',
    serviceUnavailableSuggestion: 'Please try again later or switch to another model',
    // Model names
    modelArkSDK: 'Ark SDK',
    modelReplicate: 'Replicate',
    // Model descriptions
    arkSDKDesc: 'Ark SDK: Doubao official AI model, high color reproduction, more natural details',
    replicateDesc: 'Replicate: Open source model, faster response speed',
    modelSwitchSuggestion: 'We suggest switching to another model and trying again',
  },
  // Passport photo page
  passportPhoto: {
    title: 'Generate Your Standard ID Photo',
    selectSize: 'ID Photo Size',
    selectBackground: 'Background Color',
    selectClothing: 'Clothing Style',
    selectModel: 'Generation Model',
    uploadPhoto: 'Upload Photo',
    currentUsedModel: 'Current Model Used',
    insufficientCredits: 'Insufficient credits. Please recharge credits before generating ID photos.',
    loginRequired: 'Please log in first to use the ID photo generation feature.',
    serviceUnavailable: 'Service temporarily unavailable',
    serviceUnavailableSuggestion: 'Please try again later or switch to another model',
    originalImage: 'Original Image',
    originalImageLoadFailed: 'Original image load failed',
    uploadedPhoto: 'Uploaded Photo',
    originalPhoto: 'Original Photo',
    generatedPhotoAlt: 'Generated ID Photo',
    errorTitle: 'Error',
    closeError: 'Close Error',
    generate: 'Generate ID Photo',
    loading: 'Generating...',
    fileSizeExceeded: 'Image size cannot exceed 20MB',
    uploadNewPhoto: 'Upload New Photo',
    regenerate: 'Regenerate',
    download: 'Download ID Photo',
    customSize: 'Custom Size',
    customBackground: 'Custom Background Color',
    generatedPhoto: 'Generated ID Photo',
    // Size options
    size1Inch: '1 inch',
    size2Inch: '2 inch',
    sizePassport: 'Passport',
    sizeCustom: 'Custom',
    // Background colors
    bgWhite: 'White',
    bgBlue: 'Blue',
    bgRed: 'Red',
    bgCustom: 'Custom',
    // Clothing styles
    clothingFormalShirt: 'Formal Shirt',
    clothingSuit: 'Suit',
    clothingCasual: 'Casual',
    // Model names
    modelArkSDK: 'Ark SDK',
    modelReplicate: 'Replicate',
    // Model descriptions
    arkSDKDesc: 'Ark SDK: Doubao official AI model, high color reproduction, more natural portrait details',
    replicateDesc: 'Replicate: Third-party open-source model, faster response speed, suitable for simple ID photo generation',
    modelSwitchSuggestion: 'We suggest switching to another model and trying again',
  },
  // Common
  common: {
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    chinese: '中文',
    english: 'English',
    uploadInstruction: 'Please upload your photo here',
    uploadFormat: 'Supports JPG, PNG formats, or drag and drop images below',
    poweredBy: 'Powered by',
    and: 'and',
    createdBy: 'Created by',
    contactUs: 'Contact us',
  },
  // Legal
  legal: {
    privacyPolicy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated',
      sections: {
        introduction: {
          title: '1. Introduction',
          content: 'Blue Star Studio ("we", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information. By using our services, you agree to the terms of this policy.',
        },
        dataCollection: {
          title: '2. Data We Collect',
          types: {
            title: 'We collect the following types of data:',
            photos: 'Photos you upload (including facial information)',
            accountInfo: 'Account information (email address, password hash)',
            paymentInfo: 'Payment information (processed through Stripe, we do not store full credit card information)',
            usageData: 'Usage data (generation count, models used, etc.)',
          },
          sensitiveNote: 'Important: Your uploaded photos are sensitive personal information. We promise not to use them for AI model training or share them with third parties.',
        },
        thirdParty: {
          title: '3. Third-Party Services',
          supabase: 'Used for user authentication and data storage. Your account information and photos are stored on Supabase servers.',
          stripe: 'Used for payment processing. Stripe handles all payment information; we do not store your full credit card information.',
          vercel: 'Used for hosting our website and API. Vercel may collect access logs and performance data.',
          bytescale: 'Used for image upload and storage. Your uploaded photos are stored through Bytescale.',
        },
        dataUsage: {
          title: '4. Purpose of Data Use',
          purpose1: 'Providing photo restoration and ID photo generation services',
          purpose2: 'Processing payments and credit management',
          purpose3: 'Improving service quality and user experience',
          noTraining: 'We do not use your photos to train AI models, nor do we use your photos for any commercial purposes.',
        },
        dataRetention: {
          title: '5. Data Retention and Deletion',
          automaticDeletion: 'Your uploaded photos are automatically deleted after generation is complete, with a maximum retention period of 7 days.',
          userDeletion: 'You can delete your photos and account at any time through account settings. After deletion, your data will be completely removed from our systems within 30 days.',
        },
        userRights: {
          title: '6. Your Rights',
          rights: 'Rights',
          access: 'Right of Access: You can request access to your personal data we hold',
          deletion: 'Right of Deletion: You can request deletion of your personal data',
          portability: 'Right of Data Portability: You can request export of your data in a structured format',
          objection: 'Right to Object: You can object to our processing of your personal data',
          restriction: 'Right to Restriction: You can request restriction of our processing of your personal data',
          ccpa: 'Under CCPA (California Consumer Privacy Act), you have the right to request that we do not sell your personal information. We do not sell your personal information.',
        },
        jurisdiction: {
          title: '7. Applicable Law',
          content: 'This Privacy Policy is governed by the laws of your country/region. If you are in the EU, GDPR applies; if you are in California, CCPA applies.',
        },
        contact: {
          title: '8. Contact Us',
          content: 'If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:',
          email: 'Email',
        },
      },
    },
    termsOfService: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated',
      sections: {
        acceptance: {
          title: '1. Acceptance of Terms',
          content: 'By using Blue Star Studio services, you agree to comply with these Terms of Service. If you do not agree to these terms, please do not use our services.',
        },
        userResponsibility: {
          title: '2. User Responsibilities',
          ownPhotos: 'You are responsible for all photos you upload and must ensure you have the right to use these photos',
          noIllegal: 'You must not upload illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, pornographic, or otherwise objectionable content',
          noThirdParty: 'You must not create ID photos for others unless you have explicit authorization',
        },
        serviceDescription: {
          title: '3. Service Description',
          content: 'We provide AI-powered photo restoration and ID photo generation services. The service uses third-party AI models (Ark SDK and Replicate) to process your photos.',
          noGuarantee: 'Important: We do not guarantee that generated ID photos will be accepted by any official authority. Different authorities may have different requirements for ID photos; please confirm specific requirements before use.',
        },
        payment: {
          title: '4. Payment and Usage Limits',
          credits: 'The service uses a credit system; each photo generation costs 1 credit',
          refund: 'Credits are generally non-refundable after purchase, unless service is unavailable due to technical failure',
          currency: 'All prices are displayed in USD; actual payment currency may vary by region',
        },
        intellectualProperty: {
          title: '5. Intellectual Property',
          userOwnership: 'Photos you upload belong to you. You retain all rights to original photos.',
          platformOwnership: 'Generated photos belong to you. Our platform, code, and design belong to us.',
        },
        disclaimer: {
          title: '6. Disclaimer',
          content: 'We make no express or implied warranties regarding AI-generated results. The service is provided "as is" without warranty of accuracy, completeness, or suitability.',
        },
        termination: {
          title: '7. Termination and Suspension',
          content: 'We reserve the right to terminate or suspend your account for violation of these terms. If your account is suspended, you will not be able to access your data, but we will provide data export options as required by GDPR.',
        },
        changes: {
          title: '8. Changes to Terms',
          content: 'We reserve the right to modify these Terms of Service at any time. Significant changes will be notified via email or website notice. Continued use of the service constitutes acceptance of modified terms.',
        },
        contact: {
          title: '9. Contact Us',
          content: 'If you have any questions about these Terms of Service, please contact us at:',
          email: 'Email',
        },
      },
    },
    refundPolicy: {
      title: 'Refund Policy',
      lastUpdated: 'Last Updated',
      sections: {
        digitalContent: {
          title: '1. Digital Content Policy',
          content: 'Since we provide digital services (photo processing and generation), digital content is generally non-refundable under the laws of most jurisdictions.',
          note: 'Important: Credits are generally non-refundable after purchase, unless service is completely unavailable due to our technical failure.',
        },
        refundEligibility: {
          title: '2. Refund Eligibility',
          technical: 'Service unavailable due to our technical failure',
          duplicate: 'Duplicate charges due to system error',
          unauthorized: 'Unauthorized transactions',
        },
        subscription: {
          title: '3. Subscriptions and Auto-Renewal',
          autoRenewal: 'If you purchase a subscription service, the subscription will auto-renew unless you cancel.',
          cancellation: 'You can cancel your subscription at any time through the Stripe Customer Portal. After cancellation, you will continue to enjoy the service until the end of the current billing cycle.',
          portalLink: 'Access Stripe Customer Portal to manage subscription',
        },
        processingTime: {
          title: '4. Processing Time',
          content: 'If your refund request is approved, the refund will be processed within 5-10 business days. The refund will be returned to your original payment method.',
        },
        europeanRights: {
          title: '5. European Consumer Rights',
          content: 'Under EU consumer protection law, if you are in the EU, you may have the right to cancel digital content purchases within 14 days and receive a refund, provided you have not started using the service. Once you use the service to generate photos, this right expires.',
        },
        contact: {
          title: '6. Contact Us',
          content: 'To request a refund, please contact us at:',
          email: 'Email',
        },
      },
    },
    cookiePolicy: {
      title: 'Cookie Policy',
      lastUpdated: 'Last Updated',
      sections: {
        whatAreCookies: {
          title: '1. What Are Cookies',
          content: 'Cookies are small text files stored on your device that improve your browsing experience and website functionality.',
        },
        types: {
          title: '2. Types of Cookies We Use',
          necessary: {
            title: 'Necessary Cookies',
            content: 'These cookies are essential for the website to function properly and cannot be disabled.',
            supabase: 'Used for user authentication and session management',
          },
          functional: {
            title: 'Functional Cookies',
            content: 'These cookies are used to remember your preferences (such as language and theme).',
          },
        },
        thirdParty: {
          title: '3. Third-Party Cookies',
          supabase: 'Supabase uses cookies for user authentication',
          stripe: 'Stripe uses cookies for payment processing and fraud prevention',
        },
        management: {
          title: '4. Cookie Management',
          content: 'You can manage cookies through your browser settings. Please note that disabling certain cookies may affect website functionality.',
          note: 'EU Users: On first visit, we display a cookie consent banner where you can choose to accept or reject non-essential cookies.',
        },
        contact: {
          title: '5. Contact Us',
          content: 'If you have any questions about our Cookie Policy, please contact us at:',
          email: 'Email',
        },
      },
    },
    dataProcessing: {
      title: 'Data Processing Agreement',
      lastUpdated: 'Last Updated',
      sections: {
        roles: {
          title: '1. Role Definitions',
          controller: 'Blue Star Studio is the "Data Controller" responsible for determining the purposes and means of processing your personal data.',
          processors: 'The following third-party services are "Data Processors" that process your data on our behalf:',
        },
        processors: {
          title: '2. Data Processors',
          supabase: {
            data: 'Data Processed: User account information, authentication tokens, uploaded photos',
            purpose: 'Processing Purpose: User authentication, data storage, session management',
            location: 'Data Processing Location: May include EU and US',
          },
          stripe: {
            data: 'Data Processed: Payment information, transaction records',
            purpose: 'Processing Purpose: Payment processing, fraud prevention',
            location: 'Data Processing Location: Global (PCI DSS compliant)',
          },
          vercel: {
            data: 'Data Processed: Access logs, performance data',
            purpose: 'Processing Purpose: Website hosting, API services',
            location: 'Data Processing Location: Global CDN',
          },
          bytescale: {
            data: 'Data Processed: Uploaded photos',
            purpose: 'Processing Purpose: Image storage and delivery',
            location: 'Data Processing Location: Global CDN',
          },
        },
        safeguards: {
          title: '3. Data Protection Safeguards',
          content: 'All data processors have signed data processing agreements and implemented appropriate technical and organizational measures to protect your data. We regularly review data processors\' security practices.',
        },
        contact: {
          title: '4. Contact Us',
          content: 'If you have any questions about data processing, please contact us at:',
          email: 'Email',
        },
      },
    },
    copyright: {
      title: 'Copyright Statement',
      lastUpdated: 'Last Updated',
      sections: {
        userContent: {
          title: '1. User Content Ownership',
          ownership: 'All photos you upload belong to you. You retain full copyright and ownership of original photos.',
          license: 'By uploading photos, you grant us a limited, non-exclusive license solely for processing and generating the results you request. This license terminates upon completion of photo processing.',
        },
        platformContent: {
          title: '2. Platform Content Ownership',
          ownership: 'The design, code, trademarks, and all other content of this website belong to Blue Star Studio and are protected by copyright law.',
        },
        noTraining: {
          title: '3. Not Used for AI Training',
          content: 'We promise not to use your photos to train any AI models. Your photos are used solely to generate the results you request and for no other purpose.',
        },
        noSharing: {
          title: '4. Not Shared with Third Parties',
          content: 'We do not share your photos with third parties unless required by law or explicitly authorized by you.',
        },
        contact: {
          title: '5. Contact Us',
          content: 'If you have any questions about copyright, please contact us at:',
          email: 'Email',
        },
      },
    },
    contact: {
      title: 'Contact Us / Legal Information',
      sections: {
        company: {
          title: '1. Company Information',
          name: 'Company Name',
          value: 'Blue Star Studio',
          registered: 'Registered Location',
          location: 'China',
        },
        contactInfo: {
          title: '2. Contact Information',
          general: 'General Inquiries',
          privacy: 'Privacy Related',
          legal: 'Legal Related',
          refunds: 'Refund Related',
        },
        dataProtection: {
          title: '3. Data Protection Officer',
          officer: 'Data Protection Officer',
          email: 'Email',
        },
        gdprRights: {
          title: '4. GDPR Rights Requests',
          content: 'Under GDPR, you have the right to:',
          right1: 'Access your personal data',
          right2: 'Delete your personal data',
          right3: 'Correct inaccurate personal data',
          right4: 'Restrict our processing of your personal data',
          right5: 'Object to our processing of your personal data',
          responseTime: 'We will respond to your request within 30 days of receipt.',
        },
        responseTime: {
          title: '5. Response Time',
          content: 'We strive to respond to your inquiries within 5 business days. For complex legal or data protection requests, it may take up to 30 days.',
        },
      },
    },
  },
};

