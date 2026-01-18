import {
  BookOpen,
  Laptop,
  Shirt,
  Dumbbell,
  Armchair,
  Wrench,
  Music,
  Bike,
  Utensils,
  Package,
  LucideIcon,
} from "lucide-react";
import { Announcement, Category, Seller } from "@/types";

// Category to Icon Mapping (used for displaying category icons in UI)
export const categoryIcons: Record<string, LucideIcon> = {
  "Libros y apuntes": BookOpen,
  "Electrónica": Laptop,
  "Ropa y accesorios": Shirt,
  "Deportes": Dumbbell,
  "Muebles": Armchair,
  "Servicios": Wrench,
  "Instrumentos musicales": Music,
  "Vehículos": Bike,
  "Hogar y cocina": Utensils,
  "Otros": Package,
};

// ============================================
// MOCK DATA - Usado cuando la API no está disponible
// ============================================

export const mockCategories: Category[] = [
  { id: "1", type: "category", attributes: { name: "Libros y apuntes", description: "Libros, apuntes y material de estudio", icon: "book", active: true, announcements_count: 15 }},
  { id: "2", type: "category", attributes: { name: "Electrónica", description: "Dispositivos electrónicos", icon: "laptop", active: true, announcements_count: 23 }},
  { id: "3", type: "category", attributes: { name: "Ropa y accesorios", description: "Ropa, zapatos y accesorios", icon: "shirt", active: true, announcements_count: 8 }},
  { id: "4", type: "category", attributes: { name: "Deportes", description: "Artículos deportivos", icon: "dumbbell", active: true, announcements_count: 12 }},
  { id: "5", type: "category", attributes: { name: "Muebles", description: "Muebles y decoración", icon: "chair", active: true, announcements_count: 6 }},
  { id: "6", type: "category", attributes: { name: "Servicios", description: "Tutorías y servicios", icon: "wrench", active: true, announcements_count: 18 }},
  { id: "7", type: "category", attributes: { name: "Instrumentos musicales", description: "Instrumentos y equipos de música", icon: "music", active: true, announcements_count: 4 }},
  { id: "8", type: "category", attributes: { name: "Vehículos", description: "Bicicletas, scooters y más", icon: "bike", active: true, announcements_count: 9 }},
  { id: "9", type: "category", attributes: { name: "Hogar y cocina", description: "Artículos para el hogar", icon: "utensils", active: true, announcements_count: 7 }},
  { id: "10", type: "category", attributes: { name: "Otros", description: "Otros artículos", icon: "package", active: true, announcements_count: 11 }},
];

export const mockSellers: Seller[] = [
  {
    id: "1",
    type: "seller",
    attributes: {
      name: "Juan Pérez",
      faculty: "FIEC",
      email: "jperez@espol.edu.ec",
      phone: "0991234567",
      whatsapp_link: "https://wa.me/593991234567",
      created_at: "2024-03-15T00:00:00Z",
    },
  },
  {
    id: "2",
    type: "seller",
    attributes: {
      name: "María García",
      faculty: "FCNM",
      email: "mgarcia@espol.edu.ec",
      phone: "0987654321",
      whatsapp_link: "https://wa.me/593987654321",
      created_at: "2024-06-20T00:00:00Z",
    },
  },
  {
    id: "3",
    type: "seller",
    attributes: {
      name: "Carlos López",
      faculty: "FIMCP",
      email: "clopez@espol.edu.ec",
      phone: "0998765432",
      whatsapp_link: "https://wa.me/593998765432",
      created_at: "2024-01-10T00:00:00Z",
    },
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    type: "announcement",
    attributes: {
      title: "Cálculo de Thomas 14va Edición",
      description: "Libro en excelente estado, sin subrayados ni anotaciones. Ideal para estudiantes de primer año de ingeniería. Incluye código de acceso online sin usar.",
      price: 45.00,
      condition: "like_new",
      location: "Campus Gustavo Galindo",
      status: "active",
      views_count: 45,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[0] },
      category: { data: mockCategories[0] },
    },
  },
  {
    id: "2",
    type: "announcement",
    attributes: {
      title: "Laptop HP Pavilion Core i5",
      description: "HP Pavilion con procesador Intel Core i5 11va generación, 8GB RAM, 512GB SSD. Perfecta para programación y diseño. Batería dura 6 horas.",
      price: 520.00,
      condition: "good",
      location: "FIEC",
      status: "active",
      views_count: 120,
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2024-01-10T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[1] },
      category: { data: mockCategories[1] },
    },
  },
  {
    id: "3",
    type: "announcement",
    attributes: {
      title: "Mochila North Face Borealis",
      description: "Mochila original North Face Borealis en color negro. Perfecta para llevar laptop de hasta 15 pulgadas. Muy cómoda y resistente.",
      price: 75.00,
      condition: "like_new",
      location: "Campus Prosperina",
      status: "active",
      views_count: 32,
      created_at: "2024-01-08T00:00:00Z",
      updated_at: "2024-01-08T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[2] },
      category: { data: mockCategories[2] },
    },
  },
  {
    id: "4",
    type: "announcement",
    attributes: {
      title: "Raqueta Wilson Pro Staff",
      description: "Raqueta de tenis Wilson Pro Staff 97. Usada por una temporada. Grip nuevo. Ideal para jugadores intermedios.",
      price: 95.00,
      condition: "good",
      location: "Canchas ESPOL",
      status: "reserved",
      views_count: 18,
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1617137599056-2db932ba61c4?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[0] },
      category: { data: mockCategories[3] },
    },
  },
  {
    id: "5",
    type: "announcement",
    attributes: {
      title: "Tutorías de Cálculo I y II",
      description: "Ofrezco tutorías personalizadas de Cálculo I y II. Soy estudiante de matemáticas con experiencia. $10/hora. Disponible fines de semana.",
      price: 10.00,
      condition: "new_item",
      location: "Biblioteca",
      status: "active",
      views_count: 200,
      created_at: "2024-01-12T00:00:00Z",
      updated_at: "2024-01-12T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[1] },
      category: { data: mockCategories[5] },
    },
  },
  {
    id: "6",
    type: "announcement",
    attributes: {
      title: "Guitarra Acústica Yamaha F310",
      description: "Guitarra acústica Yamaha F310, perfecta para principiantes. Incluye funda, capo y cuerdas de repuesto.",
      price: 150.00,
      condition: "good",
      location: "FADCOM",
      status: "active",
      views_count: 35,
      created_at: "2024-01-14T00:00:00Z",
      updated_at: "2024-01-14T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[2] },
      category: { data: mockCategories[6] },
    },
  },
  {
    id: "7",
    type: "announcement",
    attributes: {
      title: "Escritorio Plegable para Estudiante",
      description: "Escritorio plegable ideal para espacios pequeños. Color blanco, superficie de 80x50cm. Fácil de transportar.",
      price: 65.00,
      condition: "acceptable",
      location: "Campus Gustavo Galindo",
      status: "active",
      views_count: 28,
      created_at: "2024-01-11T00:00:00Z",
      updated_at: "2024-01-11T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[0] },
      category: { data: mockCategories[4] },
    },
  },
  {
    id: "8",
    type: "announcement",
    attributes: {
      title: "Bicicleta MTB Aro 26",
      description: "Bicicleta montañera aro 26, 21 velocidades. Marco de aluminio. Perfecta para moverse por el campus.",
      price: 180.00,
      condition: "good",
      location: "Parqueadero FIEC",
      status: "active",
      views_count: 67,
      created_at: "2024-01-09T00:00:00Z",
      updated_at: "2024-01-09T00:00:00Z",
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80"],
    },
    relationships: {
      seller: { data: mockSellers[1] },
      category: { data: mockCategories[7] },
    },
  },
];

// Helper functions para usar mock data
export const getMockPopularAnnouncements = () => 
  [...mockAnnouncements].sort((a, b) => b.attributes.views_count - a.attributes.views_count).slice(0, 4);

export const getMockRecentAnnouncements = () => 
  [...mockAnnouncements].sort((a, b) => 
    new Date(b.attributes.created_at).getTime() - new Date(a.attributes.created_at).getTime()
  ).slice(0, 8);

export const getMockAnnouncementById = (id: string) => 
  mockAnnouncements.find(a => a.id === id);

export const getMockSellerById = (id: string) => 
  mockSellers.find(s => s.id === id);

export const getMockAnnouncementsBySeller = (sellerId: string) => 
  mockAnnouncements.filter(a => a.relationships?.seller?.data?.id === sellerId);
