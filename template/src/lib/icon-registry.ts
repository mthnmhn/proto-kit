import type { LucideIcon } from 'lucide-react';
import {
  Activity, AlertCircle, Archive, ArrowRight, BarChart3, Bell, BookOpen,
  BookUser, Briefcase, Building2, Calendar, Check, ChevronRight,
  CircleDollarSign, ClipboardList, Clock, Cloud, Code, Cog, CreditCard,
  Database, Download, Edit, Eye, File, FileText, Filter, Flag, Folder,
  FolderTree, Globe, Grid2x2, HardDrive, Heart, Home, Image, Inbox,
  Key, Layers, LayoutDashboard, Link, List, Lock, Mail, Map, MapPin,
  MessageSquare, Monitor, Moon, MoreHorizontal, Network, Package,
  PanelLeftClose, PanelLeftOpen, Pencil, PieChart, Play, Plus, Power,
  Repeat, Scale, ScrollText, Search, Send, Server, Settings, Share2,
  Shield, ShieldCheck, ShoppingCart, Sliders, Smartphone, Sparkles,
  Star, Sun, Tag, Target, Terminal, ThumbsUp, Trash2, TrendingDown,
  TrendingUp, Trophy, Upload, User, UserCheck, UserPlus, Users, Wallet,
  Wifi, Wrench, X, Zap,
} from 'lucide-react';

const registry: Record<string, LucideIcon> = {
  Activity, AlertCircle, Archive, ArrowRight, BarChart3, Bell, BookOpen,
  BookUser, Briefcase, Building2, Calendar, Check, ChevronRight,
  CircleDollarSign, ClipboardList, Clock, Cloud, Code, Cog, CreditCard,
  Database, Download, Edit, Eye, File, FileText, Filter, Flag, Folder,
  FolderTree, Globe, Grid2x2, HardDrive, Heart, Home, Image, Inbox,
  Key, Layers, LayoutDashboard, Link, List, Lock, Mail, Map, MapPin,
  MessageSquare, Monitor, Moon, MoreHorizontal, Network, Package,
  PanelLeftClose, PanelLeftOpen, Pencil, PieChart, Play, Plus, Power,
  Repeat, Scale, ScrollText, Search, Send, Server, Settings, Share2,
  Shield, ShieldCheck, ShoppingCart, Sliders, Smartphone, Sparkles,
  Star, Sun, Tag, Target, Terminal, ThumbsUp, Trash2, TrendingDown,
  TrendingUp, Trophy, Upload, User, UserCheck, UserPlus, Users, Wallet,
  Wifi, Wrench, X, Zap,
};

export const iconNames = Object.keys(registry).sort();

export function resolveIcon(name: string): LucideIcon {
  return registry[name] ?? LayoutDashboard;
}
