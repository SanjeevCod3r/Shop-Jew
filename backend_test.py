#!/usr/bin/env python3
"""
E-commerce Backend API Test Suite
Tests all backend endpoints including authentication, products, cart, orders, payments, and admin functions.
"""

import requests
import json
import os
import sys
from typing import Dict, Any, Optional

class EcommerceAPITester:
    def __init__(self):
        # Get base URL from environment
        self.base_url = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://premium-store-demo.preview.emergentagent.com')
        self.api_url = f"{self.base_url}/api"
        
        # Store tokens and test data
        self.user_token = None
        self.admin_token = None
        self.test_user_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }
        self.admin_data = {
            "email": "admin",
            "password": "admin123"
        }
        self.test_product_id = None
        self.test_order_id = None
        
        # Test results tracking
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.test_results["passed"] += 1
        else:
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"{test_name}: {message}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return response and success status"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        
        default_headers = {"Content-Type": "application/json"}
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                return None, False, "Invalid HTTP method"
            
            return response, True, ""
        except requests.exceptions.RequestException as e:
            return None, False, str(e)

    def test_api_root(self):
        """Test API root endpoint"""
        print("\n=== Testing API Root ===")
        
        response, success, error = self.make_request("GET", "")
        if not success:
            self.log_result("API Root", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "message" in data:
                    self.log_result("API Root", True, f"API is running: {data['message']}")
                else:
                    self.log_result("API Root", False, "Missing message in response")
            except json.JSONDecodeError:
                self.log_result("API Root", False, "Invalid JSON response")
        else:
            self.log_result("API Root", False, f"Status: {response.status_code}")

    def test_auth_signup(self):
        """Test user signup"""
        print("\n=== Testing Authentication - Signup ===")
        
        response, success, error = self.make_request("POST", "auth/signup", self.test_user_data)
        if not success:
            self.log_result("User Signup", False, f"Request failed: {error}")
            return
        
        if response.status_code == 201:
            try:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user_token = data["token"]
                    self.log_result("User Signup", True, f"User created: {data['user']['email']}")
                else:
                    self.log_result("User Signup", False, "Missing token or user in response")
            except json.JSONDecodeError:
                self.log_result("User Signup", False, "Invalid JSON response")
        elif response.status_code == 400:
            # User might already exist, try to continue
            try:
                data = response.json()
                if "already exists" in data.get("error", ""):
                    self.log_result("User Signup", True, "User already exists (expected)")
                else:
                    self.log_result("User Signup", False, f"Signup failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("User Signup", False, f"Status: {response.status_code}")
        else:
            self.log_result("User Signup", False, f"Status: {response.status_code}")

    def test_auth_login_user(self):
        """Test user login"""
        print("\n=== Testing Authentication - User Login ===")
        
        login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        
        response, success, error = self.make_request("POST", "auth/login", login_data)
        if not success:
            self.log_result("User Login", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user_token = data["token"]
                    self.log_result("User Login", True, f"Login successful: {data['user']['email']}")
                else:
                    self.log_result("User Login", False, "Missing token or user in response")
            except json.JSONDecodeError:
                self.log_result("User Login", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("User Login", False, f"Login failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("User Login", False, f"Status: {response.status_code}")

    def test_auth_login_admin(self):
        """Test admin login"""
        print("\n=== Testing Authentication - Admin Login ===")
        
        response, success, error = self.make_request("POST", "auth/login", self.admin_data)
        if not success:
            self.log_result("Admin Login", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "token" in data and "user" in data and data["user"]["role"] == "admin":
                    self.admin_token = data["token"]
                    self.log_result("Admin Login", True, f"Admin login successful: {data['user']['email']}")
                else:
                    self.log_result("Admin Login", False, "Missing token, user, or admin role in response")
            except json.JSONDecodeError:
                self.log_result("Admin Login", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Admin Login", False, f"Admin login failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Admin Login", False, f"Status: {response.status_code}")

    def test_auth_me(self):
        """Test get current user info"""
        print("\n=== Testing Authentication - Get Current User ===")
        
        if not self.user_token:
            self.log_result("Get Current User", False, "No user token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("GET", "auth/me", headers=headers)
        
        if not success:
            self.log_result("Get Current User", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "user" in data:
                    self.log_result("Get Current User", True, f"User info retrieved: {data['user']['email']}")
                else:
                    self.log_result("Get Current User", False, "Missing user in response")
            except json.JSONDecodeError:
                self.log_result("Get Current User", False, "Invalid JSON response")
        else:
            self.log_result("Get Current User", False, f"Status: {response.status_code}")

    def test_products_list(self):
        """Test get all products"""
        print("\n=== Testing Products - List All ===")
        
        response, success, error = self.make_request("GET", "products")
        if not success:
            self.log_result("List Products", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "products" in data and "pagination" in data:
                    products = data["products"]
                    if products:
                        self.test_product_id = products[0]["_id"]  # Store first product ID for later tests
                    self.log_result("List Products", True, f"Retrieved {len(products)} products")
                else:
                    self.log_result("List Products", False, "Missing products or pagination in response")
            except json.JSONDecodeError:
                self.log_result("List Products", False, "Invalid JSON response")
        else:
            self.log_result("List Products", False, f"Status: {response.status_code}")

    def test_products_search(self):
        """Test product search"""
        print("\n=== Testing Products - Search ===")
        
        response, success, error = self.make_request("GET", "products?search=wireless")
        if not success:
            self.log_result("Search Products", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "products" in data:
                    products = data["products"]
                    self.log_result("Search Products", True, f"Search returned {len(products)} products")
                else:
                    self.log_result("Search Products", False, "Missing products in response")
            except json.JSONDecodeError:
                self.log_result("Search Products", False, "Invalid JSON response")
        else:
            self.log_result("Search Products", False, f"Status: {response.status_code}")

    def test_products_filter_category(self):
        """Test product filtering by category"""
        print("\n=== Testing Products - Filter by Category ===")
        
        response, success, error = self.make_request("GET", "products?category=Electronics")
        if not success:
            self.log_result("Filter Products by Category", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "products" in data:
                    products = data["products"]
                    self.log_result("Filter Products by Category", True, f"Category filter returned {len(products)} products")
                else:
                    self.log_result("Filter Products by Category", False, "Missing products in response")
            except json.JSONDecodeError:
                self.log_result("Filter Products by Category", False, "Invalid JSON response")
        else:
            self.log_result("Filter Products by Category", False, f"Status: {response.status_code}")

    def test_categories_list(self):
        """Test get all categories"""
        print("\n=== Testing Categories - List All ===")
        
        response, success, error = self.make_request("GET", "categories")
        if not success:
            self.log_result("List Categories", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "categories" in data:
                    categories = data["categories"]
                    self.log_result("List Categories", True, f"Retrieved {len(categories)} categories: {categories}")
                else:
                    self.log_result("List Categories", False, "Missing categories in response")
            except json.JSONDecodeError:
                self.log_result("List Categories", False, "Invalid JSON response")
        else:
            self.log_result("List Categories", False, f"Status: {response.status_code}")

    def test_product_details(self):
        """Test get product details"""
        print("\n=== Testing Products - Get Details ===")
        
        if not self.test_product_id:
            self.log_result("Get Product Details", False, "No product ID available")
            return
        
        response, success, error = self.make_request("GET", f"products/{self.test_product_id}")
        if not success:
            self.log_result("Get Product Details", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "product" in data:
                    product = data["product"]
                    self.log_result("Get Product Details", True, f"Product details: {product['title']}")
                else:
                    self.log_result("Get Product Details", False, "Missing product in response")
            except json.JSONDecodeError:
                self.log_result("Get Product Details", False, "Invalid JSON response")
        else:
            self.log_result("Get Product Details", False, f"Status: {response.status_code}")

    def test_cart_get(self):
        """Test get user's cart"""
        print("\n=== Testing Cart - Get Cart ===")
        
        if not self.user_token:
            self.log_result("Get Cart", False, "No user token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("GET", "cart", headers=headers)
        
        if not success:
            self.log_result("Get Cart", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "cart" in data:
                    cart = data["cart"]
                    self.log_result("Get Cart", True, f"Cart retrieved with {len(cart['items'])} items")
                else:
                    self.log_result("Get Cart", False, "Missing cart in response")
            except json.JSONDecodeError:
                self.log_result("Get Cart", False, "Invalid JSON response")
        else:
            self.log_result("Get Cart", False, f"Status: {response.status_code}")

    def test_cart_add_item(self):
        """Test add item to cart"""
        print("\n=== Testing Cart - Add Item ===")
        
        if not self.user_token or not self.test_product_id:
            self.log_result("Add Item to Cart", False, "No user token or product ID available")
            return
        
        cart_data = {
            "productId": self.test_product_id,
            "quantity": 2
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("POST", "cart", cart_data, headers)
        
        if not success:
            self.log_result("Add Item to Cart", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "cart" in data and "message" in data:
                    self.log_result("Add Item to Cart", True, data["message"])
                else:
                    self.log_result("Add Item to Cart", False, "Missing cart or message in response")
            except json.JSONDecodeError:
                self.log_result("Add Item to Cart", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Add Item to Cart", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Add Item to Cart", False, f"Status: {response.status_code}")

    def test_cart_update_item(self):
        """Test update cart item quantity"""
        print("\n=== Testing Cart - Update Item ===")
        
        if not self.user_token or not self.test_product_id:
            self.log_result("Update Cart Item", False, "No user token or product ID available")
            return
        
        update_data = {
            "productId": self.test_product_id,
            "quantity": 3
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("PUT", "cart", update_data, headers)
        
        if not success:
            self.log_result("Update Cart Item", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "cart" in data and "message" in data:
                    self.log_result("Update Cart Item", True, data["message"])
                else:
                    self.log_result("Update Cart Item", False, "Missing cart or message in response")
            except json.JSONDecodeError:
                self.log_result("Update Cart Item", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Update Cart Item", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Update Cart Item", False, f"Status: {response.status_code}")

    def test_payment_create_order(self):
        """Test create payment order"""
        print("\n=== Testing Payment - Create Order ===")
        
        if not self.user_token:
            self.log_result("Create Payment Order", False, "No user token available")
            return
        
        payment_data = {
            "amount": 5000  # Amount in paise (₹50)
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("POST", "payment/create-order", payment_data, headers)
        
        if not success:
            self.log_result("Create Payment Order", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "orderId" in data and "amount" in data:
                    self.log_result("Create Payment Order", True, f"Payment order created: {data['orderId']}")
                else:
                    self.log_result("Create Payment Order", False, "Missing orderId or amount in response")
            except json.JSONDecodeError:
                self.log_result("Create Payment Order", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Create Payment Order", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Create Payment Order", False, f"Status: {response.status_code}")

    def test_payment_verify(self):
        """Test payment verification (with mock data)"""
        print("\n=== Testing Payment - Verify Payment ===")
        
        if not self.user_token or not self.test_product_id:
            self.log_result("Verify Payment", False, "No user token or product ID available")
            return
        
        # Mock payment verification data
        verify_data = {
            "razorpay_order_id": "order_test_123",
            "razorpay_payment_id": "pay_test_456",
            "razorpay_signature": "mock_signature_for_testing",
            "orderDetails": {
                "items": [{
                    "productId": self.test_product_id,
                    "title": "Test Product",
                    "price": 2500,
                    "quantity": 2,
                    "image": "test.jpg"
                }],
                "totalAmount": 5000,
                "address": {
                    "name": "John Doe",
                    "phone": "9876543210",
                    "street": "123 Test Street",
                    "city": "Test City",
                    "state": "Test State",
                    "zipCode": "123456",
                    "country": "India"
                }
            }
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("POST", "payment/verify", verify_data, headers)
        
        if not success:
            self.log_result("Verify Payment", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "orderId" in data and "message" in data:
                    self.test_order_id = data["orderId"]
                    self.log_result("Verify Payment", True, f"Payment verified, order created: {data['orderId']}")
                else:
                    self.log_result("Verify Payment", False, "Missing orderId or message in response")
            except json.JSONDecodeError:
                self.log_result("Verify Payment", False, "Invalid JSON response")
        else:
            # Payment verification might fail due to signature mismatch (expected for mock data)
            try:
                data = response.json()
                if "verification failed" in data.get("error", "").lower():
                    self.log_result("Verify Payment", True, "Payment verification failed as expected (mock signature)")
                else:
                    self.log_result("Verify Payment", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Verify Payment", False, f"Status: {response.status_code}")

    def test_orders_list(self):
        """Test get user's orders"""
        print("\n=== Testing Orders - List User Orders ===")
        
        if not self.user_token:
            self.log_result("List User Orders", False, "No user token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("GET", "orders", headers=headers)
        
        if not success:
            self.log_result("List User Orders", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "orders" in data:
                    orders = data["orders"]
                    if orders and not self.test_order_id:
                        self.test_order_id = orders[0]["_id"]  # Store first order ID
                    self.log_result("List User Orders", True, f"Retrieved {len(orders)} orders")
                else:
                    self.log_result("List User Orders", False, "Missing orders in response")
            except json.JSONDecodeError:
                self.log_result("List User Orders", False, "Invalid JSON response")
        else:
            self.log_result("List User Orders", False, f"Status: {response.status_code}")

    def test_order_details(self):
        """Test get specific order details"""
        print("\n=== Testing Orders - Get Order Details ===")
        
        if not self.user_token:
            self.log_result("Get Order Details", False, "No user token available")
            return
        
        if not self.test_order_id:
            self.log_result("Get Order Details", False, "No order ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("GET", f"orders/{self.test_order_id}", headers=headers)
        
        if not success:
            self.log_result("Get Order Details", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "order" in data:
                    order = data["order"]
                    self.log_result("Get Order Details", True, f"Order details retrieved: {order['status']}")
                else:
                    self.log_result("Get Order Details", False, "Missing order in response")
            except json.JSONDecodeError:
                self.log_result("Get Order Details", False, "Invalid JSON response")
        else:
            self.log_result("Get Order Details", False, f"Status: {response.status_code}")

    def test_user_profile_get(self):
        """Test get user profile"""
        print("\n=== Testing User Profile - Get Profile ===")
        
        if not self.user_token:
            self.log_result("Get User Profile", False, "No user token available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("GET", "user/profile", headers=headers)
        
        if not success:
            self.log_result("Get User Profile", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "user" in data:
                    user = data["user"]
                    self.log_result("Get User Profile", True, f"Profile retrieved: {user['name']}")
                else:
                    self.log_result("Get User Profile", False, "Missing user in response")
            except json.JSONDecodeError:
                self.log_result("Get User Profile", False, "Invalid JSON response")
        else:
            self.log_result("Get User Profile", False, f"Status: {response.status_code}")

    def test_user_profile_update(self):
        """Test update user profile"""
        print("\n=== Testing User Profile - Update Profile ===")
        
        if not self.user_token:
            self.log_result("Update User Profile", False, "No user token available")
            return
        
        profile_data = {
            "name": "John Doe Updated",
            "phone": "9876543210",
            "address": {
                "street": "123 Updated Street",
                "city": "Updated City",
                "state": "Updated State",
                "zipCode": "654321",
                "country": "India"
            }
        }
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("PUT", "user/profile", profile_data, headers)
        
        if not success:
            self.log_result("Update User Profile", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "user" in data and "message" in data:
                    self.log_result("Update User Profile", True, data["message"])
                else:
                    self.log_result("Update User Profile", False, "Missing user or message in response")
            except json.JSONDecodeError:
                self.log_result("Update User Profile", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Update User Profile", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Update User Profile", False, f"Status: {response.status_code}")

    def test_admin_stats(self):
        """Test admin dashboard statistics"""
        print("\n=== Testing Admin - Dashboard Stats ===")
        
        if not self.admin_token:
            self.log_result("Admin Dashboard Stats", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("GET", "admin/stats", headers=headers)
        
        if not success:
            self.log_result("Admin Dashboard Stats", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "stats" in data:
                    stats = data["stats"]
                    self.log_result("Admin Dashboard Stats", True, f"Stats retrieved: {stats['totalProducts']} products, {stats['totalUsers']} users")
                else:
                    self.log_result("Admin Dashboard Stats", False, "Missing stats in response")
            except json.JSONDecodeError:
                self.log_result("Admin Dashboard Stats", False, "Invalid JSON response")
        else:
            self.log_result("Admin Dashboard Stats", False, f"Status: {response.status_code}")

    def test_admin_products_list(self):
        """Test admin get all products"""
        print("\n=== Testing Admin - List All Products ===")
        
        if not self.admin_token:
            self.log_result("Admin List Products", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("GET", "admin/products", headers=headers)
        
        if not success:
            self.log_result("Admin List Products", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "products" in data:
                    products = data["products"]
                    self.log_result("Admin List Products", True, f"Retrieved {len(products)} products")
                else:
                    self.log_result("Admin List Products", False, "Missing products in response")
            except json.JSONDecodeError:
                self.log_result("Admin List Products", False, "Invalid JSON response")
        else:
            self.log_result("Admin List Products", False, f"Status: {response.status_code}")

    def test_admin_product_create(self):
        """Test admin create new product"""
        print("\n=== Testing Admin - Create Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Create Product", False, "No admin token available")
            return
        
        product_data = {
            "title": "Test Product from API",
            "description": "This is a test product created via API testing",
            "price": 1999,
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
            "category": "Electronics",
            "stock": 25
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("POST", "admin/products", product_data, headers)
        
        if not success:
            self.log_result("Admin Create Product", False, f"Request failed: {error}")
            return
        
        if response.status_code == 201:
            try:
                data = response.json()
                if "product" in data and "message" in data:
                    product = data["product"]
                    self.log_result("Admin Create Product", True, f"Product created: {product['title']}")
                else:
                    self.log_result("Admin Create Product", False, "Missing product or message in response")
            except json.JSONDecodeError:
                self.log_result("Admin Create Product", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Admin Create Product", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Admin Create Product", False, f"Status: {response.status_code}")

    def test_admin_product_update(self):
        """Test admin update product"""
        print("\n=== Testing Admin - Update Product ===")
        
        if not self.admin_token or not self.test_product_id:
            self.log_result("Admin Update Product", False, "No admin token or product ID available")
            return
        
        update_data = {
            "title": "Updated Product Title",
            "description": "Updated product description",
            "price": 2999,
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
            "category": "Electronics",
            "stock": 40
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("PUT", f"admin/products/{self.test_product_id}", update_data, headers)
        
        if not success:
            self.log_result("Admin Update Product", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "product" in data and "message" in data:
                    product = data["product"]
                    self.log_result("Admin Update Product", True, f"Product updated: {product['title']}")
                else:
                    self.log_result("Admin Update Product", False, "Missing product or message in response")
            except json.JSONDecodeError:
                self.log_result("Admin Update Product", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Admin Update Product", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Admin Update Product", False, f"Status: {response.status_code}")

    def test_admin_orders_list(self):
        """Test admin get all orders"""
        print("\n=== Testing Admin - List All Orders ===")
        
        if not self.admin_token:
            self.log_result("Admin List Orders", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("GET", "admin/orders", headers=headers)
        
        if not success:
            self.log_result("Admin List Orders", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "orders" in data:
                    orders = data["orders"]
                    self.log_result("Admin List Orders", True, f"Retrieved {len(orders)} orders")
                else:
                    self.log_result("Admin List Orders", False, "Missing orders in response")
            except json.JSONDecodeError:
                self.log_result("Admin List Orders", False, "Invalid JSON response")
        else:
            self.log_result("Admin List Orders", False, f"Status: {response.status_code}")

    def test_admin_order_update_status(self):
        """Test admin update order status"""
        print("\n=== Testing Admin - Update Order Status ===")
        
        if not self.admin_token:
            self.log_result("Admin Update Order Status", False, "No admin token available")
            return
        
        if not self.test_order_id:
            self.log_result("Admin Update Order Status", False, "No order ID available")
            return
        
        status_data = {
            "status": "Shipped"
        }
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("PUT", f"admin/orders/{self.test_order_id}", status_data, headers)
        
        if not success:
            self.log_result("Admin Update Order Status", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "order" in data and "message" in data:
                    order = data["order"]
                    self.log_result("Admin Update Order Status", True, f"Order status updated to: {order['status']}")
                else:
                    self.log_result("Admin Update Order Status", False, "Missing order or message in response")
            except json.JSONDecodeError:
                self.log_result("Admin Update Order Status", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Admin Update Order Status", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Admin Update Order Status", False, f"Status: {response.status_code}")

    def test_admin_users_list(self):
        """Test admin get all users"""
        print("\n=== Testing Admin - List All Users ===")
        
        if not self.admin_token:
            self.log_result("Admin List Users", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response, success, error = self.make_request("GET", "admin/users", headers=headers)
        
        if not success:
            self.log_result("Admin List Users", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "users" in data:
                    users = data["users"]
                    self.log_result("Admin List Users", True, f"Retrieved {len(users)} users")
                else:
                    self.log_result("Admin List Users", False, "Missing users in response")
            except json.JSONDecodeError:
                self.log_result("Admin List Users", False, "Invalid JSON response")
        else:
            self.log_result("Admin List Users", False, f"Status: {response.status_code}")

    def test_cart_remove_item(self):
        """Test remove item from cart"""
        print("\n=== Testing Cart - Remove Item ===")
        
        if not self.user_token or not self.test_product_id:
            self.log_result("Remove Item from Cart", False, "No user token or product ID available")
            return
        
        headers = {"Authorization": f"Bearer {self.user_token}"}
        response, success, error = self.make_request("DELETE", f"cart/{self.test_product_id}", headers=headers)
        
        if not success:
            self.log_result("Remove Item from Cart", False, f"Request failed: {error}")
            return
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "cart" in data and "message" in data:
                    self.log_result("Remove Item from Cart", True, data["message"])
                else:
                    self.log_result("Remove Item from Cart", False, "Missing cart or message in response")
            except json.JSONDecodeError:
                self.log_result("Remove Item from Cart", False, "Invalid JSON response")
        else:
            try:
                data = response.json()
                self.log_result("Remove Item from Cart", False, f"Failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                self.log_result("Remove Item from Cart", False, f"Status: {response.status_code}")

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting E-commerce Backend API Tests")
        print(f"🌐 Testing API at: {self.api_url}")
        print("=" * 80)
        
        # Test API root
        self.test_api_root()
        
        # Authentication tests
        self.test_auth_signup()
        self.test_auth_login_user()
        self.test_auth_login_admin()
        self.test_auth_me()
        
        # Product tests (public)
        self.test_products_list()
        self.test_products_search()
        self.test_products_filter_category()
        self.test_categories_list()
        self.test_product_details()
        
        # Cart tests (requires user auth)
        self.test_cart_get()
        self.test_cart_add_item()
        self.test_cart_update_item()
        
        # Payment tests (requires user auth)
        self.test_payment_create_order()
        self.test_payment_verify()
        
        # Order tests (requires user auth)
        self.test_orders_list()
        self.test_order_details()
        
        # User profile tests (requires user auth)
        self.test_user_profile_get()
        self.test_user_profile_update()
        
        # Admin tests (requires admin auth)
        self.test_admin_stats()
        self.test_admin_products_list()
        self.test_admin_product_create()
        self.test_admin_product_update()
        self.test_admin_orders_list()
        self.test_admin_order_update_status()
        self.test_admin_users_list()
        
        # Cart cleanup test
        self.test_cart_remove_item()
        
        # Print final results
        self.print_final_results()

    def print_final_results(self):
        """Print final test results summary"""
        print("\n" + "=" * 80)
        print("🏁 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = self.test_results["passed"] + self.test_results["failed"]
        pass_rate = (self.test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📊 Total: {total_tests}")
        print(f"📈 Pass Rate: {pass_rate:.1f}%")
        
        if self.test_results["errors"]:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results["errors"]:
                print(f"   • {error}")
        
        print("\n" + "=" * 80)
        
        if self.test_results["failed"] == 0:
            print("🎉 ALL TESTS PASSED! The e-commerce backend API is working correctly.")
        else:
            print("⚠️  Some tests failed. Please review the errors above.")
        
        return self.test_results["failed"] == 0

if __name__ == "__main__":
    tester = EcommerceAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)