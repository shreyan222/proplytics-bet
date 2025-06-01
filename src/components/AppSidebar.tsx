
import {
  Home,
  Activity,
  Trophy,
  GitCompare,
  Users,
  BarChart3,
  Settings,
  Database,
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
    title: "Best Props",
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
    title: "Data Processing",
    url: "/data-processing",
    icon: Database,
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
    <Sidebar className="border-r border-slate-700 bg-slate-900/90 backdrop-blur-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/402b1e50-6b1e-40ae-abbb-0c98816bea46.png" 
                alt="Proplytics Logo" 
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
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
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-slate-800/50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600/20 data-[active=true]:to-blue-500/20 data-[active=true]:border data-[active=true]:border-blue-500/30"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                      <item.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-400 group-data-[active=true]:text-blue-400 transition-colors" />
                      <span className="text-slate-300 group-hover:text-white group-data-[active=true]:text-white transition-colors font-medium">{item.title}</span>
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
