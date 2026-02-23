import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Image = Uint8Array;
export type Id = bigint;
export interface CartItem {
    id: Id;
    name: string;
    description: string;
    image: Image;
    price: bigint;
}
export interface Order {
    id: Id;
    total: bigint;
    paymentMethod: PaymentMethod;
    customer: Principal;
    products: Array<Product>;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: Id;
    name: string;
    description: string;
    image: Image;
    price: bigint;
}
export enum PaymentMethod {
    upi = "upi",
    cashOnDelivery = "cashOnDelivery"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: bigint, image: Image): Promise<void>;
    addToCart(productId: Id): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(paymentMethod: PaymentMethod): Promise<bigint>;
    clearCart(): Promise<void>;
    deleteProduct(id: Id): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(id: Id): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: Id): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(id: Id, name: string | null, description: string | null, price: bigint | null, image: Image | null): Promise<void>;
}
