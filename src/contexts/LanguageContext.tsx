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
      search: 'Search',
      cart: 'Cart',
      wishlist: 'Wishlist',
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
    },
    
    // Accessories
    accessories: {
      title: 'Accessories',
      subtitle: 'Premium accessories for your devices',
      filters: 'Filters',
      sortBy: 'Sort by',
      priceRange: 'Price Range',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      addToCart: 'Add to Cart',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      viewDetails: 'View Details',
      relatedProducts: 'Related Products',
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
      title: 'Trade-In Your Device',
      subtitle: 'Get instant value for your old device',
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
    
    // Booking
    booking: {
      title: 'Book Appointment',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      customerInfo: 'Customer Information',
      deviceInfo: 'Device Information',
      repairDetails: 'Repair Details',
      confirmation: 'Confirmation',
      appointmentBooked: 'Appointment Booked Successfully',
      appointmentDetails: 'Appointment Details',
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
    },
    
    // Admin
    admin: {
      title: 'Admin Dashboard',
      manageRepairs: 'Manage Repairs',
      manageAccessories: 'Manage Accessories',
      manageTradeIn: 'Manage Trade-In',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
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
      search: 'Zoeken',
      cart: 'Winkelwagen',
      wishlist: 'Verlanglijst',
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
    },
    
    // Accessories
    accessories: {
      title: 'Accessoires',
      subtitle: 'Premium accessoires voor uw apparaten',
      filters: 'Filters',
      sortBy: 'Sorteren op',
      priceRange: 'Prijsbereik',
      inStock: 'Op Voorraad',
      outOfStock: 'Niet Op Voorraad',
      addToCart: 'Toevoegen aan Winkelwagen',
      addToWishlist: 'Toevoegen aan Verlanglijst',
      removeFromWishlist: 'Verwijderen van Verlanglijst',
      viewDetails: 'Details Bekijken',
      relatedProducts: 'Gerelateerde Producten',
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
      title: 'Ruil Uw Apparaat In',
      subtitle: 'Krijg directe waarde voor uw oude apparaat',
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
    booking: {
      title: 'Afspraak Maken',
      selectDate: 'Selecteer Datum',
      selectTime: 'Selecteer Tijd',
      customerInfo: 'Klantgegevens',
      deviceInfo: 'Apparaatgegevens',
      repairDetails: 'Reparatiedetails',
      confirmation: 'Bevestiging',
      appointmentBooked: 'Afspraak Succesvol Gemaakt',
      appointmentDetails: 'Afspraakdetails',
    },
    
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
    },
    
    // Admin
    admin: {
      title: 'Admin Dashboard',
      manageRepairs: 'Reparaties Beheren',
      manageAccessories: 'Accessoires Beheren',
      manageTradeIn: 'Inruil Beheren',
      users: 'Gebruikers',
      reports: 'Rapporten',
      settings: 'Instellingen',
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
    },
  },
};
