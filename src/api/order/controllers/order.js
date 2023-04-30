("use strict");
const stripe = require("stripe")(process.env.STRIPE_KEY);
/**
 * order controller
 */

 const express = require('express');
 const app = express();
 app.use(express.static('public'));
 
 const YOUR_DOMAIN = 'http://localhost:4242';

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
	async create(ctx) {
		const { products } = ctx.request.body;
		try {
			const lineItems = await Promise.all(
				products.map(async (product) => {
					const item = await strapi
						.service("api::product.product")
						.findOne(product.id);
					
					console.log(product)
					


					return {
						price_data: {
							currency: "BYN",
							product_data: {
								name: item.title,
								description: item.desc,
								images: [item.image],
							},
							unit_amount: Math.round(item.price * 100),
						},
						quantity: product.attributes.quantity,
					};
				})
			);


      app.post('/create-checkout-session', async (req, res) =>{})
			const session = await stripe.checkout.sessions.create({
				shipping_address_collection: { allowed_countries: ["RU"] },
				payment_method_types: ["card"],
				mode: "payment",
				success_url: process.env.CLIENT_URL + "/success",
				cancel_url: process.env.CLIENT_URL + "?success=false",
				line_items: lineItems,
			});

			await strapi
				.service("api::order.order")
				.create({ data: { products, stripeId: session.id } });

			return { stripeSession: session };
		} catch (error) {
			ctx.response.status = 500;
			return { error };
		}
	},
}));
