// components/icons.tsx
import {
    LucideProps,
    Github,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Chrome,
    Home,
    Settings,
    User,
    PanelLeft,
    Search,
    type Icon as LucideIcon,
    ClipboardList, // Placeholder for Interview
    LogOut,
    LifeBuoy,
  } from "lucide-react"
  
//   export type Icon = LucideIcon
  
  export const Icons = {
    gitHub: Github,
    google: Chrome,
    spinner: Loader2,
    warning: AlertTriangle,
    success: CheckCircle2,
    home: Home,
    settings: Settings,
    user: User,
    panelLeft: PanelLeft,
    search: Search,
    interview: ClipboardList, // Or Mic, MessageSquare etc.
    logout: LogOut,
    support: LifeBuoy
  };