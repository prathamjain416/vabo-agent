const axios = require('axios');

async function getShopifySummary() {
    const key = process.env.SHOPIFY_API_KEY;
    const url = process.env.SHOPIFY_STORE_URL;

    if (!key || !url) {
        console.log("[Shopify] Using mock data because API credentials aren't set");
        // Mock data
        return {
            total_revenue: "$12,450",
            total_orders: 142,
            top_product: "Wireless Headphones"
        };
    }

    try {
        console.log("[Shopify] Fetching orders and revenues from real API...");
        // Example call using Shopify API 2023-10
        const response = await axios.get(`https://${url}/admin/api/2023-10/orders.json?status=any`, {
            headers: {
                'X-Shopify-Access-Token': key
            }
        });
        
        const orders = response.data.orders || [];
        const total_orders = orders.length;
        const total_revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

        return {
            total_revenue: `$${total_revenue.toFixed(2)}`,
            total_orders: total_orders,
            top_product: "Placeholder Product"
        };
    } catch (error) {
        console.error("[Shopify] Error fetching data:", error.message);
        throw new Error("Failed to fetch Shopify data");
    }
}

module.exports = { getShopifySummary };
