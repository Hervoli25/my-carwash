// Google Wallet and Samsung Wallet Integration
export interface WalletPassData {
  membershipId: string;
  memberName: string;
  memberEmail: string;
  membershipPlan: string;
  qrCode: string;
  discountRate: string;
  loyaltyPoints: number;
  validFrom: string;
  validUntil: string;
  organizationName: string;
  logoUrl: string;
  backgroundColor: string;
  foregroundColor: string;
}

// Google Wallet Integration
export class GoogleWalletService {
  private issuerId: string;
  private classId: string;

  constructor() {
    this.issuerId = process.env.NEXT_PUBLIC_GOOGLE_WALLET_ISSUER_ID || 'ekhaya_carwash';
    this.classId = `${this.issuerId}.membership_card`;
  }

  // Generate Google Wallet pass URL
  generateGoogleWalletUrl(passData: WalletPassData): string {
    const walletObject = {
      id: `${this.issuerId}.${passData.membershipId}`,
      classId: this.classId,
      state: 'ACTIVE',
      heroImage: {
        sourceUri: {
          uri: passData.logoUrl || '/api/images/membership-hero.png'
        }
      },
      textModulesData: [
        {
          header: 'Member Name',
          body: passData.memberName,
          id: 'member_name'
        },
        {
          header: 'Membership Plan',
          body: passData.membershipPlan,
          id: 'membership_plan'
        },
        {
          header: 'Discount Rate',
          body: passData.discountRate,
          id: 'discount_rate'
        },
        {
          header: 'Loyalty Points',
          body: passData.loyaltyPoints.toString(),
          id: 'loyalty_points'
        }
      ],
      barcode: {
        type: 'QR_CODE',
        value: passData.qrCode,
        alternateText: passData.qrCode
      },
      validTimeInterval: {
        start: {
          date: passData.validFrom
        },
        end: passData.validUntil ? {
          date: passData.validUntil
        } : undefined
      }
    };

    // Encode the wallet object
    const encodedObject = encodeURIComponent(JSON.stringify(walletObject));
    
    // Generate the Add to Google Wallet URL
    return `https://pay.google.com/gp/v/save/${encodedObject}`;
  }

  // Create wallet button HTML
  createGoogleWalletButton(passData: WalletPassData): string {
    const saveUrl = this.generateGoogleWalletUrl(passData);
    
    return `
      <a href="${saveUrl}" target="_blank" rel="noopener noreferrer">
        <img 
          src="https://developers.google.com/wallet/generic/resources/logo_guidelines/wallet-add-to-google-wallet-button.png" 
          alt="Add to Google Wallet"
          style="width: 200px; height: auto;"
        />
      </a>
    `;
  }
}

// Samsung Wallet Integration
export class SamsungWalletService {
  private serviceId: string;

  constructor() {
    this.serviceId = process.env.NEXT_PUBLIC_SAMSUNG_WALLET_SERVICE_ID || 'ekhaya_carwash_membership';
  }

  // Generate Samsung Wallet pass data
  generateSamsungWalletData(passData: WalletPassData): any {
    return {
      serviceId: this.serviceId,
      templateId: 'membership_template',
      certificate: {
        id: passData.membershipId,
        name: passData.memberName,
        description: `${passData.membershipPlan} Member at Ekhaya Car Wash`,
        organization: {
          name: passData.organizationName,
          logo: passData.logoUrl
        },
        validPeriod: {
          from: passData.validFrom,
          to: passData.validUntil
        },
        barcode: {
          type: 'QR',
          value: passData.qrCode,
          text: passData.qrCode
        },
        fields: [
          {
            key: 'membership_plan',
            label: 'Membership Plan',
            value: passData.membershipPlan
          },
          {
            key: 'discount_rate',
            label: 'Discount Rate',
            value: passData.discountRate
          },
          {
            key: 'loyalty_points',
            label: 'Loyalty Points',
            value: passData.loyaltyPoints.toString()
          }
        ],
        style: {
          backgroundColor: passData.backgroundColor,
          foregroundColor: passData.foregroundColor
        }
      }
    };
  }

  // Create Samsung Wallet URL
  generateSamsungWalletUrl(passData: WalletPassData): string {
    const walletData = this.generateSamsungWalletData(passData);
    const encodedData = encodeURIComponent(JSON.stringify(walletData));
    
    return `samsungwallet://certificates/add?data=${encodedData}`;
  }
}

// Apple Wallet Integration (for iOS devices)
export class AppleWalletService {
  // Generate Apple Wallet pass data (PKPass format)
  generateAppleWalletData(passData: WalletPassData): any {
    return {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.ekhayacarwash.membership',
      serialNumber: passData.membershipId,
      teamIdentifier: process.env.NEXT_PUBLIC_APPLE_TEAM_ID || 'EKHAYA123',
      organizationName: passData.organizationName,
      description: 'Ekhaya Car Wash Membership Card',
      logoText: 'Ekhaya Car Wash',
      foregroundColor: passData.foregroundColor,
      backgroundColor: passData.backgroundColor,
      generic: {
        primaryFields: [
          {
            key: 'member_name',
            label: 'Member',
            value: passData.memberName
          }
        ],
        secondaryFields: [
          {
            key: 'membership_plan',
            label: 'Plan',
            value: passData.membershipPlan
          },
          {
            key: 'discount',
            label: 'Discount',
            value: passData.discountRate
          }
        ],
        auxiliaryFields: [
          {
            key: 'points',
            label: 'Points',
            value: passData.loyaltyPoints.toString()
          }
        ],
        backFields: [
          {
            key: 'qr_code',
            label: 'QR Code',
            value: passData.qrCode
          },
          {
            key: 'terms',
            label: 'Terms and Conditions',
            value: 'Visit ekhayacarwash.com for full terms and conditions.'
          }
        ]
      },
      barcode: {
        message: passData.qrCode,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      },
      validityPeriod: {
        startDate: passData.validFrom,
        endDate: passData.validUntil
      }
    };
  }
}

// Universal Wallet Integration
export class WalletIntegration {
  private googleWallet: GoogleWalletService;
  private samsungWallet: SamsungWalletService;
  private appleWallet: AppleWalletService;

  constructor() {
    this.googleWallet = new GoogleWalletService();
    this.samsungWallet = new SamsungWalletService();
    this.appleWallet = new AppleWalletService();
  }

  // Detect device type and return appropriate wallet service
  detectWalletType(): 'google' | 'samsung' | 'apple' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('mac')) {
      return 'apple';
    } else if (userAgent.includes('samsung')) {
      return 'samsung';
    } else if (userAgent.includes('android') || userAgent.includes('chrome')) {
      return 'google';
    }
    
    return 'google'; // Default to Google Wallet
  }

  // Add to appropriate wallet based on device
  async addToWallet(membershipData: any): Promise<string> {
    const passData: WalletPassData = {
      membershipId: membershipData.membershipId || 'unknown',
      memberName: membershipData.memberName || 'Member',
      memberEmail: membershipData.memberEmail || '',
      membershipPlan: membershipData.membershipPlan || 'Basic',
      qrCode: membershipData.qrCode || '',
      discountRate: membershipData.discountRate || '10%',
      loyaltyPoints: membershipData.loyaltyPoints || 0,
      validFrom: membershipData.memberSince || new Date().toISOString().split('T')[0],
      validUntil: membershipData.validUntil || '',
      organizationName: 'Ekhaya Car Wash',
      logoUrl: '/images/ekhaya-logo.png',
      backgroundColor: '#1e40af',
      foregroundColor: '#ffffff'
    };

    const walletType = this.detectWalletType();
    
    switch (walletType) {
      case 'google':
        return this.googleWallet.generateGoogleWalletUrl(passData);
      case 'samsung':
        return this.samsungWallet.generateSamsungWalletUrl(passData);
      case 'apple':
        return '/api/wallet/apple-pass'; // Will generate PKPass file
      default:
        return this.googleWallet.generateGoogleWalletUrl(passData);
    }
  }

  // Get wallet button component based on device
  getWalletButtonData(membershipData: any): { url: string; buttonText: string; icon: string } {
    const walletType = this.detectWalletType();
    
    switch (walletType) {
      case 'apple':
        return {
          url: '/api/wallet/apple-pass',
          buttonText: 'Add to Apple Wallet',
          icon: '📱'
        };
      case 'samsung':
        return {
          url: this.samsungWallet.generateSamsungWalletUrl(this.formatPassData(membershipData)),
          buttonText: 'Add to Samsung Wallet',
          icon: '📲'
        };
      default:
        return {
          url: this.googleWallet.generateGoogleWalletUrl(this.formatPassData(membershipData)),
          buttonText: 'Add to Google Wallet',
          icon: '💳'
        };
    }
  }

  private formatPassData(membershipData: any): WalletPassData {
    return {
      membershipId: membershipData.membershipId || 'unknown',
      memberName: membershipData.memberName || 'Member',
      memberEmail: membershipData.memberEmail || '',
      membershipPlan: membershipData.membershipPlan || 'Basic',
      qrCode: membershipData.qrCode || '',
      discountRate: membershipData.discountRate || '10%',
      loyaltyPoints: membershipData.loyaltyPoints || 0,
      validFrom: membershipData.memberSince || new Date().toISOString().split('T')[0],
      validUntil: membershipData.validUntil || '',
      organizationName: 'Ekhaya Car Wash',
      logoUrl: '/images/ekhaya-logo.png',
      backgroundColor: '#1e40af',
      foregroundColor: '#ffffff'
    };
  }
}