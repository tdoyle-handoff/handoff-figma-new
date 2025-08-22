export const FAVICON_SVG = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#034078" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
`)}`;

export const VIEWPORT_META_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

export const APP_TITLES = {
  authenticated: 'Handoff - Real Estate Transaction Management',
  unauthenticated: 'Handoff - Sign In'
} as const;

// Calculate monthly mortgage payment
export const calculateMonthlyPayment = (
  propertyPrice: number,
  downPaymentPercent: number = 20,
  interestRate: number = 6.5, // Annual interest rate as percentage
  loanTermYears: number = 30
): number => {
  // Calculate loan amount after down payment
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  
  // Convert annual interest rate to monthly rate
  const monthlyInterestRate = (interestRate / 100) / 12;
  
  // Calculate total number of payments
  const numberOfPayments = loanTermYears * 12;
  
  // Calculate monthly payment using standard mortgage formula
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  if (monthlyInterestRate === 0) {
    // If no interest, just divide loan amount by number of payments
    return loanAmount / numberOfPayments;
  }
  
  const monthlyPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  return Math.round(monthlyPayment);
};

// Get default loan parameters
export const getDefaultLoanParameters = () => ({
  downPaymentPercent: 20,
  interestRate: 6.5, // Current typical rate
  loanTermYears: 30
});

// Format currency utility
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};