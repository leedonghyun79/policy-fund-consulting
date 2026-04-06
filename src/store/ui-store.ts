import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarCollapsed: boolean;
  activeTab: string;
  searchTerm: string;
  statusFilter: string;
  currentPage: number;
  readNotiIds: string[];
}

interface UIActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  addReadNotiId: (id: string) => void;
  markAllNotisRead: (ids: string[]) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      activeTab: "dashboard",
      searchTerm: "",
      statusFilter: "ALL",
      currentPage: 1,
      readNotiIds: [],

      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
      setStatusFilter: (filter) => set({ statusFilter: filter, currentPage: 1 }),
      setCurrentPage: (page) =>
        set((state) => ({
          currentPage: typeof page === "function" ? page(state.currentPage) : page,
        })),
      addReadNotiId: (id) =>
        set((state) => ({
          readNotiIds: state.readNotiIds.includes(id)
            ? state.readNotiIds
            : [...state.readNotiIds, id],
        })),
      markAllNotisRead: (ids) => set({ readNotiIds: ids }),
    }),
    {
      name: "admin-ui-storage",
      partialize: (state) => ({
        activeTab: state.activeTab,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
