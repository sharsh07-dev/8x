import axios, { AxiosInstance } from 'axios';
import redis from '../utils/redis';
import { AppError } from '../middlewares/errorHandler';
import { prisma } from '../../lib/prisma';

export class ShiprocketService {
  private static baseURL = 'https://apiv2.shiprocket.in/v1/external';
  
  /**
   * Automatically gets or refreshes the Bearer token.
   */
  private static async getToken(): Promise<string> {
    const CACHE_KEY = 'shiprocket:token';
    const cachedToken = await redis.get(CACHE_KEY);
    if (cachedToken) return cachedToken;

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new AppError('Shiprocket credentials are not configured', 500);
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email, password
      }, { timeout: 10000 });

      const token = response.data.token;
      if (!token) throw new Error('No token in response');

      await redis.setex(CACHE_KEY, 8 * 24 * 60 * 60, token);
      return token;
    } catch (error: any) {
      console.error('[Shiprocket] Auth Error:', error.response?.data || error.message);
      throw new AppError('Failed to authenticate with shipping provider', 502);
    }
  }

  private static async getClient(): Promise<AxiosInstance> {
    const token = await this.getToken();
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
  }

  static async checkServiceability(pickup_postcode: string, delivery_postcode: string, weight: number, cod: boolean = false) {
    try {
      const client = await this.getClient();
      const response = await client.get('/courier/serviceability/', {
        params: { pickup_postcode, delivery_postcode, weight, cod: cod ? 1 : 0 }
      });
      return response.data;
    } catch (error: any) {
      console.error('[Shiprocket] Serviceability Error:', error.response?.data || error.message);
      throw new AppError('Unable to check delivery serviceability', 502);
    }
  }

  static async createOrder(orderPayload: any) {
    try {
      const client = await this.getClient();
      const response = await client.post('/orders/create/adhoc', orderPayload);
      return response.data;
    } catch (error: any) {
      console.error('[Shiprocket] Order Creation Error:', error.response?.data || error.message);
      throw new AppError('Failed to sync order with shipping provider', 502);
    }
  }

  static async generateAWB(shipment_id: string, courier_id: string) {
    try {
      const client = await this.getClient();
      const response = await client.post('/courier/assign/awb', { shipment_id, courier_id });
      return response.data;
    } catch (error: any) {
      console.error('[Shiprocket] AWB Generation Error:', error.response?.data || error.message);
      throw new AppError('Failed to generate AWB', 502);
    }
  }

  static async requestPickup(shipment_id: string[]) {
    try {
      const client = await this.getClient();
      const response = await client.post('/courier/generate/pickup', { shipment_id });
      return response.data;
    } catch (error: any) {
      console.error('[Shiprocket] Pickup Request Error:', error.response?.data || error.message);
      throw new AppError('Failed to request pickup', 502);
    }
  }

  static async trackAWB(awb_code: string) {
    try {
      const client = await this.getClient();
      const response = await client.get(`/courier/track/awb/${awb_code}`);
      return response.data;
    } catch (error: any) {
      console.error('[Shiprocket] Tracking Error:', error.response?.data || error.message);
      throw new AppError('Failed to fetch tracking details', 502);
    }
  }

  static async syncOrder(order: any, userEmail: string, phone: string = '9876543210') {
    if (!process.env.SHIPROCKET_EMAIL) {
      console.warn('[Shiprocket] Skipping order sync, no credentials configured.');
      return null;
    }

    const payload = {
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary",
      billing_customer_name: order.addressSnapshot?.fullName || 'Customer',
      billing_last_name: '',
      billing_address: order.addressSnapshot?.street || 'N/A',
      billing_city: order.addressSnapshot?.city || 'N/A',
      billing_pincode: order.addressSnapshot?.zipCode || '000000',
      billing_state: order.addressSnapshot?.state || 'N/A',
      billing_country: order.addressSnapshot?.country || 'India',
      billing_email: userEmail,
      billing_phone: order.addressSnapshot?.phone || phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.productTitle,
        sku: item.productId || 'UNKNOWN_SKU',
        units: item.quantity,
        selling_price: item.unitPrice
      })),
      payment_method: order.paymentStatus === 'PAID' ? 'Prepaid' : 'COD',
      shipping_charges: order.shipping,
      total_discount: order.discount,
      sub_total: order.total,
      length: 10, breadth: 10, height: 10, weight: 1
    };

    try {
      const shiprocketData = await this.createOrder(payload);
      if (shiprocketData?.order_id) {
        await prisma.shipment.create({
          data: {
            orderId: order.id,
            status: 'PROCESSING',
            shiprocketOrderId: shiprocketData.order_id.toString(),
            shiprocketShipmentId: shiprocketData.shipment_id?.toString()
          }
        });
      }
      return shiprocketData;
    } catch (e: any) {
      console.error('[Shiprocket] Failed to sync order', e.message);
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          status: 'FAILED_SYNC',
          shippingError: e.message
        }
      });
      return null;
    }
  }
}
