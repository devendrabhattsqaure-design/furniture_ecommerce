// Product and shop constants
export const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Modern Sofa',
    price: 2499,
    image: '/modern-sofa.jpg',
    rating: 4.8,
    reviews: 128,
    category: 'sofas',
  },
  {
    id: '2',
    name: 'Executive Chair',
    price: 899,
    image: '/executive-chair.jpg',
    rating: 4.6,
    reviews: 95,
    category: 'chairs',
  },
  {
    id: '3',
    name: 'Dining Table',
    price: 1599,
    image: '/dining-table.jpg',
    rating: 4.9,
    reviews: 156,
    category: 'tables',
  },
  {
    id: '4',
    name: 'Coffee Table',
    price: 599,
    image: '/coffee-table.jpg',
    rating: 4.7,
    reviews: 82,
    category: 'tables',
  },
  {
    id: '5',
    name: 'Sectional Sofa',
    price: 3299,
    image: '/sectional-sofa.jpg',
    rating: 4.9,
    reviews: 203,
    category: 'sofas',
  },
  {
    id: '6',
    name: 'Accent Chair',
    price: 799,
    image: '/accent-chair.jpg',
    rating: 4.5,
    reviews: 67,
    category: 'chairs',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Interior Designer',
    content: 'The quality and design of these furniture pieces exceeded my expectations. Perfect for my projects!',
    image: '/placeholder-user.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Homeowner',
    content: 'Delivered quickly and the build quality is outstanding. Highly recommend to anyone!',
    image: '/placeholder-user.jpg',
  },
  {
    name: 'Emma Davis',
    role: 'Architect',
    content: 'Working with this furniture brand has been seamless. They understand modern design perfectly.',
    image: '/placeholder-user.jpg',
  },
];

export const CATEGORIES = ['All', 'Sofas', 'Chairs', 'Tables', 'Accessories'];

export const PRICE_RANGES = [
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: '$1000 - $2000', min: 1000, max: 2000 },
  { label: 'Over $2000', min: 2000, max: Infinity },
];
