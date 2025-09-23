import { off } from 'process';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && ['en', 'nl'].includes(savedLanguage) ? savedLanguage : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key; // Return the key if translation is missing
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // Navigation
    nav: {
      phones: 'Phones',
      accessories: 'Accessories',
      repairs: 'Repairs',
      about: 'About',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      dashboard: 'Dashboard',
      admin: 'Admin',
      repairManagement: 'Repair Management',
      accessoriesManagement: 'Accessories Management',
      tradeInManagement: 'Trade-In Management',
      bannerManagement: 'Banner Management',
      search: 'Search',
      cart: 'Cart',
      wishlist: 'Wishlist',
      tradeIn: 'Trade In',
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      home: 'Home',
      price: 'Price',
      total: 'Total',
      quantity: 'Quantity',
      description: 'Description',
      category: 'Category',
      brand: 'Brand',
      model: 'Model',
      condition: 'Condition',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      zipCode: 'Zip Code',
      country: 'Country',
      device: 'Device',
      clear: 'Clear',
    },
    
    // Homepage
    home: {
      hero: {
        title: 'Professional Phone Repair Services',
        subtitle: 'Expert repairs for all smartphone brands with warranty guarantee',
        description: 'Fast, reliable repairs and premium accessories. Certified technicians, genuine parts, and lifetime warranty on all repairs.',
        cta: 'Get Started',
        learnMore: 'Learn More',
      },
      features: {
        title: 'Why Choose Us',
        subtitle: 'Professional service with guaranteed results',
        description: 'We\'re committed to providing the best smartphone shopping experience with premium services and unmatched customer support.',
        fastRepair: {
          title: 'Fast Repair',
          description: 'Quick turnaround times for most repairs',
        },
        expertTechnicians: {
          title: 'Expert Technicians',
          description: 'Certified professionals with years of experience',
        },
        warranty: {
          title: 'Warranty',
          description: 'All repairs come with comprehensive warranty',
        },
        qualityParts: {
          title: 'Quality Parts',
          description: 'Only genuine and high-quality replacement parts',
        },
      },
      showcase: {
        title: 'Popular Services',
        subtitle: 'Most requested repair services',
        viewAll: 'View All',
      },
    },
    
    // Repairs
    repairs: {
      title: 'Repair Services',
      subtitle: 'Select your device and repair service',
      selectCategory: 'Select Category',
      selectBrand: 'Select Brand',
      selectModel: 'Select Model',
      selectPart: 'Select Part',
      bookAppointment: 'Book Appointment',
      readyToFix: 'Ready to Fix Your Phone?',
      readyToFixDescription: 'Get your device repaired by certified professionals. Book your repair appointment today or visit our store for immediate assistance.',
      findStore: 'Find Store Location',
      getQuote: 'Get a Quote',
      
      // Repair Services Section
      ourRepairServices: 'Our Repair',
      services: 'Services',
      servicesDescription: 'Professional repair services for all major smartphone brands with genuine parts and expert technicians.',
      
      // Service Types
      screenReplacement: 'Screen Replacement',
      screenReplacementDesc: 'Cracked or damaged screen? We replace with genuine OEM parts.',
      batteryReplacement: 'Battery Replacement',
      batteryReplacementDesc: 'Restore your phone\'s battery life with genuine battery replacements.',
      cameraRepair: 'Camera Repair',
      cameraRepairDesc: 'Fix blurry photos, broken lenses, and camera malfunctions.',
      speakerAudio: 'Speaker & Audio',
      speakerAudioDesc: 'Repair speakers, microphones, and audio-related issues.',
      connectivityIssues: 'Connectivity Issues',
      connectivityIssuesDesc: 'Fix WiFi, Bluetooth, and cellular connectivity problems.',
      waterDamage: 'Water Damage',
      waterDamageDesc: 'Professional water damage assessment and restoration services.',
      
      // Repair Process Section
      ourRepairProcess: 'Our Repair',
      process: 'Process',
      processDescription: 'Simple, transparent, and professional repair process designed to get your device back to perfect condition.',
      
      // Process Steps
      diagnosis: 'Diagnosis',
      diagnosisDesc: 'Free diagnostic to identify the exact issue with your device.',
      quote: 'Quote',
      quoteDesc: 'Transparent pricing with no hidden fees. Approve before we proceed.',
      repair: 'Repair',
      repairDesc: 'Expert repair using genuine parts and professional tools.',
      testing: 'Testing',
      testingDesc: 'Thorough quality testing to ensure everything works perfectly.',
      warranty: 'Warranty',
      warrantyDesc: '1-year warranty on parts and labor for your peace of mind.',
      
      // Repair Guarantees Section
      whyChooseOur: 'Why Choose Our',
      repairService: 'Repair Service',
      
      // Guarantees
      oneYearWarranty: '1-Year Warranty',
      oneYearWarrantyDesc: 'All repairs come with comprehensive 1-year warranty coverage.',
      genuineParts: 'Genuine Parts',
      genuinePartsDesc: 'We only use authentic OEM parts for lasting quality and performance.',
      fastService: 'Fast Service',
      fastServiceDesc: 'Most repairs completed within 30-60 minutes while you wait.',
      expertTechnicians: 'Expert Technicians',
      expertTechniciansDesc: 'Certified professionals with years of experience in mobile repairs.',
      
      // Contact Info
      storeHours: 'Store Hours',
      contact: 'Contact',
      location: 'Location',
      monFri: 'Mon-Fri: 9AM-7PM',
      satSun: 'Sat-Sun: 10AM-6PM',
      phone: '+1 (555) 123-4567',
      email: 'repairs@phonehub.com',
      address1: '123 Tech Street',
      address2: 'Mobile City, MC 12345',
      
      // Pricing
      from: 'From',
      
      // Quality types
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      
      // Common repair parts
      parts: {
        screen: 'Screen',
        display: 'Display',
        battery: 'Battery',
        camera: 'Camera',
        speaker: 'Speaker',
        microphone: 'Microphone',
        charging: 'Charging Port',
        backCover: 'Back Cover',
        homeButton: 'Home Button',
        powerButton: 'Power Button',
        volumeButton: 'Volume Button',
      },
    },
    
    // Booking
    booking: {
      title: 'Book Your Repair',
      selectedService: 'Selected Repair Service',
      deviceServiceSelection: 'Device & Service Selection',
      deviceCategory: 'Device Category',
      deviceBrand: 'Device Brand',
      deviceModel: 'Device Model',
      repairService: 'Repair Service',
      describeIssue: 'Describe the Issue',
      selectDateTime: 'Select Date & Time',
      appointmentDate: 'Appointment Date',
      appointmentTime: 'Appointment Time',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      confirmBooking: 'Confirm Booking',
      aftermarket: 'Aftermarket',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      price: 'Price',
      selectDeviceCategory: 'Select Device Category',
      selectDeviceBrand: 'Select Device Brand',
      selectDeviceModel: 'Select Device Model',
      selectDevicePart: 'Select Device Part',
      selectService: 'Select Service',
      selectQuality: 'Select Quality',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      describeProblemPlaceholder: 'Describe the Problem',
      chooseQualityOption: 'Choose Quality Option',
      "noQualityOption": "No Quality Option",
      services: 'services',
      noServicesAvailable: 'No services available for selected device',
      from: 'From',
      availableQualityOptions: 'Available Quality Options',
      original: 'Original',
      copy: 'Copy',
      oem: 'OEM',
      selectTimeSlot: 'Select a time slot',
      firstNamePlaceholder: 'John',
      lastNamePlaceholder: 'Doe',
      emailPlaceholder: 'john.doe@example.com',
      phonePlaceholder: '+1 (555) 123-4567',
      quality: 'Quality',
      authenticationRequired: 'Authentication Required',
      signInToBook: 'Please sign in to book a repair',
      bookingConfirmed: 'Booking Confirmed!',
      appointmentScheduled: 'Your repair appointment has been scheduled for {{date}} at {{time}}.',
      bookingFailed: 'Booking Failed',
      bookingErrorDescription: 'There was an error submitting your booking. Please try again.',
      contactInformation: 'Contact Information',
      bookingSummary: 'Booking Summary',
      device: 'Device',
    },
    
    // Homepage/ProductShowcase
    homepage: {
      liveInventory: 'Live Inventory',
      featuredProducts: 'Featured Products',
      realProducts: 'Real Products',
      bestSelling: 'Best Selling',
      andServices: '& Services',
      liveDataDescription: 'Live data from our inventory: {{accessories}} featured accessories, {{brands}} device brands, and {{repairs}} completed repairs.',
      fallbackDescription: 'Discover our handpicked selection of premium smartphones and accessories, featuring the latest technology and unbeatable prices.',
      readyToGetStarted: 'Ready to Get Started?',
      exploreCollection: 'Explore Our Complete Collection',
      exploreDescription: 'From premium accessories to expert repair services, we have everything you need to enhance your mobile experience.',
      browseAccessories: 'Browse Accessories',
      bookRepair: 'Book Repair',
    },
    
    // Search Modal
    search: {
      placeholder: 'Search devices, parts, accessories...',
      clear: 'Clear',
      recentSearches: 'Recent Searches',
      popularSearches: 'Popular Searches',
      noResults: 'No results found',
      noResultsDescription: 'Try adjusting your search terms or browse our categories.',
      loading: 'Searching...',
      searchResults: 'Search Results',
      viewAll: 'View All',
      devices: 'Devices',
      parts: 'Parts',
      accessories: 'Accessories',
      removeAll: 'Remove All',
    },
    
    // Quote Request Modal
    quote: {
      title: 'Request Quote',
      description: 'Tell us about your device and the issue you\'re experiencing. We\'ll provide you with a detailed quote within 24 hours.',
      fullName: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number (Optional)',
      phonePlaceholder: '+1 (555) 123-4567',
      deviceInfo: 'Device Information',
      deviceInfoPlaceholder: 'e.g., iPhone 14 Pro Max, Samsung Galaxy S23 Ultra',
      issueDescription: 'Issue Description',
      issuePlaceholder: 'Please describe the problem in detail. Include any relevant information about when it started, what happened, etc.',
      cancel: 'Cancel',
      requestQuote: 'Request Quote',
      submitting: 'Submitting...',
      authenticationRequired: 'Authentication Required',
      signInToRequest: 'Please sign in to request a quote.',
      quoteSubmitted: 'Quote Request Submitted!',
      quoteSubmittedDescription: 'We\'ll review your request and send you a quote within 24 hours.',
      error: 'Error',
      errorDescription: 'Failed to submit quote request. Please try again.',
    },
    
    // Accessories
    accessories: {
      title: 'Accessories',
      subtitle: 'Premium accessories for your devices',
      filters: 'Filters',
      sortBy: 'Sort by',
      priceRange: 'Price Range',
      viewDetails: 'View Details',
      filterDescription: 'Filter and search accessories',
      applyFilters: 'Apply Filters',
      searchResults: 'Search Results for "{{query}}"',
      allProducts: 'All Products',
      productsFound: '{{count}} products found',
      filtered: 'filtered',
      featuredOnly: 'Featured Products Only',
      mostPopular: 'Most Popular',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      highestRated: 'Highest Rated',
      newestFirst: 'Newest First',
      // AccessoryProduct page
      description: 'Description',
      keyFeatures: 'Key Features',
      compatibility: 'Compatibility',
      stockStatus: 'Stock Status',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      quantity: 'Quantity',
      addToCart: 'Add to Cart',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      readMore: 'Read more',
      readLess: 'Read less',
      relatedProducts: 'Related Products',
      reviews: 'Reviews',
      rating: 'Rating',
      warranty: 'Warranty',
      specifications: 'Specifications',
      shipping: 'Shipping',
      freeShipping: 'Free Shipping',
      estimatedDelivery: 'Estimated Delivery',
      returnPolicy: 'Return Policy',
      daysReturn: '{{days}} days return',
      brand: 'Brand',
      category: 'Category',
      sku: 'SKU',
      weight: 'Weight',
      dimensions: 'Dimensions',
      color: 'Color',
      material: 'Material',
      model: 'Model',
      year: 'Year',
      condition: 'Condition',
      new: 'New',
      refurbished: 'Refurbished',
      used: 'Used',
      originalPrice: 'Original Price',
      currentPrice: 'Current Price',
      discount: 'Discount',
      save: 'Save',
      youSave: 'You save',
      limitedTime: 'Limited Time Offer',
      bestSeller: 'Best Seller',
      featured: 'Featured',
      newArrival: 'New Arrival',
      sale: 'Sale',
      outOfStockMessage: 'This item is currently out of stock',
      lowStockMessage: 'Only {{count}} left in stock',
      addToCartSuccess: 'Added to cart successfully',
      addToWishlistSuccess: 'Added to wishlist',
      removeFromWishlistSuccess: 'Removed from wishlist',
      loginRequired: 'Please log in to add items to cart',
      loginRequiredWishlist: 'Please log in to manage wishlist',
      productNotFound: 'Product not found',
      invalidProduct: 'Invalid product',
      inCart: 'In Cart',
      quantityInCart: 'Quantity in cart:',
      adding: 'Adding...',
      goToCartCheckout: 'Go to Cart & Checkout',
      inCartLabel: 'in cart',
      viewCart: 'View Cart',
      buyNow: 'Buy Now',
      off: 'off',
      available: 'available',
      sameDayShipping: 'Get it by tomorrow with same-day shipping',
      monthWarranty: 'Month Warranty',
      fullManufacturerWarranty: 'Full manufacturer warranty included',
      shippingReturns: 'Shipping & Returns',
      noReviews: 'No reviews yet',
      beFirstToReview: 'Be the first to review this product',
      shippingInformation: 'Shipping Information',
      expressShipping: 'Express shipping available (next business day)',
      trackingInformation: 'Tracking information provided',
      freeReturns: 'Free returns on all orders',
      returnShippingLabel: 'Prepaid return shipping label included',
      refundProcessed: 'Refunds processed within 3-5 business days',
      returnWindow: '30-day return window for unused items',
      viewAll: 'View All',
    },
    
    // Cart
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyDescription: 'Add some accessories to get started!',
      continueShopping: 'Continue Shopping',
      checkout: 'Checkout',
      removeItem: 'Remove Item',
      updateQuantity: 'Update Quantity',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      itemsInCart: '{{count}} items in your cart',
    },
    
    // Wishlist
    wishlist: {
      title: 'Wishlist',
      empty: 'Your wishlist is empty',
      emptyDescription: 'Start adding accessories to your wishlist!',
      addItems: 'Add items to your wishlist',
      moveToCart: 'Move to Cart',
      itemsInWishlist: '{{count}} items in your wishlist',
    },
    
    // Trade-In
    tradeIn: {
      title: 'Trade In Your',
      subtitle: 'Old iPhone',
      program: 'iPhone Trade-In Program',
      description: 'Get real-time market-based trade-in values for your iPhone. Our dynamic pricing algorithm considers market demand, supply levels, seasonal factors, and competitive pricing for the best value.',
      selectDevice: 'Select Your Device',
      selectStorage: 'Select Storage',
      selectCondition: 'Select Condition',
      estimatedValue: 'Estimated Value',
      getQuote: 'Get Trade-In Quote',
      submitRequest: 'Submit Trade-In Request',
      marketConditions: 'Market Conditions',
      timeDecay: 'Time Decay',
      seasonalAdjustment: 'Seasonal Adjustment',
      supplyDemand: 'Supply & Demand',
      competitivePricing: 'Competitive Pricing',
    },
    
   
    
    // Auth
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signInSuccess: 'Welcome back!',
      signUpSuccess: 'Account created successfully!',
      description: 'Sign in to your account or create a new one',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      passwordCreatePlaceholder: 'Create a password',
      fullNamePlaceholder: 'Enter your full name',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      signInFailed: 'Sign in failed',
      signUpFailed: 'Sign up failed',
      signInSuccessMessage: 'You\'ve been signed in successfully.',
      signUpSuccessMessage: 'Please check your email to verify your account.',
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      recentBookings: 'Recent Bookings',
      upcomingAppointments: 'Upcoming Appointments',
      repairHistory: 'Repair History',
      viewAll: 'View All',
      overview: 'Overview',
      allBookings: 'All Bookings',
      quotes: 'Quotes',
      analytics: 'Analytics',
      myBookings: 'My Bookings',
      totalBookings: 'Total Bookings',
      totalRevenue: 'Total Revenue',
      completionRate: 'Completion Rate',
    },
    
    // Admin
    admin: {
      title: 'Admin Dashboard',
      manageRepairs: 'Manage Repairs',
      manageAccessories: 'Manage Accessories',
      accessoriesManagement: 'Accessories Management',
      manageTradeIn: 'Manage Trade-In',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
      repairManagement: 'Repair Services Management',
      repairManagementDescription: 'Manage your custom repair items, services, and pricing',
      deviceManagement: 'Device Management',
      addLegacyItem: 'Add Legacy Item',
      manageLegacyItems: 'Manage Legacy Items',
    },
    
    // Footer
    footer: {
      company: 'Company',
      services: 'Services',
      support: 'Support',
      legal: 'Legal',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      subscribe: 'Subscribe',
      allRightsReserved: 'All rights reserved',
      description: 'Your trusted destination for the latest smartphones, accessories, and expert mobile solutions. Quality products, competitive prices, exceptional service.',
      contact: 'Contact Us',
      shipping: 'Shipping Info',
      returns: 'Returns & Exchanges',
      faq: 'FAQ',
      warranty: 'Warranty',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
    },
    
    // Error messages
    errors: {
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      networkError: 'Network error. Please check your connection',
      unauthorized: 'You are not authorized to perform this action',
      notFound: 'The requested resource was not found',
      validationError: 'Please check your input and try again',
      pageNotFound: 'Oops! Page not found',
    },

    // SEO Content
    seo: {
      siteName: 'Blueprint Phone Zen',
      tagline: 'Premium Phone Repair & Accessories Store',
      
      // Page titles
      titles: {
        home: 'Home',
        repairs: 'Phone Repair Services',
        accessories: 'Phone Accessories',
        dashboard: 'Dashboard',
        auth: 'Login & Registration',
        search: 'Search Results',
        categories: 'Device Repair Services',
        brands: 'Brand Repair Services',
        models: 'Device Model Repairs',
        parts: 'Component Repair Services',
      },
      
      // Meta descriptions
      descriptions: {
        home: 'Expert phone repair services and premium mobile accessories. Fast repairs, genuine parts, competitive prices with warranty coverage.',
        repairs: 'Professional phone repair services for all major brands. Screen replacement, battery repair, water damage recovery, and more with warranty.',
        accessories: 'Premium phone accessories including cases, chargers, screen protectors, headphones and more. Compatible with iPhone, Samsung, Google Pixel.',
        dashboard: 'Manage your repair bookings, track order status, and access your account information.',
        auth: 'Sign in to your account or create a new account to book repair services and track your orders.',
        search: 'Find the perfect phone repair service or accessory. Search our comprehensive catalog of devices and services.',
        categories: 'Choose your device type for professional repair services. Smartphones, tablets, laptops, and more with expert technicians.',
        brands: 'Professional repair services for all major device brands. Genuine parts, expert technicians, warranty coverage.',
        models: 'Specific repair services for your exact device model. Expert diagnosis, genuine parts, fast turnaround.',
        parts: 'Professional component repair and replacement services. Screen, battery, camera, speaker repairs with warranty.',
      },
      
      // Keywords
      keywords: {
        base: 'phone repair, mobile repair, device repair service',
        home: 'phone repair, mobile repair, iPhone repair, Samsung repair, screen replacement, battery replacement',
        repairs: 'phone repair, screen replacement, battery replacement, iPhone repair, Samsung repair, mobile repair service',
        accessories: 'phone accessories, phone cases, screen protectors, chargers, headphones, mobile accessories',
        categories: 'device repair, smartphone repair, tablet repair, laptop repair, mobile device service',
        brands: 'brand repair service, authorized repair, genuine parts, warranty repair',
        models: 'model repair, device specific repair, exact model service, professional diagnosis',
        parts: 'component repair, part replacement, screen repair, battery replacement, camera fix',
      },
      
      // Dynamic content templates
      templates: {
        categoryTitle: '{{category}} Repair Services | Phone Repair Services',
        categoryDescription: 'Expert {{category}} repair services. Choose from top brands with genuine parts and warranty coverage.',
        brandTitle: '{{brand}} {{category}} Repair | Professional Service',
        brandDescription: 'Professional {{brand}} {{category}} repair services. All models supported with genuine parts and expert technicians.',
        modelTitle: '{{brand}} {{model}} Parts & Repair Services',
        modelDescription: '{{brand}} {{model}} repair services. Screen replacement, battery repair, camera fix, and more with genuine parts.',
        serviceTitle: '{{brand}} {{model}} {{service}} Repair Service',
        serviceDescription: 'Professional {{brand}} {{model}} {{service}} repair service. Expert technicians, genuine parts, fast turnaround, warranty included.',
        accessoryTitle: '{{name}} | {{brand}} {{category}}',
        accessoryDescription: '{{name}} - Premium mobile accessory from {{brand}}. High quality, competitive prices, fast shipping.',
      },
      
      // Service types for SEO
      serviceTypes: {
        screen: 'Screen Replacement',
        battery: 'Battery Replacement',
        camera: 'Camera Repair',
        speaker: 'Speaker Repair',
        microphone: 'Microphone Repair',
        charging: 'Charging Port Repair',
        water: 'Water Damage Recovery',
        software: 'Software Repair',
        unlock: 'Device Unlocking',
        diagnostic: 'Diagnostic Service',
      },
    },

    // Banner Content
    banner: {
      promotion: {
        title: '50% OFF Screen Repairs',
        subtitle: 'Limited Time Offer',
        description: 'Professional screen replacement for all major phone brands. Book now and save big!',
        buttonText: 'Book Repair',
      },
      feature: {
        title: 'New iPhone 15 Accessories',
        subtitle: 'Just Arrived',
        description: 'Premium cases, wireless chargers, and screen protectors for the latest iPhone.',
        buttonText: 'Shop Now',
      },
      announcement: {
        title: 'Extended Warranty Available',
        subtitle: 'Peace of Mind',
        description: '6-month warranty on all repair services. Professional quality guaranteed.',
        buttonText: 'Learn More',
      },
      seasonal: {
        title: 'Holiday Special Deals',
        subtitle: 'Gift Your Loved Ones',
        description: 'Premium phone accessories at unbeatable prices. Perfect gifts for tech lovers!',
        buttonText: 'Explore Gifts',
      },
    },
  },
  
  nl: {
    // Navigation
    nav: {
      phones: 'Telefoons',
      accessories: 'Accessoires',
      repairs: 'Reparaties',
      about: 'Over Ons',
      signIn: 'Inloggen',
      signOut: 'Uitloggen',
      dashboard: 'Dashboard',
      admin: 'Admin',
      repairManagement: 'Reparatiebeheer',
      accessoriesManagement: 'Accessoirebeheer',
      tradeInManagement: 'Inruilbeheer',
      bannerManagement: 'Bannerbeheer',
      search: 'Zoeken',
      cart: 'Winkelwagen',
      wishlist: 'Verlanglijst',
      tradeIn: 'Inruil',
    },
    
    // Common
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      cancel: 'Annuleren',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      add: 'Toevoegen',
      remove: 'Verwijderen',
      close: 'Sluiten',
      next: 'Volgende',
      previous: 'Vorige',
      submit: 'Verzenden',
      confirm: 'Bevestigen',
      yes: 'Ja',
      no: 'Nee',
      back: 'Terug',
      home: 'Home',
      price: 'Prijs',
      total: 'Totaal',
      quantity: 'Aantal',
      description: 'Beschrijving',
      category: 'Categorie',
      brand: 'Merk',
      model: 'Model',
      condition: 'Conditie',
      status: 'Status',
      date: 'Datum',
      time: 'Tijd',
      name: 'Naam',
      email: 'E-mail',
      phone: 'Telefoon',
      address: 'Adres',
      city: 'Stad',
      zipCode: 'Postcode',
      country: 'Land',
      device: 'Apparaat',
      clear: 'Wissen',
    },
    
    // Homepage
    home: {
      hero: {
        title: 'Professionele Telefoonreparaties',
        subtitle: 'Expert reparaties voor alle smartphone merken met garantie',
        description: 'Snelle, betrouwbare reparaties en premium accessoires. Gecertificeerde technici, originele onderdelen en levenslange garantie op alle reparaties.',
        cta: 'Aan de Slag',
        learnMore: 'Meer Informatie',
      },
      features: {
        title: 'Waarom Kiezen voor Ons',
        subtitle: 'Professionele service met gegarandeerde resultaten',
        description: 'We zijn toegewijd aan het bieden van de beste smartphone winkelervaring met premium diensten en ongeëvenaarde klantenservice.',
        fastRepair: {
          title: 'Snelle Reparatie',
          description: 'Snelle doorlooptijden voor de meeste reparaties',
        },
        expertTechnicians: {
          title: 'Expert Technici',
          description: 'Gecertificeerde professionals met jarenlange ervaring',
        },
        warranty: {
          title: 'Garantie',
          description: 'Alle reparaties komen met uitgebreide garantie',
        },
        qualityParts: {
          title: 'Kwaliteitsonderdelen',
          description: 'Alleen originele en hoogwaardige vervangingsonderdelen',
        },
      },
      showcase: {
        title: 'Populaire Diensten',
        subtitle: 'Meest gevraagde reparatiediensten',
        viewAll: 'Alles Bekijken',
      },
    },
    
    // Repairs
    repairs: {
      title: 'Reparatiediensten',
      subtitle: 'Selecteer uw apparaat en reparatieservice',
      selectCategory: 'Selecteer Categorie',
      selectBrand: 'Selecteer Merk',
      selectModel: 'Selecteer Model',
      selectPart: 'Selecteer Onderdeel',
      bookAppointment: 'Afspraak Maken',
      readyToFix: 'Klaar om Uw Telefoon te Laten Repareren?',
      readyToFixDescription: 'Laat uw apparaat repareren door gecertificeerde professionals. Maak vandaag nog een reparatieafspraak of bezoek onze winkel voor directe hulp.',
      findStore: 'Vind Winkel Locatie',
      getQuote: 'Offerte Aanvragen',
      
      // Repair Services Section
      ourRepairServices: 'Onze Reparatie',
      services: 'Diensten',
      servicesDescription: 'Professionele reparatiediensten voor alle grote smartphone merken met originele onderdelen en expert technici.',
      
      // Service Types
      screenReplacement: 'Scherm Vervanging',
      screenReplacementDesc: 'Gebarsten of beschadigd scherm? We vervangen met originele OEM onderdelen.',
      batteryReplacement: 'Batterij Vervanging',
      batteryReplacementDesc: 'Herstel de batterijduur van uw telefoon met originele batterij vervangingen.',
      cameraRepair: 'Camera Reparatie',
      cameraRepairDesc: 'Repareer wazige foto\'s, gebroken lenzen en camera storingen.',
      speakerAudio: 'Speaker & Audio',
      speakerAudioDesc: 'Repareer speakers, microfoons en audio-gerelateerde problemen.',
      connectivityIssues: 'Connectiviteitsproblemen',
      connectivityIssuesDesc: 'Repareer WiFi, Bluetooth en mobiele connectiviteitsproblemen.',
      waterDamage: 'Waterschaade',
      waterDamageDesc: 'Professionele waterschade beoordeling en herstel diensten.',
      
      // Repair Process Section
      ourRepairProcess: 'Ons Reparatie',
      process: 'Proces',
      processDescription: 'Eenvoudig, transparant en professioneel reparatieproces ontworpen om uw apparaat terug te brengen naar perfecte staat.',
      
      // Process Steps
      diagnosis: 'Diagnose',
      diagnosisDesc: 'Gratis diagnose om het exacte probleem met uw apparaat te identificeren.',
      quote: 'Offerte',
      quoteDesc: 'Transparante prijzen zonder verborgen kosten. Keur goed voordat we doorgaan.',
      repair: 'Reparatie',
      repairDesc: 'Expert reparatie met originele onderdelen en professionele gereedschappen.',
      testing: 'Testen',
      testingDesc: 'Gedegen kwaliteitstest om ervoor te zorgen dat alles perfect werkt.',
      warranty: 'Garantie',
      warrantyDesc: '1-jaar garantie op onderdelen en arbeid voor uw gemoedsrust.',
      
      // Repair Guarantees Section
      whyChooseOur: 'Waarom Kiezen voor Onze',
      repairService: 'Reparatiedienst',
      
      // Guarantees
      oneYearWarranty: '1-Jaar Garantie',
      oneYearWarrantyDesc: 'Alle reparaties komen met uitgebreide 1-jaar garantie dekking.',
      genuineParts: 'Originele Onderdelen',
      genuinePartsDesc: 'We gebruiken alleen authentieke OEM onderdelen voor blijvende kwaliteit en prestaties.',
      fastService: 'Snelle Service',
      fastServiceDesc: 'De meeste reparaties voltooid binnen 30-60 minuten terwijl u wacht.',
      expertTechnicians: 'Expert Technici',
      expertTechniciansDesc: 'Gecertificeerde professionals met jaren ervaring in mobiele reparaties.',
      
      // Contact Info
      storeHours: 'Winkeluren',
      contact: 'Contact',
      location: 'Locatie',
      monFri: 'Ma-Vr: 9:00-19:00',
      satSun: 'Za-Zo: 10:00-18:00',
      phone: '+31 (0) 6 12345678',
      email: 'reparaties@phonehub.nl',
      address1: '123 Tech Straat',
      address2: 'Mobiel Stad, MS 12345',
      
      // Pricing
      from: 'Vanaf',
      
      // Quality types
      easy: 'Makkelijk',
      medium: 'Gemiddeld',
      hard: 'Moeilijk',
      
      // Common repair parts
      parts: {
        screen: 'Scherm',
        display: 'Display',
        battery: 'Batterij',
        camera: 'Camera',
        speaker: 'Luidspreker',
        microphone: 'Microfoon',
        charging: 'Oplaadpoort',
        backCover: 'Achterkant',
        homeButton: 'Home Knop',
        powerButton: 'Aan/Uit Knop',
        volumeButton: 'Volume Knop',
      },
    },
    
    // Booking
    booking: {
      title: 'Boek Uw Reparatie',
      selectedService: 'Geselecteerde Reparatieservice',
      deviceServiceSelection: 'Apparaat & Service Selectie',
      deviceCategory: 'Apparaatcategorie',
      deviceBrand: 'Apparaatmerk',
      deviceModel: 'Apparaatmodel',
      repairService: 'Reparatieservice',
      describeIssue: 'Beschrijf het Probleem',
      selectDateTime: 'Selecteer Datum & Tijd',
      appointmentDate: 'Afspraakdatum',
      appointmentTime: 'Afspraaktijd',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      email: 'E-mail',
      phoneNumber: 'Telefoonnummer',
      confirmBooking: 'Bevestig Boeking',
      service: 'Service',
      date: 'Datum',
      selectDeviceCategory: 'Selecteer Apparaatcategorie',
      selectDeviceBrand: 'Selecteer Apparaatmerk',
      selectDeviceModel: 'Selecteer Apparaatmodel',
      selectDevicePart: 'Selecteer Apparaatonderdeel',
      selectService: 'Selecteer Service',
      selectQuality: 'Selecteer Kwaliteit',
      selectDate: 'Selecteer Datum',
      selectTime: 'Selecteer Tijd',
      time: 'Tijd',
      price: 'Prijs',
      "describeProblemPlaceholder": "Beschrijf het probleem",
      services: 'services',
      noServicesAvailable: 'Geen services beschikbaar voor geselecteerd apparaat',
      from: 'Vanaf',
      availableQualityOptions: 'Beschikbare Kwaliteitsopties',
      original: 'Origineel',
      copy: 'Kopie',
      oem: 'OEM',
      chooseQualityOption: 'Kies kwaliteitsoptie',
      selectTimeSlot: 'Selecteer een tijdslot',
      firstNamePlaceholder: 'Jan',
      lastNamePlaceholder: 'Jansen',
      emailPlaceholder: 'jan.jansen@voorbeeld.nl',
      phonePlaceholder: '+31 6 12345678',
      quality: 'Kwaliteit',
      authenticationRequired: 'Authenticatie Vereist',
      signInToBook: 'Log in om een reparatie te boeken',
      aftermarket: 'Aftermarket',
      bookingConfirmed: 'Boeking Bevestigd!',
      appointmentScheduled: 'Uw reparatieafspraak is ingepland voor {{date}} om {{time}}.',
      bookingFailed: 'Boeking Mislukt',
      bookingErrorDescription: 'Er was een fout bij het indienen van uw boeking. Probeer het opnieuw.',
      contactInformation: 'Contactinformatie',
      bookingSummary: 'Boekingsoverzicht',
      device: 'Apparaat',
    },
    
    // Homepage/ProductShowcase
    homepage: {
      liveInventory: 'Live Voorraad',
      featuredProducts: 'Uitgelichte Producten',
      realProducts: 'Echte Producten',
      bestSelling: 'Bestsellers',
      andServices: '& Diensten',
      liveDataDescription: 'Live gegevens uit onze voorraad: {{accessories}} uitgelichte accessoires, {{brands}} apparaatmerken en {{repairs}} voltooide reparaties.',
      fallbackDescription: 'Ontdek onze handmatig geselecteerde collectie premium smartphones en accessoires, met de nieuwste technologie en onverslaanbare prijzen.',
      readyToGetStarted: 'Klaar om te Beginnen?',
      exploreCollection: 'Verken Onze Volledige Collectie',
      exploreDescription: 'Van premium accessoires tot expert reparatiediensten, we hebben alles wat u nodig heeft om uw mobiele ervaring te verbeteren.',
      browseAccessories: 'Blader door Accessoires',
      bookRepair: 'Boek Reparatie',
    },
    
    // Search Modal
    search: {
      placeholder: 'Zoek apparaten, onderdelen, accessoires...',
      clear: 'Wissen',
      recentSearches: 'Recente Zoekopdrachten',
      popularSearches: 'Populaire Zoekopdrachten',
      noResults: 'Geen resultaten gevonden',
      noResultsDescription: 'Probeer uw zoektermen aan te passen of blader door onze categorieën.',
      loading: 'Zoeken...',
      searchResults: 'Zoekresultaten',
      viewAll: 'Alles Bekijken',
      devices: 'Apparaten',
      parts: 'Onderdelen',
      accessories: 'Accessoires',
      removeAll: 'Alles Verwijderen',
    },
    
    // Quote Request Modal
    quote: {
      title: 'Offerte Aanvragen',
      description: 'Vertel ons over uw apparaat en het probleem dat u ervaart. We sturen u binnen 24 uur een gedetailleerde offerte.',
      fullName: 'Volledige Naam',
      email: 'E-mail',
      phoneNumber: 'Telefoonnummer (Optioneel)',
      phonePlaceholder: '+31 (0) 6 12345678',
      deviceInfo: 'Apparaatinformatie',
      deviceInfoPlaceholder: 'bijv. iPhone 14 Pro Max, Samsung Galaxy S23 Ultra',
      issueDescription: 'Probleembeschrijving',
      issuePlaceholder: 'Beschrijf het probleem in detail. Voeg relevante informatie toe over wanneer het begon, wat er gebeurde, etc.',
      cancel: 'Annuleren',
      requestQuote: 'Offerte Aanvragen',
      submitting: 'Verzenden...',
      authenticationRequired: 'Authenticatie Vereist',
      signInToRequest: 'Log in om een offerte aan te vragen.',
      quoteSubmitted: 'Offerte Aanvraag Verzonden!',
      quoteSubmittedDescription: 'We bekijken uw aanvraag en sturen u binnen 24 uur een offerte.',
      error: 'Fout',
      errorDescription: 'Offerte aanvraag verzenden mislukt. Probeer het opnieuw.',
    },
    
    // Accessories
    accessories: {
      title: 'Accessoires',
      subtitle: 'Premium accessoires voor uw apparaten',
      filters: 'Filters',
      sortBy: 'Sorteren op',
      priceRange: 'Prijsbereik',
      viewDetails: 'Details Bekijken',
      filterDescription: 'Filter en zoek accessoires',
      applyFilters: 'Filters Toepassen',
      searchResults: 'Zoekresultaten voor "{{query}}"',
      allProducts: 'Alle Producten',
      productsFound: '{{count}} producten gevonden',
      filtered: 'gefilterd',
      featuredOnly: 'Alleen Uitgelichte Producten',
      mostPopular: 'Meest Populair',
      priceLowToHigh: 'Prijs: Laag naar Hoog',
      priceHighToLow: 'Prijs: Hoog naar Laag',
      highestRated: 'Hoogst Beoordeeld',
      newestFirst: 'Nieuwste Eerst',
      // AccessoryProduct page
      description: 'Beschrijving',
      keyFeatures: 'Belangrijkste Kenmerken',
      off: ' korting',
      sameDayShipping: 'Ontvang het morgen met same-day verzending',
      monthWarranty: 'Maand Garantie',
      fullManufacturerWarranty: 'Volledige fabrieksgarantie inbegrepen',
      shippingReturns: 'Verzending & Retouren',
      noReviews: 'Nog geen beoordelingen',
      beFirstToReview: 'Wees de eerste die dit product beoordeelt',
      shippingInformation: 'Verzendinformatie',
      expressShipping: 'Express verzending beschikbaar (volgende werkdag)',
      trackingInformation: 'Tracking informatie verstrekt',
      freeReturns: 'Gratis retouren op alle bestellingen',
      returnShippingLabel: 'Voorafbetaalde retour verzendlabel inbegrepen',
      refundProcessed: 'Terugbetalingen verwerkt binnen 3-5 werkdagen',
      returnWindow: '30 dagen retourtermijn voor ongebruikte items',
      viewAll: 'Alles Bekijken',
      keyFeaturesList: [
        'Hoogwaardige materialen voor duurzaamheid',
        'Compatibel met meerdere apparaten',
        'Stijlvol en functioneel ontwerp',
        'Garantie inbegrepen voor gemoedsrust',
        'Eenvoudig te installeren en te gebruiken',
      ],
      available: 'beschikbaar',
      productDetails: 'Productdetails',
      descriptionFallback: 'Geen beschrijving beschikbaar voor dit product.',
      compatibility: 'Compatibiliteit',
      stockStatus: 'Voorraadstatus',
      inStock: 'Op Voorraad',
      outOfStock: 'Niet Op Voorraad',
      lowStock: 'Weinig Voorraad',
      quantity: 'Aantal',
      addToCart: 'Toevoegen',
      addToWishlist: 'Toevoegen aan Verlanglijst',
      removeFromWishlist: 'Verwijderen van Verlanglijst',
      readMore: 'Lees meer',
      readLess: 'Lees minder',
      relatedProducts: 'Gerelateerde Producten',
      reviews: 'Beoordelingen',
      rating: 'Beoordeling',
      warranty: 'Garantie',
      specifications: 'Specificaties',
      shipping: 'Verzending',
      freeShipping: 'Gratis Verzending',
      estimatedDelivery: 'Geschatte Levering',
      returnPolicy: 'Retourbeleid',
      daysReturn: '{{days}} dagen retour',
      brand: 'Merk',
      category: 'Categorie',
      sku: 'SKU',
      weight: 'Gewicht',
      dimensions: 'Afmetingen',
      color: 'Kleur',
      material: 'Materiaal',
      model: 'Model',
      year: 'Jaar',
      condition: 'Conditie',
      new: 'Nieuw',
      refurbished: 'Gereviseerd',
      used: 'Gebruikt',
      originalPrice: 'Originele Prijs',
      currentPrice: 'Huidige Prijs',
      discount: 'Korting',
      save: 'Besparen',
      youSave: 'U bespaart',
      limitedTime: 'Beperkte Tijd Aanbieding',
      bestSeller: 'Bestseller',
      featured: 'Uitgelicht',
      newArrival: 'Nieuwe Aankomst',
      sale: 'Uitverkoop',
      outOfStockMessage: 'Dit item is momenteel niet op voorraad',
      lowStockMessage: 'Nog maar {{count}} op voorraad',
      addToCartSuccess: 'Succesvol toegevoegd aan winkelwagen',
      addToWishlistSuccess: 'Toegevoegd aan verlanglijst',
      removeFromWishlistSuccess: 'Verwijderd van verlanglijst',
      loginRequired: 'Log in om items toe te voegen aan winkelwagen',
      loginRequiredWishlist: 'Log in om verlanglijst te beheren',
      productNotFound: 'Product niet gevonden',
      invalidProduct: 'Ongeldig product',
      inCart: 'In Winkelwagen',
      quantityInCart: 'Aantal in winkelwagen:',
      adding: 'Toevoegen...',
      
    },
    
    // Cart
    cart: {
      title: 'Winkelwagen',
      empty: 'Uw winkelwagen is leeg',
      emptyDescription: 'Voeg wat accessoires toe om te beginnen!',
      continueShopping: 'Verder Winkelen',
      checkout: 'Afrekenen',
      removeItem: 'Item Verwijderen',
      updateQuantity: 'Aantal Bijwerken',
      subtotal: 'Subtotaal',
      shipping: 'Verzending',
      tax: 'Belasting',
      total: 'Totaal',
      itemsInCart: '{{count}} items in uw winkelwagen',
    },
    
    // Wishlist
    wishlist: {
      title: 'Verlanglijst',
      empty: 'Uw verlanglijst is leeg',
      emptyDescription: 'Begin met het toevoegen van accessoires aan uw verlanglijst!',
      addItems: 'Voeg items toe aan uw verlanglijst',
      moveToCart: 'Verplaats naar Winkelwagen',
      itemsInWishlist: '{{count}} items in uw verlanglijst',
    },
    
    // Trade-In
    tradeIn: {
      title: 'Ruil Uw',
      subtitle: 'Oude iPhone In',
      program: 'iPhone Inruilprogramma',
      description: 'Krijg real-time marktgebaseerde inruilwaarden voor uw iPhone. Ons dynamische prijsalgoritme houdt rekening met marktvraag, aanbodniveaus, seizoensfactoren en concurrerende prijzen voor de beste waarde.',
      selectDevice: 'Selecteer Uw Apparaat',
      selectStorage: 'Selecteer Opslag',
      selectCondition: 'Selecteer Conditie',
      estimatedValue: 'Geschatte Waarde',
      getQuote: 'Inruilofferte Aanvragen',
      submitRequest: 'Inruilaanvraag Verzenden',
      marketConditions: 'Marktomstandigheden',
      timeDecay: 'Tijdsverval',
      seasonalAdjustment: 'Seizoensaanpassing',
      supplyDemand: 'Vraag & Aanbod',
      competitivePricing: 'Concurrerende Prijzen',
    },
    
    // Booking
   
    // Auth
    auth: {
      signIn: 'Inloggen',
      signUp: 'Registreren',
      email: 'E-mail',
      password: 'Wachtwoord',
      confirmPassword: 'Wachtwoord Bevestigen',
      fullName: 'Volledige Naam',
      forgotPassword: 'Wachtwoord Vergeten?',
      rememberMe: 'Onthoud Mij',
      alreadyHaveAccount: 'Heeft u al een account?',
      dontHaveAccount: 'Heeft u nog geen account?',
      signInSuccess: 'Welkom terug!',
      signUpSuccess: 'Account succesvol aangemaakt!',
      description: 'Log in op uw account of maak een nieuw account aan',
      emailPlaceholder: 'Voer uw e-mailadres in',
      passwordPlaceholder: 'Voer uw wachtwoord in',
      passwordCreatePlaceholder: 'Maak een wachtwoord aan',
      fullNamePlaceholder: 'Voer uw volledige naam in',
      signingIn: 'Inloggen...',
      creatingAccount: 'Account aanmaken...',
      signInFailed: 'Inloggen mislukt',
      signUpFailed: 'Registreren mislukt',
      signInSuccessMessage: 'U bent succesvol ingelogd.',
      signUpSuccessMessage: 'Controleer uw e-mail om uw account te verifiëren.',
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welkom terug',
      recentBookings: 'Recente Boekingen',
      upcomingAppointments: 'Aankomende Afspraken',
      repairHistory: 'Reparatiegeschiedenis',
      viewAll: 'Alles Bekijken',
      overview: 'Overzicht',
      allBookings: 'Alle Boekingen',
      quotes: 'Offertes',
      analytics: 'Analytics',
      myBookings: 'Mijn Boekingen',
      totalBookings: 'Totaal Boekingen',
      totalRevenue: 'Totale Omzet',
      completionRate: 'Voltooiingspercentage',
    },
    
    // Admin
    admin: {
      title: 'Admin Dashboard',
      manageRepairs: 'Reparaties Beheren',
      manageAccessories: 'Accessoires Beheren',
      accessoriesManagement: 'Accessoires Beheer',
      manageTradeIn: 'Inruil Beheren',
      users: 'Gebruikers',
      reports: 'Rapporten',
      settings: 'Instellingen',
      repairManagement: 'Reparatiediensten Beheer',
      repairManagementDescription: 'Beheer uw aangepaste reparatie-items, diensten en prijzen',
      deviceManagement: 'Apparaatbeheer',
      addLegacyItem: 'Legacy Item Toevoegen',
      manageLegacyItems: 'Legacy Items Beheren',
    },
    
    // Footer
    footer: {
      company: 'Bedrijf',
      services: 'Diensten',
      support: 'Ondersteuning',
      legal: 'Juridisch',
      followUs: 'Volg Ons',
      newsletter: 'Nieuwsbrief',
      subscribe: 'Abonneren',
      allRightsReserved: 'Alle rechten voorbehouden',
      description: 'Uw vertrouwde bestemming voor de nieuwste smartphones, accessoires en expert mobiele oplossingen. Kwaliteitsproducten, concurrerende prijzen, uitzonderlijke service.',
      contact: 'Contact Opnemen',
      shipping: 'Verzendinformatie',
      returns: 'Retourneren & Omwisselen',
      faq: 'Veelgestelde Vragen',
      warranty: 'Garantie',
      privacy: 'Privacybeleid',
      terms: 'Servicevoorwaarden',
      cookies: 'Cookiebeleid',
    },
    
    // Error messages
    errors: {
      somethingWentWrong: 'Er is iets misgegaan',
      tryAgain: 'Probeer het opnieuw',
      networkError: 'Netwerkfout. Controleer uw verbinding',
      unauthorized: 'U bent niet geautoriseerd om deze actie uit te voeren',
      notFound: 'De gevraagde bron is niet gevonden',
      validationError: 'Controleer uw invoer en probeer opnieuw',
      pageNotFound: 'Oeps! Pagina niet gevonden',
    },

    // SEO Content
    seo: {
      siteName: 'Blueprint Phone Zen',
      tagline: 'Premium Telefoon Reparatie & Accessoires Winkel',
      
      // Page titles
      titles: {
        home: 'Thuis',
        repairs: 'Telefoon Reparatie Diensten',
        accessories: 'Telefoon Accessoires',
        dashboard: 'Dashboard',
        auth: 'Inloggen & Registratie',
        search: 'Zoekresultaten',
        categories: 'Apparaat Reparatie Diensten',
        brands: 'Merk Reparatie Diensten',
        models: 'Apparaat Model Reparaties',
        parts: 'Onderdeel Reparatie Diensten',
      },
      
      // Meta descriptions
      descriptions: {
        home: 'Expert telefoon reparatie diensten en premium mobiele accessoires. Snelle reparaties, originele onderdelen, concurrerende prijzen met garantiedekking.',
        repairs: 'Professionele telefoon reparatie diensten voor alle grote merken. Schermvervanging, batterij reparatie, waterschade herstel, en meer met garantie.',
        accessories: 'Premium telefoon accessoires inclusief hoesjes, opladers, schermbeschermers, koptelefoons en meer. Compatibel met iPhone, Samsung, Google Pixel.',
        dashboard: 'Beheer uw reparatie boekingen, volg bestelling status, en toegang tot uw account informatie.',
        auth: 'Log in op uw account of maak een nieuw account aan om reparatie diensten te boeken en uw bestellingen te volgen.',
        search: 'Vind de perfecte telefoon reparatie dienst of accessoire. Doorzoek ons uitgebreide catalogus van apparaten en diensten.',
        categories: 'Kies uw apparaat type voor professionele reparatie diensten. Smartphones, tablets, laptops, en meer met expert technici.',
        brands: 'Professionele reparatie diensten voor alle grote apparaat merken. Originele onderdelen, expert technici, garantiedekking.',
        models: 'Specifieke reparatie diensten voor uw exacte apparaat model. Expert diagnose, originele onderdelen, snelle doorlooptijd.',
        parts: 'Professionele component reparatie en vervangingsdiensten. Scherm, batterij, camera, luidspreker reparaties met garantie.',
      },
      
      // Keywords
      keywords: {
        base: 'telefoon reparatie, mobiele reparatie, apparaat reparatie dienst',
        home: 'telefoon reparatie, mobiele reparatie, iPhone reparatie, Samsung reparatie, schermvervanging, batterij vervanging',
        repairs: 'telefoon reparatie, schermvervanging, batterij vervanging, iPhone reparatie, Samsung reparatie, mobiele reparatie dienst',
        accessories: 'telefoon accessoires, telefoon hoesjes, schermbeschermers, opladers, koptelefoons, mobiele accessoires',
        categories: 'apparaat reparatie, smartphone reparatie, tablet reparatie, laptop reparatie, mobiele apparaat service',
        brands: 'merk reparatie service, geautoriseerde reparatie, originele onderdelen, garantie reparatie',
        models: 'model reparatie, apparaat specifieke reparatie, exact model service, professionele diagnose',
        parts: 'component reparatie, onderdeel vervanging, scherm reparatie, batterij vervanging, camera reparatie',
      },
      
      // Dynamic content templates
      templates: {
        categoryTitle: '{{category}} Reparatie Diensten | Telefoon Reparatie Diensten',
        categoryDescription: 'Expert {{category}} reparatie diensten. Kies uit topmerken met originele onderdelen en garantiedekking.',
        brandTitle: '{{brand}} {{category}} Reparatie | Professionele Service',
        brandDescription: 'Professionele {{brand}} {{category}} reparatie diensten. Alle modellen ondersteund met originele onderdelen en expert technici.',
        modelTitle: '{{brand}} {{model}} Onderdelen & Reparatie Diensten',
        modelDescription: '{{brand}} {{model}} reparatie diensten. Schermvervanging, batterij reparatie, camera reparatie, en meer met originele onderdelen.',
        serviceTitle: '{{brand}} {{model}} {{service}} Reparatie Service',
        serviceDescription: 'Professionele {{brand}} {{model}} {{service}} reparatie service. Expert technici, originele onderdelen, snelle doorlooptijd, garantie inbegrepen.',
        accessoryTitle: '{{name}} | {{brand}} {{category}}',
        accessoryDescription: '{{name}} - Premium mobiele accessoire van {{brand}}. Hoge kwaliteit, concurrerende prijzen, snelle verzending.',
      },
      
      // Service types for SEO
      serviceTypes: {
        screen: 'Schermvervanging',
        battery: 'Batterij Vervanging',
        camera: 'Camera Reparatie',
        speaker: 'Luidspreker Reparatie',
        microphone: 'Microfoon Reparatie',
        charging: 'Oplaadpoort Reparatie',
        water: 'Waterschade Herstel',
        software: 'Software Reparatie',
        unlock: 'Apparaat Ontgrendelen',
        diagnostic: 'Diagnose Service',
      },
    },

    // Banner Content
    banner: {
      promotion: {
        title: '50% KORTING Schermreparaties',
        subtitle: 'Beperkte Tijd Aanbieding',
        description: 'Professionele schermvervanging voor alle grote telefoonmerken. Boek nu en bespaar veel!',
        buttonText: 'Boek Reparatie',
      },
      feature: {
        title: 'Nieuwe iPhone 15 Accessoires',
        subtitle: 'Net Binnen',
        description: 'Premium hoesjes, draadloze opladers en schermbeschermers voor de nieuwste iPhone.',
        buttonText: 'Shop Nu',
      },
      announcement: {
        title: 'Uitgebreide Garantie Beschikbaar',
        subtitle: 'Gemoedsrust',
        description: '6 maanden garantie op alle reparatiediensten. Professionele kwaliteit gegarandeerd.',
        buttonText: 'Meer Informatie',
      },
      seasonal: {
        title: 'Feestdagen Speciale Aanbiedingen',
        subtitle: 'Geef Je Dierbaren Een Cadeau',
        description: 'Premium telefoon accessoires tegen onverslaanbare prijzen. Perfecte cadeaus voor techliefhebbers!',
        buttonText: 'Ontdek Cadeaus',
      },
    },
  },
};
