import axios, { AxiosInstance } from 'axios';
import {
  Product,
  ProductDto,
  Category,
  Supplier,
  Project,
  ProjectDto,
  SupervisorDto,
  User,
  AuthUser,
  ApiHealthResponse,
} from '@/types';

class ApiService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      (typeof window !== 'undefined' && localStorage.getItem('StockCore_API_URL')) ||
      process.env.NEXT_PUBLIC_API_URL ||
      '';

    this.client = axios.create({
      baseURL: this.baseUrl || undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  public setBaseUrl(newUrl: string) {
    this.baseUrl = newUrl;
    this.client.defaults.baseURL = newUrl || undefined;
    if (typeof window !== 'undefined') {
      localStorage.setItem('StockCore_API_URL', newUrl);
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // ===================== AUTH & USERS =====================
  public async login(email: string, password: string): Promise<AuthUser> {
    const res = await this.client.post<AuthUser>('/api/Auth/login', { email, password });
    return res.data;
  }

  public async getProfile(userId: number): Promise<AuthUser> {
    const res = await this.client.get<AuthUser>(`/api/Auth/me/${userId}`);
    return res.data;
  }

  public async getAllUsers(): Promise<User[]> {
    const res = await this.client.get<User[]>('/api/Auth/users');
    return res.data;
  }

  // ===================== PROJECTS =====================
  public async getProjects(): Promise<Project[]> {
    const res = await this.client.get<Project[]>('/api/Project');
    return res.data;
  }

  public async getProject(id: number): Promise<any> {
    const res = await this.client.get<any>(`/api/Project/${id}`);
    return res.data;
  }

  public async getUnassignedProjects(): Promise<Project[]> {
    const res = await this.client.get<Project[]>('/api/Project/unassigned');
    return res.data;
  }

  public async createProject(project: ProjectDto): Promise<Project> {
    const res = await this.client.post<Project>('/api/Project', project);
    return res.data;
  }

  public async updateProject(id: number, project: ProjectDto): Promise<Project> {
    const res = await this.client.put<Project>(`/api/Project/${id}`, project);
    return res.data;
  }

  public async deleteProject(id: number): Promise<void> {
    await this.client.delete(`/api/Project/${id}`);
  }

  // ===================== SUPERVISORS =====================
  public async getSupervisors(): Promise<User[]> {
    const res = await this.client.get<User[]>('/api/Supervisor');
    return res.data;
  }

  public async getSupervisor(id: number): Promise<User> {
    const res = await this.client.get<User>(`/api/Supervisor/${id}`);
    return res.data;
  }

  public async createSupervisor(supervisor: SupervisorDto): Promise<User> {
    const res = await this.client.post<User>('/api/Supervisor', supervisor);
    return res.data;
  }

  public async updateSupervisor(id: number, supervisor: SupervisorDto): Promise<User> {
    const res = await this.client.put<User>(`/api/Supervisor/${id}`, supervisor);
    return res.data;
  }

  public async deleteSupervisor(id: number): Promise<void> {
    await this.client.delete(`/api/Supervisor/${id}`);
  }

  // ===================== PRODUCTS / MATERIALS =====================
  public async getProducts(projectId?: number | null): Promise<Product[]> {
    const params = projectId && projectId > 0 ? { projectId } : {};
    const res = await this.client.get<Product[]>('/api/Product', { params });
    return res.data;
  }

  public async getProduct(id: number): Promise<Product> {
    const res = await this.client.get<Product>(`/api/Product/${id}`);
    return res.data;
  }

  public async createProduct(product: ProductDto): Promise<Product> {
    const res = await this.client.post<Product>('/api/Product', product);
    return res.data;
  }

  public async updateProduct(id: number, product: ProductDto): Promise<Product> {
    const res = await this.client.put<Product>(`/api/Product/${id}`, product);
    return res.data;
  }

  public async deleteProduct(id: number): Promise<void> {
    await this.client.delete(`/api/Product/${id}`);
  }

  public async createProductsBulk(products: ProductDto[]): Promise<Product[]> {
    const res = await this.client.post<Product[]>('/api/Product/bulk', products);
    return res.data;
  }

  // ===================== CATEGORIES =====================
  public async getCategories(projectId?: number | null): Promise<Category[]> {
    const params = projectId && projectId > 0 ? { projectId } : {};
    const res = await this.client.get<Category[]>('/api/Category', { params });
    return res.data;
  }

  public async getCategory(id: number): Promise<Category> {
    const res = await this.client.get<Category>(`/api/Category/${id}`);
    return res.data;
  }

  public async createCategory(category: Partial<Category>): Promise<Category> {
    const res = await this.client.post<Category>('/api/Category', category);
    return res.data;
  }

  public async createCategoriesBulk(categories: Partial<Category>[]): Promise<any> {
    const res = await this.client.post('/api/Category/bulk', categories);
    return res.data;
  }

  public async updateCategory(id: number, category: Partial<Category>): Promise<void> {
    await this.client.put(`/api/Category/${id}`, category);
  }

  public async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/api/Category/${id}`);
  }

  // ===================== SUPPLIERS =====================
  public async getSuppliers(projectId?: number | null): Promise<Supplier[]> {
    const params = projectId && projectId > 0 ? { projectId } : {};
    const res = await this.client.get<Supplier[]>('/api/Supplier', { params });
    return res.data;
  }

  public async getSupplier(id: number): Promise<Supplier> {
    const res = await this.client.get<Supplier>(`/api/Supplier/${id}`);
    return res.data;
  }

  public async createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    const res = await this.client.post<Supplier>('/api/Supplier', supplier);
    return res.data;
  }

  public async createSuppliersBulk(suppliers: Partial<Supplier>[]): Promise<any> {
    const res = await this.client.post('/api/Supplier/bulk', suppliers);
    return res.data;
  }

  public async updateSupplier(id: number, supplier: Partial<Supplier>): Promise<void> {
    await this.client.put(`/api/Supplier/${id}`, supplier);
  }

  public async deleteSupplier(id: number): Promise<void> {
    await this.client.delete(`/api/Supplier/${id}`);
  }

  // ===================== HEALTH CHECK =====================
  public async checkHealth(): Promise<ApiHealthResponse> {
    const start = performance.now();
    try {
      const res = await this.client.get('/api/Health', { timeout: 4000 });
      const latency = Math.round(performance.now() - start);
      return {
        status: res.status === 200 ? 'healthy' : 'degraded',
        latencyMs: latency,
        checkedAt: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Fallback ping to product endpoint
      try {
        await this.client.get('/api/Product', { timeout: 4000 });
        const latency = Math.round(performance.now() - start);
        return {
          status: 'healthy',
          latencyMs: latency,
          checkedAt: new Date().toLocaleTimeString(),
        };
      } catch {
        return {
          status: 'offline',
          latencyMs: 0,
          checkedAt: new Date().toLocaleTimeString(),
        };
      }
    }
  }

  // ===================== ADMIN / DATA RESET =====================
  public async resetPakistaniData(): Promise<{ message: string }> {
    const res = await this.client.post<{ message: string }>('/api/Admin/reset-pakistan-data');
    return res.data;
  }
}

export const apiService = new ApiService();

export function getApiBaseUrl(): string {
  return apiService.getBaseUrl();
}

export function setApiBaseUrl(url: string): void {
  apiService.setBaseUrl(url);
}

export function parseErrorMessage(error: any): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (typeof error.response?.data === 'string') {
      return error.response.data;
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please verify backend is active.';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected network error occurred.';
}
