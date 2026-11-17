import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './controllers/auth.controller.js';
import { CatalogueController } from './controllers/catalogue.controller.js';
import { CartController } from './controllers/cart.controller.js';
import { AddressesController } from './controllers/addresses.controller.js';
import { CheckoutController } from './controllers/checkout.controller.js';
import { OrdersController } from './controllers/orders.controller.js';
import { PaymentsController } from './controllers/payments.controller.js';
import { AuthGuard, RolesGuard } from './security/auth.guards.js';

@Module({
  controllers: [
    AuthController,
    CatalogueController,
    CartController,
    AddressesController,
    CheckoutController,
    OrdersController,
    PaymentsController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
