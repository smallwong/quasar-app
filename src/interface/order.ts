export interface IOrder {
  id: number;
  order_name: string;
  customer_name: string;
  order_status: string;
  financial_status: string;
  fulfillment_status: string;
  created_at: string;
  total_price: number;
  receiver_address: string;
  delivery_date: string;
  delivery_time: string;
  shipping_name: string | null;
  city: string;
  district: string;
  internal_note: string;
}
