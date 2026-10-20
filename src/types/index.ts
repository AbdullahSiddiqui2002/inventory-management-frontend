export type UserRole = 'Admin' | 'Supervisor';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  assignedProjectId?: number | null;
  assignedProjectName?: string | null;
  assignedProjectCode?: string | null;
  assignedProjectLocation?: string | null;
  createdAt?: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  assignedProjectId?: number | null;
  assignedProjectName?: string | null;
  token?: string;
}

export interface Project {
  projectId: number;
  name: string;
  code: string;
  location: string;
  budget: number;
  status: 'Active' | 'Completed' | 'OnHold';
  createdAt?: string;
  supervisorId?: number | null;
  supervisorName?: string | null;
  supervisorEmail?: string | null;
  supervisorPhone?: string | null;
  totalMaterialsCount?: number;
  totalInventoryUnits?: number;
  totalInventoryValuation?: number;
  lowStockAlertsCount?: number;
}

export interface ProjectDto {
  projectId?: number;
  name: string;
  code?: string;
  location?: string;
  budget: number;
  status?: string;
  supervisorId?: number | null;
}

export interface SupervisorDto {
  userId?: number;
  username?: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  assignedProjectId?: number | null;
}

export interface Product {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  unit: string; // e.g. "Bags", "Tons", "Trucks", "Pieces", "Lengths", "Sq Meters"
  receiptSlipUrl?: string; // Cloudinary receipt image URL
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  projectId?: number | null;
  projectName?: string | null;
  createdAt?: string;
}

export interface ProductDto {
  productId?: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  unit?: string;
  receiptSlipUrl?: string;
  categoryId: number;
  supplierId: number;
  projectId?: number | null;
}

export interface Category {
  categoryId: number;
  name: string;
  projectId?: number | null;
  products?: Product[];
}

export interface Supplier {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  projectId?: number | null;
  products?: Product[];
}

export interface InventoryStats {
  totalProjects: number;
  totalProducts: number;
  totalQuantity: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  totalSuppliers: number;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'offline' | 'checking';
  latencyMs?: number;
  checkedAt?: string;
  timestamp?: string;
  version?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
