import { createShopifyWebhookTrigger } from "../common/register-webhook";


export const newCancelledOrder = createShopifyWebhookTrigger({
    name: "new_cancelled_order",
    description: "Triggered when order is cancelled",
    topic: "orders/cancelled",
    displayName: "New Cancelled Order",
    sampleData: {
        "id": 5324790137142,
        "admin_graphql_api_id": "gid://shopify/Order/5324790137142",
        "app_id": 16818700281,
        "browser_ip": "244.100.5.121",
        "buyer_accepts_marketing": false,
        "cancel_reason": "other",
        "cancelled_at": "2023-03-24T18:08:18-04:00",
        "cart_token": null,
        "checkout_id": 36646023004470,
        "checkout_token": "751db9e69c75eb563f4d9b052e8cc0f7",
        "client_details": {
            "accept_language": null,
            "browser_height": null,
            "browser_ip": "244.100.5.121",
            "browser_width": null,
            "session_hash": null,
            "user_agent": "Sunflower/production Cusco/1.12.1 Ruby/3.1.2"
        },
        "closed_at": "2023-03-24T18:08:18-04:00",
        "company": null,
        "confirmed": true,
        "contact_email": "russel.winfield@example.com",
        "created_at": "2023-03-24T11:28:18-04:00",
        "currency": "USD",
        "current_subtotal_price": "0.00",
        "current_subtotal_price_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
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
        "current_total_price": "0.00",
        "current_total_price_set": {
            "shop_money": {
                "amount": "0.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "0.00",
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
        "discount_codes": [
            {
                "code": "",
                "amount": "313.47",
                "type": "percentage"
            }
        ],
        "email": "russel.winfield@example.com",
        "estimated_taxes": false,
        "financial_status": "refunded",
        "fulfillment_status": null,
        "gateway": "manual",
        "landing_site": null,
        "landing_site_ref": null,
        "location_id": null,
        "merchant_of_record_app_id": null,
        "name": "#1009",
        "note": null,
        "note_attributes": [],
        "number": 9,
        "order_number": 1009,
        "order_status_url": "https://activepieces-test.myshopify.com/74392404278/orders/85adf5f235cb50d1dfc203d1b8da9885/authenticate?key=f91a3b1892736757ffb6ba26d3e7ff70",
        "original_total_duties_set": null,
        "payment_gateway_names": [
            "manual"
        ],
        "phone": null,
        "presentment_currency": "USD",
        "processed_at": "2023-03-24T11:28:17-04:00",
        "processing_method": "manual",
        "reference": "7b40196bcf0a1cad3f0954c4e058c229",
        "referring_site": null,
        "source_identifier": "7b40196bcf0a1cad3f0954c4e058c229",
        "source_name": "16818700289",
        "source_url": null,
        "subtotal_price": "1776.38",
        "subtotal_price_set": {
            "shop_money": {
                "amount": "1776.38",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "1776.38",
                "currency_code": "USD"
            }
        },
        "tags": "Line Item Discount, Order Discount",
        "tax_lines": [],
        "taxes_included": false,
        "test": false,
        "token": "85adf5f235cb50d1dfc203d1b8da9885",
        "total_discounts": "323.47",
        "total_discounts_set": {
            "shop_money": {
                "amount": "323.47",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "323.47",
                "currency_code": "USD"
            }
        },
        "total_line_items_price": "2099.85",
        "total_line_items_price_set": {
            "shop_money": {
                "amount": "2099.85",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "2099.85",
                "currency_code": "USD"
            }
        },
        "total_outstanding": "0.00",
        "total_price": "1806.38",
        "total_price_set": {
            "shop_money": {
                "amount": "1806.38",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "1806.38",
                "currency_code": "USD"
            }
        },
        "total_shipping_price_set": {
            "shop_money": {
                "amount": "30.00",
                "currency_code": "USD"
            },
            "presentment_money": {
                "amount": "30.00",
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
        "total_weight": 13605,
        "updated_at": "2023-03-24T18:08:18-04:00",
        "user_id": null,
        "billing_address": {
            "first_name": "Russell",
            "address1": "105 Victoria St",
            "phone": null,
            "city": "Toronto",
            "zip": "M5C1N7",
            "province": null,
            "country": "Canada",
            "last_name": "Winfield",
            "address2": null,
            "company": "Company Name",
            "latitude": 43.6522608,
            "longitude": -79.3776862,
            "name": "Russell Winfield",
            "country_code": "CA",
            "province_code": null
        },
        "customer": {
            "id": 6972527083830,
            "email": "russel.winfield@example.com",
            "accepts_marketing": false,
            "created_at": "2023-03-24T11:28:11-04:00",
            "updated_at": "2023-03-24T11:28:19-04:00",
            "first_name": "Russell",
            "last_name": "Winfield",
            "state": "disabled",
            "note": "This customer is created with most available fields",
            "verified_email": true,
            "multipass_identifier": null,
            "tax_exempt": false,
            "phone": "+16135550135",
            "email_marketing_consent": {
                "state": "not_subscribed",
                "opt_in_level": "single_opt_in",
                "consent_updated_at": null
            },
            "sms_marketing_consent": {
                "state": "not_subscribed",
                "opt_in_level": "unknown",
                "consent_updated_at": null,
                "consent_collected_from": "OTHER"
            },
            "tags": "VIP",
            "currency": "USD",
            "accepts_marketing_updated_at": "2023-03-24T11:28:11-04:00",
            "marketing_opt_in_level": null,
            "tax_exemptions": [],
            "admin_graphql_api_id": "gid://shopify/Customer/6972527083830",
            "default_address": {
                "id": 9218460975414,
                "customer_id": 6972527083830,
                "first_name": "Russell",
                "last_name": "Winfield",
                "company": "Company Name",
                "address1": "105 Victoria St",
                "address2": null,
                "city": "Toronto",
                "province": null,
                "country": "Canada",
                "zip": "M5C1N7",
                "phone": null,
                "name": "Russell Winfield",
                "province_code": null,
                "country_code": "CA",
                "country_name": "Canada",
                "default": true
            }
        },
        "discount_applications": [
            {
                "target_type": "line_item",
                "type": "manual",
                "value": "10.0",
                "value_type": "fixed_amount",
                "allocation_method": "each",
                "target_selection": "explicit",
                "title": "",
                "description": null
            },
            {
                "target_type": "line_item",
                "type": "manual",
                "value": "15.0",
                "value_type": "percentage",
                "allocation_method": "across",
                "target_selection": "all",
                "title": "",
                "description": null
            }
        ],
        "fulfillments": [],
        "line_items": [
            {
                "id": 13924936679734,
                "admin_graphql_api_id": "gid://shopify/LineItem/13924936679734",
                "fulfillable_quantity": 0,
                "fulfillment_service": "manual",
                "fulfillment_status": null,
                "gift_card": false,
                "grams": 4536,
                "name": "The Complete Snowboard - Powder",
                "price": "699.95",
                "price_set": {
                    "shop_money": {
                        "amount": "699.95",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "699.95",
                        "currency_code": "USD"
                    }
                },
                "product_exists": true,
                "product_id": 8222223302966,
                "properties": [],
                "quantity": 1,
                "requires_shipping": true,
                "sku": "",
                "taxable": true,
                "title": "The Complete Snowboard",
                "total_discount": "10.00",
                "total_discount_set": {
                    "shop_money": {
                        "amount": "10.00",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "10.00",
                        "currency_code": "USD"
                    }
                },
                "variant_id": 44872881537334,
                "variant_inventory_management": "shopify",
                "variant_title": "Powder",
                "vendor": "Snowboard Vendor",
                "tax_lines": [],
                "duties": [],
                "discount_allocations": [
                    {
                        "amount": "10.00",
                        "amount_set": {
                            "shop_money": {
                                "amount": "10.00",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "10.00",
                                "currency_code": "USD"
                            }
                        },
                        "discount_application_index": 0
                    },
                    {
                        "amount": "103.50",
                        "amount_set": {
                            "shop_money": {
                                "amount": "103.50",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "103.50",
                                "currency_code": "USD"
                            }
                        },
                        "discount_application_index": 1
                    }
                ]
            },
            {
                "id": 13924936712502,
                "admin_graphql_api_id": "gid://shopify/LineItem/13924936712502",
                "fulfillable_quantity": 0,
                "fulfillment_service": "manual",
                "fulfillment_status": null,
                "gift_card": false,
                "grams": 4536,
                "name": "The Complete Snowboard - Electric",
                "price": "699.95",
                "price_set": {
                    "shop_money": {
                        "amount": "699.95",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "699.95",
                        "currency_code": "USD"
                    }
                },
                "product_exists": true,
                "product_id": 8222223302966,
                "properties": [],
                "quantity": 2,
                "requires_shipping": true,
                "sku": "",
                "taxable": true,
                "title": "The Complete Snowboard",
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
                "variant_id": 44872881570102,
                "variant_inventory_management": "shopify",
                "variant_title": "Electric",
                "vendor": "Snowboard Vendor",
                "tax_lines": [],
                "duties": [],
                "discount_allocations": [
                    {
                        "amount": "209.97",
                        "amount_set": {
                            "shop_money": {
                                "amount": "209.97",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "209.97",
                                "currency_code": "USD"
                            }
                        },
                        "discount_application_index": 1
                    }
                ]
            }
        ],
        "payment_terms": null,
        "refunds": [
            {
                "id": 945108681014,
                "admin_graphql_api_id": "gid://shopify/Refund/945108681014",
                "created_at": "2023-03-24T18:08:18-04:00",
                "note": null,
                "order_id": 5324790137142,
                "processed_at": "2023-03-24T18:08:18-04:00",
                "restock": false,
                "total_duties_set": {
                    "shop_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "0.00",
                        "currency_code": "USD"
                    }
                },
                "user_id": 94873289014,
                "order_adjustments": [
                    {
                        "id": 278632759606,
                        "amount": "-30.00",
                        "amount_set": {
                            "shop_money": {
                                "amount": "-30.00",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "-30.00",
                                "currency_code": "USD"
                            }
                        },
                        "kind": "shipping_refund",
                        "order_id": 5324790137142,
                        "reason": "Shipping refund",
                        "refund_id": 945108681014,
                        "tax_amount": "0.00",
                        "tax_amount_set": {
                            "shop_money": {
                                "amount": "0.00",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "0.00",
                                "currency_code": "USD"
                            }
                        }
                    }
                ],
                "transactions": [
                    {
                        "id": 6492880732470,
                        "admin_graphql_api_id": "gid://shopify/OrderTransaction/6492880732470",
                        "amount": "1806.38",
                        "authorization": null,
                        "created_at": "2023-03-24T18:08:18-04:00",
                        "currency": "USD",
                        "device_id": null,
                        "error_code": null,
                        "gateway": "manual",
                        "kind": "refund",
                        "location_id": null,
                        "message": "Refunded 1806.38 from manual gateway",
                        "order_id": 5324790137142,
                        "parent_id": 6492602990902,
                        "payment_id": "#1009.2",
                        "processed_at": "2023-03-24T18:08:18-04:00",
                        "receipt": {},
                        "source_name": "1830279",
                        "status": "success",
                        "test": false,
                        "user_id": null
                    }
                ],
                "refund_line_items": [
                    {
                        "id": 554287071542,
                        "line_item_id": 13924936679734,
                        "location_id": null,
                        "quantity": 1,
                        "restock_type": "no_restock",
                        "subtotal": 586.45,
                        "subtotal_set": {
                            "shop_money": {
                                "amount": "586.45",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "586.45",
                                "currency_code": "USD"
                            }
                        },
                        "total_tax": 0,
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
                        "line_item": {
                            "id": 13924936679734,
                            "admin_graphql_api_id": "gid://shopify/LineItem/13924936679734",
                            "fulfillable_quantity": 0,
                            "fulfillment_service": "manual",
                            "fulfillment_status": null,
                            "gift_card": false,
                            "grams": 4536,
                            "name": "The Complete Snowboard - Powder",
                            "price": "699.95",
                            "price_set": {
                                "shop_money": {
                                    "amount": "699.95",
                                    "currency_code": "USD"
                                },
                                "presentment_money": {
                                    "amount": "699.95",
                                    "currency_code": "USD"
                                }
                            },
                            "product_exists": true,
                            "product_id": 8222223302966,
                            "properties": [],
                            "quantity": 1,
                            "requires_shipping": true,
                            "sku": "",
                            "taxable": true,
                            "title": "The Complete Snowboard",
                            "total_discount": "10.00",
                            "total_discount_set": {
                                "shop_money": {
                                    "amount": "10.00",
                                    "currency_code": "USD"
                                },
                                "presentment_money": {
                                    "amount": "10.00",
                                    "currency_code": "USD"
                                }
                            },
                            "variant_id": 44872881537334,
                            "variant_inventory_management": "shopify",
                            "variant_title": "Powder",
                            "vendor": "Snowboard Vendor",
                            "tax_lines": [],
                            "duties": [],
                            "discount_allocations": [
                                {
                                    "amount": "10.00",
                                    "amount_set": {
                                        "shop_money": {
                                            "amount": "10.00",
                                            "currency_code": "USD"
                                        },
                                        "presentment_money": {
                                            "amount": "10.00",
                                            "currency_code": "USD"
                                        }
                                    },
                                    "discount_application_index": 0
                                },
                                {
                                    "amount": "103.50",
                                    "amount_set": {
                                        "shop_money": {
                                            "amount": "103.50",
                                            "currency_code": "USD"
                                        },
                                        "presentment_money": {
                                            "amount": "103.50",
                                            "currency_code": "USD"
                                        }
                                    },
                                    "discount_application_index": 1
                                }
                            ]
                        }
                    },
                    {
                        "id": 554287104310,
                        "line_item_id": 13924936712502,
                        "location_id": null,
                        "quantity": 2,
                        "restock_type": "no_restock",
                        "subtotal": 1189.93,
                        "subtotal_set": {
                            "shop_money": {
                                "amount": "1189.93",
                                "currency_code": "USD"
                            },
                            "presentment_money": {
                                "amount": "1189.93",
                                "currency_code": "USD"
                            }
                        },
                        "total_tax": 0,
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
                        "line_item": {
                            "id": 13924936712502,
                            "admin_graphql_api_id": "gid://shopify/LineItem/13924936712502",
                            "fulfillable_quantity": 0,
                            "fulfillment_service": "manual",
                            "fulfillment_status": null,
                            "gift_card": false,
                            "grams": 4536,
                            "name": "The Complete Snowboard - Electric",
                            "price": "699.95",
                            "price_set": {
                                "shop_money": {
                                    "amount": "699.95",
                                    "currency_code": "USD"
                                },
                                "presentment_money": {
                                    "amount": "699.95",
                                    "currency_code": "USD"
                                }
                            },
                            "product_exists": true,
                            "product_id": 8222223302966,
                            "properties": [],
                            "quantity": 2,
                            "requires_shipping": true,
                            "sku": "",
                            "taxable": true,
                            "title": "The Complete Snowboard",
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
                            "variant_id": 44872881570102,
                            "variant_inventory_management": "shopify",
                            "variant_title": "Electric",
                            "vendor": "Snowboard Vendor",
                            "tax_lines": [],
                            "duties": [],
                            "discount_allocations": [
                                {
                                    "amount": "209.97",
                                    "amount_set": {
                                        "shop_money": {
                                            "amount": "209.97",
                                            "currency_code": "USD"
                                        },
                                        "presentment_money": {
                                            "amount": "209.97",
                                            "currency_code": "USD"
                                        }
                                    },
                                    "discount_application_index": 1
                                }
                            ]
                        }
                    }
                ],
                "duties": []
            }
        ],
        "shipping_address": {
            "first_name": "Russell",
            "address1": "105 Victoria St",
            "phone": null,
            "city": "Toronto",
            "zip": "M5C1N7",
            "province": null,
            "country": "Canada",
            "last_name": "Winfield",
            "address2": null,
            "company": "Company Name",
            "latitude": 43.6522608,
            "longitude": -79.3776862,
            "name": "Russell Winfield",
            "country_code": "CA",
            "province_code": null
        },
        "shipping_lines": [
            {
                "id": 4362548838710,
                "carrier_identifier": "071e9d6cd4a1d56acf60bc21aea1e689",
                "code": "International Shipping",
                "delivery_category": null,
                "discounted_price": "30.00",
                "discounted_price_set": {
                    "shop_money": {
                        "amount": "30.00",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "30.00",
                        "currency_code": "USD"
                    }
                },
                "phone": null,
                "price": "30.00",
                "price_set": {
                    "shop_money": {
                        "amount": "30.00",
                        "currency_code": "USD"
                    },
                    "presentment_money": {
                        "amount": "30.00",
                        "currency_code": "USD"
                    }
                },
                "requested_fulfillment_service_id": null,
                "source": "shopify",
                "title": "International Shipping",
                "tax_lines": [],
                "discount_allocations": []
            }
        ]
    }
},
);