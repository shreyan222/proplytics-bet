
import {
  Home,
  Activity,
  Trophy,
  GitCompare,
  Flame,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Calendar,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Props Tracker",
    url: "/tracker",
    icon: Activity,
  },
  {
    title: "Top Props",
    url: "/best-props",
    icon: Trophy,
  },
  {
    title: "Compare Props",
    url: "/compare",
    icon: GitCompare,
  },
  {
    title: "Hot Props",
    url: "/hot-props",
    icon: Flame,
  },
  {
    title: "Players",
    url: "/players",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Recap",
    url: "/recap",
    icon: Calendar,
  },
  {
    title: "Using Proplytics",
    url: "/using-proplytics",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useSupabaseAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/landing')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-800/95 backdrop-blur-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-3">
              <img  
                src="final_logo.png" 
                alt="Proplytics Logo" 
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                PROPLYTICS
              </span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-muted data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-accent/20 data-[active=true]:border data-[active=true]:border-primary/30"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary group-data-[active=true]:text-primary transition-colors" />
                      <span className="text-muted-foreground group-hover:text-foreground group-data-[active=true]:text-foreground transition-colors font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* User info and logout at bottom */}
      <SidebarFooter className="p-4 border-t border-gray-700">
        <div className="space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                Signed in
              </p>
            </div>
          </div>
          
          {/* Logout button */}
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-gray-700/50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
