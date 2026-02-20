import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Link2,
  BarChart3,
  Target,
  MessageSquare,
  CheckCircle,
  DollarSign,
  Search,
  Users,
  Rocket,
  FileText,
  ArrowRight,
  Plus,
  Sparkles,
  Zap,
  Brain,
  Settings,

  LineChart,
  MessageCircle,
  Shield,
  Loader2,
  Clock,
  Star,
  ChevronDown,
  X,
  TrendingUp,
  Heart,
  Wallet,
  Globe,
  Hand,
  CalendarClock,
  Instagram,
  Youtube,
  Mail,
  Flag
} from 'lucide-react';
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown as ChevronDownIcon, ChevronUp } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";



import GoogleAuthButton from '../components/GoogleAuthButton';

// Utility function
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
        heroOutline: "border-2 border-primary/30 bg-background text-primary hover:bg-primary/5 hover:border-primary/50",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-xl animate-pulse-slow",
        white: "bg-background text-primary hover:bg-background/90 shadow-lg",
        nav: "bg-primary text-primary-foreground hover:bg-primary-dark",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return React.createElement(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
});
Button.displayName = "Button";

// Input component
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return React.createElement("input", {
    type,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    ),
    ref,
    ...props,
  });
});
Input.displayName = "Input";

// Select components
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  React.createElement(SelectPrimitive.Trigger, {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    ),
    ...props,
  },
    children,
    React.createElement(SelectPrimitive.Icon, { asChild: true },
      React.createElement(ChevronDownIcon, { className: "h-4 w-4 opacity-50" })
    )
  )
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  React.createElement(SelectPrimitive.Portal, null,
    React.createElement(SelectPrimitive.Content, {
      ref,
      className: cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      ),
      position,
      ...props,
    },
      React.createElement(SelectScrollUpButton),
      React.createElement(SelectPrimitive.Viewport, {
        className: cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        ),
      }, children),
      React.createElement(SelectScrollDownButton)
    )
  )
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  React.createElement(SelectPrimitive.ScrollUpButton, {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
  }, React.createElement(ChevronUp, { className: "h-4 w-4" }))
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  React.createElement(SelectPrimitive.ScrollDownButton, {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
  }, React.createElement(ChevronDownIcon, { className: "h-4 w-4" }))
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  React.createElement(SelectPrimitive.Item, {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    ),
    ...props,
  },
    React.createElement("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" },
      React.createElement(SelectPrimitive.ItemIndicator, null,
        React.createElement(Check, { className: "h-4 w-4" })
      )
    ),
    React.createElement(SelectPrimitive.ItemText, null, children)
  )
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// Dialog components
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  React.createElement(DialogPrimitive.Overlay, {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    ),
    ...props,
  })
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  React.createElement(DialogPortal, null,
    React.createElement(DialogOverlay),
    React.createElement(DialogPrimitive.Content, {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      ),
      ...props,
    },
      children,
      React.createElement(DialogPrimitive.Close, {
        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      },
        React.createElement(X, { className: "h-4 w-4" }),
        React.createElement("span", { className: "sr-only" }, "Close")
      )
    )
  )
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  React.createElement("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props })
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  React.createElement(DialogPrimitive.Title, {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props,
  })
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Landing Page Components

// Navbar Component
const Navbar = ({ onSignIn, onGetStarted, userType }) => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarStyle, setNavbarStyle] = useState('white');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Determine background color based on scroll position
      // Hero section starts at 0 and has blue background
      // LogoBar section starts around 600px and has white background
      if (scrollY < 800) {
        setNavbarStyle('white');
      } else {
        setNavbarStyle('transparent');
      }

      setScrolled(scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavbarStyles = () => {
    if (navbarStyle === 'white') {
      return {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      };
    } else {
      return {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      };
    }
  };

  const getTextStyles = () => {
    return navbarStyle === 'white' ? 'text-gray-800' : 'text-gray-800 hover:text-gray-900';
  };

  const getButtonTextStyles = () => {
    return navbarStyle === 'white'
      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
  };

  return (
    <nav
      className={`fixed top-8 left-1/2 right-1/2 z-50 transition-all duration-300 transform -translate-x-1/2 w-[90%] md:w-[70%] max-w-4xl`}
      style={getNavbarStyles()}
    >
      <div className="flex items-center justify-between h-16 md:h-20 px-8">
        <a href="/" className="flex items-center gap-2 group">
          <img src="/logo-name.png" alt="Sera Ai" className="h-6 w-auto md:h-8" />
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className={`text-sm ${getTextStyles()} transition-colors animated-underline`}>
            How It Works
          </a>
          <a href="#features" className={`text-sm ${getTextStyles()} transition-colors animated-underline`}>
            Features
          </a>

          <a href="#about" className={`text-sm ${getTextStyles()} transition-colors animated-underline`}>
            About
          </a>
          <a href="#faq" className={`text-sm ${getTextStyles()} transition-colors animated-underline`}>
            FAQ
          </a>
        </div>

        <Button
          onClick={userType === 'brand' ? onGetStarted : onSignIn}
          className={`${getButtonTextStyles()} h-10 md:h-12 px-6`}
          size="md"
          data-testid="nav-cta-btn"
        >
          {userType === 'brand' ? 'Get Started' : 'Sign In'}
        </Button>
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = ({
  userType,
  setUserType,
  handles,
  addHandle,
  removeHandle,
  updateHandle,
  onAnalyze,
  onStartCampaign,
  analyzing
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showHandHint, setShowHandHint] = useState(true);

  return (
    <section className="relative overflow-hidden overflow-x-hidden flex items-center justify-center rounded-b-3xl" style={{
      backgroundColor: '#0029FF',
      backgroundImage: `
        radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #010dc2ff 100%),
        linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)
      `,
      minHeight: '103vh',
      borderBottomLeftRadius: '3rem',
      borderBottomRightRadius: '3rem'
    }}>
      {/* Background Blobs for Glassy Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/30 rounded-full blur-[100px] animate-blob mix-blend-overlay" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-400/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-overlay" />
      </div>
      {/* 3D Logos */}
      {/* Bottom-right logo - visible on all screens */}
      <img
        src="/3dlogo.jpg"
        alt=""
        className="absolute w-124 h-60 md:w-132 md:h-72 opacity-100 -rotate-12 -bottom-10 -right-3 rounded-lg z-10"
        style={{ transform: 'scale(1.1)' }}
      />
      {/* Top-right logo - visible on all screens */}
      <img
        src="/3dlogo.jpg"
        alt=""
        className="absolute w-24 h-24 opacity-40 rotate-12 top-32 right-20 rounded-lg z-0"
        style={{ transform: 'rotate(20deg)' }}
      />
      {/* Other logos - hidden on mobile, visible on md and up */}
      <img
        src="/3dlogo.jpg"
        alt=""
        className="hidden md:block absolute w-40 h-40 opacity-10 -rotate-6 top-20 left-10 rounded-lg z-0"
        style={{ transform: 'rotate(-40deg)' }}
      />
      <img
        src="/3dlogo.jpg"
        alt=""
        className="hidden md:block absolute w-28 h-28 opacity-35 rotate-3 bottom-1/4 left-1/3 rounded-lg z-0"
        style={{ transform: 'rotate(90deg)' }}
      />
      <img
        src="/3dlogo.jpg"
        alt=""
        className="hidden md:block absolute w-36 h-36 opacity-5 -rotate-12 top-1/3 right-1/4 rounded-lg z-0"
        style={{ transform: 'rotate(-8deg)' }}
      />
      {/* Fine Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)'
        }}
      />

      {/* Supernova Top Glow */}
      <div
        className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-blue-400/30 blur-[150px] rounded-full pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Cloud Layers */}
      {/* Cloud Layers - Temporarily removed due to transparency issues */}
      {/* 
      <div
        className="absolute bottom-0 left-0 w-full h-[600px] pointer-events-none z-0"
        style={{ transform: `translateX(${scrollY * 0.05}px)` }}
      >
        <img src="/clouds-bottom.png" alt="" className="w-full h-full object-cover opacity-90" />
      </div>

      <div
        className="absolute bottom-20 left-0 w-full h-[400px] pointer-events-none z-0 mix-blend-screen opacity-80"
        style={{ transform: `translateX(${-scrollY * 0.08}px)` }}
      >
        <img src="/clouds-floating.png" alt="" className="w-full h-full object-contain" />
      </div>
      */}

      {/* Radial overlay for extra shine */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none z-0" />


      <div className="container-wide relative z-10">
        <div className=" mx-auto  relative">
          {/* User type toggle */}
          <div className="inline-flex items-center p-1 bg-white/10 backdrop-blur-sm rounded-full shadow-md border border-white/20 mb-4 -mt-12 relative">
            <div
              className="absolute  left-1 h-[calc(100%-0.5rem)] bg-white rounded-full transition-all duration-300 ease-in-out shadow-sm"
              style={{
                width: userType === 'brand' ? 'calc(50% - 0.25rem)' : 'calc(50% - 0.25rem)',
                transform: userType === 'brand' ? 'translateX(0)' : 'translateX(100%)'
              }}
            />
            <button
              data-testid="brand-toggle"
              onClick={() => {
                setUserType('brand');
                setShowHandHint(false);
              }}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${userType === 'brand'
                ? 'text-blue-600'
                : 'text-white/80 hover:text-white'
                }`}
            >
              Brand
            </button>
            <button
              data-testid="creator-toggle"
              onClick={() => {
                setUserType('creator');
                setShowHandHint(false);
              }}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${userType === 'creator'
                ? 'text-blue-600'
                : 'text-white/80 hover:text-white'
                }`}
            >
              Creator
            </button>
          </div>

          {/* Hand hint animation */}
          {showHandHint && (
            <div className="relative">
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -top-6 flex flex-col items-center"
                style={{
                  animation: 'handSwipe 3s ease-in-out infinite'
                }}
              >
                <Hand
                  className="w-4 h-4 text-white/60 mb-1"
                  style={{
                    transform: 'rotate(-15deg)',
                    animation: 'handMove 3s ease-in-out infinite'
                  }}
                />
                <span className="text-xs text-white/60 text-center whitespace-nowrap">
                  Tap to switch
                </span>
              </div>
            </div>
          )}

          {/* Content container with fixed height to prevent toggle movement */}
          <div className="min-h-[400px] relative">
            <div className="absolute inset-0 transition-all duration-300 ease-in-out">
              {userType === 'creator' ? (
                <div className="opacity-100 transform translate-y-0 transition-all duration-300 ease-in-out text-center flex flex-col items-center">
                  <div className="mt-7 max-w-6xl flex flex-col items-center">
                    <div className="hidden md:inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm mb-2">
                      <span className="text-xs font-medium text-white/90">🎉 v2.3.1</span>
                    </div>
                    <h1 className="flex flex-col items-center gap-2 text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight text-center -mb-4">
                      <span className="text-xl md:text-4xl whitespace-nowrap">TURN YOUR CONTENT INTO</span>
                      <span className="text-4xl md:text-6xl lg:text-7xl font-extrabold [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap">MORE BRAND DEALS</span>

                    </h1>
                    <div className="w-full max-w-[90vw] mx-auto px-4">
                      <p className="text-sm md:text-lg text-white/90 max-w-6xl mx-auto mt-4 -mb-2 leading-relaxed text-center whitespace-normal md:whitespace-nowrap">
                        Connect your socials. Get AI-powered pricing, brand matching & automated outreach. <br className="hidden md:block" />
                        <span className="md:hidden"> </span>Turn your influence into steady income.
                      </p>
                    </div>

                    <div className="w-full mt-8 px-4 flex justify-center relative z-20">
                      <div className="w-full max-w-lg">
                        {/* Mobile Connect Button - only shown on small screens */}
                        <div className="flex flex-col items-center w-full md:hidden mb-4">
                          <Button
                            onClick={() => {
                              const signInButton = document.querySelector('[data-testid="nav-signin-btn"]');
                              if (signInButton) signInButton.click();
                            }}
                            className="bg-white text-[#0D5CCE] hover:bg-white/90 font-medium px-8 py-4 h-14 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-auto min-w-[200px]"
                          >
                            <Link2 className="mr-2 w-4 h-6" />
                            Connect Socials
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                          <div className="flex flex-col gap-1 mt-6 text-center">
                            <span className="text-white/80 text-sm ">• No cold DMs • No messy E-mails •</span>
                            <span className="text-white/80 text-sm ">• No payment stress •</span>
                          </div>
                        </div>

                        {/* Desktop Pill Input */}
                        <div className="hidden md:block">
                          <div className="bg-white rounded-full p-2 pl-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center border border-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">

                            {/* Platform Selector */}
                            <Select
                              value={handles[0].platform}
                              onValueChange={(value) => updateHandle(0, 'platform', value)}
                            >
                              <SelectTrigger className="w-[60px] border-none focus:ring-0 shadow-none gap-2 px-2 justify-center text-gray-700 bg-transparent hover:bg-gray-50 rounded-full transition-colors" data-testid="platform-select-trigger">
                                <SelectValue placeholder={<Instagram className="w-5 h-5 text-pink-600" />}>
                                  {handles[0].platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                                  {handles[0].platform === 'youtube' && <Youtube className="w-5 h-5 text-red-600" />}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="instagram">
                                  <div className="flex items-center gap-2">
                                    <Instagram className="w-4 h-4 text-pink-600" />
                                    <span>Instagram</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="youtube">
                                  <div className="flex items-center gap-2">
                                    <Youtube className="w-4 h-4 text-red-600" />
                                    <span>YouTube</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <div className="h-8 w-px bg-gray-200 mx-1" />

                            {/* Input */}
                            <Input
                              placeholder="@paste your handle or profile URL"
                              value={handles[0].handle}
                              onChange={(e) => updateHandle(0, 'handle', e.target.value)}
                              className="flex-1 border-none shadow-none focus-visible:ring-0 text-base bg-transparent placeholder:text-gray-400 h-12 text-left"
                              data-testid="hero-handle-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') onAnalyze();
                              }}
                            />

                            {/* Connect Button */}
                            <Button
                              onClick={onAnalyze}
                              disabled={analyzing}
                              className="rounded-full px-6 py-2 h-11 text-sm font-medium shadow-md hover:shadow-lg transition-all bg-[#0D5CCE] hover:bg-[#0029FF] ml-2 shrink-0"
                              data-testid="hero-connect-btn"
                            >
                              {analyzing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  Connect <ArrowRight className="ml-2 h-3 w-3" />
                                </>
                              )}
                            </Button>
                          </div>

                          <p className="text-white/70 text-sm mt-4 text-center font-medium">
                            <span className="text-sm text-white/80 mt-5">No cold DMs</span> • <span className="text-sm text-white/80 mt-5">No messy E-mails</span> • <span className="text-sm text-white/80 mt-5">No payment stress</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="opacity-100 transform translate-y-0 transition-all duration-300 ease-in-out text-center flex flex-col items-center w-full">
                  <div className="mt-7 max-w-6xl flex flex-col items-center">
                    <div className="hidden md:inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm mb-4">
                      <span className="text-xs font-medium text-white/90">🎉 v2.3.1</span>
                    </div>
                    <h1 className="flex flex-col items-center gap-2 text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight text-center -mb-4">
                      <span className="text-xl md:text-4xl whitespace-nowrap">YOUR AI TEAMMATE FOR</span>
                      <span className="text-4xl md:text-6xl lg:text-7xl font-extrabold [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap">CREATOR MARKETING</span>
                    </h1>
                    <div className="w-full max-w-[90vw] mx-auto px-4">
                      <p className="text-sm md:text-lg text-white/90 max-w-6xl mx-auto mt-4 leading-relaxed text-center whitespace-normal md:whitespace-nowrap">
                        Sera AI is your dedicated teammate for creator marketing.<br className="hidden md:block" />
                        <span className="md:hidden"> </span> handling execution in the background, so your team isn’t managing every moving part.
                      </p>
                    </div>
                  </div>




                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full max-w-2xl mx-auto">
                    {/* Book Walkthrough Button - Outline - LEFT */}
                    <button
                      onClick={() => window.open('https://calendly.com/sera-ai/discovery-call', '_blank')}
                      className="group bg-transparent border border-white text-white hover:bg-white/10 font-medium px-8 py-4 h-14 text-base rounded-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto whitespace-nowrap"
                      data-testid="brand-meeting-btn"
                    >
                      <CalendarClock className="mr-2 w-5 h-5" />
                      Book a walkthrough
                    </button>

                    {/* Start Campaign Button - Solid White - RIGHT */}
                    <button
                      onClick={onStartCampaign}
                      className="bg-white text-[#0D5CCE] hover:bg-white/90 font-medium px-8 py-4 h-14 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto whitespace-nowrap"
                      data-testid="brand-start-campaign-btn"
                    >
                      Start a Campaign
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-white/80 mt-5">See how creator campaigns run when execution isn’t manual.</p>
                </div>
              )}
            </div>
          </div>

        </div >
      </div >
    </section >
  );
};

// Logo Bar Component
const logos = [

  { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { name: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },

];

const LogoBar = () => {
  return (
    <section className="py-12 md:py-16 bg-card/30">
      <div className="container-wide">
        <p className="text-center text-sm text-muted-foreground mb-6 md:mb-8 font-medium tracking-wide uppercase">
          Trusted by creators on
        </p>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex animate-[marquee_30s_linear_infinite] md:animate-[marquee_60s_linear_infinite] whitespace-nowrap">
            {[...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center mx-4 md:mx-12 opacity-40 hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <svg className="h-6 md:h-9 w-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d={logo.icon} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats Section Component
const stats = [
  { value: '50+', label: '50+ Creators Waitlisted', description: 'Creators signed up organically before launch' },
  { value: '4x', label: 'Faster Shortlisting', description: 'Compared to manual creator discovery workflows' },
  { value: '< 5', label: ' Minutes Setup', description: 'Onboard in minutes and run campaigns or get invites' },
  { value: '96%', label: 'Match Success Rate', description: 'Agentic AI that knows who fits and why' },
];

const StatsSection = ({ userType }) => {
  return (
    <section className="py-12 bg-white relative overflow-hidden ">
      <div className="container-wide relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
            Sera AI for Creators & Brands
          </h2>
          <p className="text-gray-600 text-lg">
            Real results. Real growth. Real partnerships.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 group"
              data-testid={`stat-card-${index + 1}`}
            >
              <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-gray-900 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-gray-600 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Workflow Section Component
const creatorWorkflow = [
  { icon: Link2, label: 'Connect Socials', color: 'from-blue-500 to-blue-600' },
  { icon: BarChart3, label: 'Analyze Performance', color: 'from-blue-500 to-blue-600' },
  { icon: Target, label: 'Match Campaigns', color: 'from-blue-500 to-blue-600' },
  { icon: MessageSquare, label: 'Auto Negotiate', color: 'from-blue-500 to-blue-600' },
  { icon: CheckCircle, label: 'Deliver Content', color: 'from-blue-500 to-blue-600' },
  { icon: DollarSign, label: 'Get Paid', color: 'from-blue-500 to-blue-600' },
];

const brandWorkflow = [
  { icon: Target, label: 'Set Goals', color: 'from-blue-500 to-blue-600' },
  { icon: BarChart3, label: 'AI Discovery', color: 'from-blue-500 to-blue-600' },
  { icon: MessageSquare, label: 'Auto Outreach', color: 'from-blue-500 to-blue-600' },
  { icon: CheckCircle, label: 'Campaign Live', color: 'from-blue-500 to-blue-600' },
  { icon: Link2, label: 'Track Results', color: 'from-blue-500 to-blue-600' },
  { icon: DollarSign, label: 'Pay & Report', color: 'from-blue-500 to-blue-600' },
];

const WorkflowSection = ({ userType }) => {
  const workflow = userType === 'creator' ? creatorWorkflow : brandWorkflow;

  return (
    <section className="relative py-20 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #336eecff 0%, #083fd8ff 50%, #0127a1ff 100%)',
      minHeight: 'auto'
    }}>


      <div className="container-wide relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4 text-white">
            {userType === 'creator' ? 'Your Path to Success' : 'Campaign Workflow'}
          </h2>
          <p className="text-white/80">
            Seamless automation from start to finish
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-2">
          {workflow.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="mt-3 text-sm font-medium text-white/90 text-center">
                  {step.label}
                </span>
              </div>
              {index < workflow.length - 1 && (
                <ArrowRight className="w-5 h-5 text-white/50 mx-2 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Benchmarks Section Component
const creatorComparison = {
  title: "Why creators choose Sera AI",
  subtitle: "Stop relying on luck. Start relying on control, growth, and consistent income.",
  cards: [
    {
      title: "Talent Agencies / Manual",
      type: "legacy",
      features: [
        "Brand Matching: Random DMs",
        "Negotiations: Back & forth emails",
        "Payouts: Net-60 / Chasing",
        "Briefs: Vague / Scope Creep",
        "Contracts: No protection",
        "Career Growth: Zero feedback"
      ]
    },
    {
      title: "Sera AI",
      type: "sera",
      features: [
        "Brand Matching: AI-Powered (True Fit)",
        "Negotiations: Automated & Fair",
        "Payouts: Instant Escrow Release",
        "Briefs: Clear & Structured",
        "Contracts: Standardized Protection",
        "Career Growth: Data-driven Insights"
      ]
    }
  ]
};

const brandComparison = {
  title: "Why brands choose Sera AI",
  subtitle: "Stop relying on luck. Start relying on data, speed, and precision.",
  cards: [
    {
      title: "Agencies",
      description: "The Old Way",
      type: "legacy",
      features: [
        "AI Creator Discovery: Limited / Manual",
        "Campaign Forecasting: Guesswork", // Will show X
        "Negotiations: Manual / Slow",
        "Campaign Tracking: Spreadsheets",
        "Fraud Detection: Separate Tools",
        "Launch Time: Weeks"
      ]
    },
    {
      title: "Sera AI",
      description: "The Operating System",
      type: "sera",
      features: [
        "AI Creator Discovery: AI-Powered Global Search",
        "Campaign Forecasting: Predictive ROI Models",
        "Negotiations: Automated Agent",
        "Campaign Tracking: Real-Time Dashboard",
        "Fraud Detection: Built-in AI",
        "Launch Time: Minutes"
      ]
    },
    {
      title: "SaaS Platforms",
      description: "The Fragmented Way",
      type: "legacy",
      features: [
        "AI Creator Discovery: Database Search",
        "Campaign Forecasting: Historical Data Only",
        "Negotiations: Manual Support",
        "Campaign Tracking: Basic Metrics",
        "Fraud Detection: Separate Tools",
        "Launch Time: Days"
      ]
    }
  ]
};

const ComparisonGrid = ({ data }) => {
  return (
    <section className="py-24 min-h-screen flex flex-col justify-center bg-white relative overflow-hidden">
      {/* Background Grid Pattern (Subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)]" />

      <div className="container-wide relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-6">
            {data.title.split('Sera AI')[0]} <span className="text-blue-600">Sera AI</span>
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className={`grid gap-6 ${data.cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {data.cards.map((card, i) => {
            const isSera = card.type === 'sera';
            return (
              <div
                key={i}
                className={`
                  relative flex flex-col p-8 rounded-2xl transition-all duration-300
                  ${isSera
                    ? 'bg-white border-2 border-blue-600 shadow-2xl shadow-blue-900/10 scale-100 md:scale-110 z-10 order-first md:order-none'
                    : 'bg-white border border-slate-200 shadow-sm opacity-100 md:opacity-90 hover:opacity-100'
                  }
                `}
              >
                {isSera && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-8 text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${isSera ? 'text-slate-900' : 'text-slate-700'}`}>
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className={`text-sm font-medium uppercase tracking-wider ${isSera ? 'text-blue-600' : 'text-slate-400'}`}>
                      {card.description}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 flex-1">
                  {card.features.map((feature, j) => {
                    const parts = feature.split(':');
                    const label = parts[0];
                    const value = parts.length > 1 ? parts.slice(1).join(':') : null;

                    return (
                      <li key={j} className="flex items-start gap-3 text-left">
                        {isSera ? (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          {value ? (
                            <>
                              <span className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isSera ? 'text-blue-600' : 'text-slate-400'}`}>
                                {label}
                              </span>
                              <span className={`text-sm leading-relaxed ${isSera ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                {value.trim()}
                              </span>
                            </>
                          ) : (
                            <span className={`text-sm leading-relaxed ${isSera ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                              {label}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


const BlueStickyScrollWorkflow = ({ userType }) => {
  const targetRef = React.useRef(null);
  const [percentage, setPercentage] = React.useState(0);
  const [curveRadius, setCurveRadius] = React.useState('50% 50% 0 0');

  React.useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the element is from the top of the viewport
      // When rect.top is at windowHeight (just entering), progress is 0.
      // When rect.top is at 0 (fully at top), progress is 1.
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));

      // Update percentage for sticky steps
      const stickyProgress = Math.max(0, Math.min(1, (-rect.top) / (rect.height - windowHeight)));
      setPercentage(stickyProgress);

      // Curve Animation: Semicircle flattens as it scrolls UP.
      // Start: Large Radius (e.g. 50% width). End: 0.
      const curve = 50 * (1 - Math.pow(progress, 2));
      setCurveRadius(`${curve}% ${curve}% 0 0`);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const creatorSteps = [
    {
      num: '01',
      title: 'Connect Socials',
      desc: 'Link your socials. Our AI instantly matches you with brands that fit your vibe.',
      icon: Link2
    },
    {
      num: '02',
      title: 'Analyze Performance',
      desc: 'We analyze your audience and engagement to justify premium rates.',
      icon: BarChart3
    },
    {
      num: '03',
      title: 'Match Campaigns',
      desc: 'Get matched with brands looking for exactly what you create.',
      icon: Target
    },
    {
      num: '04',
      title: 'Auto Negotiate',
      desc: 'Skip the DMs. Rates and deliverables are pre-agreed.',
      icon: MessageSquare
    },
    {
      num: '05',
      title: 'Deliver Content',
      desc: 'Upload drafts, get feedback, and get approval directly in the workflow.',
      icon: CheckCircle
    },
    {
      num: '06',
      title: 'Get Paid',
      desc: 'Money is escrowed. Instant payout upon approval.',
      icon: DollarSign
    }
  ];

  const brandSteps = [
    {
      num: '01',
      title: 'Set Goals',
      desc: 'Define your budget, KPIs, and target audience. We build the strategy.',
      icon: Target
    },
    {
      num: '02',
      title: 'AI Discovery',
      desc: 'We scan millions of profiles to find creators who actually influence your buyers.',
      icon: Search
    },
    {
      num: '03',
      title: 'Auto Outreach',
      desc: 'Automated outreach fills your campaign with qualified, interested creators in minutes.',
      icon: MessageSquare
    },
    {
      num: '04',
      title: 'Campaign Live',
      desc: 'Content goes live. Links are tracked. Performance is monitored in real-time.',
      icon: Rocket
    },
    {
      num: '05',
      title: 'Track Results',
      desc: 'Live performance data feeds back into the system to optimize your next move.',
      icon: BarChart3
    },
    {
      num: '06',
      title: 'Pay & Report',
      desc: 'Automatic payouts upon approval. Comprehensive reporting for your stakeholders.',
      icon: DollarSign
    }
  ];

  const steps = userType === 'creator' ? creatorSteps : brandSteps;

  // WINDING ROAD PATH - Extended to reach finish line properly
  const pathData = `
    M 0 50
    Q 100 200 250 250
    Q 400 300 500 400
    Q 600 500 500 600
    Q 400 700 250 650
    Q 100 600 50 700
    Q 0 800 100 900
    Q 200 1000 350 950
    Q 500 900 650 1000
    Q 800 1100 750 1200
    Q 700 1300 850 1350
    L 950 1370
  `;

  // Mobile winding path - extended to finish
  const mobilePathData = `
    M 0 250
    Q 50 230 150 270
    Q 250 310 300 400
    Q 350 490 250 570
    Q 150 650 100 750
    Q 50 850 150 930
    Q 250 1010 350 970
    Q 450 930 500 1010
    Q 550 1090 450 1170
    Q 350 1250 450 1330
    L 550 1350
  `;

  // Node positions - PRECISELY aligned with path curves calculated on 1400px height
  const nodePositions = [
    { top: 3.5, left: 1, align: 'left' },       // Step 1: Start (0, 50) -> Top 3.5%
    { top: 25, left: 50, align: 'left' },       // Step 2: First Curve Peak (User Approved)
    { top: 40, left: 25, align: 'left' },     // Step 3: Left Curve (Centered on loop)
    { top: 58, left: 7, align: 'left' },        // Step 4: Bottom Left Trough
    { top: 60, left: 50, align: 'left' },      // Step 5: Right Curve Peak
    { top: 80, left: 75, align: 'right' },      // Step 6: End Tip
  ];

  return (
    <section className="relative z-20 overflow-visible -mt-12 transition-all duration-300 ease-out" ref={targetRef} style={{
      borderTopLeftRadius: curveRadius,
      borderTopRightRadius: curveRadius,
      backgroundColor: '#0029FF',
      backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #010dc2ff 100%)`,
      backgroundAttachment: 'fixed',
      backgroundSize: '100% 100%',
      position: 'relative'
    }}>
      {/* Background Blobs - Static */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/30 rounded-full blur-[100px] mix-blend-overlay" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-400/30 rounded-full blur-[100px] mix-blend-overlay" />
      </div>

      {/* Hero Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)'
        }}
      />

      {/* Supernova Top Glow */}
      <div
        className="absolute -top-[5%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-blue-400/30 blur-[150px] rounded-full pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      <div className="h-[450vh] relative" style={{ zIndex: 2 }}>
        <div className="sticky top-0 h-screen w-full overflow-visible flex flex-col items-center justify-center" style={{ background: 'transparent', zIndex: 2 }}>

          {/* Header - Moved below navbar */}
          <div className={`absolute top-24 md:top-36 right-8 md:right-16 z-30 transition-opacity duration-500 text-right`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white mb-2">
              {userType === 'creator' ? 'Your Path to Success' : 'Campaign Workflow'}
            </h2>
            <p className="text-white/80 text-sm md:text-base">
              Seamless automation from start to finish
            </p>
          </div>

          {/* SVG Accurate Flowing Path - Matching Reference Image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <svg className="w-full h-full" viewBox="0 0 1000 1400" preserveAspectRatio="none" style={{ transform: 'translateX(-50px)' }}>

              {/* ACCURATE BACKGROUND PATH */}
              <path
                d={pathData}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden md:block"
              />
              <path
                d={mobilePathData}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:hidden"
              />

              {/* ACTIVE ACCURATE PATH */}
              <path
                d={pathData}
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hidden md:block"
                style={{
                  strokeDasharray: 3000,
                  strokeDashoffset: 3000 - (3000 * Math.min(1, Math.max(0, percentage * 1.0))),
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))'
                }}
              />
              <path
                d={mobilePathData}
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:hidden"
                style={{
                  strokeDasharray: 2200,
                  strokeDashoffset: 2200 - (2200 * Math.min(1, Math.max(0, percentage))),
                  filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))'
                }}
              />



              {/* END MARKER - Not stretched, properly positioned */}
              <g transform="translate(950, 1370)" style={{
                opacity: percentage > 0.8 ? 1 : 0.3,
                transition: 'opacity 0.5s ease-out'
              }}>
                <circle cx="0" cy="0" r="8" fill="white" stroke="#0D5CCE" strokeWidth="2" />
                <circle cx="0" cy="0" r="4" fill="#0D5CCE" />
              </g>

              {/* Accurate Path Flow Indicators */}
              <g opacity={percentage > 0.2 ? 0.6 : 0} style={{ transition: 'opacity 0.5s ease' }}>
                <circle cx="300" cy="180" r="2" fill="rgba(255,255,255,0.8)">
                  <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="650" cy="200" r="2" fill="rgba(255,255,255,0.8)">
                  <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="0.7s" />
                </circle>
                <circle cx="750" cy="600" r="2" fill="rgba(255,255,255,0.8)">
                  <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="1.4s" />
                </circle>
                <circle cx="350" cy="1050" r="2" fill="rgba(255,255,255,0.8)">
                  <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="2.1s" />
                </circle>
              </g>

              {/* Accurate Direction Flow */}
              <g opacity={percentage > 0.3 ? 0.4 : 0} style={{ transition: 'opacity 0.5s ease' }}>
                <defs>
                  <marker id="accurateFlowArrow" markerWidth="8" markerHeight="6"
                    refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.5)" />
                  </marker>
                </defs>
                <path d="M 150 100 Q 200 120 250 150" fill="none" stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1" markerEnd="url(#accurateFlowArrow)" />
                <path d="M 500 280 Q 550 250 600 220" fill="none" stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1" markerEnd="url(#accurateFlowArrow)" />
                <path d="M 750 600 Q 700 650 650 700" fill="none" stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1" markerEnd="url(#accurateFlowArrow)" />
              </g>
            </svg>
          </div>

          {/* Nodes Container - Allow overflow to left edge */}
          <div className="absolute inset-0 w-full h-full z-20" style={{ paddingLeft: '0px', marginLeft: '0px' }}>
            <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
              {steps.map((step, i) => {
                const pos = nodePositions[i];
                // Trigger when line passes the vertical position (Top %)
                const isVisible = percentage > (pos.top / 100);

                // Alignment Classes
                let containerClasses = 'flex-row'; // Default Left
                if (pos.align === 'right') containerClasses = 'md:flex-row-reverse flex-row';
                if (pos.align === 'bottom') containerClasses = 'flex-col';

                return (
                  <div
                    key={i}
                    className={`absolute transition-all duration-700 flex items-center gap-4 md:gap-5 
                           ${containerClasses}
                           ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}
                         `}
                    style={{
                      top: `${pos.top}%`,
                      left: `${pos.left}%`,
                      width: '320px',
                      transform: `translateY(${isVisible ? 0 : 50}px) scale(${isVisible ? 1 : 0.95})`,
                      transitionDelay: `${i * 120}ms`,
                      zIndex: 30 + i
                    }}
                  >
                    {/* Glass Icon Circle - Refined Size */}
                    <div className="shrink-0 w-16 h-16 md:w-18 md:h-18 rounded-full bg-[#0D5CCE] backdrop-blur-md border border-white/30 flex items-center justify-center z-10 relative group hover:scale-110 transition-all duration-300"
                      style={{
                        background: 'rgba(13, 92, 206, 0.85)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 24px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                      }}>
                      <step.icon className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-sm" />
                      {/* Refined glass shine effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-white/8 to-transparent opacity-60" />
                      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/30 blur-sm" />
                    </div>

                    {/* Text Content - Refined Spacing */}
                    <div className={`flex flex-col flex-1 
                      ${pos.align === 'right' ? 'md:items-end md:text-right items-start text-left' :
                        pos.align === 'bottom' ? 'items-center text-center mt-2' :
                          'items-start text-left'}`}>
                      <span className="text-xl md:text-2xl font-bold text-white/25 font-display mb-1 leading-none">0{i + 1}</span>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1.5 drop-shadow-sm leading-tight">{step.title}</h3>
                      <p className="text-white/90 font-light leading-relaxed text-sm md:text-sm drop-shadow-sm max-w-xs">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



const BrandContent = () => {
  const snakeRef = React.useRef(null);
  const [snakeProgress, setSnakeProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!snakeRef.current) return;
      const rect = snakeRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      // Calculate progress: 0 when element enters, 1 when it leaves (adjusted for sticky duration)
      // We want the animation to happen while the element is pinned.
      // Sticky starts when rect.top <= 0.

      // Simply use standardized intersection ratio or mapped scroll
      const distance = elementHeight - windowHeight;
      let p = -rect.top / distance;
      p = Math.max(0, Math.min(1, p)); // Clamp 0-1

      // Direct DOM update for performance (Smoothness)
      const textEl = document.getElementById('scrolling-text');
      if (textEl) {
        // Top: Active 0.0 - 0.6
        // Move from 100% (Right) to -100% (Left)
        let move = -100;
        if (p <= 0.6) {
          move = 100 - ((p / 0.6) * 200);
        }
        textEl.style.transform = `translateX(${move}%)`;
      }

      const textElBottom = document.getElementById('scrolling-text-bottom');
      if (textElBottom) {
        // Bottom: Active 0.3 - 1.0 (Starts very early to close gap)
        // Move from 100% (Right) to -100% (Left)
        let moveBottom = 100;
        if (p > 0.3) {
          const pBottom = (p - 0.3) / 0.7; // Normalized 0-1 over 0.7 duration
          moveBottom = 100 - (pBottom * 200);
        }
        textElBottom.style.transform = `translateX(${moveBottom}%)`;
      }

      setSnakeProgress(p); // Keep state if needed for other things, but DOM is updated directly
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    requestAnimationFrame(handleScroll); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Problem Section: Stitched Together */}
      <section className="py-12 bg-white relative overflow-visible">
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 mb-6 tracking-tight leading-tight">
              Creator marketing works better when it isn’t <span className="text-blue-600">stitched together</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Running creator campaigns usually means keeping track of creators, negotiations, briefs, drafts, timelines, and follow-ups — across tools that were never designed to work as one.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Main Container - Visual styles removed */}
            <div className="relative p-8 md:p-12">

              {/* Content Grid - "Electric Flow V8" (Color Fixed) */}
              <div className="relative z-10 w-full md:w-[75%] h-[400px] mx-auto flex items-center -mt-1 -mb-28 overflow-visible">

                {/* Connection Lines (SVG) - "High Contrast Electric" */}
                <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible" style={{ zIndex: 0 }}>
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>

                    <defs>
                      {/* 3D Drop Shadow for Depth */}
                      <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* === ROOTS V14: Staggered Schematic (3D Effect, Straight Lines, Small Curves) === */}
                    {/* Style: Thin (1px), Dark Blue, Schematic "Circuit" Pathing, Staggered Merges */}

                    <g stroke="#3464eaff" strokeWidth="0.5" fill="none" strokeLinecap="round" filter="url(#lineShadow)" className="opacity-90">
                      {/* Trunk - Main Unified Line (Y=25) - Starts from first merge (X=28) to Hub (X=88) */}
                      <path d="M 28 25 H 88" strokeWidth="1.2" />

                      {/* 1. Slack (L:5%, T:25%) -> Straight Merge at Start */}
                      <path d="M 5 25 H 28" />

                      {/* 6. Instagram (L:-3%, T:13%) -> Down -> Merge at X=32 */}
                      <path d="M -3 13 H 27 Q 28 13 28 17 V 25" />

                      {/* 4. Gmail (L:20%, T:-1%) -> Down -> Merge at X=36 */}
                      <path d="M 20 -1 H 32 Q 36 -1 36 3 V 25" />

                      {/* 2. WhatsApp (L:15%, T:39%) -> Up -> Merge at X=40 */}
                      <path d="M 15 39 H 29 Q 30 39 30 35 V 25" />

                      {/* 5. Sheets (L:1%, T:55%) -> Up -> Merge at X=44 */}
                      <path d="M 1 55 H 38 Q 40 55 40 51 V 25" />

                      {/* 3. YouTube (L:25%, T:60%) -> Up -> Merge at X=48 */}
                      <path d="M 25 65 H 44 Q 48 65 48 60 V 25" />
                    </g>
                  </svg>
                </div>

                {/* Scattered Inputs - Solid Icons (No Blend, No Shadow, No Text) */}

                {/* 1. Slack (Top Left) - Small (w-12) */}
                <div className="absolute top-[25%] left-[5%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 hover:scale-110 transition-transform duration-300 z-20">
                  <img src="/3d/icon_slack_glass.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* 2. WhatsApp (Mid Left) - Small (w-12) */}
                <div className="absolute top-[39%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 hover:scale-110 transition-transform duration-300 delay-75 z-20">
                  <img src="/3d/icon_whatsapp_new.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* 3. YouTube (Bottom Left) - Prominent (w-20) */}
                <div className="absolute top-[65%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 hover:scale-110 transition-transform duration-300 delay-150 z-20">
                  <img src="/3d/icon_youtube_new.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* 4. Gmail (Mid-Low Left) - Small (w-12) */}
                <div className="absolute -top-[1%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 hover:scale-110 transition-transform duration-300 delay-200 z-20">
                  <img src="/3d/icon_gmail.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* 5. Sheets (Center Left) - Small (w-12) */}
                <div className="absolute top-[55%] left-[1%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 hover:scale-110 transition-transform duration-300 delay-100 z-20">
                  <img src="/3d/icon_sheets_new.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* 6. Instagram (Top Inner) - Small (w-12) */}
                <div className="absolute top-[13%] -left-[3%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 hover:scale-110 transition-transform duration-300 delay-300 z-20">
                  <img src="/3d/icon_insta_new.png" alt="" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>

                {/* Center: The HUB - Balanced (w-32) */}
                <div className="absolute top-[25%] right-0 -translate-y-1/2 w-26 h-26 flex items-center justify-center z-30 translate-x-[15%]">
                  {/* WATER RIPPLE RINGS */}
                  {/* Ring 1: Immediate */}
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple"></div>
                  {/* Ring 2: 1s Delay */}
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple animation-delay-2000" style={{ animationDelay: '1s' }}></div>
                  {/* Ring 3: 2s Delay */}
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple animation-delay-4000" style={{ animationDelay: '2s' }}></div>

                  {/* Central Logo - Balanced Size */}
                  <img src="/3dlogo.jpg" alt="" className="relative w-28 h-28 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 z-40" />
                </div>



              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Solution: AI Teammate (3D Showcase) */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="container-wide relative z-1 ">
          <div className="text-center max-w-3xl mx-auto mb-16 ">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900 mb-6">
              What your <span className="text-blue-600">AI teammate</span> <br />
              actually <span className="text-blue-600">runs</span>
            </h2>
            <p className="text-lg text-slate-600">
              Sera AI handles execution across the full creator workflow.
            </p>
          </div>
        </div>

        <div className="w-[90%] mb-4 mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(260px,auto)]">

            {/* Card 1: Discovery (Span 8) */}
            <div className="md:col-span-8 relative rounded-[2rem] p-0 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50 flex items-center" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `
                radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)
              `
            }}>
              <div className="grid md:grid-cols-2 gap-0 w-full h-full items-center">

                {/* Image on Left: Full Height - Aligned Left */}
                <div className="relative h-full min-h-[100px] flex items-center justify-start order-2 md:order-1 p-4">
                  <img src="/3d/creator.png" alt="" className="w-auto h-full max-h-[110%] object-contain scale-125 [mask-image:radial-gradient(circle,white_60%,transparent_95%)] group-hover:scale-135 transition-transform duration-700" />
                </div>

                {/* Content on Right */}
                <div className="relative z-10 flex flex-col justify-center order-1 md:order-2 p-8 md:p-12">
                  <h3 className="text-4xl font-bold text-white mb-6">Creator discovery & selection</h3>
                  <p className="text-lg text-white/90 leading-relaxed font-light mb-6">
                    Stop guessing. Our AI analyzes millions of profiles to find your perfect match based on true audience overlap, engagement quality, and brand safety.
                  </p>
                  <ul className="space-y-3 text-white/80 font-light">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                      <span>Audience Demographics Deep-Dive</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                      <span>Past Performance Prediction</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                      <span>Real-time Budget Optimization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Outreach (Span 4) */}
            <div className="md:col-span-4 relative rounded-[2rem] p-6 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `
                radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)
              `
            }}>
              <div className="relative z-10">

                <h3 className="text-4xl font-bold text-white mb-3">Outreach & negotiation</h3>
                <p className="text-white/90 leading-relaxed font-light mb-6">
                  Rates, deliverables, timelines, and usage are handled in one place, without prolonged back-and-forth.
                </p>
                <ul className="space-y-3 text-white/80 font-light">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Smart Rate Negotiation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Automated Contract Usage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Unified Communication Hub</span>
                  </li>
                </ul>
              </div>
              <div className="absolute  -bottom-44 w-125 h-125 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/outreach_blue.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] rotate-3 group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Row 2 */}

            {/* Card 3: Content Direction (Span 3) */}
            <div className="md:col-span-3 relative rounded-[2rem] p-1 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50 flex flex-col items-start text-left" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `
                radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)
              `
            }}>
              <div className="relative w-96 h-96 -mb-16 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/content_blue.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] group-hover:-rotate-3 transition-transform duration-700" />
              </div>
              <div className="relative z-10 p-8 -pt-8">
                <h3 className="text-4xl font-bold text-white mb-3">Content direction</h3>
                <p className="text-white/90 leading-relaxed font-light">
                  Briefs are clear. Drafts, feedback, and approvals stay organised. <br />
                  Ensure every asset aligns perfectly with your brand voice.
                </p>
              </div>
            </div>

            {/* Card 4: Tracking (Span 3) */}
            <div className="md:col-span-3 relative rounded-[2rem] p-6 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `
                radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)
              `
            }}>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold text-white mb-4">Tracking & payouts</h3>
                <p className="text-lg text-white/90 leading-relaxed font-light">
                  Content goes live as approved. Performance is tracked. Payouts are released without follow-ups.
                </p>

              </div>
              <div className="absolute -right-8 -bottom-4 w-96 h-96 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/tracking.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Card 5: Execution (NEW) (Span 6) */}
            <div className="md:col-span-6 relative rounded-[2rem] p-8 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `
                radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)
              `
            }}>
              <div className="relative z-10 w-full md:w-[70%]">
                <h3 className="text-4xl font-bold text-white mb-6">Execution that improves with every campaign</h3>
                <p className="text-white/90 leading-relaxed font-light mb-6">
                  Most creator campaigns live and end on their own. What was learned gets buried in reports, messages, or folders — and rarely shapes the next campaign.
                </p>
                <p className="text-white/90 font-medium mb-4">Sera AI carries forward what actually matters:</p>
                <ul className="space-y-3 text-white/80 font-light">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Pricing that was agreed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Creators and formats that performed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    <span>Outcomes achieved at real cost</span>
                  </li>
                </ul>
              </div>
              <div className="absolute -bottom-36 -right-12 h-full flex items-center justify-center pointer-events-none">
                <img src="/3d/memory.png" alt="" className="w-auto h-full max-h-[110%] object-contain scale-[1.6] [mask-image:radial-gradient(circle,white_70%,transparent_100%)] group-hover:scale-[1.7] transition-transform duration-700" />
              </div>
            </div>


          </div>
        </div>

      </section>

      <ComparisonGrid data={brandComparison} />

      {/* Benefits: What this changes */}
      {/* Benefits: What this changes - NEW DESIGN */}
      {/* Benefits: What this changes - Big Scroll Design */}
      {/* Benefits: What this changes - Optimized Big Scroll */}
      <section ref={snakeRef} className="h-[900vh] relative bg-white">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col pt-32 pb-12 justify-between">

          {/* 1. Scrolling Header (Top) */}
          <div className="h-[15vh] relative w-full flex items-center mb-4 shrink-0 z-20">
            <h2
              id="scrolling-text"
              className="text-[7vw] leading-none font-bold font-display text-slate-900 whitespace-nowrap absolute left-0 will-change-transform"
              style={{ transform: 'translateX(100%)' }}
            >
              What this changes for <span className="text-blue-600">brands</span>
            </h2>
          </div>

          {/* 2. Content Grid (Middle) */}
          <div className="container-wide relative z-10 flex-1 flex items-center justify-center">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-10 w-full max-w-7xl mx-auto">
              {[
                {
                  title: "Less coordination required",
                  desc: "Automate the manual tracking. No more spreadsheets, lost DMs, or chasing creators for updates.",
                  img: "/3d/glass_efficiency_v3.png"
                },
                {
                  title: "Market-aligned negotiations",
                  desc: "Access real-time pricing data instantly. Secure fair rates without the endless back-and-forth emails.",
                  img: "/3d/glass_negotiation_v3.png"
                },
                {
                  title: "Fewer hours managing",
                  desc: "Focus on high-level strategy while our AI agent handles the logistics, briefs, and follow-ups.",
                  img: "/3d/glass_time_v3.png"
                },
                {
                  title: "Scale without complexity",
                  desc: "Launch 10 or 100 creators with the same effort. The system adapts to your volume effortlessly.",
                  img: "/3d/glass_scale_v3.png"
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 group p-4 rounded-3xl transition-colors duration-300">
                  {/* Left: Image (Smaller for better fit) */}
                  <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 relative mt-1">
                    <div className="absolute inset-0 bg-blue-100/50 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                    <img
                      src={item.img}
                      alt=""
                      className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 brightness-150 saturate-125 contrast-100"
                    />
                  </div>

                  {/* Right: Text */}
                  <div className="pt-2">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Scrolling Footer (Bottom) */}
          <div className="h-[15vh] relative w-full flex items-center mt-4 shrink-0 z-20">
            <h2
              id="scrolling-text-bottom"
              className="text-[6vw] leading-none font-bold font-display text-slate-900 whitespace-nowrap absolute left-0 will-change-transform"
              style={{ transform: 'translateX(100%)' }}
            >
              Now, your team stops running <span className="text-blue-600">campaigns.</span> They review, decide, and stay focused on <span className="text-blue-600">outcomes.</span>
            </h2>
          </div>

        </div>
      </section>
    </>
  );
};

const CreatorContent = () => {
  const snakeRef = React.useRef(null);
  const [snakeProgress, setSnakeProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!snakeRef.current) return;
      const rect = snakeRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      // Calculate progress: 0 when element enters, 1 when it leaves (adjusted for sticky duration)
      // We want the animation to happen while the element is pinned.
      // Sticky starts when rect.top <= 0.
      const distance = elementHeight - windowHeight;
      let p = -rect.top / distance;
      p = Math.max(0, Math.min(1, p)); // Clamp 0-1

      // Direct DOM update for performance (Smoothness)
      const textEl = document.getElementById('scrolling-text-creator');
      if (textEl) {
        // Top: Active 0.0 - 0.6
        // Move from 100% (Right) to -100% (Left)
        let move = -100;
        if (p <= 0.6) {
          move = 100 - ((p / 0.6) * 200);
        }
        textEl.style.transform = `translateX(${move}%)`;
      }

      const textElBottom = document.getElementById('scrolling-text-bottom-creator');
      if (textElBottom) {
        // Bottom: Active 0.3 - 1.0 (Starts very early to close gap)
        // Move from 100% (Right) to -100% (Left)
        let moveBottom = 100;
        if (p > 0.3) {
          const pBottom = (p - 0.3) / 0.7; // Normalized 0-1 over 0.7 duration
          moveBottom = 100 - (pBottom * 200);
        }
        textElBottom.style.transform = `translateX(${moveBottom}%)`;
      }

      setSnakeProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    requestAnimationFrame(handleScroll); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <>
      <section className="py-24 bg-white relative overflow-visible">
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 mb-6 tracking-tight leading-tight">
              All in one place where you can <span className="text-blue-600">control everything</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Get more brands from all in one place. Stop stitching tools together.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto -mt-10 mb-20">
            <div className="relative p-8 md:p-12">
              <div className="relative z-10 w-full md:w-[75%] h-[400px] mx-auto flex items-center -mt-1 -mb-28 overflow-visible">
                <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible" style={{ zIndex: 0 }}>
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                      <filter id="lineShadowCreator" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
                      </filter>
                    </defs>
                    <g stroke="#3464eaff" strokeWidth="0.5" fill="none" strokeLinecap="round" filter="url(#lineShadowCreator)" className="opacity-90">
                      <path d="M 28 25 H 88" strokeWidth="1.2" />
                      <path d="M 5 25 H 28" />
                      <path d="M -3 13 H 27 Q 28 13 28 17 V 25" />
                      <path d="M 20 -1 H 32 Q 36 -1 36 3 V 25" />
                      <path d="M 15 39 H 29 Q 30 39 30 35 V 25" />
                      <path d="M 1 55 H 38 Q 40 55 40 51 V 25" />
                      <path d="M 25 65 H 44 Q 48 65 48 60 V 25" />
                    </g>
                  </svg>
                </div>
                {/* Apps - Reusing Brand Side Position & Assets */}
                <div className="absolute top-[25%] left-[5%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20">
                  <img src="/3d/icon_linkedin_glass.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute top-[39%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 delay-75">
                  <img src="/3d/icon_whatsapp_new.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute top-[68%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 delay-150">
                  <img src="/3d/icon_youtube_new.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute -top-[1%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 delay-200">
                  <img src="/3d/icon_gmail.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute top-[55%] left-[1%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 delay-100">
                  <img src="/3d/icon_calendar_glass.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute top-[10%] -left-[5%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 delay-300">
                  <img src="/3d/icon_insta_new.png" className="w-full h-full object-contain mix-blend-multiply brightness-100 contrast-125" style={{ maskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle closest-side, black 70%, transparent 100%)' }} />
                </div>
                <div className="absolute top-[25%] right-0 -translate-y-1/2 w-26 h-26 flex items-center justify-center z-30 translate-x-[15%]">
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple"></div>
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ripple" style={{ animationDelay: '2s' }}></div>
                  <img src="/3dlogo.jpg" className="relative w-28 h-28 object-contain drop-shadow-2xl z-40" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-20 mt-32">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900 mb-6">
              What your <span className="text-blue-600">AI agent</span> <br />
              actually <span className="text-blue-600">manages</span>
            </h2>
            <p className="text-lg text-slate-600">
              Sera AI handles execution across the full creator workflow.
            </p>
          </div>

        </div>
        <div className="w-[90%] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(260px,auto)]">

            {/* Card 1: Verified Brand Deals (Span 8) */}
            <div className="md:col-span-8 relative rounded-[2rem] p-0 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50 flex items-center" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)`
            }}>
              <div className="grid md:grid-cols-2 gap-0 w-full h-full items-center">
                <div className="relative h-full min-h-[300px] flex items-center justify-center order-2 md:order-1 p-8">
                  <img src="/3d/creator.png" alt="" className="w-auto h-[120%] object-contain scale-110 [mask-image:radial-gradient(circle,white_60%,transparent_95%)] group-hover:scale-125 transition-transform duration-700" />
                </div>
                <div className="relative z-10 flex flex-col justify-center order-1 md:order-2 p-8 md:p-12">
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Verified Brand Deals</h3>
                  <p className="text-xl text-white/90 leading-relaxed font-light mb-8">
                    Our AI matches you with brands that actually fit your audience. No fake offers.
                  </p>
                  <ul className="space-y-4 text-white/80 font-light text-lg">
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-300"></div><span>True Audience Fit</span></li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-300"></div><span>High-Paying Niches</span></li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-300"></div><span>Long-term Partnerships</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Auto Pitching */}
            <div className="md:col-span-4 relative rounded-[2rem] p-6 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)`
            }}>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold text-white mb-4">Auto Pitching</h3>
                <p className="text-lg text-white/90 leading-relaxed font-light mb-6">
                  We pitch for you. Sera AI sends personalized pitches to brands 24/7.
                </p>
                <ul className="space-y-2 text-white/80 font-light text-sm">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-300"></div><span>Personalized DMs</span></li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-300"></div><span>Follow-ups handled</span></li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-300"></div><span>Replies to your dashboard</span></li>
                </ul>
              </div>
              <div className="absolute  -bottom-44 w-125 h-125 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/outreach_blue.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] rotate-3 group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Card 3: Brief Management (Content) */}
            <div className="md:col-span-3 relative rounded-[2rem] p-1 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50 flex flex-col items-start text-left" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)`
            }}>
              <div className="relative w-96 h-96 -mb-16 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/content_blue.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] group-hover:-rotate-3 transition-transform duration-700" />
              </div>
              <div className="relative z-10 p-8 -pt-8">
                <h3 className="text-4xl font-bold text-white mb-3">Clear Briefs</h3>
                <p className="text-white/90 leading-relaxed font-light">
                  Know exactly what to create. No guessing.
                </p>
              </div>
            </div>

            {/* Card 4: Payments (Tracking) */}
            <div className="md:col-span-3 relative rounded-[2rem] p-6 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)`
            }}>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold text-white mb-4">Guaranteed Pay</h3>
                <p className="text-lg text-white/90 leading-relaxed font-light">
                  Escrowed funds released automatically.
                </p>
              </div>
              <div className="absolute -right-8 -bottom-4 w-96 h-96 opacity-100 group-hover:opacity-100 transition-opacity">
                <img src="/3d/tracking.png" alt="" className="w-full h-full object-contain [mask-image:radial-gradient(circle,white_40%,transparent_80%)] group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Card 5: Career Growth (Execution) */}
            <div className="md:col-span-6 relative rounded-[2rem] p-8 overflow-hidden group border border-blue-600 hover:border-white/20 transition-all duration-500 shadow-2xl shadow-blue-900/50" style={{
              backgroundColor: '#0029FF',
              backgroundImage: `radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #2563eb 100%)`
            }}>
              <div className="relative z-10 w-full md:w-[70%]">
                <h3 className="text-4xl font-bold text-white mb-6">Career Growth</h3>
                <p className="text-white/90 leading-relaxed font-light mb-6">
                  Your AI agent learns what deals you like.
                </p>
                <ul className="space-y-3 text-white/80 font-light">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div><span>Higher Rates</span></li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div><span>Better Brands</span></li>
                </ul>
              </div>
              <div className="absolute -bottom-36 -right-12 h-full flex items-center justify-center pointer-events-none">
                <img src="/3d/memory.png" alt="" className="w-auto h-full max-h-[110%] object-contain scale-[1.6] [mask-image:radial-gradient(circle,white_70%,transparent_100%)] group-hover:scale-[1.7] transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ComparisonGrid data={creatorComparison} />
      {/* What this changes for creators (Sticky Scroll) */}
      <section ref={snakeRef} className="h-[900vh] relative bg-white">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col pt-32 pb-12 justify-between">

          {/* 1. Scrolling Header (Top) */}
          <div className="h-[15vh] relative w-full flex items-center mb-4 shrink-0 z-20">
            <h2
              id="scrolling-text-creator"
              className="text-[7vw] leading-none font-bold font-display text-slate-900 whitespace-nowrap absolute left-0 will-change-transform"
              style={{ transform: 'translateX(100%)' }}
            >
              What this changes for <span className="text-blue-600">creators</span>
            </h2>
          </div>

          {/* 2. Content Grid (Middle) */}
          <div className="container-wide relative z-10 flex-1 flex items-center justify-center">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-10 w-full max-w-7xl mx-auto">
              {[
                {
                  title: "No endless outreach",
                  desc: "You shouldn’t have to spam inboxes to get noticed. Stop decoding half-written briefs.",
                  img: "/3d/glass_time_v3.png"
                },
                {
                  title: "No scope creep",
                  desc: "No last-minute \"can you also add this?\". Every campaign comes with clear direction.",
                  img: "/3d/glass_negotiation_v3.png"
                },
                {
                  title: "No chasing money",
                  desc: "Definitely shouldn’t be checking banks wondering if paid. Payouts are handled inside.",
                  img: "/3d/glass_scale_v3.png"
                },
                {
                  title: "Focus on creating",
                  desc: "Your time goes into creating strong content, not managing chaos. We handle the rest.",
                  img: "/3d/glass_efficiency_v3.png"
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 group p-4 rounded-3xl transition-colors duration-300">
                  {/* Left: Image (Smaller for better fit) */}
                  <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 relative mt-1">
                    <div className="absolute inset-0 bg-blue-100/50 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                    <img
                      src={item.img}
                      alt=""
                      className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 brightness-150 saturate-125 contrast-100"
                    />
                  </div>

                  {/* Right: Text */}
                  <div className="pt-2">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Scrolling Footer (Bottom) */}
          <div className="h-[15vh] relative w-full flex items-center mt-4 shrink-0 z-20">
            <h2
              id="scrolling-text-bottom-creator"
              className="text-[6vw] leading-none font-bold font-display text-slate-900 whitespace-nowrap absolute left-0 will-change-transform"
              style={{ transform: 'translateX(100%)' }}
            >
              Now, you stop chasing <span className="text-blue-600">brands.</span> You create, connect, and focus on <span className="text-blue-600">growth.</span>
            </h2>
          </div>

        </div>
      </section>







    </>
  );
};

// Features Section Component


// FAQ Section Component
const creatorFAQs = [
  {
    question: 'What is Sera AI?',
    answer: 'Sera AI is an AI-powered platform that helps creators monetize their influence. We analyze your social profiles, generate fair rate cards, match you with relevant brands, and automate outreach and negotiations—all so you can focus on creating content.'
  },
  {
    question: 'Who does Sera AI work for?',
    answer: 'Sera AI works for creators of all sizes across Instagram, TikTok, YouTube, LinkedIn, and Twitter. Whether you have 10K or 10M followers, our AI tailors opportunities to your specific audience and engagement metrics.'
  },
  {
    question: 'Is Sera AI free for creators/influencers?',
    answer: 'Yes! Sera AI is free for creators to join. We only earn when you earn—taking a small commission on successful brand deals facilitated through our platform.'
  },
  {
    question: 'How does Sera AI help me find the perfect brand match?',
    answer: 'Our AI analyzes your content niche, audience demographics, engagement patterns, and past collaborations to match you with brands that genuinely align with your style and followers. You get 5 new curated opportunities daily.'
  },
  {
    question: 'How does payment work on Sera AI?',
    answer: 'All payments are escrowed upfront before you start any deliverable. Once you complete the campaign requirements and the brand approves, payment is released to you immediately. No chasing invoices, no delays.'
  },
  {
    question: 'How does Sera AI set the rate?',
    answer: 'Our AI analyzes your engagement rates, audience quality, past brand deal performance, platform benchmarks, and market rates to suggest optimal pricing. You always have final control to adjust your rates.'
  }
];

const brandFAQs = [
  {
    question: 'What is Sera AI?',
    answer: 'Sera AI is your AI Teammate for creator marketing. We automate the entire campaign lifecycle—from creator discovery and outreach to negotiations, campaign execution, and payment processing.'
  },
  {
    question: 'How does creator discovery work?',
    answer: 'Our AI searches millions of creator profiles, scoring them on audience fit, engagement authenticity, brand safety, and budget alignment. You get curated recommendations, not endless scrolling.'
  },
  {
    question: 'Can Sera AI predict campaign performance?',
    answer: 'Yes! Before you commit budget, our AI simulates expected reach, impressions, engagement, and conversions based on historical data and creator metrics. Plan with confidence, not guesswork.'
  },
  {
    question: 'How does pricing and negotiation work?',
    answer: 'You set your target CPM, CPC, and budget constraints. Our AI handles creator negotiations, counter-offers, and budget optimization to maximize your campaign efficiency within your parameters.'
  },
  {
    question: 'What platforms do you support?',
    answer: 'We support multi-platform campaigns across Instagram, YouTube, and LinkedIn. Manage all your creator marketing from one unified dashboard.'
  },
  {
    question: 'How are payments handled?',
    answer: 'Payments are escrowed when campaigns are approved. Funds are released to creators automatically upon deliverable completion and brand approval. Full transparency, zero hassle.'
  }
];

const FAQSection = ({ userType }) => {
  const [openIndex, setOpenIndex] = React.useState(0);
  const faqs = userType === 'creator' ? creatorFAQs : brandFAQs;

  return (
    <section id="faq" className="section-padding">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about Sera AI
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
              >
                <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = ({ userType, onGetStarted }) => {
  return (
    <section className="py-24 bg-white">
      <div className="relative w-[90%] md:w-[80%] mx-auto rounded-[3rem] overflow-hidden px-6 py-20 md:px-12 md:py-24 text-center shadow-2xl shadow-blue-900/20"
        style={{
          backgroundColor: '#0029FF',
          backgroundImage: 'radial-gradient(90% 90% at 50% 10%, #4070FF 0%, #0029FF 45%, #010dc2ff 100%)',
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%'
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* Static Blobs + Grid + Glow for CTA */}
          <div className="absolute inset-0 bg-blue-400/10 mix-blend-overlay" />

          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.3
            }}
          />
          <div
            className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-blue-400/30 blur-[100px] rounded-full pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* 3D Logos - Show only 2 on mobile, all on larger screens */}
          <img
            src="/3dlogo.jpg"
            alt=""
            className="absolute w-24 h-24 opacity-20 -rotate-12 top-10 left-10 rounded-lg hidden md:block"
            style={{ transform: 'rotate(-15deg) scale(1.1)' }}
          />
          <img
            src="/3dlogo.jpg"
            alt=""
            className="absolute w-16 h-16 opacity-15 rotate-12 top-1/4 right-16 rounded-lg"
            style={{ transform: 'rotate(20deg)' }}
          />
          <img
            src="/3dlogo.jpg"
            alt=""
            className="absolute w-32 h-32 opacity-10 -rotate-6 bottom-20 left-1/4 rounded-lg hidden md:block"
            style={{ transform: 'rotate(-10deg)' }}
          />

          <img
            src="/3dlogo.jpg"
            alt=""
            className="absolute w-28 h-28 opacity-10 -rotate-12 top-1/3 right-1/4 rounded-lg"
            style={{ transform: 'rotate(-8deg)' }}
          />
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        <div className="container-narrow relative z-10 text-center">


          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-primary-foreground mb-6">
            {userType === 'creator'
              ? 'Get high-quality brand deals now with Sera AI'
              : 'Launch your campaign today with Sera AI'}
          </h2>

          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            {userType === 'creator'
              ? 'Join thousands of creators who turned their influence into predictable income. Sera AI helps creators create more, stress less, and monetise their content through real brand work.'
              : 'If you’re running creator marketing and want execution to feel lighter, not heavier - a short walkthrough will make it clear whether Sera AI fits how your team works.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {userType === 'creator' ? (
              <Button
                onClick={onGetStarted}
                variant="white"
                size="xl"
                className="shadow-xl"
                data-testid="connect-socials-btn"
              >
                Connect Socials
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <a
                href="https://calendly.com/sera-ai/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 shadow-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                data-testid="book-meeting-btn"
              >
                Book a walkthrough
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            )}
          </div>

          <p className="mt-5 text-sm text-primary-foreground/60">
            No Obligation. Just clarity.
          </p>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-white w-full">
      <div className="container-wide py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24 mb-8 mt-8">
          <div className="max-w-sm">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo-name-top.png" alt="Sera Ai" className="h-8 w-auto" />
            </a>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Agentic AI - creator marketing platform for brands and creators.
            </p>
            <div className="flex gap-4">

              <a href="https://www.linkedin.com/company/sera-ai" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/sera_ai/" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

            </div>
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 mt-3">
              <p className="text-sm text-muted-foreground">
                © {currentYear} Sera AI. All rights reserved.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>





      </div>
    </footer>
  );
};

// Auth Dialog Component
const AuthDialog = ({
  open,
  onOpenChange,
  onAuth,
  onGoogleAuth,
  authMode,
  setAuthMode,
  authData,
  setAuthData,
  userType,
  isGoogleLoading,
  onForgotPassword,
  onResendVerification
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto sm:mx-0 sm:max-w-md" data-testid="auth-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display text-foreground">
            {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {authMode === 'signup'
              ? `Join as a ${userType} to get started`
              : 'Sign in to your account'}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={onGoogleAuth}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={onAuth} className="space-y-4">
            {authMode === 'signup' && userType === 'creator' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={authData.name}
                  onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                  required
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                required
                data-testid="auth-email-input"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                required
                data-testid="auth-password-input"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              className="w-full"
              data-testid="auth-submit-btn"
            >
              {authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
              className="text-primary hover:text-primary-dark font-medium ml-2 transition-colors"
              data-testid="auth-toggle-btn"
            >
              {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {authMode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={onResendVerification}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Didn't receive verification email? Resend
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main App Component
export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState('brand');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [handles, setHandles] = useState([{ platform: 'instagram', handle: '' }]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL parameters for auth feedback
  useEffect(() => {
    const error = searchParams.get('error');
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    const login = searchParams.get('login');

    if (error) {
      switch (error) {
        case 'oauth_error':
          toast.error('Google authentication failed');
          break;
        case 'oauth_failed':
          toast.error('Google authentication failed. Please try again.');
          break;
        case 'missing_code':
          toast.error('Authentication was cancelled');
          break;
        default:
          toast.error('Authentication error occurred');
      }
    }

    if (verified === 'true') {
      toast.success('Email verified successfully! You can now log in.');
    }

    if (searchParams.get('already_verified') === 'true') {
      toast.info('Email was already verified. You can log in now.');
    }

    if (reset === 'success') {
      toast.success('Password reset successfully! You can now log in with your new password.');
    }

    if (login === 'success') {
      toast.success('Successfully logged in with Google!');
    }
  }, [searchParams]);

  // Helper to open auth in specific mode
  const openAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = authMode === 'signup'
        ? { ...authData, role: userType }
        : { email: authData.email, password: authData.password };

      const response = await axios.post(endpoint, payload);

      if (authMode === 'signup' && response.data.requiresVerification) {
        toast.success('Account created! Please check your email to verify your account.');
        setShowAuth(false);
        return;
      }

      // Handle successful login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success(authMode === 'signup' ? 'Account created successfully!' : 'Welcome back!');

      // If we have handles to analyze, do it after login
      const validHandles = handles.filter(h => h.handle.trim());
      if (validHandles.length > 0) {
        await analyzeProfilesAfterLogin(validHandles);
      } else {
        // Navigate to appropriate dashboard based on user type
        navigate(response.data.user.role === 'creator' ? '/creator' : '/brand');
      }

      setShowAuth(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.data?.error ||
        'Authentication failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProfilesAfterLogin = async (validHandles) => {
    setAnalyzing(true);
    try {
      const response = await axios.post('/api/profile/analyze', { handles: validHandles });

      if (response.data.success) {
        const successfulAnalyses = response.data.results.filter(r => r.success);
        if (successfulAnalyses.length > 0) {
          toast.success(`Successfully analyzed ${successfulAnalyses.length} profile(s)!`);
          navigate('/creator');
        } else {
          toast.error('Failed to analyze profiles. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.data?.error ||
        'Profile analysis failed';
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      // Use the backend URL for Google OAuth
      const authUrl = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/google`;
      const stateParam = encodeURIComponent(JSON.stringify({ userType }));
      const urlWithUserType = `${authUrl}?state=${stateParam}`;

      // Redirect to the backend OAuth endpoint
      window.location.href = urlWithUserType;
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to initiate Google authentication');
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowAuth(false);
    navigate('/forgot-password');
  };

  const handleResendVerification = async () => {
    if (!authData.email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      await axios.post('/api/auth/resend-verification', { email: authData.email });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to send verification email');
    }
  };

  const addHandle = () => {
    setHandles([...handles, { platform: 'instagram', handle: '' }]);
  };

  const removeHandle = (index) => {
    const newHandles = handles.filter((_, i) => i !== index);
    setHandles(newHandles);
  };

  const updateHandle = (index, field, value) => {
    const newHandles = [...handles];
    newHandles[index] = { ...newHandles[index], [field]: value };
    setHandles(newHandles);
  };

  const handleAnalyze = () => {
    const validHandles = handles.filter(h => h.handle.trim());
    if (validHandles.length === 0) {
      toast.error('Please enter at least one handle');
      return;
    }
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        userType={userType}
        onSignIn={() => openAuth('login')}
        onGetStarted={() => openAuth('signup')}
      />

      <HeroSection
        userType={userType}
        setUserType={setUserType}
        handles={handles}
        addHandle={addHandle}
        removeHandle={removeHandle}
        updateHandle={updateHandle}
        onAnalyze={handleAnalyze}
        onStartCampaign={() => openAuth('signup')}
        analyzing={analyzing}
      />


      <LogoBar />

      <StatsSection userType={userType} />

      {userType === 'brand' ? <BrandContent /> : <CreatorContent />}

      <BlueStickyScrollWorkflow userType={userType} />

      <FAQSection userType={userType} />

      <CTASection
        userType={userType}
        onGetStarted={() => setShowAuth(true)}
      />

      <Footer />

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onAuth={handleAuth}
        onGoogleAuth={handleGoogleAuth}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authData={authData}
        setAuthData={setAuthData}
        userType={userType}
        isGoogleLoading={isGoogleLoading || isLoading}
        onForgotPassword={handleForgotPassword}
        onResendVerification={handleResendVerification}
        isLoading={isLoading}
      />
    </div>
  );
}