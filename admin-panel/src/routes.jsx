// admin-panel/src/routes.js
import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UsersIcon,
  CubeIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  ShoppingBagIcon, 
  CalendarDaysIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

// Import all management components
import UserManagement from "@/pages/dashboard/UserManagement";
import AttendanceManagement from "./pages/dashboard/AttendanceManagement";
import ProductManagement from "@/pages/dashboard/ProductManagement";
import BlogManagement from "@/pages/dashboard/BlogManagement";
import SliderManagement from "@/pages/dashboard/SliderManagement";
import CategoryManagement from "@/pages/dashboard/CategoryManagement";
import OrderManagement from "@/pages/dashboard/OrderManagement";
import UserDetailsPage from "./pages/dashboard/UserDetailsPage";

const icon = {
  className: "w-5 h-5 text-inherit",
};

// Function to get user role from localStorage
const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

// Base dashboard pages (always visible)
const baseDashboardPages = [
  {
    icon: <HomeIcon {...icon} />,
    name: "dashboard",
    path: "/home",
    element: <Home />,
  },
  {
    icon: <DocumentTextIcon {...icon} />,
    name: "blog",
    path: "/blog",
    element: <BlogManagement />,
  },
  {
    icon: <PhotoIcon {...icon} />,
    name: "slider",
    path: "/slider",
    element: <SliderManagement />,
  },
  {
    icon: <TagIcon {...icon} />,
    name: "category",
    path: "/category",
    element: <CategoryManagement />,
  },
  {
    icon: <CalendarDaysIcon {...icon} />,
    name: "Attendance",
    path: "/attendance",
    element: <AttendanceManagement />,
  },
  {
    icon: <CubeIcon {...icon} />,
    name: "product management",
    path: "/product-management",
    element: <ProductManagement />,
  },
  {
    icon: <UserCircleIcon {...icon} />,
    name: "profile",
    path: "/profile",
    element: <Profile />,
  },
  {
    icon: <TableCellsIcon {...icon} />,
    name: "tables",
    path: "/tables",
    element: <Tables />,
  },
  {
    icon: <InformationCircleIcon {...icon} />,
    name: "notifications",
    path: "/notifications",
    element: <Notifications />,
  },
];

// Admin-only pages
const adminPages = [
  {
    icon: <UsersIcon {...icon} />,
    name: "user management",
    path: "/user-management",
    element: <UserManagement />,
  },
  {
    icon: <ShoppingBagIcon {...icon} />,
    name: "order management",
    path: "/order-management",
    element: <OrderManagement />,
  },
];

// User details page (hidden from sidebar)
const userDetailsPage = {
  icon: <EyeIcon {...icon} />,
  name: "user details",
  path: "/users/:userId", // Changed from "/dashboard/users/:userId" to "/users/:userId"
  element: <UserDetailsPage />,
  hideFromSidebar: true,
};

// Combine pages based on user role
const getDashboardPages = () => {
  const pages = [...baseDashboardPages];
  
  if (isAdmin()) {
    // Add admin pages after dashboard
    pages.splice(1, 0, ...adminPages);
  }
  
  return pages;
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      ...getDashboardPages(),
      userDetailsPage, // Add user details page
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;