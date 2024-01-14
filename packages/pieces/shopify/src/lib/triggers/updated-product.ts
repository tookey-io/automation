import { createShopifyWebhookTrigger } from "../common/register-webhook";

export const updatedProduct = createShopifyWebhookTrigger({
    name: "updated_product",
    description: "Triggered when a product is updated.",
    topic: "products/update",
    displayName: "Updated Product",
    sampleData: {
        "id": 8282295566587,
        "title": "My AP Product",
        "body_html": "Well <strong>this is nice</strong>",
        "vendor": "Kofahi",
        "product_type": "Test",
        "created_at": "2024-01-02T20:36:40+03:00",
        "handle": "my-ap-product-1",
        "updated_at": "2024-01-02T20:36:40+03:00",
        "published_at": "2024-01-02T20:36:40+03:00",
        "template_suffix": null,
        "published_scope": "global",
        "tags": "",
        "status": "active",
        "variants": [
            {
                "id": 45134980382971,
                "product_id": 8282295566587,
                "title": "Default Title",
                "price": "0.000",
                "sku": "",
                "position": 1,
                "inventory_policy": "deny",
                "compare_at_price": null,
                "fulfillment_service": "manual",
                "inventory_management": null,
                "option1": "Default Title",
                "option2": null,
                "option3": null,
                "created_at": "2024-01-02T20:36:40+03:00",
                "updated_at": "2024-01-02T20:36:40+03:00",
                "taxable": true,
                "barcode": null,
                "grams": 0,
                "image_id": null,
                "weight": 0,
                "weight_unit": "kg",
                "inventory_item_id": 47200507134203,
                "inventory_quantity": 0,
                "old_inventory_quantity": 0,
                "requires_shipping": true
            }
        ],
        "options": [
            {
                "id": 10640607805691,
                "product_id": 8282295566587,
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "images": [
            {
                "id": 41679215657211,
                "product_id": 8282295566587,
                "position": 1,
                "created_at": "2024-01-02T20:36:40+03:00",
                "updated_at": "2024-01-02T20:36:40+03:00",
                "alt": null,
                "width": 500,
                "height": 500,
                "src": "https://cdn.shopify.com/s/files/1/0676/6598/5787/products/416a37a613b156f9d23e4fa1fd5358d7.png?v=1704217000",
                "variant_ids": []
            }
        ],
        "image": {
            "id": 41679215657211,
            "product_id": 8282295566587,
            "position": 1,
            "created_at": "2024-01-02T20:36:40+03:00",
            "updated_at": "2024-01-02T20:36:40+03:00",
            "alt": null,
            "width": 500,
            "height": 500,
            "src": "https://cdn.shopify.com/s/files/1/0676/6598/5787/products/416a37a613b156f9d23e4fa1fd5358d7.png?v=1704217000",
            "variant_ids": []
        }
    }
});