export const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: '🔧', desc: 'Leaks, pipes, taps & drainage', startingPrice: 299 },
  { id: 'electrical', label: 'Electrical', icon: '⚡', desc: 'Wiring, switches & appliances', startingPrice: 349 },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹', desc: 'Deep clean, sofa & carpet', startingPrice: 599 },
  { id: 'appliance', label: 'Appliance Repair', icon: '🔨', desc: 'AC, fridge, washing machine', startingPrice: 449 },
  { id: 'pest', label: 'Pest Control', icon: '🐛', desc: 'Termites, cockroach & rodents', startingPrice: 999 },
  { id: 'painting', label: 'Painting', icon: '🎨', desc: 'Interior, exterior & textures', startingPrice: 1999 },
  { id: 'carpentry', label: 'Carpentry', icon: '🪚', desc: 'Furniture, doors & cabinets', startingPrice: 499 },
  { id: 'hvac', label: 'HVAC', icon: '❄️', desc: 'AC service, duct cleaning', startingPrice: 799 },
];

export const PROVIDERS = [
  {
    id: 'p1', name: 'Ravi Kumar', avatar: 'RK', service: 'Plumbing', category: 'plumbing', experience: '8 yrs',
    verified: true, rating: 4.8, reviews: 214, price: 350, city: 'Chennai', serviceCity: 'Chennai',
    location: 'Anna Nagar', latitude: 13.0852, longitude: 80.2101,
    available: true, tags: ['Leak Fix', 'Pipe Repair', 'Tap Install'],
    reliabilityScore: 98, lowScoreDays: 0,
    radius: '5km', workingHours: '9:00 AM - 6:00 PM',
  },
  {
    id: 'p2', name: 'Suresh Babu', avatar: 'SB', service: 'Electrical', category: 'electrical', experience: '6 yrs',
    verified: true, rating: 4.6, reviews: 189, price: 400, city: 'Chennai', serviceCity: 'Chennai',
    location: 'Velachery', latitude: 12.9755, longitude: 80.2207,
    available: true, tags: ['Wiring', 'Fan Install', 'Short Circuit'],
    reliabilityScore: 50, lowScoreDays: 3,
    radius: '8km', workingHours: '10:00 AM - 8:00 PM',
  },
  {
    id: 'p3', name: 'Meena Devi', avatar: 'MD', service: 'Cleaning', category: 'cleaning', experience: '5 yrs',
    verified: true, rating: 4.9, reviews: 302, price: 800, city: 'Madurai', serviceCity: 'Madurai',
    location: 'KK Nagar', latitude: 9.9177, longitude: 78.119,
    available: false, tags: ['Deep Clean', 'Sofa Wash', 'Carpet'],
    radius: '10km', workingHours: '8:00 AM - 5:00 PM',
  },
  {
    id: 'p4', name: 'Karthik Raja', avatar: 'KR', service: 'Appliance Repair', category: 'appliance', experience: '7 yrs',
    verified: true, rating: 4.5, reviews: 145, price: 500, city: 'Chennai', serviceCity: 'Chennai',
    location: 'T Nagar', latitude: 13.0418, longitude: 80.2341,
    available: true, tags: ['AC Service', 'Fridge', 'Washing Machine'],
    radius: '6km', workingHours: '9:30 AM - 7:30 PM',
  },
  {
    id: 'p5', name: 'Anand Pillai', avatar: 'AP', service: 'Pest Control', category: 'pest', experience: '4 yrs',
    verified: false, rating: 4.7, reviews: 98, price: 1200, city: 'Madurai', serviceCity: 'Madurai',
    location: 'Anna Nagar', latitude: 9.9418, longitude: 78.123,
    available: true, tags: ['Termite', 'Cockroach', 'Rodent'],
    radius: '12km', workingHours: '9:00 AM - 9:00 PM',
  },
  {
    id: 'p6', name: 'Divya L.', avatar: 'DL', service: 'Painting', category: 'painting', experience: '3 yrs',
    verified: true, rating: 4.4, reviews: 76, price: 2500, city: 'Coimbatore', serviceCity: 'Coimbatore',
    location: 'Peelamedu', latitude: 11.0182, longitude: 76.9582,
    available: true, tags: ['Interior', 'Texture', 'Exterior'],
    radius: '15km', workingHours: '8:30 AM - 6:30 PM',
  },
];

export const BOOKINGS = [
  { id: 'B001', service: 'Plumbing', status: 'Completed', date: '2025-02-10', time: '10:00 AM', address: '12, Park St, Anna Nagar', amount: 420, rating: 5, providerName: 'Ravi Kumar', invoiceId: 'INV001' },
  { id: 'B002', service: 'Electrical', status: 'In Progress', date: '2025-02-22', time: '2:00 PM', address: '12, Park St, Anna Nagar', amount: 400, rating: null, providerName: 'Suresh Babu', invoiceId: 'INV002' },
  { id: 'B003', service: 'Cleaning', status: 'Requested', date: '2025-02-25', time: '9:00 AM', address: '12, Park St, Anna Nagar', amount: 800, rating: null, providerName: 'Meena Devi', invoiceId: null },
  { id: 'B004', service: 'Appliance Repair', status: 'Cancelled', date: '2025-02-05', time: '11:00 AM', address: '12, Park St, Anna Nagar', amount: 0, rating: null, providerName: 'Karthik Raja', invoiceId: null },
  { id: 'B005', service: 'Carpentry', status: 'Completed', date: '2025-01-28', time: '3:00 PM', address: '12, Park St, Anna Nagar', amount: 750, rating: 4, providerName: 'Vijay Selvam', invoiceId: 'INV003' },
];

export const PROVIDER_JOBS = [
  { id: 'B010', customerName: 'Arjun Mehta', status: 'Requested', date: '2025-02-24', time: '10:00 AM', address: '12, Park St, Anna Nagar', amount: 420 },
  { id: 'B011', customerName: 'Kavitha Rajan', status: 'Accepted', date: '2025-02-24', time: '2:00 PM', address: '5, MG Road, Nungambakkam', amount: 350 },
  { id: 'B012', customerName: 'Siddharth N.', status: 'In Progress', date: '2025-02-23', time: '11:00 AM', address: '89, GST Road, Tambaram', amount: 600 },
  { id: 'B013', customerName: 'Anita Sharma', status: 'Completed', date: '2025-02-20', time: '9:00 AM', address: '22, NH45, Perungalathur', amount: 380 },
];

export const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 48000, bookings: 142 },
  { month: 'Oct', revenue: 62000, bookings: 185 },
  { month: 'Nov', revenue: 55000, bookings: 161 },
  { month: 'Dec', revenue: 78000, bookings: 230 },
  { month: 'Jan', revenue: 91000, bookings: 274 },
  { month: 'Feb', revenue: 84000, bookings: 252 },
];

export const CATEGORY_DEMAND = [
  { name: 'Plumbing', value: 28 },
  { name: 'Electrical', value: 22 },
  { name: 'Cleaning', value: 20 },
  { name: 'Appliance', value: 15 },
  { name: 'Painting', value: 10 },
  { name: 'Other', value: 5 },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Booking Confirmed', message: 'Your booking #B002 has been confirmed by Suresh Babu', time: '10 min ago', read: false },
  { id: 2, title: 'Service Reminder', message: 'Your Electrical service is scheduled for tomorrow at 2:00 PM', time: '1 hr ago', read: false },
  { id: 3, title: 'Rating Requested', message: 'Please rate your completed Plumbing service with Ravi Kumar', time: '2 days ago', read: true },
  { id: 4, title: 'Payment Received', message: 'Your payment of ₹420 has been processed successfully', time: '5 days ago', read: true },
  { id: 5, title: 'New Offer', message: 'Get 50% off on your next Cleaning service. Use code CLEAN50', time: '1 week ago', read: true },
];

export const DEMO_USERS = [
  {
    id: 'cust_1',
    name: 'Arjun',
    email: 'arjun@email.com',
    password: 'customer123',
    role: 'customer',
    avatar: 'AR',
    verified: true,
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    serviceCity: 'Coimbatore',
    serviceCityActive: true,
    location: 'Peelamedu',
    displayAddress: 'Peelamedu, Coimbatore, Tamil Nadu, India',
    latitude: 11.0168,
    longitude: 76.9558,
  },
  {
    id: 'prov_1',
    name: 'Ravi',
    email: 'ravi@email.com',
    password: 'provider123',
    role: 'provider',
    avatar: 'RV',
    verified: true,
    reliabilityScore: 98,
    lowScoreDays: 0,
    state: 'Tamil Nadu',
    city: 'Chennai',
    serviceCity: 'Chennai',
    serviceCityActive: true,
    location: 'Anna Nagar',
    latitude: 13.0852,
    longitude: 80.2101,
    serviceType: 'Plumbing',
  },
  {
    id: 'admin_1',
    name: 'Admin',
    email: 'admin@handyserve.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AD',
    verified: true,
  },
];

/** @deprecated Use map search — kept for legacy imports only */
export const LOCATIONS = {
  'Tamil Nadu': {
    Chennai: [],
    Coimbatore: [],
    Madurai: [],
  },
};

export const PROMO_CODES = {
  FIRST50: { label: '50% off first booking', type: 'percent', value: 50 },
  CLEAN200: { label: '₹200 off cleaning', type: 'flat', value: 200 },
  SUMMER10: { label: '10% summer discount', type: 'percent', value: 10 },
};

export const RECENT_ACTIVITIES = [
  { id: 1, text: 'New provider Ravi Kumar verified in Chennai', time: '5 min ago', color: 'var(--success)' },
  { id: 2, text: 'Booking #B102 marked In Progress', time: '22 min ago', color: 'var(--brand)' },
  { id: 3, text: 'Customer dispute opened for booking #B004', time: '1 hr ago', color: 'var(--warning)' },
  { id: 4, text: 'Meena Devi updated availability in Madurai', time: '2 hrs ago', color: 'var(--info)' },
];

export const DISPUTES = [
  { id: 'D001', bookingId: 'B004', customer: 'Arjun Mehta', provider: 'Karthik Raja', issue: 'Service not completed as promised', status: 'Open', amount: 500, date: '20 Feb 2025' },
  { id: 'D002', bookingId: 'B003', customer: 'Kavitha Rajan', provider: 'Anand Pillai', issue: 'Provider arrived 3 hours late', status: 'Resolved', amount: 420, date: '18 Feb 2025' },
  { id: 'D003', bookingId: 'B009', customer: 'Siddharth N.', provider: 'Nisha Thomas', issue: 'Poor quality work', status: 'Open', amount: 900, date: '15 Feb 2025' },
  { id: 'D004', bookingId: 'B007', customer: 'Anita Sharma', provider: 'Divya L.', issue: 'Charged more than quoted price', status: 'Pending', amount: 2500, date: '10 Feb 2025' },
];
