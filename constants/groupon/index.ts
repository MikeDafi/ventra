import * as FileSystem from 'expo-file-system/legacy';

export const GROUPON_FOLDER = FileSystem.documentDirectory + 'groupons/';

export type Voucher = {
  id: string;
  title: string;
  location: string;
  countCurrent: number;
  countTotal: number;
  hasBarcode: boolean;
  redemptionCode: string;
  grouponCode: string;
  originalPrice: string;
  grouponPrice: string;
  promoDiscount: string;
  amountPaid: string;
  expires: string;
  redeemedDate: string | null;
  customerName: string;
};

export type Field = {
  label: string;
  key: keyof Voucher;
  required?: boolean;
  example?: string;
  default?: string;
};

export const VOUCHER_FIELDS: Field[] = [
  { label: 'Title', key: 'title', example: '$50 Game Card valid for Arcade and VR Games' },
  { label: 'Location', key: 'location', example: 'Launch Family Entertainment - Gurnee' },
  { label: 'Redemption Code', key: 'redemptionCode', default: '21297169' },
  { label: 'Groupon Code', key: 'grouponCode', default: 'VS-3J23-95PG-HFXX-NL6R' },
  { label: 'Original Price', key: 'originalPrice', example: '$50.00' },
  { label: 'Groupon Price', key: 'grouponPrice', example: '$30.00' },
  { label: 'Promotional Discount', key: 'promoDiscount', example: '-$7.51' },
  { label: 'Amount Paid', key: 'amountPaid', example: '$22.49' },
  { label: 'Expires', key: 'expires', default: 'January 22, 2026' },
];

export const SEED_VOUCHERS: Voucher[] = [
  {
    id: 'seed-1',
    title: '$50 Game Card valid for Arcade and VR Games',
    location: 'Launch Family Entertainment - Gurnee',
    countCurrent: 1,
    countTotal: 1,
    hasBarcode: true,
    redemptionCode: '21297169',
    grouponCode: 'VS-3J23-95PG-HFXX-NL6R',
    originalPrice: '$50.00',
    grouponPrice: '$30.00',
    promoDiscount: '-$7.51',
    amountPaid: '$22.49',
    expires: 'January 22, 2026',
    redeemedDate: null,
    customerName: 'Ashley Kumar',
  },
  {
    id: 'seed-2',
    title: 'One Game of Mini Golf (Valid Any Day) - For 2 People',
    location: '',
    countCurrent: 1,
    countTotal: 1,
    hasBarcode: false,
    redemptionCode: 'CZ38FT2D',
    grouponCode: 'VS-94BZ-KY3J-KX1F-WBVB',
    originalPrice: '$28.00',
    grouponPrice: '$25.20',
    promoDiscount: '-$2.24',
    amountPaid: '$22.96',
    expires: 'July 2, 2026',
    redeemedDate: null,
    customerName: 'Ashley Kumar',
  },
  {
    id: 'seed-3',
    title: '2-Hour Arcade Pass for 1 Person',
    location: 'Enterrium',
    countCurrent: 1,
    countTotal: 1,
    hasBarcode: true,
    redemptionCode: '84208872',
    grouponCode: 'VS-MFSZ-GVLK-RYH9-TL1G',
    originalPrice: '$40.00',
    grouponPrice: '$24.30',
    promoDiscount: '-$3.64',
    amountPaid: '$20.66',
    expires: 'March 21, 2026',
    redeemedDate: null,
    customerName: 'Ashley Kumar',
  },
];
