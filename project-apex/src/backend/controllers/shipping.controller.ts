import { Request, Response } from 'express';
import { ShiprocketService } from '../services/shiprocket.service';
import { AppError } from '../middlewares/errorHandler';
import { prisma } from '../../lib/prisma';

export class ShippingController {
  /**
   * Check delivery serviceability for a pincode
   */
  static async checkServiceability(req: Request, res: Response) {
    const { delivery_postcode, pickup_postcode = '110030', weight = 1, cod = false } = req.body;

    if (!delivery_postcode) {
      throw new AppError('Delivery postcode is required', 400);
    }

    // In a real scenario, you'd check if credentials are set, else return mock or fallback
    if (!process.env.SHIPROCKET_EMAIL) {
      return res.status(200).json({
        success: true,
        data: {
          available: true,
          couriers: [
            { name: 'Standard Delivery', rate: 50, estimated_delivery_days: 5 }
          ]
        }
      });
    }

    try {
      const data = await ShiprocketService.checkServiceability(pickup_postcode, delivery_postcode, weight, cod);
      
      const available_couriers = data?.data?.available_courier_companies || [];
      const isAvailable = available_couriers.length > 0;

      res.status(200).json({
        success: true,
        data: {
          available: isAvailable,
          couriers: available_couriers.map((c: any) => ({
            courier_id: c.courier_company_id,
            name: c.courier_name,
            rate: c.rate,
            estimated_delivery_days: c.estimated_delivery_days,
            cod: c.cod === 1
          }))
        }
      });
    } catch (e: any) {
      console.error('[ShippingController Serviceability]', e.message);
      // Fallback if Shiprocket API is down
      res.status(200).json({
        success: true,
        data: {
          available: true,
          fallback: true,
          couriers: [{ name: 'Standard Delivery', rate: 50, estimated_delivery_days: 5 }]
        }
      });
    }
  }

  /**
   * Handle Shiprocket Webhooks for Tracking Updates
   */
  static async shiprocketWebhook(req: Request, res: Response) {
    // Acknowledge quickly
    res.status(200).send('OK');

    try {
      const payload = req.body;
      const awb = payload?.awb;
      const currentStatus = payload?.current_status;
      const shipmentId = payload?.shipment_id;

      if (!awb || !currentStatus) return;

      const shipment = await prisma.shipment.findFirst({
        where: { awb }
      });

      if (!shipment) return;

      // Avoid duplicating the status if it hasn't changed
      if (shipment.status === currentStatus) return;

      // Idempotent update
      await prisma.$transaction(async (tx) => {
        await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            status: currentStatus,
            lastSyncAt: new Date(),
          }
        });

        // Store granular event
        await tx.trackingEvent.create({
          data: {
            shipmentId: shipment.id,
            status: currentStatus,
            location: payload?.current_location_name || null,
            message: payload?.scans?.[0]?.activity || null,
            timestamp: payload?.current_timestamp ? new Date(payload.current_timestamp) : new Date()
          }
        });
      });
      
    } catch (e: any) {
      console.error('[Shiprocket Webhook Error]', e.message);
    }
  }
}
