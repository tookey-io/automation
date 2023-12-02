import { createShopifyWebhookTrigger } from "../common/register-webhook";


export const newPaidOrder = createShopifyWebhookTrigger(  {
    name: "new_paid_order",
    description: "Triggered when a paid order is created",
    topic: "orders/paid",
    displayName: "New Paid Order",
    sampleData: {
        "id": 5324830114101,
        "admin_graphql_api_id": "gid://shopify/Order/5324830114102",
        "app_id": 1354745,
        "browser_ip": "95.90.193.175",
        "buyer_accepts_marketing": false,
        "cancel_reason": null,
        "cancelled_at": null,
        "cart_token": null,
        "checkout_id": 36646099517750,
        "checkout_token": "2b9ba639fb81a1fb61a02be4c95459b5",
        "client_details": {
            "accept_language": null,
            "browser_height": null,
            "browser_ip": "95.90.193.175",
            "browser_width": null,
            "session_hash": null,
            "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
        },
        "closed_at": null,
        "company": null,
        "confirmed": true,
        "contact_email": null,
        "created_at": "2023-03-24T12:37:26-04:00",
        "currency": "USD",
        "current_subtotal_price": "2629.95",
        "current_subtotal_price_set": {
            "shop_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            }
        },
        "current_total_discounts": "0.00",
        "current_total_discounts_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
                "currency_code": "USD"
            }
        },
        "current_total_duties_set": null,
        "current_total_price": "2629.95",
        "current_total_price_set": {
            "shop_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            }
        },
        "current_total_tax": "0.00",
        "current_total_tax_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
                "currency_code": "USD"
            }
        },
        "customer_locale": "en",
        "device_id": null,
        "discount_codes": [],
        "email": "",
        "estimated_taxes": false,
        "financial_status": "paid",
        "fulfillment_status": null,
        "gateway": "manual",
        "landing_site": null,
        "landing_site_ref": null,
        "location_id": 80901996854,
        "merchant_of_record_app_id": null,
        "name": "#1010",
        "note": null,
        "note_attributes": [],
        "number": 10,
        "order_number": 1010,
        "order_status_url": "https://activepieces-test.myshopify.com/74392404278/orders/2979b599ca9a25049397820ac12aaf87/authenticate?key=42a8db0d2e048823fea486a316d0d231",
        "original_total_duties_set": null,
        "payment_gateway_names": [
            "manual"
        ],
        "presentment_currency": "USD",
        "processed_at": "2023-03-24T12:37:26-04:00",
        "processing_method": "manual",
        "reference": "f86c8158ece5ee11dfafc9b21f390184",
        "referring_site": null,
        "source_identifier": "f86c8158ece5ee11dfafc9b21f390184",
        "source_name": "shopify_draft_order",
        "source_url": null,
        "subtotal_price": "2629.95",
        "subtotal_price_set": {
            "shop_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            }
        },
        "tags": "",
        "tax_lines": [],
        "taxes_included": false,
        "test": false,
        "token": "2979b599ca9a25049397820ac12aaf87",
        "total_discounts": "0.00",
        "total_discounts_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
                "currency_code": "USD"
            }
        },
        "total_line_items_price": "2629.95",
        "total_line_items_price_set": {
            "shop_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            }
        },
        "total_outstanding": "0.00",
        "total_price": "2629.95",
        "total_price_set": {
            "shop_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2629.95",
                "currency_code": "USD"
            }
        },
        "total_shipping_price_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
                "currency_code": "USD"
            }
        },
        "total_tax": "0.00",
        "total_tax_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
                "currency_code": "USD"
            }
        },
        "total_tip_received": "0.00",
        "total_weight": 0,
        "updated_at": "2023-03-24T12:37:27-04:00",
        "user_id": 94873289014,
        "discount_applications": [],
        "fulfillments": [],
        "line_items": [
            {
                "id": 13925006311734,
                "admin_graphql_api_id": "gid://shopify/LineItem/13925006311734",
                "fulfillable_quantity": 1,
                "fulfillment_service": "snow-city-warehouse",
                "fulfillment_status": null,
                "gift_card": false,
                "grams": 0,
                "name": "The 3p Fulfilled Snowboard",
                "price": "2629.95",
                "price_set": {
                    "shop_money": {
                        "amount": "2629.95",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "2629.95",
                        "currency_code": "USD"
                    }
                },
                "product_exists": true,
                "product_id": 8222223204662,
                "properties": [],
                "quantity": 1,
                "requires_shipping": true,
                "sku": "sku-hosted-1",
                "taxable": true,
                "title": "The 3p Fulfilled Snowboard",
                "total_discount": "0.00",
                "total_discount_set": {
                    "shop_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                    }
                },
                "variant_id": 44872881439030,
                "variant_inventory_management": "shopify",
                "variant_title": null,
                "vendor": "activepieces-test",
                "tax_lines": [],
                "duties": [],
                "discount_allocations": []
            }
        ],
        "payment_terms": null,
        "refunds": [],
        "shipping_lines": []
    }
});