import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Package,
  Wrench,
  Image as ImageIcon,
  Megaphone,
  BookOpen,
  Mail,
  FileText,
  Users,
  BarChart3,
  FolderDown,
  ShieldCheck,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "orders"
  | "messages"
  | "bookings"
  | "products"
  | "services"
  | "gallery"
  | "posters"
  | "guides"
  | "resources"
  | "newsletter"
  | "content"
  | "team"
  | "stats"
  | "security";

type Item = { key: AdminSection; label: string; icon: React.ElementType };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Operations",
    items: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "orders", label: "Orders", icon: ShoppingCart },
      { key: "messages", label: "Messages", icon: MessageSquare },
      { key: "bookings", label: "Bookings", icon: Calendar },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { key: "products", label: "Products", icon: Package },
      { key: "services", label: "Services", icon: Wrench },
      { key: "gallery", label: "Gallery", icon: ImageIcon },
      { key: "posters", label: "Ads", icon: Megaphone },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "guides", label: "Guides", icon: BookOpen },
      { key: "resources", label: "Resources", icon: FolderDown },
      { key: "newsletter", label: "Newsletter", icon: Mail },
      { key: "content", label: "Page Content", icon: FileText },
    ],
  },
  {
    label: "Organisation",
    items: [
      { key: "team", label: "Team", icon: Users },
      { key: "stats", label: "Stats", icon: BarChart3 },
      { key: "security", label: "Security", icon: ShieldCheck },
    ],
  },
];

export function AdminSidebar({
  section,
  onSelect,
}: {
  section: AdminSection;
  onSelect: (s: AdminSection) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={section === item.key}
                      onClick={() => onSelect(item.key)}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export default AdminSidebar;
