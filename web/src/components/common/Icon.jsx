import React from 'react';
import {
  Bell, Settings, Medal, BookOpen, Swords, Crosshair, Tent, Newspaper, ShoppingBag,
  Search, X, Wrench, Globe, Undo, Home, Trash2, Lock, Star, FileText, Check,
  Coins, Clock, Trophy, Languages, ChevronDown, Loader, Lightbulb, Users,
  ArrowLeft, User, Image, CircleHelp
} from 'lucide-react';

const MAP = {
  // Core
  'bell': Bell,
  'settings': Settings,
  'medal': Medal,
  'book-open': BookOpen,
  'swords': Swords,
  'crosshair': Crosshair,
  'tent': Tent,
  'newspaper': Newspaper,
  'shopping-bag': ShoppingBag,
  // General
  'search': Search,
  'x': X,
  'wrench': Wrench,
  'globe': Globe,
  'undo': Undo,
  'home': Home,
  'trash-2': Trash2,
  'lock': Lock,
  'star': Star,
  'file-text': FileText,
  'check': Check,
  'coins': Coins,
  'clock': Clock,
  'trophy': Trophy,
  'languages': Languages,
  'chevron-down': ChevronDown,
  'loader': Loader,
  'lightbulb': Lightbulb,
  'users': Users,
  'arrow-left': ArrowLeft,
  'user': User,
  'image': Image,
};

export default function Icon({ name, size = 22, color = 'currentColor', ...rest }) {
  const Cmp = MAP[name] || CircleHelp;
  return <Cmp size={size} color={color} {...rest} />;
}
