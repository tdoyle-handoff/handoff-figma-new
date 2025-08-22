// Global ambient type declarations to satisfy cross-cutting component usages

declare interface ComprehensivePropertyData {
  [key: string]: any;
  property_basic_profile?: any;
  property_expanded_detail?: any;
}

declare interface AddressDetails {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
