import {
  Home,
  Activity,
  Trophy,
  GitCompare,
  Users,
  BarChart3,
  Settings,
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
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

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
    </Sidebar>
  )
}
