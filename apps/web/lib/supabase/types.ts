export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'admin'
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          category: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      batches: {
        Row: {
          id: string
          product_id: string | null
          harvest_date: string | null
          location: string | null
          farm_name: string | null
          is_organic: boolean
          notes: string | null
          qr_data: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          harvest_date?: string | null
          location?: string | null
          farm_name?: string | null
          is_organic?: boolean
          notes?: string | null
          qr_data?: string | null
        }
        Update: {
          harvest_date?: string | null
          location?: string | null
          farm_name?: string | null
          is_organic?: boolean
          notes?: string | null
          qr_data?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'cancelled' | 'shipped' | 'delivered'
          total_amount: number
          shipping_fee: number
          midtrans_token: string | null
          midtrans_order_id: string | null
          shipping_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'cancelled' | 'shipped' | 'delivered'
          total_amount: number
          shipping_fee?: number
          midtrans_token?: string | null
          midtrans_order_id?: string | null
          shipping_address?: string | null
        }
        Update: {
          status?: 'pending' | 'paid' | 'cancelled' | 'shipped' | 'delivered'
          midtrans_token?: string | null
          midtrans_order_id?: string | null
          shipping_address?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
        }
      }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Batch = Database['public']['Tables']['batches']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
