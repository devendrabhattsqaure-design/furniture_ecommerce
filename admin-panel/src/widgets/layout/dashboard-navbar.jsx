import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useEffect, useState } from "react";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout API
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Clear localStorage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear any user state
      setUser(null);
      
      // Redirect to login page
      navigate('/auth/sign-in');
        window.location.reload();
      
      // Show success message
      if (response.ok) {
        console.log('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/auth/sign-in');
        window.location.reload();
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all text-white-600 ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div style={{visibility:"hidden"}} className="mr-auto md:mr-4 md:w-56">
            <Input label="Search" />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          {/* Conditional rendering based on login status */}
          {user ? (
            // User is logged in - show profile menu
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  color="blue-gray"
                  className="flex items-center gap-1 px-4 normal-case"
                >
                  {user.profile_image ? (
                    <Avatar
                      src={user.profile_image}
                      alt={user.full_name}
                      size="sm"
                      className="border border-blue-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Typography
                        variant="small"
                        color="white"
                        className="text-sm font-bold"
                      >
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </Typography>
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start">
                    <Typography variant="small" className="font-normal text-blue-gray-700">
                      {user.full_name}
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500 capitalize">
                      {user.role}
                    </Typography>
                  </div>
                </Button>
              </MenuHandler>
              <MenuList className="w-72 border-0">
                <MenuItem className="flex items-center gap-3 border-b border-blue-gray-50 pb-3">
                  {user.profile_image ? (
                    <Avatar
                      src={user.profile_image}
                      alt={user.full_name}
                      size="sm"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Typography
                        variant="small"
                        color="white"
                        className="text-sm font-bold"
                      >
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </Typography>
                    </div>
                  )}
                  <div>
                    <Typography variant="h6" color="blue-gray">
                      {user.full_name}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70 capitalize"
                    >
                      {user.role}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal opacity-70"
                    >
                      {user.email}
                    </Typography>
                  </div>
                </MenuItem>
                
                <Link to="/dashboard/profile">
                  <MenuItem className="flex items-center gap-3 py-2">
                    <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      My Profile
                    </Typography>
                  </MenuItem>
                </Link>
                
                <MenuItem 
                  className="flex items-center gap-3 py-2"
                  onClick={() => setOpenConfigurator(dispatch, true)}
                >
                  <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    Settings
                  </Typography>
                </MenuItem>
                
                <hr className="my-2 border-blue-gray-50" />
                
                <MenuItem 
                  className="flex items-center gap-3 py-2 hover:bg-red-50 hover:text-red-500 focus:bg-red-50 focus:text-red-500"
                  onClick={handleLogout}
                >
                  <PowerIcon className="h-5 w-5 text-red-500" />
                  <Typography variant="small" color="red" className="font-normal">
                    Logout
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            // User is not logged in - show sign in button
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                Sign In
              </Button>
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </Link>
          )}

          {/* <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/small-logos/logo-spotify.svg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New album</strong> by Travis Scott
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 1 day ago
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu> */}
          
          {/* <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton> */}
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;