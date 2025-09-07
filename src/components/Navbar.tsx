import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Menu, Search, Phone, User, Settings, LogOut, Shield, Wrench, Heart, TrendingUp, Package, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart, useWishlist } from "@/hooks/useAccessories";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search as SearchComponent } from "./Search";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { user, signOut, userRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { data: cartItems = [] } = useCart(user?.id);
  const { data: wishlistItems = [] } = useWishlist(user?.id);

  const closeMenu = () => setIsOpen(false);

  // Get user initials for avatar fallback
  const getUserInitials = (email: string) => {
    return email?.slice(0, 2).toUpperCase() || 'US';
  };

  // Profile Dropdown Component
  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent/50 transition-colors">
          <Avatar className="h-8 w-8 transition-transform hover:scale-105">
            <AvatarImage src="" alt={user?.email || "User"} />
            <AvatarFallback className={`text-sm transition-colors ${userRole === 'admin' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-primary text-primary-foreground'}`}>
              {getUserInitials(user?.email || '')}
            </AvatarFallback>
          </Avatar>
          {userRole === 'admin' && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              {userRole === 'admin' && (
                <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t('nav.dashboard')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/orders" className="w-full cursor-pointer">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </DropdownMenuItem>
        {userRole === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('nav.admin')}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/admin/repairs" className="w-full cursor-pointer">
                <Wrench className="mr-2 h-4 w-4" />
                <span>{t('nav.repairManagement')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/accessories" className="w-full cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>{t('nav.accessoriesManagement')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/trade-in" className="w-full cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>{t('nav.tradeInManagement')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/orders" className="w-full cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Order Management</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={async () => {
            console.log('Logout button clicked');
            try {
              await signOut();
              console.log('Sign out successful');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <div className={`${mobile ? 'flex flex-col space-y-2' : 'hidden md:flex items-center space-x-8'}`}>
      <Link 
        to="/" 
        className={`${mobile ? 'flex items-center px-3 py-2 rounded-lg hover:bg-accent transition-colors' : 'text-foreground hover:text-primary transition-colors'} font-medium`}
        onClick={onLinkClick}
      >
        {t('nav.phones')}
      </Link>
      <Link 
        to="/accessories" 
        className={`${mobile ? 'flex items-center px-3 py-2 rounded-lg hover:bg-accent transition-colors' : 'text-foreground hover:text-primary transition-colors'} font-medium`}
        onClick={onLinkClick}
      >
        {t('nav.accessories')}
      </Link>
      <Link 
        to="/repairs" 
        className={`${mobile ? 'flex items-center px-3 py-2 rounded-lg hover:bg-accent transition-colors' : 'text-foreground hover:text-primary transition-colors'} font-medium`}
        onClick={onLinkClick}
      >
        {t('nav.repairs')}
      </Link>
     
      <a 
        href="/about" 
        className={`${mobile ? 'flex items-center px-3 py-2 rounded-lg hover:bg-accent transition-colors' : 'text-foreground hover:text-primary transition-colors'} font-medium`}
        onClick={onLinkClick}
      >
        {t('nav.about')}
      </a>
    </div>
  );

  const UserActions = ({ mobile = false, onActionClick = () => {} }) => (
    <div className={`${mobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-4'}`}>
      {!mobile && (
        <>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSearchModalOpen(true)}
            className="hover:bg-accent/50"
          >
            <Search className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </Link>
        </>
      )}
      
      {user ? (
        <>
          {!mobile ? (
            // Desktop: Show profile dropdown
            <ProfileDropdown />
          ) : (
            // Mobile: Show traditional buttons
            <>
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback className={`text-sm ${userRole === 'admin' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                    {getUserInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                {userRole === 'admin' && (
                  <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
                  <Link to="/dashboard" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Link to="/orders" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                  </Link>
              {userRole === 'admin' && (
                <>
                  <Link to="/admin/repairs" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Wrench className="h-4 w-4 mr-2" />
                      {t('nav.repairManagement')}
                    </Button>
                  </Link>
                  <Link to="/admin/accessories" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('nav.accessoriesManagement')}
                    </Button>
                  </Link>
                  <Link to="/admin/trade-in" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {t('nav.tradeInManagement')}
                    </Button>
                  </Link>
                  <Link to="/admin/orders" onClick={onActionClick}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Order Management
                    </Button>
                  </Link>
                </>
              )}
              <Button 
                variant="ghost" 
                onClick={async () => { 
                  console.log('Mobile logout button clicked');
                  try {
                    await signOut();
                    console.log('Mobile sign out successful');
                    onActionClick();
                  } catch (error) {
                    console.error('Mobile sign out error:', error);
                  }
                }} 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.signOut')}
              </Button>
            </>
          )}
        </>
      ) : (
        <Link to="/auth" onClick={onActionClick}>
          <Button variant="default" className={mobile ? "w-full" : "hidden sm:inline-flex"}>
            {t('nav.signIn')}
          </Button>
        </Link>
      )}

      {mobile && (
        <div className="flex gap-3 pt-4 border-t border-border">
          <LanguageSwitcher variant="button" size="sm" className="flex-1" />
          <Link to="/wishlist" onClick={onActionClick}>
            <Button variant="outline" size="sm" className="relative">
              <Heart className="h-4 w-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/cart" onClick={onActionClick}>
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Phone className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground font-display">PhoneHub</span>
          </Link>

          {/* Desktop Navigation */}
          <NavLinks />

          {/* Desktop Actions */}
          <div className="hidden md:flex">
            <UserActions />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchModalOpen(true)}
              className="hover:bg-accent/50"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] flex flex-col">
                <SheetHeader className="pb-4 flex-shrink-0">
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <Phone className="h-6 w-6 text-primary" />
                    PhoneHub
                  </SheetTitle>
                  <SheetDescription className="text-sm">
                    Navigate through our services
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-2">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">Navigation</h3>
                    <NavLinks mobile onLinkClick={closeMenu} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">Quick Actions</h3>
                    <UserActions mobile onActionClick={closeMenu} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchComponent 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;