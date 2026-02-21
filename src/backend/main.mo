import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module Product {
    public type Id = Nat;
    public type Image = [Nat8];

    public type Product = {
      id : Id;
      name : Text;
      description : Text;
      price : Nat;
      image : Image;
    };

    public func create(id : Id, name : Text, description : Text, price : Nat, image : Image) : Product {
      {
        id;
        name;
        description;
        price;
        image;
      };
    };
  };

  module Order {
    public type Id = Nat;

    public type Order = {
      id : Id;
      customer : Principal;
      products : [Product.Product];
      total : Nat;
    };
  };

  module Cart {
    public type CartItem = Product.Product;
    public type Cart = List.List<CartItem>;

    public func createCart() : Cart {
      List.empty<CartItem>();
    };

    public func addToCart(cart : Cart, product : Product.Product) {
      cart.add(product);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  var nextProductId = 0;
  var nextOrderId = 0;

  let productsMap = Map.empty<Nat, Product.Product>();
  let ordersMap = Map.empty<Nat, Order.Order>();
  let cartsMap = Map.empty<Principal, Cart.Cart>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product management (Admin only)
  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, image : Product.Image) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let product = Product.create(nextProductId, name, description, price, image);
    productsMap.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateProduct(id : Product.Id, name : ?Text, description : ?Text, price : ?Nat, image : ?Product.Image) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (productsMap.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          id = product.id;
          name = switch (name) { case (null) { product.name }; case (?name) { name } };
          description = switch (description) { case (null) { product.description }; case (?description) { description } };
          price = switch (price) { case (null) { product.price }; case (?price) { price } };
          image = switch (image) { case (null) { product.image }; case (?image) { image } };
        };
        productsMap.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Product.Id) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    productsMap.remove(id);
  };

  // Product catalog viewing (Public - no auth required)
  public query func getProducts() : async [Product.Product] {
    productsMap.values().toArray();
  };

  public query func getProduct(id : Product.Id) : async ?Product.Product {
    productsMap.get(id);
  };

  // Cart management (User only)
  public shared ({ caller }) func addToCart(productId : Product.Id) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    switch (productsMap.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let currentCart = switch (cartsMap.get(caller)) {
          case (null) { Cart.createCart() };
          case (?cart) { cart };
        };
        Cart.addToCart(currentCart, product);
        cartsMap.add(caller, currentCart);
      };
    };
  };

  public query ({ caller }) func getCart() : async [Cart.CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (cartsMap.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray().reverse() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    cartsMap.remove(caller);
  };

  // Order processing (User only)
  public shared ({ caller }) func checkout() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };
    let cart = switch (cartsMap.get(caller)) {
      case (null) { Runtime.trap("No cart found") };
      case (?cart) { cart };
    };

    let products = cart.toArray();
    if (products.size() == 0) {
      Runtime.trap("Cannot checkout an empty cart");
    };

    let total = products.values().foldLeft(0, func(acc, product) { acc + product.price });
    let orderId = nextOrderId;
    let order = {
      id = orderId;
      customer = caller;
      products;
      total;
    };

    ordersMap.add(orderId, order);
    cartsMap.remove(caller);
    nextOrderId += 1;
    orderId;
  };

  // Order viewing
  public query ({ caller }) func getOrders() : async [Order.Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    ordersMap.values().toArray();
  };

  public query ({ caller }) func getMyOrders() : async [Order.Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    ordersMap.values().filter(func(order) { order.customer == caller }).toArray();
  };

  public query ({ caller }) func getOrder(id : Order.Id) : async ?Order.Order {
    switch (ordersMap.get(id)) {
      case (null) { null };
      case (?order) {
        if (order.customer == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
  };

  // Admin role verification (Patched)
  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
