import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  useEffect(() => {
    fetchUserOrganization();
  }, []);

  const fetchUserOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setOrganization({
            org_name: data.user.org_name || "Organization",
            org_logo: data.user.org_logo,
            org_id: data.user.org_id
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 flex flex-col`}
    >
      {/* Fixed Header */}
      <div className={`relative ${sidenavType === "dark" ? "bg-gray-800" : "bg-gray-50"} border-b border-blue-gray-50 flex-shrink-0`}>
        <Link to="/" className="py-4 px-6 flex items-center gap-3">
          {/* Organization Logo */}
          <div className="flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : organization?.org_logo ? (
              <img 
                src={organization.org_logo} 
                alt={organization.org_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          
          {/* Organization Name */}
          <div className="flex-1 min-w-0">
            <Typography
              variant="h6"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
              className="font-bold truncate text-sm"
            >
              {loading ? (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                organization?.org_name || "Organization"
              )}
            </Typography>
          </div>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-3 flex flex-col gap-1">
            {title && (
              <li className="mx-2 mt-3 mb-1">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75 text-xs"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-3 px-3 py-2 capitalize text-sm"
                      fullWidth
                    >
                      <span className="flex-shrink-0">{icon}</span>
                      <Typography
                        color="inherit"
                        className="font-medium capitalize text-sm truncate"
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "",
  brandName: "",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;